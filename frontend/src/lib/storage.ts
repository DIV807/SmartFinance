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
import { expensesApi, authApi } from "./api";

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
export interface Group {
  id: string;
  name: string;
  members: string[]; // names/emails
  createdAt: string;
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

export const addGroup = (name: string, members: string[]): Group => {
  const groups = getGroups();
  const group: Group = {
    id: Date.now().toString(),
    name,
    members: members.map((m) => m.trim()).filter(Boolean),
    createdAt: new Date().toISOString(),
  };
  groups.unshift(group);
  saveGroups(groups);
  return group;
};

export const deleteGroup = (groupId: string) => {
  const groups = getGroups();
  const filteredGroups = groups.filter((g) => g.id !== groupId);
  saveGroups(filteredGroups);
  
  // Also delete all expenses associated with this group
  const expenses = getGroupExpenses();
  const filteredExpenses = expenses.filter((e) => e.groupId !== groupId);
  saveGroupExpenses(filteredExpenses);
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

// Compute balances for a group: positive => owed to you, negative => you owe
export const computeGroupBalances = (groupId: string) => {
  const groups = getGroups();
  const group = groups.find((g) => g.id === groupId);
  if (!group) return {} as Record<string, number>;
  const expenses = getGroupExpenses().filter((e) => e.groupId === groupId);
  const balances: Record<string, number> = {};
  group.members.forEach((m) => (balances[m] = 0));

  for (const e of expenses) {
    const participants = e.participants.length ? e.participants : group.members;
    // Payer initially covers all
    balances[e.paidBy] += e.amount;

    // Determine per-participant shares. If explicit shares exist, use them; otherwise split equally.
    const hasExplicitShares = e.shares && Object.keys(e.shares).length > 0;
    if (hasExplicitShares && e.shares) {
      for (const p of participants) {
        const share = e.shares[p] ?? 0;
        balances[p] -= share;
      }
    } else {
      const share = e.amount / participants.length;
      for (const p of participants) {
        balances[p] -= share;
      }
    }
  }
  return balances;
};

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
