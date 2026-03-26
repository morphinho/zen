import { Utensils, MessageCircle, BookOpen, RefreshCw } from "lucide-react";

const benefits = [
  {
    icon: Utensils,
    title: "Personalizirani prehrambeni plan",
    description: "Dobij plan prilagođen tvom tijelu, ciljevima i načinu života.",
  },
  {
    icon: MessageCircle,
    title: "Podrška putem WhatsAppa",
    description: "Svakodnevna podrška tvoje nutricionistice izravno na mobitel.",
  },
  {
    icon: BookOpen,
    title: "Tjedni recepti",
    description: "Novi zdravi recepti svaki tjedan da ti nikad ne bude dosadno.",
  },
  {
    icon: RefreshCw,
    title: "Mjesečna procjena",
    description: "Prilagođavamo tvoj plan svaki mjesec prema tvom napretku i potrebama.",
  },
];

export const LandingBenefits = () => {
  return (
    <section id="beneficios" className="py-20 bg-secondary">
      <div className="container mx-auto px-4">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Sve što trebaš za svoju <span className="text-primary">dobrobit</span>
          </h2>
          <p className="text-muted-foreground font-body max-w-2xl mx-auto">
            NutriZen kombinira personaliziranu prehranu s kontinuiranom podrškom kako bi poboljšao tvoje rezultate.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {benefits.map((benefit, i) => (
            <div
              key={benefit.title}
              className="bg-card rounded-2xl p-6 shadow-sm border border-border hover:shadow-md transition-shadow duration-300 animate-fade-in"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <benefit.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-2 font-heading">{benefit.title}</h3>
              <p className="text-sm text-muted-foreground font-body">{benefit.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
