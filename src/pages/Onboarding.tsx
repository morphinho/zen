import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { ChevronLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useAppState, QuestionnaireData } from "@/context/AppContext";
import { supabase } from "@/integrations/supabase/client";
import zenlifeLogo from "@/assets/zenlife-logo.svg";

const TOTAL_STEPS = 7;

const goalOptions = [
  { value: "emagrecer", label: "Smršavjeti", emoji: "⚖️", desc: "Izgubiti kilograme na zdrav način" },
  { value: "inchaco", label: "Smanjiti nadutost", emoji: "🌿", desc: "Manje upale i nelagode" },
  { value: "energia", label: "Dobiti energiju", emoji: "⚡", desc: "Osjećati se aktivnije i vitalnije" },
  { value: "alimentacion", label: "Poboljšati prehranu", emoji: "🥗", desc: "Jesti bolje svaki dan" },
];

const activityOptions = [
  { value: "sedentaria", label: "Sjedilačka", emoji: "🛋️", desc: "Malo kretanja tijekom dana" },
  { value: "activa", label: "Aktivna", emoji: "🚶‍♀️", desc: "Hodam i krećem se redovito" },
  { value: "pilates", label: "Pilates uz zid", emoji: "🧘‍♀️", desc: "1-2 puta tjedno" },
  { value: "3-5x", label: "3-5x tjedno", emoji: "🏃‍♀️", desc: "Redovito vježbanje" },
  { value: "5+", label: "Više od 5x", emoji: "💪", desc: "Intenzivan trening" },
];

const restrictionOptions = ["Nema", "Bez laktoze", "Bez glutena", "Vegetarijanska"];

const foodPreferenceOptions = [
  "Piletina", "Riba", "Jaja", "Meso", "Riža", "Salate", "Voće", "Mliječni proizvodi",
];

const difficultyOptions = [
  { value: "muy_simple", label: "Vrlo jednostavno", emoji: "🍳", desc: "Recepti od 5-10 minuta" },
  { value: "simple", label: "Jednostavno", emoji: "👨‍🍳", desc: "Recepti do 20 minuta" },
  { value: "elaborada", label: "Složenije", emoji: "🧑‍🍳", desc: "Recepti s više koraka" },
];

