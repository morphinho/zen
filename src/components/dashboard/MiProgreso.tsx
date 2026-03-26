import { Trophy, Clock, CheckCircle2 } from "lucide-react";

interface MiProgresoProps {
  completedDays: number;
  totalDays: number;
  totalMinutes: number;
}

const cardShadow = { boxShadow: '0 8px 20px rgba(0,0,0,0.06)' };

const MiProgreso = ({ completedDays, totalDays, totalMinutes }: MiProgresoProps) => (
  <div className="rounded-2xl bg-card p-4 border border-border/50" style={cardShadow}>
    <h2 className="text-sm font-heading font-bold mb-3">Moj napredak</h2>
    <div className="grid grid-cols-3 gap-3">
      <div className="text-center">
        <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-1.5">
          <Trophy className="w-4 h-4 text-primary" />
        </div>
        <p className="text-lg font-heading font-bold leading-none">{completedDays}<span className="text-xs text-muted-foreground font-normal">/{totalDays}</span></p>
        <p className="text-[10px] text-muted-foreground font-body mt-0.5">dana</p>
      </div>
      <div className="text-center">
        <div className="w-9 h-9 rounded-xl bg-accent/10 flex items-center justify-center mx-auto mb-1.5">
          <CheckCircle2 className="w-4 h-4 text-accent" />
        </div>
        <p className="text-lg font-heading font-bold leading-none">{completedDays}</p>
        <p className="text-[10px] text-muted-foreground font-body mt-0.5">lekcija</p>
      </div>
      <div className="text-center">
        <div className="w-9 h-9 rounded-xl bg-secondary/80 flex items-center justify-center mx-auto mb-1.5">
          <Clock className="w-4 h-4 text-foreground/60" />
        </div>
        <p className="text-lg font-heading font-bold leading-none">{totalMinutes}</p>
        <p className="text-[10px] text-muted-foreground font-body mt-0.5">min</p>
      </div>
    </div>
  </div>
);

export default MiProgreso;
