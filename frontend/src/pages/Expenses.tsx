import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import CategoryBadge from "@/components/CategoryBadge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getExpenses, getUser, Expense } from "@/lib/storage";
import { formatDate } from "@/lib/utils";

const categories = ["All", "Food", "Travel", "Shopping", "Bills", "Groceries", "Others"] as const;

const Expenses = () => {
  const navigate = useNavigate();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [filter, setFilter] = useState<typeof categories[number]>("All");

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

  const filteredExpenses = filter === "All" 
    ? expenses 
    : expenses.filter((e) => e.category === filter);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-foreground">All Expenses</h2>
          
          <div className="w-48">
            <Select value={filter} onValueChange={(value) => setFilter(value as typeof filter)}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="bg-card rounded-2xl shadow-md border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Category</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Description</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Date</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-foreground">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredExpenses.length > 0 ? (
                  filteredExpenses.map((expense) => (
                    <tr key={expense.id} className="hover:bg-muted/50 transition-colors">
                      <td className="px-6 py-4">
                        <CategoryBadge category={expense.category} />
                      </td>
                      <td className="px-6 py-4 text-foreground">
                        {expense.description || <span className="text-muted-foreground italic">No description</span>}
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">
                        {formatDate(expense.date)}
                      </td>
                      <td className="px-6 py-4 text-right font-semibold text-primary">
                        ${expense.amount.toFixed(2)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-6 py-20 text-center text-muted-foreground">
                      {filter === "All" ? "No expenses yet" : `No expenses in ${filter} category`}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Expenses;
