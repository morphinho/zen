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
  // DEV MODE — ignorar auth e subscription check
  const { user } = useAuth();
  const { loadingData } = useAppState();

  // DEV MODE — subscription fake com acesso total
  const subscription: SubscriptionStatus = {
    hasZenLifeAccess: true,
    hasNutriZenAccess: true,
    status: "ACTIVE",
    subscriptionType: "NUTRIZEN",
    nextChargeDate: null,
  };

  // DEV MODE — removido: redirect para /login, checkingSub, authLoading guard

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
