import { expensesApi, authApi } from "./api";


export interface Expense {
  id: string;
  amount: number;
  category: "Food" | "Travel" | "Shopping" | "Bills" | "Groceries" | "Others";
  description: string;
  date: string;
  createdAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
}

const USER_KEY = "smartfinance_user";

// Use API for expenses

export const getExpenses = async (): Promise<Expense[]> => {
  try {
    return await expensesApi.getAll();
  } catch {
    return [];
  }
};

export const addExpense = async (expense: Omit<Expense, "id" | "createdAt">): Promise<Expense> => {
  return await expensesApi.create(expense);
};

export const deleteExpense = async (id: string) => {
  await expensesApi.delete(id);
};

// User management - keep localStorage for backward compat but also use API
export const getUser = (): User | null => {
  const stored = localStorage.getItem(USER_KEY);
  return stored ? JSON.parse(stored) : null;
};

export const saveUser = (user: User) => {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
};

export const logout = () => {
  authApi.logout();
  localStorage.removeItem(USER_KEY);
};

// Groups (frontend-only state)
export interface GroupMember {
  name: string;
  email?: string; // if provided & user has account, links automatically
}
export interface Group {
  id: string;
  name: string;
  members: (string | GroupMember)[]; // legacy: string; new: { name, email? }
  createdAt: string;
}

// Get display name for a member (handles legacy string format)
export function getMemberDisplay(m: string | GroupMember): string {
  return typeof m === "string" ? m : m.name;
}
// Get display name from member key (for balances display)
export function getMemberDisplayByKey(group: Group, key: string): string {
  const m = group.members.find((x) => getMemberKey(x) === key);
  return m ? getMemberDisplay(m) : key;
}
// Get canonical key for balances/shares (email for linked accounts, else name)
export function getMemberKey(m: string | GroupMember): string {
  if (typeof m === "string") return m;
  return m.email?.trim() ? m.email.trim() : m.name;
}
// Get member keys for a group (for paidBy, participants, shares)
export function getMemberKeys(group: Group): string[] {
  return group.members.map(getMemberKey);
}
// Normalize members to GroupMember[]
export function normalizeMembers(members: (string | GroupMember)[]): GroupMember[] {
  return members.map((m) =>
    typeof m === "string" ? { name: m } : { name: m.name, email: m.email }
  );
}

export interface SharedExpense {
  id: string;
  groupId: string;
  amount: number;
  description: string;
  paidBy: string; // member name/email
  participants: string[]; // members included in split
  // Amount owed per participant (currency, not percent). Optional for legacy data.
  shares?: Record<string, number>;
  // How the split was decided (display only).
  splitType?: "equal" | "percent" | "exact";
  date: string;
  createdAt: string;
}

const GROUPS_KEY = "smartfinance_groups";
const GROUP_EXPENSES_KEY = "smartfinance_group_expenses";
const BUDGET_KEY = "smartfinance_budget";

export const getGroups = (): Group[] => {
  const stored = localStorage.getItem(GROUPS_KEY);
  return stored ? JSON.parse(stored) : [];
};

export const saveGroups = (groups: Group[]) => {
  localStorage.setItem(GROUPS_KEY, JSON.stringify(groups));
};

export const addGroup = (name: string, members: GroupMember[]): Group => {
  const groups = getGroups();
  const valid = members.filter((m) => m.name.trim());
  if (valid.length < 2) throw new Error("At least 2 members required");
  const group: Group = {
    id: Date.now().toString(),
    name,
    members: valid,
    createdAt: new Date().toISOString(),
  };
  groups.unshift(group);
  saveGroups(groups);
  return group;
};

export const deleteGroup = (groupId: string) => {
  const groups = getGroups();
  saveGroups(groups.filter((g) => g.id !== groupId));
  const expenses = getGroupExpenses();
  saveGroupExpenses(expenses.filter((e) => e.groupId !== groupId));
  const settlements = getSettlements();
  saveSettlements(settlements.filter((s) => s.groupId !== groupId));
};

export const getGroupExpenses = (): SharedExpense[] => {
  const stored = localStorage.getItem(GROUP_EXPENSES_KEY);
  return stored ? JSON.parse(stored) : [];
};

export const saveGroupExpenses = (items: SharedExpense[]) => {
  localStorage.setItem(GROUP_EXPENSES_KEY, JSON.stringify(items));
};

