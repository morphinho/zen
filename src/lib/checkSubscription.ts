export interface SubscriptionStatus {
  hasZenLifeAccess: boolean;
  hasNutriZenAccess: boolean;
  status: string | null;
  subscriptionType: string | null;
  nextChargeDate: string | null;
}

export async function checkUserSubscription(_userId: string): Promise<SubscriptionStatus> {
  return {
    hasZenLifeAccess: true,
    hasNutriZenAccess: true,
    status: "ACTIVE",
    subscriptionType: "NUTRIZEN",
    nextChargeDate: null,
  };
}
