// DEV MODE — import original comentado
// import { supabase } from "@/integrations/supabase/client";

export interface SubscriptionStatus {
  hasZenLifeAccess: boolean;
  hasNutriZenAccess: boolean;
  status: string | null;
  subscriptionType: string | null;
  nextChargeDate: string | null;
}

// DEV MODE — sempre retorna acesso total
export async function checkUserSubscription(_userId: string): Promise<SubscriptionStatus> {
  return {
    hasZenLifeAccess: true,
    hasNutriZenAccess: true,
    status: "ACTIVE",
    subscriptionType: "NUTRIZEN",
    nextChargeDate: null,
  };
}