export const addSharedExpense = (expense: Omit<SharedExpense, "id" | "createdAt">): SharedExpense => {
  const items = getGroupExpenses();
  const newItem: SharedExpense = {
    ...expense,
    id: Date.now().toString(),
    createdAt: new Date().toISOString(),
  };
  items.unshift(newItem);
  saveGroupExpenses(items);
  return newItem;
};

// Settlements (when someone pays another - reduces balance)
export interface Settlement {
  id: string;
  groupId: string;
  from: string; // member key (owes)
  to: string;   // member key (is owed)
  amount: number;
  paidAt: string;
}
const SETTLEMENTS_KEY = "smartfinance_settlements";

export function getSettlements(): Settlement[] {
  const stored = localStorage.getItem(SETTLEMENTS_KEY);
  return stored ? JSON.parse(stored) : [];
}
function saveSettlements(items: Settlement[]) {
  localStorage.setItem(SETTLEMENTS_KEY, JSON.stringify(items));
}
export function addSettlement(s: Omit<Settlement, "id" | "paidAt">): Settlement {
  const items = getSettlements();
  const newItem: Settlement = {
    ...s,
    id: Date.now().toString(),
    paidAt: new Date().toISOString(),
  };
  items.push(newItem);
  saveSettlements(items);
  return newItem;
}

// Compute balances for a group (expenses minus settlements)
export function computeGroupBalances(groupId: string) {
  const group = getGroups().find(g => g.id === groupId);
  if (!group) return {};

  const memberKeys = group.members.map(getMemberKey);
  const balances: Record<string, number> = {};
  memberKeys.forEach(k => balances[k] = 0);

  const expenses = getGroupExpenses().filter(e => e.groupId === groupId);
  expenses.forEach(exp => {
    balances[exp.paidBy] = (balances[exp.paidBy] ?? 0) + exp.amount;
    if (exp.shares) {
      Object.entries(exp.shares).forEach(([person, share]) => {
        balances[person] = (balances[person] ?? 0) - share;
      });
    }
  });

  const settlements = getSettlements().filter(s => s.groupId === groupId);
  settlements.forEach(s => {
    if (balances[s.from] !== undefined) balances[s.from] += s.amount;
    if (balances[s.to] !== undefined) balances[s.to] -= s.amount;
  });

  return balances;
}


// Get member key for current user (for matching in groups)
export function getCurrentUserMemberKey(): string | null {
  const user = getUser();
  if (!user) return null;
  return user.email || user.name;
}

// Get groups where current user is a member (by email or name)
export function getGroupsForCurrentUser(): { group: Group; myKey: string }[] {
  const userKey = getCurrentUserMemberKey();
  if (!userKey) return [];
  return getGroups()
    .map((group) => {
      const myKey = group.members
        .map(getMemberKey)
        .find((k) => k.toLowerCase() === userKey.toLowerCase());
      return myKey ? { group, myKey } : null;
    })
    .filter((x): x is { group: Group; myKey: string } => x !== null);
}

export function computeSettlements(groupId: string) {
  const balances = computeGroupBalances(groupId);

  const creditors: [string, number][] = [];
  const debtors: [string, number][] = [];

  Object.entries(balances).forEach(([person, balance]) => {
    if (balance > 1) creditors.push([person, balance]);
    else if (balance < -1) debtors.push([person, -balance]);
  });

  const settlements: { from: string; to: string; amount: number }[] = [];

  let i = 0, j = 0;

  while (i < debtors.length && j < creditors.length) {
    const [debtor, debt] = debtors[i];
    const [creditor, credit] = creditors[j];

    const paid = Math.min(debt, credit);

    settlements.push({
      from: debtor,
      to: creditor,
      amount: Math.round(paid),
    });

    debtors[i][1] -= paid;
    creditors[j][1] -= paid;

    if (debtors[i][1] <= 1) i++;
    if (creditors[j][1] <= 1) j++;
  }

  return settlements;
}

//delete shared expense
export function deleteSharedExpense(expenseId: string) {
  const expenses = getGroupExpenses();
  const updated = expenses.filter((e) => e.id !== expenseId);
  // Reuse the same helper to keep storage key consistent
  saveGroupExpenses(updated);
}



// Budget management
export const getBudget = (): number => {
  const stored = localStorage.getItem(BUDGET_KEY);
  return stored ? Number.parseFloat(stored) : 10000; // Default to 10000 if not set
};

export const saveBudget = (budget: number) => {
  if (budget < 0) {
    throw new Error("Budget cannot be negative");
  }
  localStorage.setItem(BUDGET_KEY, budget.toString());
};
