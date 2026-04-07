import { AppHeader } from "@/components/dashboard/AppHeader";
import { BottomNav } from "@/components/dashboard/BottomNav";
import { Outlet } from "react-router-dom";
import { useAppState } from "@/context/AppContext";
import { Loader2 } from "lucide-react";
import { SubscriptionStatus } from "@/lib/checkSubscription";

export const SubscriptionContext = ({ children, subscription }: { children: React.ReactNode; subscription: SubscriptionStatus | null }) => {
  return <>{children}</>;
};

const DashboardLayout = () => {
  const { loadingData } = useAppState();

  const subscription: SubscriptionStatus = {
    hasZenLifeAccess: true,
    hasNutriZenAccess: true,
    status: "ACTIVE",
    subscriptionType: "NUTRIZEN",
    nextChargeDate: null,
  };

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
