import { useState } from "react";
import { Button } from "@/components/ui/button";
import { BookOpen, CheckSquare, Calendar, Headphones, FileText, Music, Eye, ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";

const cardShadow = { boxShadow: '0 8px 20px rgba(0,0,0,0.06)' };

const mockPages: Record<string, { title: string; lines: string[] }[]> = {
  antiinflamatorias: [
    { title: "Vodič za protuupalne recepte", lines: ["Uvod", "", "Ovaj vodič sadrži prirodne recepte", "osmišljene za smanjenje upale", "u tijelu na zdrav način.", "", "Sadržaj:", "1. Protuupalni doručci", "2. Uravnoteženi ručkovi", "3. Lagane večere", "4. Zdravi međuobroci", "5. Protuupalni napitci"] },
    { title: "Poglavlje 1: Doručci", lines: ["Smoothie od kurkume i đumbira", "", "Sastojci:", "• 1 zrela banana", "• 1 žličica kurkume u prahu", "• 1/2 žličice ribanog đumbira", "• 200ml bademovog mlijeka", "• 1 žlica sjemenki chie", "", "Priprema:", "Izmiksajte sve sastojke", "dok ne dobijete glatku teksturu."] },
    { title: "Poglavlje 2: Ručkovi", lines: ["Mediteranska salata", "", "Sastojci:", "• Miješano zeleno lisnato povrće", "• Cherry rajčice", "• Krastavac", "• Crne masline", "• Ekstra djevičansko maslinovo ulje", "• Limun", "", "Bogata antioksidansima i omega-3."] },
    { title: "Poglavlje 3: Lagane večere", lines: ["Juha od povrća s đumbirom", "", "Sastojci:", "• Mrkva, tikvica, poriluk", "• Svježi ribani đumbir", "• Povrtni temeljac", "• Sol i papar po ukusu", "", "Idealno za završetak dana", "s utješnim obrokom."] },
    { title: "Završne napomene", lines: ["Opći savjeti:", "", "• Izbjegavajte prerađenu hranu", "• Dajte prednost svježim namirnicama", "• Pijte dovoljno vode", "• Uključite protuupalne začine", "  poput kurkume, đumbira i cimeta", "", "Hvala što pratite ovaj vodič!"] },
  ],
  refrigerador: [
    { title: "Popis za zdravi hladnjak", lines: ["Tvoj vodič za održavanje", "zdrave i organizirane kuhinje.", "", "Ovaj popis će ti pomoći da uvijek", "imaš pri ruci sastojke potrebne", "za uravnoteženu i", "protuupalnu prehranu."] },
    { title: "Odjeljak 1: Voće i povrće", lines: ["□ Špinat / Kelj", "□ Brokula", "□ Mrkva", "□ Krastavac", "□ Rajčice", "□ Avokado", "□ Limuni", "□ Bobičasto voće", "□ Jabuke", "□ Banane", "□ Papaja"] },
    { title: "Odjeljak 2: Proteini", lines: ["□ Pileća prsa", "□ Svježi ili smrznuti losos", "□ Jaja (kutija)", "□ Prirodni grčki jogurt", "□ Tofu ili tempeh", "□ Kuhane mahunarke", "", "Savjet: Pripremite proteine", "na početku tjedna."] },
    { title: "Odjeljak 3: Osnovna ostava", lines: ["□ Ekstra djevičansko maslinovo ulje", "□ Integralna zobena kaša", "□ Smeđa riža ili kvinoja", "□ Sjemenke chie i lana", "□ Orašasti plodovi", "□ Kurkuma u prahu", "□ Đumbir", "□ Cimet", "□ Med ili stevija"] },
  ],
  menu7dias: [
    { title: "Jelovnik za 7 dana s popisom namirnica", lines: ["Potpuni tjedni plan", "za jednostavniju prehranu.", "", "Svaki dan uključuje:", "• Doručak", "• Ručak", "• Užinu", "• Večeru", "", "Ukupno približno: 1400-1600 kcal/dan"] },
    { title: "Dan 1 - Ponedjeljak", lines: ["Doručak: Zobena kaša s bobičastim voćem", "Ručak: Piletina s kvinojom i salatom", "Užina: Grčki jogurt s orasima", "Večera: Juha od povrća s đumbirom", "", "Dan 2 - Utorak", "Doručak: Tost s avokadom i jajem", "Ručak: Losos s brokulom na pari", "Užina: Jabuka s kikiriki maslacem", "Večera: Mediteranska salata"] },
    { title: "Dan 3 do 7", lines: ["Dan 3: Zeleni smoothie / Leća", "Dan 4: Jaja sa špinatom / Bowl", "Dan 5: Zobeni palačinke / Puretina", "Dan 6-7: Slobodne varijacije", "", "Kreativnost u kuhinji!"] },
    { title: "Tjedni popis za kupovinu", lines: ["Povrće: špinat, brokula, tikvica,", "  mrkva, krastavac, rajčice, bundeva", "Voće: jabuke, banane, bobičasto voće,", "  papaja, avokado, limuni", "Proteini: piletina, losos, oslić,", "  jaja, puretina, leća", "Ostalo: zobena kaša, kvinoja, smeđa riža,", "  grčki jogurt, orašasti plodovi,", "  maslinovo ulje, začini"] },
  ],
  meditacion: [
    { title: "Meditacija za anksioznost vezanu uz hranu", lines: ["Vodič za praćenje", "", "Ova sesija od 10 minuta pomoći će ti", "da se ponovno povežeš sa svojim tijelom i smanjiš", "anksioznost povezanu s hranom."] },
    { title: "Dio 1: Disanje", lines: ["Duboko udahnite kroz nos", "brojeći do 4.", "", "Zadržite dah brojeći do 4.", "", "Polako izdahnite kroz usta", "brojeći do 6.", "", "Ponovite ovaj ciklus 5 puta."] },
    { title: "Dio 2: Tjelesna svjesnost", lines: ["Usmjerite pažnju na svoj želudac.", "", "Osjećate li pravu glad ili anksioznost?", "", "Prava glad pojavljuje se postupno.", "Anksioznost vezana uz hranu pojavljuje se", "naglo.", "", "Promatrajte bez prosuđivanja."] },
    { title: "Dio 3: Afirmacije", lines: ["Ponovite u sebi:", "", "\"Biram se hraniti s ljubavlju.\"", "", "\"Moje tijelo zaslužuje prehranu.\"", "", "\"Vjerujem svojim signalima gladi.\"", "", "Polako otvorite oči. 🧘‍♀️"] },
  ],
};

const bonuses = [
  { id: "antiinflamatorias", icon: BookOpen, title: "Vodič za protuupalne recepte", type: "PDF", typeIcon: FileText, desc: "Prirodni recepti za smanjenje upale u tijelu", color: "bg-primary/10 text-primary" },
  { id: "refrigerador", icon: CheckSquare, title: "Popis za zdravi hladnjak", type: "PDF", typeIcon: FileText, desc: "Potpuni popis onoga što ne smije nedostajati u tvojoj kuhinji", color: "bg-accent/10 text-accent" },
  { id: "menu7dias", icon: Calendar, title: "Jelovnik za 7 dana s popisom namirnica", type: "PDF", typeIcon: FileText, desc: "Planiraj cijeli tjedan s lakoćom", color: "bg-primary/10 text-primary" },
  { id: "meditacion", icon: Headphones, title: "Meditacija za anksioznost vezanu uz hranu", type: "Audio", typeIcon: Music, desc: "10 minuta mira za ponovnu povezanost s tijelom", color: "bg-accent/10 text-accent" },
];

const PDFViewer = ({ pages }: { pages: { title: string; lines: string[] }[] }) => {
  const [currentPage, setCurrentPage] = useState(0);
  const total = pages.length;

  return (
    <div className="space-y-3">
      <div
        className="w-full rounded-xl border border-border/40 bg-card p-6 min-h-[420px] flex flex-col justify-between"
        style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.08)" }}
      >
        <div className="flex-1">
          <h3 className="text-sm font-heading font-bold text-foreground mb-4 pb-2 border-b border-border/30">
            {pages[currentPage].title}
          </h3>
          <div className="space-y-1">
            {pages[currentPage].lines.map((line, i) => (
              <p key={i} className={`text-xs font-body leading-relaxed ${line === "" ? "h-3" : "text-foreground/80"}`}>
                {line}
              </p>
            ))}
          </div>
        </div>
        <p className="text-[10px] text-muted-foreground font-body text-center mt-6 pt-3 border-t border-border/20">
          Stranica {currentPage + 1} od {total}
        </p>
      </div>
      <div className="flex items-center justify-between">
        <Button variant="outline" size="sm" className="h-9 rounded-xl text-xs gap-1" disabled={currentPage === 0} onClick={() => setCurrentPage(p => p - 1)}>
          <ChevronLeft className="w-3.5 h-3.5" /> Natrag
        </Button>
        <div className="flex gap-1">
          {pages.map((_, i) => (
            <button key={i} onClick={() => setCurrentPage(i)} className={`w-2 h-2 rounded-full transition-colors ${i === currentPage ? "bg-primary" : "bg-border"}`} />
          ))}
        </div>
        <Button variant="outline" size="sm" className="h-9 rounded-xl text-xs gap-1" disabled={currentPage === total - 1} onClick={() => setCurrentPage(p => p + 1)}>
          Dalje <ChevronRight className="w-3.5 h-3.5" />
        </Button>
      </div>
    </div>
  );
};

