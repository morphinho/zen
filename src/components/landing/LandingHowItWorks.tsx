const steps = [
  { num: "1", emoji: "📋", title: "Ispuni upitnik", desc: "Unesi svoje podatke, ciljeve i prehrambene preferencije." },
  { num: "2", emoji: "🥗", title: "Dobij svoj personalizirani plan", desc: "Kreiramo prehrambeni plan prilagođen tebi." },
  { num: "3", emoji: "💬", title: "Dobij svakodnevnu podršku", desc: "Kontinuirana podrška putem WhatsAppa s tvojom nutricionisticom." },
  { num: "4", emoji: "🔄", title: "Mjesečno prilagođavanje plana", desc: "Svaki mjesec pregledavamo i ažuriramo tvoj plan prema tvom napretku." },
];

export const LandingHowItWorks = () => {
  return (
    <section id="como-funciona" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Kako <span className="text-primary">funkcionira</span>?
          </h2>
          <p className="text-muted-foreground font-body max-w-xl mx-auto">
            U 4 jednostavna koraka započinješ svoju prehrambenu transformaciju.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, i) => (
            <div
              key={step.num}
              className="text-center animate-fade-in"
              style={{ animationDelay: `${i * 150}ms` }}
            >
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4 text-3xl">
                {step.emoji}
              </div>
              <div className="text-xs font-semibold text-primary font-heading mb-1">KORAK {step.num}</div>
              <h3 className="font-semibold text-lg mb-2 font-heading">{step.title}</h3>
              <p className="text-sm text-muted-foreground font-body">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
