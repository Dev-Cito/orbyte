import type { Metadata } from "next";
import { Faq } from "@/components/marketing/faq";
import { PricingCards } from "@/components/marketing/pricing-cards";

export const metadata: Metadata = {
  title: "Pricing",
  description: "Free for up to 3 projects. Pro and Business for unlimited projects.",
};

export default function PricingPage() {
  return (
    <>
      <section aria-labelledby="pricing-title" className="bg-background">
        <div className="mx-auto max-w-6xl px-5 pb-16 pt-16 sm:px-8 sm:pt-24">
          <h1
            id="pricing-title"
            className="max-w-3xl text-[36px] font-[700] leading-[1.05] tracking-[-0.03em] sm:text-[56px]"
          >
            Simple pricing that grows with your team.
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-fg-secondary sm:text-xl">
            Start free with 3 projects. Move to unlimited projects when your team needs it.
          </p>
          <div className="mt-14">
            <PricingCards />
          </div>
        </div>
      </section>
      <section aria-labelledby="faq-title" className="bg-background">
        <div className="mx-auto max-w-6xl px-5 pb-24 sm:px-8">
          <h2 id="faq-title" className="mb-8 text-2xl font-[700] tracking-[-0.02em] sm:text-3xl">
            Questions
          </h2>
          <Faq />
        </div>
      </section>
    </>
  );
}