const Onboarding = () => {
  const navigate = useNavigate();
  const { setQuestionnaire, setMealPlan, hasCompletedOnboarding, loadingData } = useAppState();
  const [step, setStep] = useState(1);

  // If onboarding already completed, redirect to dashboard
  useEffect(() => {
    if (!loadingData && hasCompletedOnboarding) {
      navigate("/dashboard", { replace: true });
    }
  }, [loadingData, hasCompletedOnboarding, navigate]);

  // Form state
  const [age, setAge] = useState("");
  const [height, setHeight] = useState("");
  const [currentWeight, setCurrentWeight] = useState("");
  const [desiredWeight, setDesiredWeight] = useState("");
  const [goal, setGoal] = useState("");
  const [activityLevel, setActivityLevel] = useState("");
  const [restrictions, setRestrictions] = useState<string[]>([]);
  const [foodPreferences, setFoodPreferences] = useState<string[]>([]);
  const [difficultyLevel, setDifficultyLevel] = useState("");

  // Loading state
  const [isGenerating, setIsGenerating] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingText, setLoadingText] = useState("");

  const toggleItem = (list: string[], item: string, setter: (v: string[]) => void) => {
    if (item === "Nema") {
      setter(list.includes("Nema") ? [] : ["Nema"]);
      return;
    }
    const without = list.filter(x => x !== "Nema");
    setter(without.includes(item) ? without.filter(x => x !== item) : [...without, item]);
  };

  const canAdvance = () => {
    switch (step) {
      case 1: return age !== "" && height !== "" && currentWeight !== "" && desiredWeight !== "";
      case 2: return goal !== "";
      case 3: return activityLevel !== "";
      case 4: return restrictions.length > 0;
      case 5: return foodPreferences.length > 0;
      case 6: return difficultyLevel !== "";
      case 7: return true;
      default: return false;
    }
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    setLoadingProgress(0);
    setLoadingText("Analiziram tvoje podatke...");

    const messages = [
      { at: 0, text: "Analiziram tvoje podatke..." },
      { at: 10, text: "Izračunavam kalorijske potrebe..." },
      { at: 25, text: "Odabirem idealne namirnice..." },
      { at: 40, text: "Sastavljam tvoj dnevni plan..." },
      { at: 55, text: "Generiram tjedne varijacije..." },
      { at: 70, text: "Kreiram personalizirane recepte..." },
      { at: 85, text: "Prilagođavam porcije..." },
      { at: 95, text: "Dovršavam tvoj NutriZen plan..." },
    ];

    let progress = 0;
    const interval = setInterval(() => {
      progress += 0.5;
      if (progress > 95) progress = 95;
      setLoadingProgress(Math.round(progress));
      const msg = [...messages].reverse().find(m => progress >= m.at);
      if (msg) setLoadingText(msg.text);
    }, 100);

    const questionnaireData: QuestionnaireData = {
      age, height, current_weight: currentWeight, desired_weight: desiredWeight,
      goal, activity_level: activityLevel,
      restrictions: restrictions.includes("Nema") ? [] : restrictions,
      food_preferences: foodPreferences, difficulty_level: difficultyLevel,
    };

    try {
      await setQuestionnaire(questionnaireData);

      const { data, error } = await supabase.functions.invoke("generate-meal-plan", {
        body: { questionnaire: questionnaireData },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      await setMealPlan(data);

      clearInterval(interval);
      setLoadingProgress(100);
      setLoadingText("Gotovo!");

      setTimeout(() => {
        toast.success("Tvoj plan prehrane je spreman!");
        navigate("/dashboard");
      }, 800);
    } catch (e: any) {
      clearInterval(interval);
      setIsGenerating(false);
      console.error("Error generating plan:", e);
      toast.error("Greška pri generiranju plana. Pokušajte ponovo.");
    }
  };

  const next = () => {
    if (step < TOTAL_STEPS) setStep(step + 1);
    else handleGenerate();
  };

  const back = () => {
    if (step > 1) setStep(step - 1);
  };

  if (isGenerating) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background px-8 text-center animate-fade-up">
        <div className="relative w-24 h-24 mb-8">
          <div className="absolute inset-0 rounded-full border-4 border-secondary" />
          <svg className="absolute inset-0 w-24 h-24 -rotate-90" viewBox="0 0 96 96">
            <circle cx="48" cy="48" r="44" fill="none" stroke="hsl(var(--primary))" strokeWidth="4" strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 44}`}
              strokeDashoffset={`${2 * Math.PI * 44 * (1 - loadingProgress / 100)}`}
              className="transition-all duration-200"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-lg font-bold font-heading text-primary">{loadingProgress}%</span>
          </div>
        </div>
        <h2 className="text-lg font-bold font-heading mb-2">Kreiram tvoj personalizirani plan prehrane...</h2>
        <p className="text-sm text-muted-foreground font-body animate-pulse max-w-[280px]">{loadingText}</p>
        <Progress value={loadingProgress} className="h-1 w-48 rounded-full mt-6" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="px-5 pt-6 pb-2 max-w-lg mx-auto w-full">
        <div className="flex items-center gap-3 mb-2">
          {step > 1 && (
            <button onClick={back} className="w-8 h-8 rounded-xl flex items-center justify-center text-muted-foreground hover:bg-secondary transition-colors">
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}
          {step === 1 && <img src={zenlifeLogo} alt="ZenLife" className="h-7" />}
          <div className="flex-1">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-body font-medium">
              Korak {step} od {TOTAL_STEPS}
            </p>
          </div>
        </div>
        <Progress value={(step / TOTAL_STEPS) * 100} className="h-1 rounded-full" />
      </div>

      {/* Content */}
      <div className="flex-1 px-5 py-6 max-w-lg mx-auto w-full flex flex-col">
        {step === 1 && (
          <div className="space-y-5 animate-slide-up">
            <div>
              <h1 className="text-xl font-bold font-heading leading-tight">Kreirajmo tvoj personalizirani plan prehrane</h1>
              <p className="text-sm text-muted-foreground font-body mt-1">Odgovori na nekoliko brzih pitanja kako bismo sastavili tvoju idealnu prehranu.</p>
            </div>
            <div className="space-y-3">
              <div className="bg-card rounded-2xl p-4 wellness-card space-y-1.5">
                <label className="text-xs text-muted-foreground font-body font-medium">Dob</label>
                <Input value={age} onChange={e => setAge(e.target.value)} placeholder="30" type="number" className="h-12 rounded-xl bg-secondary border-0 text-lg font-heading font-bold" />
              </div>
              <div className="bg-card rounded-2xl p-4 wellness-card space-y-1.5">
                <label className="text-xs text-muted-foreground font-body font-medium">Visina (cm)</label>
                <Input value={height} onChange={e => setHeight(e.target.value)} placeholder="165" type="number" className="h-12 rounded-xl bg-secondary border-0 text-lg font-heading font-bold" />
              </div>
              <div className="bg-card rounded-2xl p-4 wellness-card space-y-1.5">
                <label className="text-xs text-muted-foreground font-body font-medium">Trenutna težina (kg)</label>
                <Input value={currentWeight} onChange={e => setCurrentWeight(e.target.value)} placeholder="65" type="number" className="h-12 rounded-xl bg-secondary border-0 text-lg font-heading font-bold" />
              </div>
              <div className="bg-card rounded-2xl p-4 wellness-card space-y-1.5">
                <label className="text-xs text-muted-foreground font-body font-medium">Željena težina (kg)</label>
                <Input value={desiredWeight} onChange={e => setDesiredWeight(e.target.value)} placeholder="58" type="number" className="h-12 rounded-xl bg-secondary border-0 text-lg font-heading font-bold" />
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-5 animate-slide-up">
            <div>
              <h1 className="text-xl font-bold font-heading leading-tight">Koji je tvoj glavni cilj?</h1>
              <p className="text-sm text-muted-foreground font-body mt-1">Odaberi opciju koja te najbolje opisuje</p>
            </div>
            <RadioGroup value={goal} onValueChange={setGoal} className="space-y-3">
              {goalOptions.map(opt => (
                <label key={opt.value} htmlFor={opt.value}
                  className={`flex items-center gap-4 p-4 rounded-2xl cursor-pointer transition-all duration-200 ${
                    goal === opt.value ? "bg-primary-light ring-2 ring-primary/30" : "bg-card wellness-card hover:bg-secondary"
                  }`}
                >
                  <RadioGroupItem value={opt.value} id={opt.value} className="sr-only" />
                  <span className="text-2xl">{opt.emoji}</span>
                  <div>
                    <p className="font-bold font-heading text-sm">{opt.label}</p>
                    <p className="text-xs text-muted-foreground font-body">{opt.desc}</p>
                  </div>
                </label>
              ))}
            </RadioGroup>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-5 animate-slide-up">
            <div>
              <h1 className="text-xl font-bold font-heading leading-tight">Razina aktivnosti</h1>
              <p className="text-sm text-muted-foreground font-body mt-1">Ovo nam pomaže izračunati tvoje kalorije</p>
            </div>
            <RadioGroup value={activityLevel} onValueChange={setActivityLevel} className="space-y-3">
              {activityOptions.map(opt => (
                <label key={opt.value} htmlFor={`act-${opt.value}`}
                  className={`flex items-center gap-4 p-4 rounded-2xl cursor-pointer transition-all duration-200 ${
                    activityLevel === opt.value ? "bg-primary-light ring-2 ring-primary/30" : "bg-card wellness-card hover:bg-secondary"
                  }`}
                >
                  <RadioGroupItem value={opt.value} id={`act-${opt.value}`} className="sr-only" />
                  <span className="text-2xl">{opt.emoji}</span>
                  <div>
                    <p className="font-bold font-heading text-sm">{opt.label}</p>
                    <p className="text-xs text-muted-foreground font-body">{opt.desc}</p>
                  </div>
                </label>
              ))}
            </RadioGroup>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-5 animate-slide-up">
            <div>
              <h1 className="text-xl font-bold font-heading leading-tight">Imaš li kakva prehrambena ograničenja?</h1>
              <p className="text-sm text-muted-foreground font-body mt-1">Odaberi sve koje se odnose na tebe</p>
            </div>
            <div className="space-y-3">
              {restrictionOptions.map(r => (
                <label key={r} htmlFor={`r-${r}`}
                  className={`flex items-center gap-3 p-4 rounded-2xl cursor-pointer transition-all duration-200 ${
                    restrictions.includes(r) ? "bg-primary-light ring-2 ring-primary/30" : "bg-card wellness-card hover:bg-secondary"
                  }`}
                >
                  <Checkbox id={`r-${r}`} checked={restrictions.includes(r)} onCheckedChange={() => toggleItem(restrictions, r, setRestrictions)} className="rounded-lg" />
                  <span className="font-medium font-body text-sm">{r}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {step === 5 && (
          <div className="space-y-5 animate-slide-up">
            <div>
              <h1 className="text-xl font-bold font-heading leading-tight">Prehrambene preferencije</h1>
              <p className="text-sm text-muted-foreground font-body mt-1">Koje namirnice voliš?</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {foodPreferenceOptions.map(f => (
                <label key={f} htmlFor={`f-${f}`}
                  className={`flex items-center gap-2 p-3 rounded-2xl cursor-pointer transition-all duration-200 ${
                    foodPreferences.includes(f) ? "bg-primary-light ring-2 ring-primary/30" : "bg-card wellness-card hover:bg-secondary"
                  }`}
                >
                  <Checkbox id={`f-${f}`} checked={foodPreferences.includes(f)} onCheckedChange={() => toggleItem(foodPreferences, f, setFoodPreferences)} className="rounded-lg" />
                  <span className="font-medium font-body text-sm">{f}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {step === 6 && (
          <div className="space-y-5 animate-slide-up">
            <div>
              <h1 className="text-xl font-bold font-heading leading-tight">Razina složenosti recepata</h1>
              <p className="text-sm text-muted-foreground font-body mt-1">Koliko složeni mogu biti?</p>
            </div>
            <RadioGroup value={difficultyLevel} onValueChange={setDifficultyLevel} className="space-y-3">
              {difficultyOptions.map(opt => (
                <label key={opt.value} htmlFor={`diff-${opt.value}`}
                  className={`flex items-center gap-4 p-4 rounded-2xl cursor-pointer transition-all duration-200 ${
                    difficultyLevel === opt.value ? "bg-primary-light ring-2 ring-primary/30" : "bg-card wellness-card hover:bg-secondary"
                  }`}
                >
                  <RadioGroupItem value={opt.value} id={`diff-${opt.value}`} className="sr-only" />
                  <span className="text-2xl">{opt.emoji}</span>
                  <div>
                    <p className="font-bold font-heading text-sm">{opt.label}</p>
                    <p className="text-xs text-muted-foreground font-body">{opt.desc}</p>
                  </div>
                </label>
              ))}
            </RadioGroup>
          </div>
        )}

        {step === 7 && (
          <div className="space-y-5 animate-slide-up">
            <div>
              <h1 className="text-xl font-bold font-heading leading-tight">Sve je spremno 🎉</h1>
              <p className="text-sm text-muted-foreground font-body mt-1">Pregledaj sažetak prije kreiranja plana</p>
            </div>
            <div className="space-y-3">
              <SummaryRow label="Podaci" value={`${age} god. · ${height}cm · ${currentWeight}kg → ${desiredWeight}kg`} />
              <SummaryRow label="Cilj" value={goalOptions.find(g => g.value === goal)?.label || goal} />
              <SummaryRow label="Aktivnost" value={activityOptions.find(a => a.value === activityLevel)?.label || activityLevel} />
              <SummaryRow label="Ograničenja" value={restrictions.join(", ") || "Nema"} />
              <SummaryRow label="Preferencije" value={foodPreferences.join(", ")} />
              <SummaryRow label="Složenost" value={difficultyOptions.find(d => d.value === difficultyLevel)?.label || difficultyLevel} />
            </div>
          </div>
        )}

        <div className="mt-auto pt-6">
          <Button variant="cta" className="w-full h-12 rounded-2xl text-sm" onClick={next} disabled={!canAdvance()}>
            {step === TOTAL_STEPS ? "Kreiraj moj NutriZen plan" : "Nastavi"}
          </Button>
        </div>
      </div>
    </div>
  );
};

const SummaryRow = ({ label, value }: { label: string; value: string }) => (
  <div className="bg-card rounded-2xl p-4 wellness-card flex justify-between items-center">
    <span className="text-xs text-muted-foreground font-body">{label}</span>
    <span className="text-sm font-bold font-heading text-right max-w-[60%]">{value}</span>
  </div>
);

export default Onboarding;
