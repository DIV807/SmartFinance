import { User, List } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { getUser, logout } from "@/lib/storage";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "./ui/button";

const Navbar = () => {
  const navigate = useNavigate();
  const user = getUser();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="border-b border-border bg-card shadow-sm">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link to="/dashboard" className="text-2xl font-bold text-primary">
          SmartFinance
        </Link>

        <div className="flex items-center gap-4">
          <Link to="/groups">
            <Button variant="ghost" size="sm">
              Groups
            </Button>
          </Link>
          <Link to="/scan-receipt">
            <Button variant="ghost" size="sm">
              Scan Receipt
            </Button>
          </Link>
          <Link to="/expenses">
            <Button variant="ghost" size="sm">
              <List className="w-4 h-4 mr-2" />
              All Expenses
            </Button>
          </Link>

          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-2 p-2 rounded-full bg-secondary hover:bg-muted transition-colors">
              <User className="w-6 h-6 text-primary" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-popover border-border">
              <DropdownMenuLabel className="text-foreground">
                {user?.name || "My Account"}
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-border" />
              <DropdownMenuItem 
                onClick={handleLogout}
                className="text-destructive cursor-pointer hover:bg-muted"
              >
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
