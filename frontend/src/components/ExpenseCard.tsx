import { Expense } from "@/lib/storage";
import CategoryBadge from "./CategoryBadge";
import { formatDate } from "@/lib/utils";
import { Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

interface ExpenseCardProps {
  expense: Expense;
  onDelete?: (id: string) => void;
}

const ExpenseCard = ({ expense, onDelete }: ExpenseCardProps) => {
  const handleDelete = async () => {
    if (onDelete) {
      onDelete(expense.id);
    }
  };

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
      <div className="flex items-center gap-3">
        <div className="text-xl font-bold text-primary">
          ₹{expense.amount.toFixed(2)}
        </div>
        {onDelete && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete the expense
                  of ₹{expense.amount.toFixed(2)} from {expense.description || "this item"}.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>
    </div>
  );
};

export default ExpenseCard;
