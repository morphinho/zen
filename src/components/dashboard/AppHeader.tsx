import zenlifeLogo from "@/assets/zenlife-logo.svg";
import { MessageCircle } from "lucide-react";

export const AppHeader = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-lg">
      <div className="flex items-center justify-between h-14 px-5 max-w-lg mx-auto">
        <img src={zenlifeLogo} alt="ZenLife" className="h-10 object-contain" />
        <a
          href={`https://wa.me/?text=${encodeURIComponent("Bok, korisnica sam ZenLife i trebam podršku.")}`}
          target="_blank"
          rel="noopener noreferrer"
          className="w-8 h-8 rounded-full bg-primary-light flex items-center justify-center text-primary transition-transform hover:scale-105"
        >
          <MessageCircle className="w-4 h-4" />
        </a>
      </div>
    </header>
  );
};
