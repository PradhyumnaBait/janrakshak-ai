import { Hero } from "@/components/Hero";
import { FeatureCards } from "@/components/FeatureCards";
import { HowItWorks } from "@/components/HowItWorks";
import { TrustSection } from "@/components/TrustSection";

export default function HomePage() {
  return (
    <div className="space-y-8">
      <Hero />
      <FeatureCards />
      <HowItWorks />
      <TrustSection />
    </div>
  );
}

