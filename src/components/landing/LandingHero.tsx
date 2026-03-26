import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import heroFood from "@/assets/hero-food.jpg";

export const LandingHero = () => {
  return (
    <section className="pt-24 pb-16 md:pt-32 md:pb-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6 animate-fade-in">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium font-body">
              🌿 Prehrana + Pilates
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight tracking-tight">
              Tvoj personalizirani prehrambeni plan za bolje rezultate{" "}
              <span className="text-primary">Pilatesa na Zidu</span>
            </h1>
            <p className="text-lg text-muted-foreground font-body max-w-lg">
              Dobij pametnu prehrambenu podršku izravno na svoj WhatsApp.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button variant="hero" asChild>
                <Link to="/register">Započni svoj plan</Link>
              </Button>
              <Button variant="outline-primary" size="xl" asChild>
                <a href="#como-funciona">Kako funkcionira</a>
              </Button>
            </div>
            <div className="flex items-center gap-6 pt-2 text-sm text-muted-foreground font-body">
              <span className="flex items-center gap-1">✅ Personalizirani plan</span>
              <span className="flex items-center gap-1">✅ WhatsApp podrška</span>
            </div>
          </div>
          <div className="relative animate-scale-in">
            <div className="rounded-3xl overflow-hidden shadow-2xl">
              <img src={heroFood} alt="Zdrava hrana" className="w-full h-auto object-cover" />
            </div>
            <div className="absolute -bottom-4 -left-4 bg-card rounded-2xl p-4 shadow-lg border border-border">
              <div className="text-sm font-body text-muted-foreground">Mjesečna cijena</div>
              <div className="text-2xl font-bold font-heading text-primary">€6,90<span className="text-sm font-normal text-muted-foreground">/mjes.</span></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
