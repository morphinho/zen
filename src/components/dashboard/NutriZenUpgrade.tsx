import { Button } from "@/components/ui/button";
import { Leaf, Utensils, RefreshCw, BookOpen, Zap, Sparkles, Users, Headphones, Dumbbell, Heart, Star, Flame, Check, ShieldCheck } from "lucide-react";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";

import testimonioMaria from "@/assets/testimonio-maria.webp";
import testimonioCarolina from "@/assets/testimonio-carolina.webp";
import testimonioAna from "@/assets/testimonio-ana.jpg";
import testimonioSofia from "@/assets/testimonio-sofia.webp";
import testimonioDaniela from "@/assets/testimonio-daniela.webp";

const NUTRIZEN_CHECKOUT_URL = "https://pay.hotmart.com/C104799271Q?off=pf4nw0ur&checkoutMode=6";

const cardShadow = { boxShadow: '0 8px 20px rgba(0,0,0,0.06)' };

const benefits = [
  { icon: Utensils, title: "Personalizirani prehrambeni plan", desc: "Prilagođen tvom cilju, metabolizmu i rutini." },
  { icon: RefreshCw, title: "Ažuriranja prema tvom napretku", desc: "Tvoja prehrana se razvija s tobom kako bi rezultati trajali." },
  { icon: BookOpen, title: "Zdravi i jednostavni recepti", desc: "Praktične i ukusne opcije za praćenje plana bez komplikacija." },
  { icon: Zap, title: "Više energije i bolji rezultati", desc: "Optimiziraj svoje tijelo za svaki trening." },
];

const zenlifePlusPerks = [
  "Ekskluzivna zajednica učenica",
  "Podrška i praćenje 24h",
  "Novi treninzi i mjesečna ažuriranja",
  "Savjeti, motivacija i ekskluzivni sadržaj",
  "Konstantna evolucija tvog programa",
];

const carouselImages = [
  { src: testimonioMaria, name: "Maria, 43 godine", location: "Zagreb, Hrvatska", desc: "Započela je NutriZen s Pilatesom i u samo 6 tjedana izgubila 11 kg, vidljivo smanjivši trbuh i ponovno se osjećajući lagano." },
  { src: testimonioCarolina, name: "Karolina, 47 godina", location: "Split, Hrvatska", desc: "Kombinirala je NutriZen s Pilatesom i izgubila 15 kg u 8 tjedana, nešto što godinama nije uspjela s drugim dijetama." },
  { src: testimonioAna, name: "Ana, 52 godine", location: "Rijeka, Hrvatska", desc: "Tijekom menopauze aktivirala je NutriZen s Pilatesom i izgubila 10 kg u 7 tjedana, smanjujući nadutost." },
  { src: testimonioSofia, name: "Sofija, 45 godina", location: "Osijek, Hrvatska", desc: "U 5 tjedana nije samo smanjila bol u leđima, već je izgubila i 8 kg te se osjeća s više energije." },
  { src: testimonioDaniela, name: "Daniela, 49 godina", location: "Dubrovnik, Hrvatska", desc: "Izgubila je 16 kg u 9 tjedana i ponovno se osjeća ugodno noseći odjeću koju je prije izbjegavala." },
];

