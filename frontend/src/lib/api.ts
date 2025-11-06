// Normalize API base URL - remove trailing slash if present
const rawApiBase = import.meta.env.VITE_API_URL || "http://localhost:5000";
const API_BASE = rawApiBase.replace(/\/+$/, ''); // Remove trailing slashes

// Log API base URL (always, for debugging)
console.log('API_BASE configured as:', API_BASE);
console.log('VITE_API_URL env var:', import.meta.env.VITE_API_URL || 'NOT SET');

// Warn if using localhost in production
if (!import.meta.env.DEV && API_BASE.includes('localhost')) {
  console.error('⚠️ WARNING: Using localhost API URL in production!');
  console.error('Please set VITE_API_URL environment variable in Vercel.');
}

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
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string> || {}),
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  // Ensure endpoint starts with / and combine with API_BASE
  const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = `${API_BASE}${normalizedEndpoint}`;
  
  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: "Request failed" }));
      throw new Error(error.error || `HTTP ${response.status}`);
    }

    return response.json();
  } catch (error: any) {
    // Handle network errors (CORS, connection refused, etc.)
    if (error instanceof TypeError && error.message.includes('fetch')) {
      console.error('Network error:', error.message);
      console.error('Attempted URL:', url);
      console.error('API_BASE:', API_BASE);
      throw new Error(`Failed to connect to server. Please check if the backend is running at ${API_BASE}`);
    }
    throw error;
  }
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

