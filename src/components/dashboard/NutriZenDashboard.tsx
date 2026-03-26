import { useAppState } from "@/context/AppContext";
import { useNavigate } from "react-router-dom";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import {
  Flame, Target, Utensils, Clock, ChevronRight, Leaf, Lightbulb,
} from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

const cardShadow = { boxShadow: '0 8px 20px rgba(0,0,0,0.06)' };

const NutriZenDashboard = () => {
  const { mealPlan, questionnaire, progress, hasCompletedOnboarding } = useAppState();
  const navigate = useNavigate();
  const [dailyTip, setDailyTip] = useState<{ tip: string; emoji: string } | null>(null);
  const [loadingTip, setLoadingTip] = useState(false);

  useEffect(() => {
    if (!hasCompletedOnboarding || dailyTip) return;
    const cacheKey = "nutrizen_daily_tip";
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      try {
        const { tip, date } = JSON.parse(cached);
        if (date === new Date().toISOString().split("T")[0] && tip) {
          setDailyTip(tip);
          return;
        }
      } catch {}
    }
    setLoadingTip(true);
    supabase.functions.invoke("generate-daily-tip", {
      body: { goal: questionnaire?.goal || "mejorar alimentación" },
    }).then(({ data, error }) => {
      if (!error && data && !data.error) {
        setDailyTip(data);
        localStorage.setItem(cacheKey, JSON.stringify({ tip: data, date: new Date().toISOString().split("T")[0] }));
      }
    }).finally(() => setLoadingTip(false));
  }, [hasCompletedOnboarding, dailyTip, questionnaire]);

  if (!hasCompletedOnboarding) {
    return (
      <div className="space-y-4 py-4 animate-fade-up">
        <div className="rounded-3xl bg-gradient-to-br from-primary/10 via-primary/5 to-accent/5 p-6 border border-primary/10 text-center" style={cardShadow}>
          <Leaf className="w-10 h-10 text-primary mx-auto mb-3" />
          <h1 className="text-lg font-bold font-heading">NutriZen</h1>
          <p className="text-sm text-muted-foreground font-body mt-2">
            Ispuni svoj prehrambeni profil kako bismo kreirali tvoj personalizirani plan.
          </p>
          <Button variant="cta" className="mt-4 h-12 rounded-2xl text-sm font-semibold" onClick={() => navigate("/onboarding")}>
            Ispuni profil
          </Button>
        </div>
      </div>
    );
  }

  const totalCalories = mealPlan?.daily_calories || 0;
  const consumedCalories = progress?.calories_consumed_today || 0;
  const caloriePercent = totalCalories > 0 ? Math.min(Math.round((consumedCalories / totalCalories) * 100), 100) : 0;

  return (
    <div className="space-y-4 py-4 animate-fade-up">
      <div>
        <h1 className="text-xl font-bold font-heading">NutriZen 🌿</h1>
        <p className="text-xs text-muted-foreground font-body mt-0.5">Tvoja personalizirana prehrana</p>
      </div>

      {/* Calorie card */}
      <div className="rounded-2xl bg-card p-4 border border-border/50" style={cardShadow}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-accent/10 flex items-center justify-center">
              <Flame className="w-4 h-4 text-accent" />
            </div>
            <span className="text-xs font-heading font-bold">Današnji unos</span>
          </div>
          <span className="text-xs font-body text-muted-foreground">{consumedCalories} / {totalCalories} kcal</span>
        </div>
        <Progress value={caloriePercent} className="h-2.5" />
      </div>

      {/* Plan card */}
      <div
        className="rounded-2xl bg-card p-4 border border-border/50 cursor-pointer active:scale-[0.98] transition-transform"
        style={cardShadow}
        onClick={() => navigate("/dashboard/plan")}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary-light flex items-center justify-center">
              <Target className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-body">Prehrambeni plan</p>
              <p className="text-sm font-bold font-heading">{mealPlan?.daily_calories || "—"} kcal/dan</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        </div>
      </div>

      {/* Recipes shortcut */}
      <div
        className="rounded-2xl bg-card p-4 border border-border/50 cursor-pointer active:scale-[0.98] transition-transform"
        style={cardShadow}
        onClick={() => navigate("/dashboard/recetas")}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
              <Utensils className="w-5 h-5 text-accent" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-body">Zdravi recepti</p>
              <p className="text-sm font-bold font-heading">{mealPlan?.recipes?.length || 0} dostupno</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        </div>
      </div>

      {/* Tip */}
      <div className="rounded-2xl bg-primary/5 border border-primary/10 p-4" style={cardShadow}>
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-xl bg-primary-light flex items-center justify-center flex-shrink-0">
            <Lightbulb className="w-4 h-4 text-primary" />
          </div>
          <div>
            <p className="text-xs font-heading font-bold">NutriZen savjet</p>
            {loadingTip ? (
              <p className="text-xs font-body text-muted-foreground mt-1 animate-pulse">Učitavam...</p>
            ) : dailyTip ? (
              <p className="text-xs font-body text-muted-foreground mt-1 italic">"{dailyTip.tip}"</p>
            ) : (
              <p className="text-xs font-body text-muted-foreground mt-1 italic">"Osobe koje jedu proteine za doručak osjećaju manje gladi tijekom dana."</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NutriZenDashboard;
