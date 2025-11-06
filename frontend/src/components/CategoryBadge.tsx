import { cn } from "@/lib/utils";

interface CategoryBadgeProps {
  category: "Food" | "Travel" | "Shopping" | "Bills" | "Groceries" | "Others";
  className?: string;
}

const categoryStyles = {
  Food: "bg-category-food/20 text-category-food border-category-food/30",
  Travel: "bg-category-travel/20 text-category-travel border-category-travel/30",
  Shopping: "bg-category-shopping/20 text-category-shopping border-category-shopping/30",
  Bills: "bg-category-bills/20 text-category-bills border-category-bills/30",
  Groceries: "bg-category-groceries/20 text-category-groceries border-category-groceries/30",
  Others: "bg-category-others/20 text-category-others border-category-others/30",
};

const CategoryBadge = ({ category, className }: CategoryBadgeProps) => {
  return (
    <span
      className={cn(
        "inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border",
        categoryStyles[category],
        className
      )}
    >
      {category}
    </span>
  );
};

export default CategoryBadge;
