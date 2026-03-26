import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Circle, Play, Clock, Dumbbell, ArrowLeft, Loader2, Trophy } from "lucide-react";
import { toast } from "sonner";

const cardShadow = { boxShadow: '0 8px 20px rgba(0,0,0,0.06)' };

interface PilatesClass {
  id: string;
  day_number: number;
  title: string;
  description: string;
  video_url: string | null;
  duration: string;
  order_index: number;
}

interface PilatesProgress {
  class_id: string;
  completed: boolean;
  completed_at: string | null;
}

const Challenge = () => {
  const { user } = useAuth();
  const [classes, setClasses] = useState<PilatesClass[]>([]);
  const [progressMap, setProgressMap] = useState<Record<string, PilatesProgress>>({});
  const [loading, setLoading] = useState(true);
  const [selectedClass, setSelectedClass] = useState<PilatesClass | null>(null);
  const [marking, setMarking] = useState(false);

  useEffect(() => {
    if (!user) return;
    loadData();
  }, [user]);

  const loadData = async () => {
    if (!user) return;
    const [classesRes, progressRes] = await Promise.all([
      (supabase as any).from("pilates_classes").select("*").order("order_index", { ascending: true }),
      (supabase as any).from("pilates_progress").select("*").eq("user_id", user.id),
    ]);

    if (classesRes.data) setClasses(classesRes.data);
    if (progressRes.data) {
      const map: Record<string, PilatesProgress> = {};
      for (const p of progressRes.data) {
        map[p.class_id] = p;
      }
      setProgressMap(map);
    }
    setLoading(false);
  };

  const toggleComplete = async (classItem: PilatesClass) => {
    if (!user) return;
    setMarking(true);
    const existing = progressMap[classItem.id];

    if (existing?.completed) {
      await (supabase as any).from("pilates_progress")
        .update({ completed: false, completed_at: null })
        .eq("user_id", user.id)
        .eq("class_id", classItem.id);
      setProgressMap(prev => ({ ...prev, [classItem.id]: { ...prev[classItem.id], completed: false, completed_at: null } }));
      toast("Lekcija odznačena");
    } else {
      await (supabase as any).from("pilates_progress")
        .upsert({
          user_id: user.id,
          class_id: classItem.id,
          completed: true,
          completed_at: new Date().toISOString(),
        }, { onConflict: "user_id,class_id" });
      setProgressMap(prev => ({ ...prev, [classItem.id]: { class_id: classItem.id, completed: true, completed_at: new Date().toISOString() } }));
      toast.success("Lekcija završena! 🎉");
    }
    setMarking(false);
  };

  const completedCount = Object.values(progressMap).filter(p => p.completed).length;
  const progressPercent = classes.length > 0 ? Math.round((completedCount / classes.length) * 100) : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  // Class detail view
  if (selectedClass) {
    const isCompleted = progressMap[selectedClass.id]?.completed || false;

    return (
      <div className="space-y-4 py-4 animate-fade-up">
        <button onClick={() => setSelectedClass(null)} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors font-body">
          <ArrowLeft className="w-4 h-4" /> Natrag na izazov
        </button>

        {/* Video placeholder */}
        <div className="rounded-3xl bg-gradient-to-br from-primary/10 via-primary/5 to-accent/5 border border-primary/10 overflow-hidden" style={cardShadow}>
          <div className="aspect-video flex items-center justify-center bg-foreground/5">
            {selectedClass.video_url ? (
              <iframe
                src={`https://www.youtube.com/embed/${new URL(selectedClass.video_url).searchParams.get('v')}?rel=0`}
                title={selectedClass.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full rounded-t-3xl"
              />
            ) : (
              <div className="text-center space-y-3">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                  <Play className="w-8 h-8 text-primary ml-1" />
                </div>
                <p className="text-xs text-muted-foreground font-body">Video uskoro</p>
              </div>
            )}
          </div>
          <div className="p-5">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-body font-semibold text-primary bg-primary/10 px-2.5 py-1 rounded-full">
                Dan {selectedClass.day_number}
              </span>
              <span className="flex items-center gap-1 text-[10px] text-muted-foreground font-body">
                <Clock className="w-3 h-3" /> {selectedClass.duration}
              </span>
            </div>
            <h1 className="text-lg font-bold font-heading mt-2">{selectedClass.title}</h1>
            <p className="text-sm text-muted-foreground font-body mt-2 leading-relaxed">{selectedClass.description}</p>
          </div>
        </div>

        <Button
          variant={isCompleted ? "outline" : "cta"}
          className="w-full h-12 rounded-2xl text-sm font-semibold"
          onClick={() => toggleComplete(selectedClass)}
          disabled={marking}
        >
          {isCompleted ? (
            <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4" /> Završeno — Odznači</span>
          ) : (
            <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4" /> Označi kao završeno</span>
          )}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4 py-4 animate-fade-up">
      {/* Header */}
      <div className="rounded-3xl bg-gradient-to-br from-primary/10 via-primary/5 to-accent/5 p-5 border border-primary/10" style={cardShadow}>
        <div className="flex items-center gap-2 mb-1">
          <Dumbbell className="w-5 h-5 text-primary" />
          <span className="text-[10px] font-body font-semibold text-primary uppercase tracking-wider">Izazov od 28 dana</span>
        </div>
        <h1 className="text-xl font-bold font-heading">Pilates uz zid</h1>
        <p className="text-xs text-muted-foreground font-body mt-1 leading-relaxed">
          Program osmišljen za jačanje tvog tijela i transformaciju držanja u samo 28 dana.
        </p>
        <div className="mt-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-heading font-bold">{completedCount} / {classes.length} dana završeno</span>
            <span className="text-xs font-body text-primary font-semibold">{progressPercent}%</span>
          </div>
          <Progress value={progressPercent} className="h-3 rounded-full" />
        </div>
        {completedCount === classes.length && classes.length > 0 && (
          <div className="flex items-center gap-2 mt-3 bg-accent/10 rounded-2xl p-3">
            <Trophy className="w-5 h-5 text-accent" />
            <span className="text-xs font-heading font-bold text-accent">Izazov završen! 🎉</span>
          </div>
        )}
      </div>

      {/* Class list */}
      <div className="space-y-2">
        {classes.map((classItem) => {
          const isCompleted = progressMap[classItem.id]?.completed || false;

          return (
            <div
              key={classItem.id}
              className={`rounded-2xl bg-card border overflow-hidden cursor-pointer active:scale-[0.98] transition-all ${isCompleted ? "border-primary/30 bg-primary/[0.02]" : "border-border/50"}`}
              style={cardShadow}
              onClick={() => setSelectedClass(classItem)}
            >
              <div className="flex items-center gap-3 p-4">
                <div
                  className={`w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 text-sm font-heading font-bold ${
                    isCompleted
                      ? "bg-primary/10 text-primary"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : classItem.day_number}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className={`font-bold text-sm font-heading leading-tight truncate ${isCompleted ? "text-primary" : ""}`}>
                    Dan {classItem.day_number}
                  </h3>
                  <p className="text-[10px] text-muted-foreground font-body mt-0.5 truncate">
                    {classItem.title}
                  </p>
                </div>
                <div className="flex items-center gap-1 text-[10px] text-muted-foreground font-body flex-shrink-0">
                  <Clock className="w-3 h-3" /> {classItem.duration}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Challenge;
