import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import logo from "@/assets/nutrizen-logo.png";

export const LandingNav = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="container mx-auto flex items-center justify-between h-16 px-4">
        <Link to="/" className="flex items-center gap-2">
          <img src={logo} alt="NutriZen" className="h-10 w-auto" />
        </Link>
        <div className="hidden md:flex items-center gap-8 font-body text-sm text-muted-foreground">
          <a href="#beneficios" className="hover:text-primary transition-colors">Prednosti</a>
          <a href="#como-funciona" className="hover:text-primary transition-colors">Kako funkcionira</a>
          <a href="#bonus" className="hover:text-primary transition-colors">Bonus</a>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/login">Prijava</Link>
          </Button>
          <Button variant="cta" size="sm" asChild>
            <Link to="/register">Počni</Link>
          </Button>
        </div>
      </div>
    </nav>
  );
};
