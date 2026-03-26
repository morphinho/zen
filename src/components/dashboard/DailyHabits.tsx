import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Checkbox } from "@/components/ui/checkbox";
import { Droplets, Utensils, Dumbbell } from "lucide-react";

const cardShadow = { boxShadow: '0 8px 20px rgba(0,0,0,0.06)' };

const habits = [
  { key: "completed_class" as const, label: "Odradila sam lekciju", icon: Dumbbell },
  { key: "drank_water" as const, label: "Popila sam vodu", icon: Droplets },
  { key: "ate_well" as const, label: "Jela sam zdravo", icon: Utensils },
];

type HabitKeys = "completed_class" | "drank_water" | "ate_well";

const DailyHabits = ({ userId }: { userId: string }) => {
  const [state, setState] = useState<Record<HabitKeys, boolean>>({
    completed_class: false,
    drank_water: false,
    ate_well: false,
  });
  const [existingId, setExistingId] = useState<string | null>(null);

  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    (supabase as any)
      .from("daily_habits")
      .select("*")
      .eq("user_id", userId)
      .eq("habit_date", today)
      .maybeSingle()
      .then(({ data }: any) => {
        if (data) {
          setExistingId(data.id);
          setState({
            completed_class: data.completed_class,
            drank_water: data.drank_water,
            ate_well: data.ate_well,
          });
        }
      });
  }, [userId]);

  const toggle = async (key: HabitKeys) => {
    const newVal = !state[key];
    const newState = { ...state, [key]: newVal };
    setState(newState);

    const today = new Date().toISOString().split("T")[0];
    if (existingId) {
      await (supabase as any).from("daily_habits").update({ [key]: newVal }).eq("id", existingId);
    } else {
      const { data } = await (supabase as any)
        .from("daily_habits")
        .insert({ user_id: userId, habit_date: today, ...newState })
        .select("id")
        .maybeSingle();
      if (data) setExistingId(data.id);
    }
  };

  const done = Object.values(state).filter(Boolean).length;

  return (
    <div className="rounded-2xl bg-card p-4 border border-border/50" style={cardShadow}>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-heading font-bold">Dnevne navike</h2>
        <span className="text-[10px] font-body text-primary font-semibold">{done}/3</span>
      </div>
      <div className="space-y-2.5">
        {habits.map((h) => (
          <label
            key={h.key}
            className={`flex items-center gap-3 p-2.5 rounded-xl cursor-pointer transition-colors ${
              state[h.key] ? "bg-primary/5" : "hover:bg-muted/50"
            }`}
          >
            <Checkbox
              checked={state[h.key]}
              onCheckedChange={() => toggle(h.key)}
              className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
            />
            <h.icon className={`w-4 h-4 ${state[h.key] ? "text-primary" : "text-muted-foreground"}`} />
            <span className={`text-xs font-body ${state[h.key] ? "line-through text-muted-foreground" : ""}`}>
              {h.label}
            </span>
          </label>
        ))}
      </div>
    </div>
  );
};

export default DailyHabits;
