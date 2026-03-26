import { useLocation, useNavigate } from "react-router-dom";
import { Home, Dumbbell, Leaf, Gift, User } from "lucide-react";
import { useState } from "react";
import { SubscriptionStatus } from "@/lib/checkSubscription";

const tabs = [
  { label: "Pilates", icon: Dumbbell, path: "/dashboard/desafio" },
  { label: "NutriZen", icon: Leaf, path: "/dashboard/nutrizen", isPremium: true },
  { label: "Početna", icon: Home, path: "/dashboard", isCenter: true },
  { label: "Bonus", icon: Gift, path: "/dashboard/bonus" },
  { label: "Profil", icon: User, path: "/dashboard/perfil" },
];

interface BottomNavProps {
  subscription?: SubscriptionStatus | null;
}

export const BottomNav = ({ subscription }: BottomNavProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [pressed, setPressed] = useState<string | null>(null);
  const hasNutriZen = subscription?.hasNutriZenAccess || false;

  const handleTap = (path: string) => {
    setPressed(path);
    navigate(path);
    setTimeout(() => setPressed(null), 150);
  };

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 safe-area-bottom"
      style={{
        background: "rgba(255,255,255,0.88)",
        backdropFilter: "blur(14px)",
        WebkitBackdropFilter: "blur(14px)",
        borderTop: "1px solid rgba(0,0,0,0.05)",
      }}
    >
      <div className="flex items-end justify-around mx-auto max-w-lg" style={{ height: 78, paddingBottom: 10, paddingLeft: 8, paddingRight: 8 }}>
        {tabs.map((tab) => {
          const isActive = tab.path === "/dashboard"
            ? location.pathname === "/dashboard"
            : location.pathname.startsWith(tab.path);
          const isPressed = pressed === tab.path;
          const showProBadge = tab.isPremium && !hasNutriZen;

          if (tab.isCenter) {
            return (
              <button
                key={tab.path}
                onClick={() => handleTap(tab.path)}
                className="flex flex-col items-center justify-center flex-1 relative -mt-5"
                style={{
                  transform: isPressed ? "scale(0.95)" : "scale(1)",
                  transition: "transform 0.15s ease",
                }}
              >
                <div
                  className="flex items-center justify-center"
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: 20,
                    background: isActive
                      ? "linear-gradient(135deg, hsl(152 45% 35%), hsl(152 45% 48%))"
                      : "hsl(var(--muted))",
                    boxShadow: isActive
                      ? "0 8px 20px rgba(46,125,50,0.25)"
                      : "0 4px 12px rgba(0,0,0,0.08)",
                    transition: "background 0.2s ease, box-shadow 0.2s ease",
                    color: isActive ? "hsl(0 0% 100%)" : "hsl(var(--muted-foreground))",
                  }}
                >
                  <tab.icon className="w-6 h-6" strokeWidth={1.8} />
                </div>
                <span
                  className="font-body mt-1"
                  style={{
                    fontSize: 11,
                    fontWeight: 500,
                    opacity: isActive ? 1 : 0.6,
                    color: isActive ? "hsl(152 45% 35%)" : "hsl(var(--muted-foreground))",
                  }}
                >
                  {tab.label}
                </span>
              </button>
            );
          }

          return (
            <button
              key={tab.path}
              onClick={() => handleTap(tab.path)}
              className="flex flex-col items-center justify-center flex-1 relative"
              style={{
                transform: isPressed ? "scale(0.95)" : "scale(1)",
                transition: "transform 0.15s ease",
                paddingTop: 6,
              }}
            >
              <div className="relative">
                <div
                  className="flex items-center justify-center transition-all duration-200"
                  style={{
                    padding: isActive ? "8px 14px" : "8px",
                    borderRadius: 12,
                    background: isActive ? "rgba(46,125,50,0.12)" : "transparent",
                  }}
                >
                  <tab.icon
                    className="transition-colors duration-200"
                    style={{
                      width: 22,
                      height: 22,
                      color: isActive ? "hsl(152 45% 35%)" : "hsl(var(--muted-foreground))",
                    }}
                    strokeWidth={isActive ? 2 : 1.6}
                  />
                </div>
                {/* PRO badge */}
                {showProBadge && (
                  <span
                    className="absolute font-body font-bold"
                    style={{
                      top: 2,
                      right: isActive ? 4 : -2,
                      fontSize: 7,
                      lineHeight: 1,
                      background: "hsl(var(--accent))",
                      color: "hsl(0 0% 100%)",
                      padding: "2px 4px",
                      borderRadius: 4,
                      letterSpacing: "0.04em",
                    }}
                  >
                    PRO
                  </span>
                )}
              </div>
              <span
                className="font-body"
                style={{
                  fontSize: 11,
                  fontWeight: 500,
                  marginTop: 2,
                  opacity: isActive ? 1 : 0.6,
                  color: isActive ? "hsl(152 45% 35%)" : "hsl(var(--muted-foreground))",
                  transition: "color 0.2s ease, opacity 0.2s ease",
                }}
              >
                {tab.label}
              </span>
              <div
                style={{
                  width: 4,
                  height: 4,
                  borderRadius: "100%",
                  background: isActive ? "hsl(152 45% 35%)" : "transparent",
                  marginTop: 3,
                  transition: "background 0.2s ease",
                }}
              />
            </button>
          );
        })}
      </div>
    </nav>
  );
};
