import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import ExpenseCard from "@/components/ExpenseCard";
import FloatingActionButton from "@/components/FloatingActionButton";
import { getExpenses, getUser, Expense } from "@/lib/storage";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, LineChart, Line, XAxis, YAxis, CartesianGrid } from "recharts";

const CATEGORY_COLORS = {
  Food: "hsl(var(--category-food))",
  Travel: "hsl(var(--category-travel))",
  Shopping: "hsl(var(--category-shopping))",
  Bills: "hsl(var(--category-bills))",
  Groceries: "hsl(var(--category-groceries))",
  Others: "hsl(var(--category-others))",
};

const Dashboard = () => {
  const navigate = useNavigate();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [view, setView] = useState<"Daily" | "Weekly" | "Monthly">("Monthly");
  const monthlyBudget = 10000; // Default budget; can be made configurable later

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(amount);

  useEffect(() => {
    const user = getUser();
    if (!user) {
      navigate("/login");
      return;
    }

    const loadExpenses = async () => {
      try {
        const data = await getExpenses();
        setExpenses(data);
      } catch (error) {
        console.error("Failed to load expenses:", error);
      }
    };
    loadExpenses();
  }, [navigate]);

  const thisMonthTotal = expenses
    .filter((e) => {
      const expenseDate = new Date(e.date);
      const now = new Date();
      return (
        expenseDate.getMonth() === now.getMonth() &&
        expenseDate.getFullYear() === now.getFullYear()
      );
    })
    .reduce((sum, e) => sum + e.amount, 0);

  const budgetUsedPct = Math.min(100, Math.round((thisMonthTotal / monthlyBudget) * 100));

  const categoryData = Object.keys(CATEGORY_COLORS).map((category) => ({
    name: category,
    value: expenses
      .filter((e) => e.category === category)
      .reduce((sum, e) => sum + e.amount, 0),
  })).filter((item) => item.value > 0);

  // Top category for current month
  const now = new Date();
  const monthCategoryTotals: Record<string, number> = {};
  expenses
    .filter((e) => {
      const d = new Date(e.date);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    })
    .forEach((e) => {
      monthCategoryTotals[e.category] = (monthCategoryTotals[e.category] || 0) + e.amount;
    });
  const topCategoryEntry = Object.entries(monthCategoryTotals).sort((a, b) => b[1] - a[1])[0];
  const topCategory = topCategoryEntry ? { name: topCategoryEntry[0], value: topCategoryEntry[1] } : null;

  // Trend data builder
  function buildTrendData() {
    const byDay: Record<string, number> = {};
    expenses.forEach((e) => {
      const d = new Date(e.date);
      const key = d.toISOString().slice(0, 10); // YYYY-MM-DD
      byDay[key] = (byDay[key] || 0) + e.amount;
    });

    if (view === "Daily") {
      // Last 14 days
      const result: { name: string; value: number }[] = [];
      for (let i = 13; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const key = d.toISOString().slice(0, 10);
        result.push({ name: `${d.getDate()}/${d.getMonth() + 1}`, value: byDay[key] || 0 });
      }
      return result;
    }

    if (view === "Weekly") {
      // Last 12 weeks, aggregate by ISO week number
      const byWeek: Record<string, number> = {};
      for (let i = 11; i >= 0; i--) {
        const start = new Date();
        start.setDate(start.getDate() - i * 7);
        const weekYear = start.getFullYear();
        const oneJan = new Date(weekYear, 0, 1);
        const week = Math.ceil(((+start - +oneJan) / 86400000 + oneJan.getDay() + 1) / 7);
        const key = `${weekYear}-W${week}`;
        const end = new Date(start);
        end.setDate(start.getDate() + 6);
        // sum days in this 7-day span
        let sum = 0;
        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
          const dayKey = d.toISOString().slice(0, 10);
          sum += byDay[dayKey] || 0;
        }
        byWeek[key] = sum;
      }
      return Object.entries(byWeek).map(([k, v]) => ({ name: k.slice(2), value: v }));
    }

    // Monthly: last 12 months
    const byMonth: Record<string, number> = {};
    for (let i = 11; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const key = `${d.getFullYear()}-${d.getMonth() + 1}`;
      // sum days in this month
      const monthStart = new Date(d.getFullYear(), d.getMonth(), 1);
      const monthEnd = new Date(d.getFullYear(), d.getMonth() + 1, 0);
      let sum = 0;
      for (let cursor = new Date(monthStart); cursor <= monthEnd; cursor.setDate(cursor.getDate() + 1)) {
        const dayKey = cursor.toISOString().slice(0, 10);
        sum += byDay[dayKey] || 0;
      }
      byMonth[key] = sum;
    }
    return Object.entries(byMonth).map(([k, v]) => {
      const [y, m] = k.split("-");
      return { name: `${Number(m)}/${y.slice(2)}`, value: v };
    });
  }

  const trendData = buildTrendData();

  const recentExpenses = expenses.slice(0, 5);

  return (
    <div className="min-h-screen bg-background animate-fade-in">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8 pb-24">
        {/* Budget + Top Category */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="md:col-span-2 rounded-2xl p-6 shadow-md border border-border bg-card transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-lg animate-fade-up" style={{ ['--delay' as any]: '0ms' }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Spent this month</p>
                <h2 className="text-3xl font-bold mt-1">{formatCurrency(thisMonthTotal)} <span className="text-muted-foreground text-base">/ {formatCurrency(monthlyBudget)}</span></h2>
              </div>
              <div className="hidden md:block text-right">
                <p className="text-sm text-muted-foreground">Budget used</p>
                <p className="text-xl font-semibold">{budgetUsedPct}%</p>
              </div>
            </div>
            <div className="mt-4 h-3 rounded-full bg-[hsl(var(--secondary))] overflow-hidden">
              <div className="h-full bg-[hsl(var(--primary))]" style={{ width: `${budgetUsedPct}%` }} />
            </div>
          </div>
          <div className="rounded-2xl p-6 shadow-md border border-border bg-card transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-lg animate-fade-up" style={{ ['--delay' as any]: '100ms' }}>
            <p className="text-sm text-muted-foreground mb-1">Top Category</p>
            {topCategory ? (
              <>
                <div className="text-lg font-semibold">{topCategory.name}</div>
                <div className="text-2xl font-bold mt-1">{formatCurrency(topCategory.value)}</div>
              </>
            ) : (
              <div className="text-muted-foreground">No expenses this month</div>
            )}
          </div>
        </div>

        {/* Trend with toggle */}
        <div className="bg-card rounded-2xl p-6 shadow-md border border-border mb-8 transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-lg animate-fade-up" style={{ ['--delay' as any]: '150ms' }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-foreground">Spending Trend</h3>
            <div className="inline-flex rounded-lg border border-border overflow-hidden">
              {(["Daily", "Weekly", "Monthly"] as const).map((label) => (
                <button
                  key={label}
                  onClick={() => setView(label)}
                  className={`px-3 py-1.5 text-sm ${view === label ? "bg-[hsl(var(--primary))] text-white" : "bg-transparent text-foreground hover:bg-[hsl(var(--secondary))]"}`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
          <div className="h-72">
            {trendData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData} margin={{ left: 8, right: 8, top: 8, bottom: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip formatter={(v: number) => formatCurrency(v)} />
                  <Line type="monotone" dataKey="value" stroke="hsl(var(--primary))" strokeWidth={2.5} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center text-muted-foreground py-20">No data available</p>
            )}
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-8">
          {/* Pie Chart */}
          <div className="bg-card rounded-2xl p-6 shadow-md border border-border transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-lg animate-fade-up" style={{ ['--delay' as any]: '200ms' }}>
            <h3 className="text-xl font-semibold mb-4 text-foreground">Spending by Category</h3>
            {categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry) => `${entry.name}: ₹${entry.value.toFixed(0)}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    isAnimationActive={true}
                    animationBegin={100}
                    animationDuration={900}
                  >
                    {categoryData.map((entry) => (
                      <Cell key={entry.name} fill={CATEGORY_COLORS[entry.name as keyof typeof CATEGORY_COLORS]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center text-muted-foreground py-20">
                No expenses yet. Add your first expense!
              </p>
            )}
          </div>

          {/* Recent Expenses */}
          <div className="bg-card rounded-2xl p-6 shadow-md border border-border">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-foreground">Recent Expenses</h3>
              <button
                onClick={() => navigate("/expenses")}
                className="text-sm text-primary hover:underline font-medium"
              >
                View All
              </button>
            </div>
            <div className="space-y-3">
              {recentExpenses.length > 0 ? (
                recentExpenses.map((expense) => (
                  <ExpenseCard key={expense.id} expense={expense} />
                ))
              ) : (
                <p className="text-center text-muted-foreground py-20">
                  No recent expenses
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      <FloatingActionButton />
    </div>
  );
};

export default Dashboard;
