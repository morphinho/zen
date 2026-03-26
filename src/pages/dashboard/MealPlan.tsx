import { useState } from "react";
import { useAppState } from "@/context/AppContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RefreshCw, Loader2, Flame, ChevronDown, UtensilsCrossed, CheckCircle2, Circle } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

const cardShadow = { boxShadow: '0 8px 20px rgba(0,0,0,0.06)' };

const MealPlan = () => {
  const { hasCompletedOnboarding, mealPlan, questionnaire, setMealPlan, progress, toggleMealChecked } = useAppState();
  const navigate = useNavigate();
  const [regenerating, setRegenerating] = useState(false);
  const [activeVariation, setActiveVariation] = useState(-1);
  const [showUpdateDialog, setShowUpdateDialog] = useState(false);
  const [newWeight, setNewWeight] = useState("");
  const [expandedMeal, setExpandedMeal] = useState<number | null>(0);

  if (!hasCompletedOnboarding || !mealPlan) {
    navigate("/onboarding");
    return null;
  }

  const activeMeals = activeVariation === -1
    ? mealPlan.daily_plan
    : mealPlan.weekly_variations?.[activeVariation]?.meals || [];

  // Real data from progress tracking
  const totalCalories = mealPlan.daily_calories || 0;
  const consumedCalories = progress?.calories_consumed_today || 0;
  const caloriePercent = totalCalories > 0 ? Math.min(Math.round((consumedCalories / totalCalories) * 100), 100) : 0;

  const handleRegenerate = async () => {
    if (!questionnaire) return;
    setRegenerating(true);
    setShowUpdateDialog(false);
    try {
      const updatedQ = newWeight ? { ...questionnaire, current_weight: newWeight } : questionnaire;
      const { data, error } = await supabase.functions.invoke("generate-meal-plan", {
        body: { questionnaire: updatedQ },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      await setMealPlan(data);
      setActiveVariation(-1);
      toast.success("Novi plan je generiran!");
    } catch (e: any) {
      toast.error("Greška pri regeneriranju plana");
      console.error(e);
    } finally {
      setRegenerating(false);
    }
  };

  return (
    <div className="space-y-4 py-4 animate-fade-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold font-heading">Moj plan 🍽</h1>
          <p className="text-xs text-muted-foreground font-body mt-0.5">Tvoj personalizirani plan prehrane</p>
        </div>
        <Dialog open={showUpdateDialog} onOpenChange={setShowUpdateDialog}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl" disabled={regenerating}>
              {regenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            </Button>
          </DialogTrigger>
          <DialogContent className="rounded-3xl max-w-[340px] border border-border/50" style={cardShadow}>
            <DialogHeader>
              <DialogTitle className="font-heading text-lg">Ažuriraj i regeneriraj</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs text-muted-foreground font-body">Nova težina (kg) - opcionalno</label>
                <Input value={newWeight} onChange={e => setNewWeight(e.target.value)} placeholder={questionnaire?.current_weight || "—"} type="number" className="h-11 rounded-2xl bg-secondary border-0" />
              </div>
              <Button variant="cta" className="w-full h-12 rounded-2xl text-sm font-semibold" onClick={handleRegenerate}>
                Generiraj novi plan
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Calorie Summary Card */}
      <div className="rounded-3xl bg-gradient-to-br from-primary/10 via-primary/5 to-accent/5 p-5 border border-primary/10" style={cardShadow}>
        <div className="flex items-center gap-2 mb-3">
          <Flame className="w-5 h-5 text-accent" />
          <span className="text-sm font-heading font-bold">Tvoj današnji plan</span>
        </div>
        <div className="flex items-end justify-between mb-2">
          <div>
            <span className="text-3xl font-heading font-bold text-foreground">{consumedCalories}</span>
            <span className="text-sm text-muted-foreground font-body"> / {totalCalories} kcal</span>
          </div>
          <span className="text-xs text-primary font-body font-semibold">{caloriePercent}%</span>
        </div>
        <Progress value={caloriePercent} className="h-3 rounded-full" />
        <p className="text-[10px] text-muted-foreground font-body mt-2">Kalorijski napredak za danas</p>
      </div>

      {/* Variation selector */}
      {mealPlan.weekly_variations && mealPlan.weekly_variations.length > 0 && (
        <Select value={String(activeVariation)} onValueChange={(v) => setActiveVariation(Number(v))}>
          <SelectTrigger className="h-11 rounded-2xl bg-card border border-border/50 text-xs font-body font-semibold" style={cardShadow}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="rounded-xl">
            <SelectItem value="-1" className="text-xs font-body">Glavni plan</SelectItem>
            {mealPlan.weekly_variations.map((v, i) => (
              <SelectItem key={i} value={String(i)} className="text-xs font-body">{v.variation_name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {/* Meal Cards */}
      {activeMeals.map((meal, idx) => {
        const isExpanded = expandedMeal === idx;
        const mealTotal = meal.items.reduce((a, b) => a + b.calories, 0);
        const isMealChecked = progress?.checked_meals?.includes(meal.meal_name) || false;

        return (
          <Collapsible
            key={idx}
            open={isExpanded}
            onOpenChange={(open) => setExpandedMeal(open ? idx : null)}
          >
            <div
              className={`rounded-2xl bg-card border overflow-hidden transition-all duration-300 ${isMealChecked ? "border-primary/30 bg-primary/[0.02]" : "border-border/50"}`}
              style={cardShadow}
            >
              <div className="flex items-center">
                <CollapsibleTrigger asChild>
                  <button className="flex-1 flex items-center justify-between p-4 text-left">
                    <div className="flex items-center gap-3">
                      <div className={`w-11 h-11 rounded-2xl flex items-center justify-center text-xl transition-colors ${isMealChecked ? "bg-primary/10" : "bg-primary/5"}`}>
                        {meal.emoji}
                      </div>
                      <div>
                        <h3 className={`font-bold text-sm font-heading ${isMealChecked ? "text-primary" : ""}`}>{meal.meal_name}</h3>
                        <p className="text-[10px] text-muted-foreground font-body mt-0.5">
                          {meal.items.length} namirnica · {mealTotal} kcal
                          {isMealChecked && <span className="text-primary ml-1">✓ Konzumirano</span>}
                        </p>
                      </div>
                    </div>
                    <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform duration-300 ${isExpanded ? "rotate-180" : ""}`} />
                  </button>
                </CollapsibleTrigger>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleMealChecked(meal.meal_name, mealTotal);
                  }}
                  className="pr-4 pl-1"
                >
                  {isMealChecked ? (
                    <CheckCircle2 className="w-6 h-6 text-primary transition-all duration-200" />
                  ) : (
                    <Circle className="w-6 h-6 text-muted-foreground/40 hover:text-primary/60 transition-all duration-200" />
                  )}
                </button>
              </div>

              <CollapsibleContent className="overflow-hidden data-[state=open]:animate-collapsible-down data-[state=closed]:animate-collapsible-up">
                <div className="px-4 pb-4">
                  <div className="space-y-2.5 border-t border-border/30 pt-3">
                    {meal.items.map((item, i) => (
                      <div key={i} className="flex items-center justify-between">
                        <div className="font-body text-sm">
                          <span className="font-medium">{item.food}</span>
                          <span className="text-muted-foreground text-xs ml-1.5">· {item.quantity}</span>
                        </div>
                        <span className="text-[10px] text-muted-foreground font-body bg-secondary px-2.5 py-1 rounded-full">{item.calories} kcal</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 pt-3 border-t border-border/30 flex items-center justify-between">
                    <span className="text-xs font-bold font-heading text-primary bg-primary-light px-3 py-1 rounded-full">
                      Total: {mealTotal} kcal
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs h-8 rounded-xl text-primary hover:text-primary"
                      onClick={() => navigate("/dashboard/recetas")}
                    >
                      <UtensilsCrossed className="w-3.5 h-3.5 mr-1" />
                      Vidi recept
                    </Button>
                  </div>
                </div>
              </CollapsibleContent>
            </div>
          </Collapsible>
        );
      })}
    </div>
  );
};

export default MealPlan;
