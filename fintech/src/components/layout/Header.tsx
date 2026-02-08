import { Link } from "react-router-dom";
import { Home, TrendingUp, Wallet, Newspaper, Globe, User } from "lucide-react";

const Header = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm border-b border-border">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-wealth/20 flex items-center justify-center text-2xl">WT</div>
          <div>
            <div className="font-bold">WealthTrace</div>
            <div className="text-xs text-muted-foreground">Financial Simulator</div>
          </div>
        </Link>

        <nav className="flex items-center gap-4">
          <Link to="/" className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-secondary/30">
            <Home className="h-4 w-4" />
            <span className="text-sm">Home</span>
          </Link>
          <Link to="/dashboard" className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-secondary/30">
            <TrendingUp className="h-4 w-4" />
            <span className="text-sm">Dashboard</span>
          </Link>
          <Link to="/gateway" className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-secondary/30">
            <Wallet className="h-4 w-4" />
            <span className="text-sm">Gateway</span>
          </Link>
          <Link to="/investments" className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-secondary/30">
            <Globe className="h-4 w-4" />
            <span className="text-sm">Investments</span>
          </Link>
          <Link to="/news" className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-secondary/30">
            <Newspaper className="h-4 w-4" />
            <span className="text-sm">News</span>
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          <Link to="/auth" className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-secondary/30">
            <User className="h-4 w-4" />
            <span className="text-sm">Sign in</span>
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Header;