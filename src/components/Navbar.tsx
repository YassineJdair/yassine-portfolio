import { Link } from "react-router-dom";
import { ThemeToggle } from "@/providers/ThemeProvider";

const Navbar = () => {
  return (
    <nav className="bg-background border-b border-border/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="text-xl font-bold text-foreground">
              Yassine Jdair
            </Link>
          </div>
          <div className="flex items-center space-x-8">
            <Link
              to="/projects"
              className="text-foreground hover:text-primary transition-colors"
            >
              Projects
            </Link>
            <Link
              to="/experience"
              className="text-foreground hover:text-primary transition-colors"
            >
              Experience
            </Link>
            <Link
              to="/CrossyRoad"
              className="text-foreground hover:text-primary transition-colors"
            >
              Crossy
            </Link>
            <Link
              to="/about"
              className="text-foreground hover:text-primary transition-colors"
            >
              About Me
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
