import { AppHeader } from "@/components/dashboard/AppHeader";
import { BottomNav } from "@/components/dashboard/BottomNav";
import { Outlet, Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useAppState } from "@/context/AppContext";
import { Loader2, Lock, MessageCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { checkUserSubscription, SubscriptionStatus } from "@/lib/checkSubscription";
import { Button } from "@/components/ui/button";
import zenlifeLogo from "@/assets/zenlife-logo.svg";

export const SubscriptionContext = ({ children, subscription }: { children: React.ReactNode; subscription: SubscriptionStatus | null }) => {
  return <>{children}</>;
};

const DashboardLayout = () => {
  const { user, loading: authLoading } = useAuth();
  const { hasCompletedOnboarding, loadingData } = useAppState();
  const [subscription, setSubscription] = useState<SubscriptionStatus | null>(null);
  const [checkingSub, setCheckingSub] = useState(true);

  useEffect(() => {
    if (!user) {
      setCheckingSub(false);
      return;
    }
    checkUserSubscription(user.id).then((result) => {
      setSubscription(result);
      setCheckingSub(false);
    });
  }, [user]);

  if (authLoading || checkingSub) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (loadingData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <main className="pt-14 pb-20 px-5 max-w-lg mx-auto">
        <Outlet context={{ subscription }} />
      </main>
      <BottomNav subscription={subscription} />
    </div>
  );
};

export default DashboardLayout;
