import logo from "@/assets/nutrizen-logo.png";

export const LandingFooter = () => {
  return (
    <footer className="py-10 bg-secondary border-t border-border">
      <div className="container mx-auto px-4 text-center">
        <img src={logo} alt="NutriZen" className="h-8 mx-auto mb-4" />
        <p className="text-sm text-muted-foreground font-body">
          © {new Date().getFullYear()} NutriZen. Sva prava pridržana.
        </p>
      </div>
    </footer>
  );
};
