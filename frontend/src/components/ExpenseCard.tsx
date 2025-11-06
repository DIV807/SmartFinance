import { Expense } from "@/lib/storage";
import CategoryBadge from "./CategoryBadge";
import { formatDate } from "@/lib/utils";

interface ExpenseCardProps {
  expense: Expense;
}

const ExpenseCard = ({ expense }: ExpenseCardProps) => {
  return (
    <div className="flex items-center justify-between p-4 bg-card rounded-xl shadow-sm border border-border hover:shadow-md transition-all">
      <div className="flex-1">
        <div className="flex items-center gap-3 mb-1">
          <CategoryBadge category={expense.category} />
          <span className="text-sm text-muted-foreground">
            {formatDate(expense.date)}
          </span>
        </div>
        {expense.description && (
          <p className="text-sm text-foreground mt-1">{expense.description}</p>
        )}
      </div>
      <div className="text-xl font-bold text-primary ml-4">
        ${expense.amount.toFixed(2)}
      </div>
    </div>
  );
};

export default ExpenseCard;
