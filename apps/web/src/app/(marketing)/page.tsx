import type { Metadata } from "next";
import { CtaBand } from "@/components/marketing/cta-band";
import { Features } from "@/components/marketing/features";
import { Hero } from "@/components/marketing/hero";
import { PricingPreview } from "@/components/marketing/pricing-preview";
import { ProductPreview } from "@/components/marketing/product-preview";

export const metadata: Metadata = {
  title: { absolute: "Orbyte — Project management for teams that ship" },
  description:
    "Projects, task boards and plans that grow with your team, with every organization's data isolated. Start free.",
};

export default function LandingPage() {
  return (
    <>
      <Hero />
      <ProductPreview />
      <Features />
      <PricingPreview />
      <CtaBand />
    </>
  );
}
