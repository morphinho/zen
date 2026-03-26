import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { useAppState } from "@/context/AppContext";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { LogOut, User, Weight, Target, TrendingDown, CheckCircle2, Camera, Loader2, Droplets } from "lucide-react";

const cardShadow = { boxShadow: '0 8px 20px rgba(0,0,0,0.06)' };

const Profile = () => {
  const { userName, questionnaire, progress, updateProgress } = useAppState();
  const { signOut, user } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState(userName);
  const [weight, setWeight] = useState(progress?.current_weight || questionnaire?.current_weight || "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [waterGoal, setWaterGoal] = useState(2000);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const goalLabels: Record<string, string> = {
    emagrecer: "Smršavjeti",
    inchaco: "Smanjiti nadutost",
    energia: "Dobiti energiju",
    alimentacion: "Poboljšati prehranu",
  };

  // Load avatar and water goal on mount
  useEffect(() => {
    if (!user) return;
    const { data } = supabase.storage.from("avatars").getPublicUrl(`${user.id}/avatar`);
    fetch(data.publicUrl, { method: "HEAD" }).then((res) => {
      if (res.ok) setAvatarUrl(data.publicUrl + "?t=" + Date.now());
    }).catch(() => {});

    (supabase as any).from("profiles").select("water_goal_ml").eq("id", user.id).maybeSingle()
      .then(({ data: p }: any) => { if (p?.water_goal_ml) setWaterGoal(p.water_goal_ml); });
  }, [user]);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setUploadingAvatar(true);
    try {
      const { error } = await supabase.storage
        .from("avatars")
        .upload(`${user.id}/avatar`, file, { upsert: true, contentType: file.type });

      if (error) throw error;

      const { data } = supabase.storage.from("avatars").getPublicUrl(`${user.id}/avatar`);
      setAvatarUrl(data.publicUrl + "?t=" + Date.now());
      toast.success("Fotografija ažurirana!");
    } catch (err) {
      toast.error("Greška pri učitavanju fotografije");
      console.error(err);
    } finally {
      setUploadingAvatar(false);
    }
  };

  const initialW = parseFloat(questionnaire?.current_weight || "0");
  const currentW = parseFloat(progress?.current_weight || questionnaire?.current_weight || "0");
  const desiredW = parseFloat(questionnaire?.desired_weight || "0");
  const weightDiff = Math.abs(initialW - desiredW);
  const weightProgress = weightDiff > 0
    ? Math.min(Math.round((Math.abs(initialW - parseFloat(weight || String(currentW))) / weightDiff) * 100), 100)
    : 0;

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    setSaved(false);
    try {
      await (supabase as any).from("profiles").update({ name, water_goal_ml: waterGoal }).eq("id", user.id);
      if (weight && questionnaire) {
        await (supabase as any).from("questionnaire_responses")
          .update({ current_weight: weight })
          .eq("user_id", user.id);
        // Update progress_tracking with new weight
        await updateProgress({ current_weight: weight });
      }
      setSaved(true);
      toast.success("Profil ažuriran!");
      setTimeout(() => setSaved(false), 2000);
    } catch (e) {
      toast.error("Greška pri ažuriranju");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await signOut();
    navigate("/login");
  };

  return (
    <div className="space-y-4 py-4 animate-fade-up">
      {/* Avatar card */}
      <div className="rounded-3xl bg-gradient-to-br from-primary/10 via-primary/5 to-accent/5 p-5 border border-primary/10 text-center" style={cardShadow}>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleAvatarUpload}
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          className="relative w-20 h-20 rounded-full mx-auto mb-3 group"
          disabled={uploadingAvatar}
        >
          {avatarUrl ? (
            <img src={avatarUrl} alt="Avatar" className="w-20 h-20 rounded-full object-cover" />
          ) : (
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="w-9 h-9 text-primary" />
            </div>
          )}
          <div className="absolute inset-0 rounded-full bg-foreground/0 group-hover:bg-foreground/20 transition-colors flex items-center justify-center">
            {uploadingAvatar ? (
              <Loader2 className="w-5 h-5 text-primary-foreground animate-spin" />
            ) : (
              <Camera className="w-5 h-5 text-primary-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
            )}
          </div>
        </button>
        <h1 className="text-lg font-bold font-heading">{userName || "Korisnica"}</h1>
        <p className="text-xs text-muted-foreground font-body mt-0.5">
          {goalLabels[questionnaire?.goal || ""] || "Poboljšati prehranu"}
        </p>
      </div>

      {/* Weight Progress */}
      <div className="rounded-2xl bg-card p-4 border border-border/50" style={cardShadow}>
        <div className="flex items-center gap-2 mb-3">
          <TrendingDown className="w-4 h-4 text-primary" />
          <span className="text-xs font-heading font-bold">Tvoj napredak</span>
        </div>
        <div className="grid grid-cols-3 gap-3 mb-3">
          <div className="text-center">
            <p className="text-lg font-heading font-bold text-foreground">{currentW || "—"}</p>
            <p className="text-[10px] text-muted-foreground font-body">Početna težina</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-heading font-bold text-primary">{weight || currentW || "—"}</p>
            <p className="text-[10px] text-muted-foreground font-body">Trenutna težina</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-heading font-bold text-accent">{desiredW || "—"}</p>
            <p className="text-[10px] text-muted-foreground font-body">Cilj</p>
          </div>
        </div>
        <Progress value={weightProgress} className="h-2.5 rounded-full" />
        <p className="text-[10px] text-muted-foreground font-body mt-2">{weightProgress}% prema tvom cilju</p>
      </div>

      {/* Edit form */}
      <div className="rounded-2xl bg-card p-4 border border-border/50 space-y-4" style={cardShadow}>
        <p className="text-xs font-heading font-bold">Uredi podatke</p>
        <div className="space-y-1.5">
          <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-body font-medium flex items-center gap-1.5">
            <User className="w-3 h-3" /> Ime
          </label>
          <Input value={name} onChange={(e) => setName(e.target.value)} className="h-11 rounded-2xl bg-secondary border-0 text-sm" />
        </div>
        <div className="space-y-1.5">
          <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-body font-medium flex items-center gap-1.5">
            <Weight className="w-3 h-3" /> Trenutna težina (kg)
          </label>
          <Input value={weight} onChange={(e) => setWeight(e.target.value)} placeholder="—" type="number" className="h-11 rounded-2xl bg-secondary border-0 text-sm" />
        </div>
        <div className="space-y-1.5">
          <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-body font-medium flex items-center gap-1.5">
            <Target className="w-3 h-3" /> Cilj
          </label>
          <Input value={goalLabels[questionnaire?.goal || ""] || ""} readOnly className="h-11 rounded-2xl bg-secondary border-0 text-sm opacity-60" />
        </div>
        <Button
          variant="cta"
          className="w-full h-12 rounded-2xl text-sm font-semibold"
          onClick={handleSave}
          disabled={saving}
        >
          {saved ? (
            <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4" /> Ažurirano!</span>
          ) : saving ? (
            "Spremam..."
          ) : (
            "Ažuriraj podatke"
          )}
        </Button>
      </div>

      {/* Water goal */}
      <div className="rounded-2xl bg-card p-4 border border-border/50 space-y-3" style={cardShadow}>
        <div className="flex items-center gap-2">
          <Droplets className="w-4 h-4 text-sky-500" />
          <p className="text-xs font-heading font-bold">Dnevni cilj za vodu</p>
        </div>
        <div className="grid grid-cols-4 gap-2">
          {[1500, 2000, 2500, 3000].map((ml) => (
            <button
              key={ml}
              onClick={() => setWaterGoal(ml)}
              className={`h-10 rounded-xl text-xs font-body font-semibold transition-all active:scale-95 ${
                waterGoal === ml
                  ? "bg-sky-500 text-white"
                  : "bg-muted/50 text-muted-foreground hover:bg-muted"
              }`}
            >
              {(ml / 1000).toFixed(1)}L
            </button>
          ))}
        </div>
      </div>

      <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 text-sm text-destructive font-body py-3 hover:opacity-70 transition-opacity rounded-2xl">
        <LogOut className="w-4 h-4" /> Odjavite se
      </button>
    </div>
  );
};

export default Profile;
