import { useAuth } from "@/context/AuthContext";
import { useAppState } from "@/context/AppContext";
import { useNavigate, useOutletContext } from "react-router-dom";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Leaf, Play, Crown, Sparkles, Droplets, Dumbbell, TrendingDown, ChevronRight,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { SubscriptionStatus } from "@/lib/checkSubscription";
import pilatesPlaceholder from "@/assets/pilates-class-placeholder.jpg";

const cardShadow = { boxShadow: '0 4px 16px rgba(0,0,0,0.06)' };
const NUTRIZEN_CHECKOUT_URL = "https://pay.hotmart.com/C104799271Q?off=pf4nw0ur&checkoutMode=6";

/* ── SVG circular progress ── */
const CircleProgress = ({
  percent, size = 140, stroke = 10, color, children,
}: {
  percent: number; size?: number; stroke?: number; color: string; children?: React.ReactNode;
}) => {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (percent / 100) * circ;
  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none"
          stroke="hsl(var(--muted))" strokeWidth={stroke} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none"
          stroke={color} strokeWidth={stroke}
          strokeDasharray={circ} strokeDashoffset={offset}
          strokeLinecap="round" className="transition-all duration-700" />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {children}
      </div>
    </div>
  );
};

/* ── Mini ring for metric cards ── */
const MiniRing = ({ percent, color, size = 48, stroke = 5 }: { percent: number; color: string; size?: number; stroke?: number }) => {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (Math.min(percent, 100) / 100) * circ;
  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="hsl(var(--muted))" strokeWidth={stroke} />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke}
        strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round" className="transition-all duration-500" />
    </svg>
  );
};

interface PilatesClass {
  id: string;
  day_number: number;
  title: string;
  description: string;
  duration: string;
  video_url: string | null;
}

