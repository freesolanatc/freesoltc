import { HeroSection } from "@/components/marketing/HeroSection";
import { FeatureGrid } from "@/components/marketing/FeatureGrid";
import { HowItWorksSteps } from "@/components/marketing/HowItWorksSteps";
import { TrustSection } from "@/components/marketing/TrustSection";
import { CtaBanner } from "@/components/marketing/CtaBanner";

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <FeatureGrid />
      <HowItWorksSteps />
      <TrustSection />
      <CtaBanner />
    </>
  );
}
