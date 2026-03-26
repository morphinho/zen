import { useState } from "react";
import { useAppState, Recipe } from "@/context/AppContext";
import { useNavigate } from "react-router-dom";
import { Clock, Flame, Users, ArrowLeft, Search, RefreshCw as RefreshCwIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const cardShadow = { boxShadow: '0 8px 20px rgba(0,0,0,0.06)' };

const categoryColors: Record<string, string> = {
  Doručak: "bg-amber-100 text-amber-700",
  Ručak: "bg-emerald-100 text-emerald-700",
  Večera: "bg-indigo-100 text-indigo-700",
  Međuobrok: "bg-pink-100 text-pink-700",
  Napitak: "bg-cyan-100 text-cyan-700",
};

const filterTabs = ["Sve", "Doručak", "Ručak", "Večera", "Međuobrok"];

const Recipes = () => {
  const { mealPlan, hasCompletedOnboarding, questionnaire } = useAppState();
  const navigate = useNavigate();
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [activeFilter, setActiveFilter] = useState("Sve");
  const [searchQuery, setSearchQuery] = useState("");

  if (!hasCompletedOnboarding) {
    navigate("/onboarding");
    return null;
  }

  const allRecipes = mealPlan?.recipes || [];

  const filteredRecipes = allRecipes.filter((r) => {
    const matchesFilter = activeFilter === "Sve" || r.category === activeFilter;
    const matchesSearch = !searchQuery || r.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });


  // Detail view
  if (selectedRecipe) {
    return (
      <div className="space-y-4 py-4 animate-fade-up">
        <button onClick={() => setSelectedRecipe(null)} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors font-body">
          <ArrowLeft className="w-4 h-4" /> Natrag na recepte
        </button>

        <div className="rounded-3xl bg-gradient-to-br from-primary/10 via-primary/5 to-accent/5 p-5 border border-primary/10" style={cardShadow}>
          <div className="flex items-center gap-3">
            <span className="text-3xl">{selectedRecipe.emoji}</span>
            <div>
              <h1 className="text-lg font-bold font-heading">{selectedRecipe.title}</h1>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-body font-medium ${categoryColors[selectedRecipe.category] || "bg-muted text-muted-foreground"}`}>
                {selectedRecipe.category}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-4 text-xs text-muted-foreground font-body mt-3">
            <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{selectedRecipe.time}</span>
            <span className="flex items-center gap-1"><Flame className="w-3.5 h-3.5" />{selectedRecipe.calories} kcal</span>
            <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" />{selectedRecipe.servings} porc.</span>

          </div>
        </div>

        <div className="rounded-2xl bg-card p-4 border border-border/50" style={cardShadow}>
          <h3 className="font-bold font-heading text-sm mb-3">🧾 Sastojci</h3>
          <ul className="space-y-2">
            {selectedRecipe.ingredients.map((ing, i) => (
              <li key={i} className="flex items-center justify-between text-sm font-body">
                <span>{ing.name}</span>
                <span className="text-muted-foreground text-xs bg-secondary px-2.5 py-1 rounded-full">{ing.quantity}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-2xl bg-card p-4 border border-border/50" style={cardShadow}>
          <h3 className="font-bold font-heading text-sm mb-3">👨‍🍳 Priprema</h3>
          <ol className="space-y-3">
            {selectedRecipe.steps.map((step, i) => (
              <li key={i} className="flex gap-3 text-sm font-body">
                <span className="flex-shrink-0 w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">{i + 1}</span>
                <span className="leading-relaxed pt-0.5">{step}</span>
              </li>
            ))}
          </ol>
        </div>

        {selectedRecipe.tips && (
          <div className="rounded-2xl bg-primary/5 border border-primary/10 p-4" style={cardShadow}>
            <p className="text-xs font-body leading-relaxed"><span className="font-bold">💡 Tip:</span> {selectedRecipe.tips}</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4 py-4 animate-fade-up">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold font-heading">Recepti 🥗</h1>
        <p className="text-xs text-muted-foreground font-body mt-0.5">{allRecipes.length} dostupnih recepata</p>
      </div>

      {/* Search + Filter row */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Pretraži recept..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-11 rounded-2xl bg-card border border-border/50 pl-10 text-sm font-body"
            style={cardShadow}
          />
        </div>
        <Select value={activeFilter} onValueChange={setActiveFilter}>
          <SelectTrigger className="w-[120px] h-11 rounded-2xl bg-card border border-border/50 text-xs font-body font-semibold" style={cardShadow}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="rounded-xl">
            {filterTabs.map((tab) => (
              <SelectItem key={tab} value={tab} className="text-xs font-body">
                {tab}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>


      {/* Recipe cards */}
      <div className="space-y-3">
        {filteredRecipes.map((recipe, i) => (
          <div
            key={i}
            onClick={() => setSelectedRecipe(recipe)}
            className="rounded-2xl bg-card border border-border/50 overflow-hidden cursor-pointer active:scale-[0.98] transition-transform flex p-4 gap-3"
            style={cardShadow}
          >
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center text-2xl flex-shrink-0">
              {recipe.emoji}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold font-heading text-sm leading-tight truncate">{recipe.title}</h3>
              <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                <span className={`text-[9px] px-2 py-0.5 rounded-full font-body font-semibold ${categoryColors[recipe.category] || "bg-muted text-muted-foreground"}`}>
                  {recipe.category}
                </span>
                <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground font-body">
                  <Clock className="w-2.5 h-2.5" />{recipe.time}
                </span>
                <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground font-body">
                  <Flame className="w-2.5 h-2.5" />{recipe.calories} kcal
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredRecipes.length === 0 && (
        <div className="text-center py-8">
          <p className="text-sm text-muted-foreground font-body">Recepti nisu pronađeni</p>
        </div>
      )}

      {/* Renewal notice */}
      <div className="rounded-2xl bg-primary/5 border border-primary/10 p-4 text-center" style={cardShadow}>
        <div className="flex items-center justify-center gap-2 mb-1">
          <RefreshCwIcon className="w-3.5 h-3.5 text-primary" />
          <span className="text-xs font-heading font-bold text-primary">Obnovljivi recepti</span>
        </div>
        <p className="text-[10px] text-muted-foreground font-body">Tvoji recepti se automatski obnavljaju svakih 24 sata prema tvom planu prehrane.</p>
      </div>
    </div>
  );
};

export default Recipes;