const DashboardHome = () => {
  const { userName, mealPlan, questionnaire, progress, hasCompletedOnboarding } = useAppState();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { subscription } = useOutletContext<{ subscription: SubscriptionStatus | null }>();
  const hasNutriZen = subscription?.hasNutriZenAccess || false;

  const [challengeProgress, setChallengeProgress] = useState({ completed: 0, total: 28 });
  const [nextClass, setNextClass] = useState<PilatesClass | null>(null);
  const [waterToday, setWaterToday] = useState(0);
  const [waterGoal, setWaterGoal] = useState(2000);

  useEffect(() => {
    if (!user) return;
    (async () => {
      // Pilates data
      const [classesRes, progressRes] = await Promise.all([
        (supabase as any).from("pilates_classes").select("*").order("order_index", { ascending: true }),
        (supabase as any).from("pilates_progress").select("class_id").eq("user_id", user.id).eq("completed", true),
      ]);
      const classes: PilatesClass[] = classesRes.data || [];
      const completedIds = new Set((progressRes.data || []).map((p: any) => p.class_id));
      setChallengeProgress({ total: classes.length || 28, completed: completedIds.size });
      setNextClass(classes.find(c => !completedIds.has(c.id)) || null);

      // Water data
      const today = new Date().toISOString().split("T")[0];
      const [waterRes, profileRes] = await Promise.all([
        (supabase as any).from("water_intake").select("amount_ml").eq("user_id", user.id)
          .gte("created_at", today + "T00:00:00").lte("created_at", today + "T23:59:59"),
        (supabase as any).from("profiles").select("water_goal_ml").eq("id", user.id).maybeSingle(),
      ]);
      const totalWater = (waterRes.data || []).reduce((s: number, r: any) => s + r.amount_ml, 0);
      setWaterToday(totalWater);
      if (profileRes.data?.water_goal_ml) setWaterGoal(profileRes.data.water_goal_ml);
    })();
  }, [user]);

  const challengePercent = challengeProgress.total > 0
    ? Math.round((challengeProgress.completed / challengeProgress.total) * 100) : 0;

  // Body progress
  const initialW = parseFloat(questionnaire?.current_weight || "0");
  const currentW = parseFloat(progress?.current_weight || questionnaire?.current_weight || "0");
  const desiredW = parseFloat(questionnaire?.desired_weight || "0");
  const weightDiff = Math.abs(initialW - desiredW);
  const bodyPercent = weightDiff > 0 ? Math.min(Math.round((Math.abs(initialW - currentW) / weightDiff) * 100), 100) : 0;

  const waterPercent = waterGoal > 0 ? Math.min(Math.round((waterToday / waterGoal) * 100), 100) : 0;
  const classesPercent = challengeProgress.total > 0
    ? Math.round((challengeProgress.completed / challengeProgress.total) * 100) : 0;

  return (
    <div className="space-y-5 py-4 animate-fade-up">

      {/* ── 1. Greeting ── */}
      <div className="px-1">
        <h1 className="text-xl font-extrabold font-heading">
          Bok{userName ? `, ${userName}` : ""}! 👋
        </h1>
        <p className="text-xs text-muted-foreground font-body mt-0.5">
          Tvoj današnji napredak
        </p>
      </div>

      {/* ── 2. Main progress ring ── */}
      <div className="rounded-3xl bg-card p-6 border border-border/50 flex flex-col items-center" style={cardShadow}>
        <CircleProgress percent={challengePercent} size={160} stroke={12} color="hsl(var(--primary))">
          <span className="text-3xl font-heading font-extrabold leading-none">{challengePercent}%</span>
          <span className="text-[10px] text-muted-foreground font-body mt-1">završeno</span>
        </CircleProgress>
        <p className="text-sm font-heading font-bold mt-4">Izazov 28 dana</p>
        <p className="text-xs text-muted-foreground font-body">
          {challengeProgress.completed} / {challengeProgress.total} dana završeno
        </p>
      </div>

      {/* ── 3. Metric cards row ── */}
      <div className="grid grid-cols-3 gap-2.5">
        {/* Hydration */}
        <div className="rounded-2xl bg-card p-3 border border-border/50 flex flex-col items-center gap-1.5" style={cardShadow}>
          <Droplets className="w-5 h-5" style={{ color: "hsl(200 80% 55%)" }} />
          <p className="text-[10px] font-heading font-bold text-foreground/70 leading-none">Voda danas</p>
          <p className="text-base font-heading font-bold leading-none">
            {(waterToday / 1000).toFixed(1)}L
          </p>
          <p className="text-[9px] text-muted-foreground font-body leading-none">/ {(waterGoal / 1000).toFixed(1)}L</p>
          <div className="w-full h-1.5 rounded-full bg-muted mt-0.5 overflow-hidden">
            <div className="h-full rounded-full transition-all duration-500" style={{ width: `${waterPercent}%`, background: "hsl(200 80% 55%)" }} />
          </div>
        </div>

        {/* Classes */}
        <div className="rounded-2xl bg-card p-3 border border-border/50 flex flex-col items-center gap-1.5" style={cardShadow}>
          <Dumbbell className="w-5 h-5 text-primary" />
          <p className="text-[10px] font-heading font-bold text-foreground/70 leading-none">Lekcije</p>
          <p className="text-base font-heading font-bold leading-none">
            {challengeProgress.completed}
          </p>
          <p className="text-[9px] text-muted-foreground font-body leading-none">/ {challengeProgress.total} lekcija</p>
          <div className="w-full h-1.5 rounded-full bg-muted mt-0.5 overflow-hidden">
            <div className="h-full rounded-full bg-primary transition-all duration-500" style={{ width: `${classesPercent}%` }} />
          </div>
        </div>

        {/* Body progress */}
        <div className="rounded-2xl bg-card p-3 border border-border/50 flex flex-col items-center gap-1.5" style={cardShadow}>
          <TrendingDown className="w-5 h-5 text-accent" />
          <p className="text-[10px] font-heading font-bold text-foreground/70 leading-none">Tjelesno</p>
          <p className="text-base font-heading font-bold leading-none">
            {bodyPercent}%
          </p>
          <p className="text-[9px] text-muted-foreground font-body leading-none">napredak</p>
          <div className="w-full h-1.5 rounded-full bg-muted mt-0.5 overflow-hidden">
            <div className="h-full rounded-full bg-accent transition-all duration-500" style={{ width: `${bodyPercent}%` }} />
          </div>
        </div>
      </div>

      {/* ── 4. Class of the day ── */}
      {nextClass && (
        <div className="rounded-2xl bg-card border border-border/50 overflow-hidden" style={cardShadow}>
          <div className="relative w-full" style={{ aspectRatio: "2.2/1" }}>
            {nextClass.video_url ? (
              <>
                <img
                  src={`https://img.youtube.com/vi/${new URL(nextClass.video_url).searchParams.get('v')}/hqdefault.jpg`}
                  alt={nextClass.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 via-foreground/10 to-transparent" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center">
                    <Play className="w-6 h-6 text-primary ml-0.5" />
                  </div>
                </div>
              </>
            ) : (
              <>
                <img src={pilatesPlaceholder} alt="Pilates" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 via-foreground/10 to-transparent" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center">
                    <Play className="w-6 h-6 text-primary ml-0.5" />
                  </div>
                </div>
              </>
            )}
            <div className="absolute bottom-3 left-4 right-4">
              <p className="text-[10px] text-primary-foreground/80 font-body font-semibold uppercase tracking-wider">
                Današnja lekcija
              </p>
              <p className="text-sm font-heading font-bold text-primary-foreground leading-tight mt-0.5">
                Dan {nextClass.day_number} — {nextClass.title}
              </p>
            </div>
            <span className="absolute top-3 right-3 text-[10px] font-body font-semibold bg-foreground/60 text-background px-2 py-0.5 rounded-lg backdrop-blur-sm">
              {nextClass.duration}
            </span>
          </div>
          <div className="p-3.5">
            <Button variant="cta" className="w-full h-10 rounded-2xl text-sm font-semibold" onClick={() => navigate("/dashboard/desafio")}>
              <Play className="w-4 h-4 mr-2" /> Započni trening
            </Button>
          </div>
        </div>
      )}

      {/* ── 5. NutriZen card ── */}
      {hasNutriZen ? (
        <div className="rounded-2xl bg-card p-4 border border-primary/20" style={cardShadow}
          onClick={() => navigate("/dashboard/nutrizen")}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Leaf className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-xs font-heading font-bold">Tvoj plan prehrane</p>
              <p className="text-[10px] text-muted-foreground font-body">{mealPlan?.daily_calories || "—"} kcal/dan</p>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </div>
        </div>
      ) : (
        <div className="rounded-2xl overflow-hidden" style={{
          ...cardShadow,
          background: "linear-gradient(135deg, hsl(24 90% 55%), hsl(32 95% 52%))",
        }}>
          <div className="p-5 text-accent-foreground">
            <div className="flex items-center gap-2 mb-2">
              <Leaf className="w-5 h-5" />
              <span className="text-[9px] font-body font-bold bg-accent-foreground/15 px-2 py-0.5 rounded-full flex items-center gap-1">
                <Crown className="w-2.5 h-2.5" /> PRO
              </span>
            </div>
            <h3 className="text-base font-heading font-bold leading-tight">
              Poboljšaj svoje rezultate s NutriZen
            </h3>
            <p className="text-xs font-body mt-1.5 leading-relaxed opacity-90">
              Dobij personalizirani plan prehrane osmišljen za pojačavanje tvojih Pilates rezultata.
            </p>
            <div className="flex gap-4 mt-3 mb-4">
              {[
                { icon: "🥗", label: "Plan prehrane" },
                { icon: "📖", label: "Recepti" },
                { icon: "📊", label: "Praćenje" },
              ].map((b, i) => (
                <div key={i} className="flex items-center gap-1.5">
                  <span className="text-sm">{b.icon}</span>
                  <span className="text-[10px] font-body font-medium opacity-90">{b.label}</span>
                </div>
              ))}
            </div>
            <Button
              className="w-full h-11 rounded-2xl text-sm font-bold bg-accent-foreground/20 hover:bg-accent-foreground/30 backdrop-blur-sm border border-accent-foreground/20"
              asChild
            >
              <a href={NUTRIZEN_CHECKOUT_URL} target="_blank" rel="noopener noreferrer">
                Aktiviraj NutriZen — €9,90/mjes.
              </a>
            </Button>
          </div>
        </div>
      )}

      {/* spacer for bottom nav */}
      <div className="h-4" />
    </div>
  );
};

export default DashboardHome;
