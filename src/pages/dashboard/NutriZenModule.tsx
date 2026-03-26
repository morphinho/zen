import { useOutletContext } from "react-router-dom";
import { SubscriptionStatus } from "@/lib/checkSubscription";
import NutriZenUpgrade from "@/components/dashboard/NutriZenUpgrade";
import NutriZenDashboard from "@/components/dashboard/NutriZenDashboard";

const NutriZenModule = () => {
  const { subscription } = useOutletContext<{ subscription: SubscriptionStatus | null }>();
  const hasAccess = subscription?.hasNutriZenAccess || false;

  if (!hasAccess) {
    return <NutriZenUpgrade />;
  }

  return <NutriZenDashboard />;
};

export default NutriZenModule;