const NutriZenUpgrade = () => {
  return (
    <div className="space-y-5 py-4 animate-fade-up">

      {/* HERO */}
      <div className="rounded-3xl bg-gradient-to-br from-primary/10 via-primary/5 to-accent/5 p-6 border border-primary/10" style={cardShadow}>
        <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
          <Leaf className="w-7 h-7 text-primary" />
        </div>
        <h1 className="text-xl font-bold font-heading text-center leading-snug">
          Otključaj NutriZen i ubrzi svoju transformaciju do <span className="text-primary">10x</span>
        </h1>
        <div className="mt-4 space-y-3 text-sm text-muted-foreground font-body leading-relaxed">
          <p>
            Tvoj Pilates trening funkcionira.{" "}
            <span className="font-semibold text-foreground">Ali bez pravog prehrambenog plana, 90% tvojih rezultata može potrajati puno dulje.</span>
          </p>
          <p>
            S NutriZenom ne trebaš slijediti stroge dijete niti jesti hranu bez okusa. Dobiti ćeš plan s ukusnim, uravnoteženim i jednostavnim obrocima, osmišljen da uživaš u procesu dok se tvoje tijelo mijenja.
          </p>
          <p>
            Aktiviraj NutriZen i dobij personalizirani plan koji radi zajedno s tvojim treningom kako bi{" "}
            <span className="font-semibold text-foreground">ubrzala napredak, smanjila masnoće i poboljšala energiju</span> iz dana u dan.
          </p>
        </div>
      </div>

      {/* PREDNOSTI */}
      <div className="rounded-2xl bg-card border border-border/50 p-5 space-y-4" style={cardShadow}>
        <h2 className="text-base font-heading font-bold">✨ Što uključuje NutriZen?</h2>
        {benefits.map((b, i) => (
          <div key={i} className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
              <b.icon className="w-5 h-5 text-primary" />
            </div>
            <div>
              <span className="text-sm font-heading font-semibold">{b.title}</span>
              <p className="text-xs text-muted-foreground font-body mt-0.5">{b.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ZENLIFE+ */}
      <div className="rounded-2xl bg-gradient-to-br from-accent/10 via-accent/5 to-primary/5 border border-accent/20 p-5 space-y-3" style={cardShadow}>
        <h2 className="text-base font-heading font-bold leading-snug">
          🎁 Aktivacijom NutriZena postaješ i učenica <span className="text-accent">ZenLife+</span> te dobivaš:
        </h2>
        <p className="text-xs font-heading font-semibold text-muted-foreground">Potpuni pristup ZenLife aplikaciji</p>
        <ul className="space-y-2">
          {zenlifePlusPerks.map((perk, i) => (
            <li key={i} className="flex items-center gap-2 text-sm font-body">
              <Check className="w-4 h-4 text-accent flex-shrink-0" />
              {perk}
            </li>
          ))}
        </ul>
        <p className="text-xs text-muted-foreground font-body italic pt-1">
          Sve na jednom mjestu kako bi ostala fokusirana i ubrzala svoju transformaciju.
        </p>
      </div>

      {/* DRUŠTVENI DOKAZ */}
      <div className="rounded-2xl bg-primary/5 border border-primary/10 p-5 text-center" style={cardShadow}>
        <p className="text-sm font-body font-semibold text-foreground leading-relaxed">
          🔥 Većina učenica koje aktiviraju NutriZen počinje primjećivati promjene{" "}
          <span className="text-primary">puno brže</span> već tijekom prvih tjedana.
        </p>
      </div>

      {/* ISKUSTVA CAROUSEL */}
      <div className="rounded-2xl bg-card border border-border/50 p-4 space-y-2" style={cardShadow}>
        <h2 className="text-base font-heading font-bold">💪 Stvarni rezultati</h2>
        <Carousel opts={{ loop: true, align: "center" }} className="w-full">
          <CarouselContent className="-ml-3">
            {carouselImages.map((img, i) => (
              <CarouselItem key={i} className="pl-3 basis-[85%]">
                <div className="rounded-xl overflow-hidden">
                  <img src={img.src} alt={img.name} className="w-full aspect-[4/3] object-cover" />
                </div>
                <div className="mt-2 px-1">
                  <p className="text-sm font-heading font-bold">{img.name}</p>
                  <p className="text-[11px] text-muted-foreground font-body">{img.location}</p>
                  <p className="text-xs text-muted-foreground font-body mt-1 italic">"{img.desc}"</p>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </div>

      {/* CIJENA + CTA */}
      <div className="rounded-2xl bg-card border border-border/50 p-6 text-center" style={cardShadow}>
        <p className="text-sm font-body text-muted-foreground mb-2">
          Aktiviraj sada i počni brže vidjeti rezultate.
        </p>
        <div className="flex items-baseline justify-center gap-1 mb-4">
          <span className="text-3xl font-heading font-bold text-foreground">€9,90</span>
          <span className="text-sm text-muted-foreground font-body">/ mjes.</span>
        </div>
        <Button variant="cta" className="w-full h-14 rounded-2xl text-base font-bold" asChild>
          <a href={NUTRIZEN_CHECKOUT_URL} target="_blank" rel="noopener noreferrer">
            Aktiviraj NutriZen
          </a>
        </Button>
        <div className="mt-3 space-y-0.5">
          <p className="text-[11px] text-muted-foreground font-body">Otkaži kad želiš. Bez obveza.</p>
          <p className="text-[11px] text-muted-foreground font-body flex items-center justify-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-primary" />
            Jamstvo od 60 dana.
          </p>
        </div>
      </div>
    </div>
  );
};

export default NutriZenUpgrade;
