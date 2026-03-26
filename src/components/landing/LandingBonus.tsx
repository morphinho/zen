import { BookOpen, CheckSquare, Calendar, Headphones } from "lucide-react";

const bonuses = [
  { icon: BookOpen, title: "Vodič za protuupalne recepte", desc: "Recepti za smanjenje upale i bolje samopočutje." },
  { icon: CheckSquare, title: "Popis za zdravi hladnjak", desc: "Organiziraj svoj hladnjak s osnovnim namirnicama." },
  { icon: Calendar, title: "Jelovnik za 7 dana s popisom za kupnju", desc: "Planiraj tjedan bez komplikacija." },
  { icon: Headphones, title: "Meditacija za anksioznost oko hrane", desc: "Vođena meditacija za zdrav odnos s hranom." },
];

export const LandingBonus = () => {
  return (
    <section id="bonus" className="py-20 bg-secondary">
      <div className="container mx-auto px-4">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Bonus <span className="text-accent">ekskluzivni</span>
          </h2>
          <p className="text-muted-foreground font-body max-w-xl mx-auto">
            Premium materijali uključeni u tvoju pretplatu.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {bonuses.map((bonus, i) => (
            <div
              key={bonus.title}
              className="bg-card rounded-2xl p-6 border border-border shadow-sm hover:shadow-md hover:border-primary/30 transition-all duration-300 animate-fade-in"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mb-4">
                <bonus.icon className="w-6 h-6 text-accent" />
              </div>
              <h3 className="font-semibold mb-2 font-heading">{bonus.title}</h3>
              <p className="text-sm text-muted-foreground font-body">{bonus.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
