import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Ruler, Plus } from "lucide-react";
import { toast } from "sonner";

const cardShadow = { boxShadow: '0 8px 20px rgba(0,0,0,0.06)' };

interface Entry {
  weight: string;
  waist: string;
  hip: string;
  created_at: string;
}

const BodyProgress = ({ userId }: { userId: string }) => {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [weight, setWeight] = useState("");
  const [waist, setWaist] = useState("");
  const [hip, setHip] = useState("");
  const [saving, setSaving] = useState(false);

  const load = async () => {
    const { data } = await (supabase as any)
      .from("body_progress")
      .select("weight, waist, hip, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(5);
    setEntries(data || []);
  };

  useEffect(() => { load(); }, [userId]);

  const handleSave = async () => {
    if (!weight && !waist && !hip) return;
    setSaving(true);
    const { error } = await (supabase as any)
      .from("body_progress")
      .insert({ user_id: userId, weight, waist, hip });
    setSaving(false);
    if (error) { toast.error("Greška pri spremanju"); return; }
    toast.success("Mjere su zabilježene");
    setShowForm(false);
    setWeight(""); setWaist(""); setHip("");
    load();
  };

  return (
    <div className="rounded-2xl bg-card p-4 border border-border/50" style={cardShadow}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Ruler className="w-4 h-4 text-primary" />
          <h2 className="text-sm font-heading font-bold">Tjelesni napredak</h2>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center active:scale-95 transition-transform"
        >
          <Plus className="w-4 h-4 text-primary" />
        </button>
      </div>

      {showForm && (
        <div className="space-y-2 mb-3 p-3 rounded-xl bg-muted/50">
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="text-[10px] font-body text-muted-foreground">Težina (kg)</label>
              <Input value={weight} onChange={e => setWeight(e.target.value)} className="h-8 text-xs rounded-lg" placeholder="65" />
            </div>
            <div>
              <label className="text-[10px] font-body text-muted-foreground">Struk (cm)</label>
              <Input value={waist} onChange={e => setWaist(e.target.value)} className="h-8 text-xs rounded-lg" placeholder="70" />
            </div>
            <div>
              <label className="text-[10px] font-body text-muted-foreground">Bokovi (cm)</label>
              <Input value={hip} onChange={e => setHip(e.target.value)} className="h-8 text-xs rounded-lg" placeholder="95" />
            </div>
          </div>
          <Button onClick={handleSave} disabled={saving} size="sm" className="w-full h-8 rounded-xl text-xs">
            {saving ? "Spremam..." : "Spremi mjere"}
          </Button>
        </div>
      )}

      {entries.length > 0 ? (
        <div className="space-y-2">
          {entries.slice(0, 3).map((e, i) => (
            <div key={i} className="flex items-center justify-between text-xs font-body p-2 rounded-lg bg-muted/30">
              <span className="text-muted-foreground">{new Date(e.created_at).toLocaleDateString("hr")}</span>
              <div className="flex gap-3">
                {e.weight && <span>{e.weight} kg</span>}
                {e.waist && <span>S: {e.waist}</span>}
                {e.hip && <span>B: {e.hip}</span>}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-xs text-muted-foreground font-body text-center py-2">Još nema zapisa</p>
      )}
    </div>
  );
};

export default BodyProgress;
