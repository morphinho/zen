import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const moods = [
  { emoji: "😞", label: "Loše" },
  { emoji: "😐", label: "Prosječno" },
  { emoji: "🙂", label: "Dobro" },
  { emoji: "😄", label: "Vrlo dobro" },
  { emoji: "🤩", label: "Odlično" },
];

const cardShadow = { boxShadow: '0 8px 20px rgba(0,0,0,0.06)' };

const MoodCheckin = ({ userId }: { userId: string }) => {
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    (supabase as any)
      .from("mood_checkins")
      .select("mood")
      .eq("user_id", userId)
      .gte("created_at", today + "T00:00:00")
      .lte("created_at", today + "T23:59:59")
      .maybeSingle()
      .then(({ data }: any) => {
        if (data) {
          setSelectedMood(data.mood);
          setSaved(true);
        }
      });
  }, [userId]);

  const handleSelect = async (emoji: string) => {
    setSelectedMood(emoji);
    setSaved(true);
    const { error } = await (supabase as any)
      .from("mood_checkins")
      .insert({ user_id: userId, mood: emoji });
    if (error) {
      toast.error("Greška pri spremanju tvog raspoloženja");
      setSaved(false);
    }
  };

  return (
    <div className="rounded-2xl bg-card p-4 border border-border/50" style={cardShadow}>
      <h2 className="text-sm font-heading font-bold mb-3">Kako se osjećaš danas?</h2>
      <div className="flex justify-between">
        {moods.map((m) => (
          <button
            key={m.emoji}
            onClick={() => !saved && handleSelect(m.emoji)}
            disabled={saved}
            className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${
              selectedMood === m.emoji
                ? "bg-primary/10 scale-110"
                : saved
                ? "opacity-40"
                : "hover:bg-muted active:scale-95"
            }`}
          >
            <span className="text-2xl">{m.emoji}</span>
            <span className="text-[9px] text-muted-foreground font-body">{m.label}</span>
          </button>
        ))}
      </div>
      {saved && (
        <p className="text-[10px] text-primary font-body mt-2 text-center">✓ Zabilježeno danas</p>
      )}
    </div>
  );
};

export default MoodCheckin;