const Bonus = () => {
  const [viewingBonus, setViewingBonus] = useState<typeof bonuses[0] | null>(null);

  if (viewingBonus) {
    const pages = mockPages[viewingBonus.id];
    return (
      <div className="py-4 animate-fade-up space-y-4">
        <button onClick={() => setViewingBonus(null)} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors font-body">
          <ArrowLeft className="w-4 h-4" /> Natrag u knjižnicu
        </button>
        <div className="rounded-2xl bg-card border border-border/50 p-5" style={cardShadow}>
          <div className="flex items-center gap-3 mb-4">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${viewingBonus.color}`}>
              <viewingBonus.icon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold font-heading text-base">{viewingBonus.title}</h2>
              <span className="flex items-center gap-1 text-[10px] font-body text-muted-foreground">
                <viewingBonus.typeIcon className="w-3 h-3" /> {viewingBonus.type} • {pages?.length || 0} stranica
              </span>
            </div>
          </div>
          {pages ? (
            <PDFViewer pages={pages} />
          ) : (
            <div className="w-full rounded-xl bg-secondary/50 border border-border/30 flex flex-col items-center justify-center py-16 space-y-3">
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${viewingBonus.color}`}>
                <viewingBonus.icon className="w-8 h-8" />
              </div>
              <p className="text-sm font-heading font-semibold text-foreground/70">Sadržaj uskoro</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 py-4 animate-fade-up">
      <div className="rounded-3xl bg-gradient-to-br from-primary/10 via-primary/5 to-accent/5 p-5 border border-primary/10" style={cardShadow}>
        <h1 className="text-xl font-bold font-heading">ZenLife knjižnica</h1>
        <p className="text-xs text-muted-foreground font-body mt-1">Ekskluzivni sadržaj za pojačavanje tvoje transformacije.</p>
      </div>

      <div className="space-y-3">
        {bonuses.map((bonus) => (
          <div
            key={bonus.id}
            className="rounded-2xl bg-card border border-border/50 p-4 active:scale-[0.98] transition-transform"
            style={cardShadow}
          >
            <div className="flex items-start gap-4">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${bonus.color}`}>
                <bonus.icon className="w-6 h-6" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold font-heading text-sm leading-tight">{bonus.title}</h3>
                <p className="text-[10px] text-muted-foreground font-body mt-1 leading-relaxed">{bonus.desc}</p>
                <div className="flex items-center justify-between mt-3">
                  <span className="flex items-center gap-1 text-[10px] font-body font-semibold text-muted-foreground bg-secondary px-2.5 py-1 rounded-full">
                    <bonus.typeIcon className="w-3 h-3" />
                    {bonus.type} • {mockPages[bonus.id]?.length || 0}p
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 rounded-xl text-xs text-primary hover:text-primary font-semibold"
                    onClick={() => setViewingBonus(bonus)}
                  >
                    <Eye className="w-3.5 h-3.5 mr-1" />
                    Pogledaj
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Bonus;
