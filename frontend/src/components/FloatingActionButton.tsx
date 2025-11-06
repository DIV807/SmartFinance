import { Plus } from "lucide-react";
import { Link } from "react-router-dom";

const FloatingActionButton = () => {
  return (
    <Link
      to="/add-expense"
      className="fixed bottom-6 right-6 w-16 h-16 bg-gradient-primary rounded-full shadow-lg flex items-center justify-center transition-transform duration-200 hover-bounce z-50"
    >
      <Plus className="w-8 h-8 text-primary-foreground" />
    </Link>
  );
};

export default FloatingActionButton;
