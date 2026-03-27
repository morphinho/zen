import { supabase } from "@/integrations/supabase/client";

export interface SubscriptionStatus {
  hasZenLifeAccess: boolean;
  hasNutriZenAccess: boolean;
  status: string | null;
  subscriptionType: string | null;
  nextChargeDate: string | null;
}

export async function checkUserSubscription(userId: string): Promise<SubscriptionStatus> {
  const { data, error } = await (supabase as any)
    .from("subscriptions")
    .select("status, next_charge_date, subscription_type")
    .eq("user_id", userId);

  if (error || !data || data.length === 0) {
    return { hasZenLifeAccess: false, hasNutriZenAccess: false, status: null, subscriptionType: null, nextChargeDate: null };
  }

  let hasZenLifeAccess = false;
  let hasNutriZenAccess = false;

  for (const sub of data) {
    const { status, next_charge_date, subscription_type } = sub;
    const isActive = status === "ACTIVE" ||
      (status === "CANCELED" && next_charge_date && new Date() < new Date(next_charge_date));

    if (isActive && subscription_type === "ZENLIFE") {
      hasZenLifeAccess = true;
    }
    if (isActive && subscription_type === "NUTRIZEN") {
      hasNutriZenAccess = true;
    }
  }

  const primary = data[0];
  return {
    hasZenLifeAccess,
    hasNutriZenAccess,
    status: primary.status,
    subscriptionType: primary.subscription_type,
    nextChargeDate: primary.next_charge_date,
  };
}
