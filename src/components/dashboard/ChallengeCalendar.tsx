import { CheckCircle2 } from "lucide-react";

const cardShadow = { boxShadow: '0 8px 20px rgba(0,0,0,0.06)' };

interface Props {
  completedDays: Set<number>;
  totalDays: number;
}

const ChallengeCalendar = ({ completedDays, totalDays }: Props) => (
  <div className="rounded-2xl bg-card p-4 border border-border/50" style={cardShadow}>
    <h2 className="text-sm font-heading font-bold mb-3">Kalendar izazova</h2>
    <div className="grid grid-cols-7 gap-1.5">
      {Array.from({ length: totalDays }, (_, i) => i + 1).map((day) => {
        const done = completedDays.has(day);
        return (
          <div
            key={day}
            className={`aspect-square rounded-lg flex items-center justify-center text-xs font-body transition-colors ${
              done
                ? "bg-primary text-primary-foreground font-semibold"
                : "bg-muted/50 text-muted-foreground"
            }`}
          >
            {done ? <CheckCircle2 className="w-3.5 h-3.5" /> : day}
          </div>
        );
      })}
    </div>
  </div>
);

export default ChallengeCalendar;
