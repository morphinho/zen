import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Progress } from "@/components/ui/progress";
import { Droplets } from "lucide-react";
import { toast } from "sonner";

const cardShadow = { boxShadow: '0 8px 20px rgba(0,0,0,0.06)' };
const quickAmounts = [250, 500, 750];

const WaterIntake = ({ userId }: { userId: string }) => {
  const [todayMl, setTodayMl] = useState(0);
  const [goalMl, setGoalMl] = useState(2000);
  const [weekData, setWeekData] = useState<{ day: string; ml: number }[]>([]);
  const [adding, setAdding] = useState(false);
  const [goalReached, setGoalReached] = useState(false);

  const today = new Date().toISOString().split("T")[0];

  const loadData = async () => {
    // Load goal from profile
    const { data: profile } = await (supabase as any)
      .from("profiles")
      .select("water_goal_ml")
      .eq("id", userId)
      .maybeSingle();
    if (profile?.water_goal_ml) setGoalMl(profile.water_goal_ml);

    // Load today's intake
    const { data: todayData } = await (supabase as any)
      .from("water_intake")
      .select("amount_ml")
      .eq("user_id", userId)
      .gte("created_at", today + "T00:00:00")
      .lte("created_at", today + "T23:59:59");
    const total = (todayData || []).reduce((s: number, r: any) => s + r.amount_ml, 0);
    setTodayMl(total);
    if (total >= (profile?.water_goal_ml || 2000) && !goalReached) {
      setGoalReached(true);
    }

    // Load last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    const { data: weekRaw } = await (supabase as any)
      .from("water_intake")
      .select("amount_ml, created_at")
      .eq("user_id", userId)
      .gte("created_at", sevenDaysAgo.toISOString().split("T")[0] + "T00:00:00")
      .order("created_at", { ascending: true });

    const dayNames = ["Ned", "Pon", "Uto", "Sri", "Čet", "Pet", "Sub"];
    const grouped: Record<string, number> = {};
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() - 6 + i);
      grouped[d.toISOString().split("T")[0]] = 0;
    }
    (weekRaw || []).forEach((r: any) => {
      const key = r.created_at.split("T")[0];
      if (grouped[key] !== undefined) grouped[key] += r.amount_ml;
    });
    setWeekData(
      Object.entries(grouped).map(([date, ml]) => ({
        day: dayNames[new Date(date + "T12:00:00").getDay()],
        ml,
      }))
    );
  };

  useEffect(() => { loadData(); }, [userId]);

  const addWater = async (ml: number) => {
    setAdding(true);
    const { error } = await (supabase as any)
      .from("water_intake")
      .insert({ user_id: userId, amount_ml: ml });
    setAdding(false);
    if (error) { toast.error("Greška pri bilježenju"); return; }

    const newTotal = todayMl + ml;
    setTodayMl(newTotal);
    if (newTotal >= goalMl && !goalReached) {
      setGoalReached(true);
      toast.success("Cilj hidratacije postignut! 💧");
    }
    loadData();
  };

  const percent = Math.min(Math.round((todayMl / goalMl) * 100), 100);
  const liters = (todayMl / 1000).toFixed(1);
  const goalLiters = (goalMl / 1000).toFixed(1);
  const maxWeek = Math.max(...weekData.map(d => d.ml), goalMl);

  return (
    <div className="rounded-2xl bg-card p-4 border border-border/50" style={cardShadow}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Droplets className="w-4 h-4 text-sky-500" />
          <h2 className="text-sm font-heading font-bold">Dnevna hidratacija</h2>
        </div>
        {goalReached && (
          <span className="text-[9px] font-body font-bold text-sky-500 bg-sky-500/10 px-2 py-0.5 rounded-full">
            💧 Cilj!
          </span>
        )}
      </div>

      {/* Progress */}
      <div className="flex items-end gap-3 mb-3">
        <p className="text-2xl font-heading font-bold leading-none text-sky-600">{liters}L</p>
        <p className="text-xs text-muted-foreground font-body mb-0.5">/ {goalLiters}L</p>
      </div>
      <div className="h-2.5 rounded-full bg-sky-100 overflow-hidden mb-4">
        <div
          className="h-full rounded-full bg-gradient-to-r from-sky-400 to-sky-500 transition-all duration-500"
          style={{ width: `${percent}%` }}
        />
      </div>

      {/* Quick add buttons */}
      <div className="flex gap-2 mb-4">
        {quickAmounts.map((ml) => (
          <button
            key={ml}
            onClick={() => addWater(ml)}
            disabled={adding}
            className="flex-1 h-9 rounded-xl bg-sky-50 text-sky-600 text-xs font-body font-semibold
              hover:bg-sky-100 active:scale-95 transition-all border border-sky-100 disabled:opacity-50"
          >
            +{ml}ml
          </button>
        ))}
      </div>

      {/* Weekly mini chart */}
      {weekData.length > 0 && (
        <div>
          <p className="text-[10px] text-muted-foreground font-body mb-2">Zadnjih 7 dana</p>
          <div className="flex items-end gap-1.5 h-12">
            {weekData.map((d, i) => {
              const h = maxWeek > 0 ? Math.max((d.ml / maxWeek) * 100, 4) : 4;
              const isToday = i === weekData.length - 1;
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full flex items-end justify-center" style={{ height: 48 }}>
                    <div
                      className={`w-full max-w-[20px] rounded-t-md transition-all ${
                        isToday ? "bg-sky-500" : "bg-sky-200"
                      }`}
                      style={{ height: `${h}%` }}
                    />
                  </div>
                  <span className={`text-[8px] font-body ${isToday ? "text-sky-600 font-bold" : "text-muted-foreground"}`}>
                    {d.day}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default WaterIntake;
