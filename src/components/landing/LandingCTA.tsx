import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Check } from "lucide-react";

const perks = [
  "Personalizirani prehrambeni plan",
  "Svakodnevna podrška putem WhatsAppa",
  "Tjedni recepti",
  "Mjesečna procjena",
  "Ekskluzivni bonusi",
];

export const LandingCTA = () => {
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="max-w-lg mx-auto text-center bg-card rounded-3xl p-10 shadow-xl border border-border">
          <div className="text-xs font-semibold text-accent font-heading mb-2 uppercase tracking-wider">Plan NutriZen</div>
          <h2 className="text-3xl font-bold mb-2 font-heading">€6,90<span className="text-lg font-normal text-muted-foreground"> /mjes.</span></h2>
          <p className="text-muted-foreground font-body mb-8">Sve uključeno, bez iznenađenja.</p>
          <ul className="space-y-3 mb-8 text-left">
            {perks.map((perk) => (
              <li key={perk} className="flex items-center gap-3 font-body text-sm">
                <Check className="w-5 h-5 text-primary flex-shrink-0" />
                {perk}
              </li>
            ))}
          </ul>
          <Button variant="hero" className="w-full" asChild>
            <Link to="/register">Aktiviraj NutriZen za €6,90/mjes.</Link>
          </Button>
        </div>
      </div>
    </section>
  );
};
