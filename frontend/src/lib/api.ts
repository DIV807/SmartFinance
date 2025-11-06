const API_BASE = "http://localhost:5000";

function getToken(): string | null {
  return localStorage.getItem("smartfinance_token");
}

function setToken(token: string): void {
  localStorage.setItem("smartfinance_token", token);
}

function removeToken(): void {
  localStorage.removeItem("smartfinance_token");
}

async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...options.headers,
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "Request failed" }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  return response.json();
}

// Auth API
export const authApi = {
  signup: async (name: string, email: string, password: string) => {
    const data = await apiRequest<{ token: string; user: { id: string; name: string; email: string } }>("/auth/signup", {
      method: "POST",
      body: JSON.stringify({ name, email, password }),
    });
    setToken(data.token);
    return data;
  },
  login: async (email: string, password: string) => {
    const data = await apiRequest<{ token: string; user: { id: string; name: string; email: string } }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    setToken(data.token);
    return data;
  },
  me: async () => {
    return apiRequest<{ user: { id: string; name: string; email: string } }>("/auth/me");
  },
  logout: () => {
    removeToken();
  },
};

// Helper to normalize MongoDB _id to id
function normalizeExpense(exp: any) {
  if (exp._id) {
    const { _id, ...rest } = exp;
    return { id: _id.toString(), ...rest };
  }
  return exp;
}

// Expenses API
export const expensesApi = {
  getAll: async () => {
    const data = await apiRequest<{ expenses: any[] }>("/expenses");
    return data.expenses.map(normalizeExpense);
  },
  create: async (expense: { amount: number; category: string; description: string; date: string }) => {
    const data = await apiRequest<{ expense: any }>("/expenses", {
      method: "POST",
      body: JSON.stringify(expense),
    });
    return normalizeExpense(data.expense);
  },
  delete: async (id: string) => {
    await apiRequest(`/expenses/${id}`, { method: "DELETE" });
  },
};

// Groups API
export const groupsApi = {
  getAll: async () => {
    // For now, return empty - you'll need to add GET /groups endpoint
    return [];
  },
  create: async (name: string, members: string[]) => {
    const data = await apiRequest<{ group: any }>("/groups", {
      method: "POST",
      body: JSON.stringify({ name, members }),
    });
    return data.group;
  },
  addExpense: async (groupId: string, expense: {
    amount: number;
    description: string;
    date: string;
    payerId: string;
    participantIds: string[];
    category?: string;
  }) => {
    const data = await apiRequest<{ expense: any }>(`/groups/${groupId}/expenses`, {
      method: "POST",
      body: JSON.stringify(expense),
    });
    return data.expense;
  },
  getBalances: async (groupId: string) => {
    const data = await apiRequest<{ balances: Record<string, number> }>(`/groups/${groupId}/balances`);
    return data.balances;
  },
};

