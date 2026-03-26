import { LandingHero } from "@/components/landing/LandingHero";
import { LandingBenefits } from "@/components/landing/LandingBenefits";
import { LandingHowItWorks } from "@/components/landing/LandingHowItWorks";
import { LandingBonus } from "@/components/landing/LandingBonus";
import { LandingCTA } from "@/components/landing/LandingCTA";
import { LandingNav } from "@/components/landing/LandingNav";
import { LandingFooter } from "@/components/landing/LandingFooter";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <LandingNav />
      <LandingHero />
      <LandingBenefits />
      <LandingHowItWorks />
      <LandingBonus />
      <LandingCTA />
      <LandingFooter />
    </div>
  );
};

export default Index;
