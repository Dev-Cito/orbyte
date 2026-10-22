const QUESTIONS: { q: string; a: string }[] = [
  {
    q: "Can I change plans?",
    a: "You can upgrade from Free to Pro or Business at any time from the Billing page, and the new plan applies as soon as Stripe confirms your subscription.",
  },
  {
    q: "What happens if my subscription ends?",
    a: "Your organization returns to the Free plan and keeps all of its projects. Above the Free limit of 3 projects, creating new ones is paused until you are back under it or upgrade again.",
  },
  {
    q: "Is my data isolated from other organizations?",
    a: "Yes. Every request is scoped to your organization by the application, and Postgres row-level security enforces the same rule again in the database itself.",
  },
  {
    q: "Do I need a credit card to start?",
    a: "No. The Free plan needs only an account. Card details are entered on Stripe's checkout page when you upgrade; they never pass through Orbyte.",
  },
];

// Native <details>: keyboard and screen-reader friendly without any script.
export function Faq() {
  return (
    <div className="divide-y divide-border rounded-panel border border-border bg-surface">
      {QUESTIONS.map(({ q, a }) => (
        <details key={q} className="group px-6 py-5">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-base font-semibold [&::-webkit-details-marker]:hidden">
            {q}
            <span
              aria-hidden="true"
              className="text-xl font-normal text-fg-muted transition-transform duration-[180ms] group-open:rotate-45"
            >
              +
            </span>
          </summary>
          <p className="mt-3 max-w-3xl text-[15px] leading-relaxed text-fg-secondary">{a}</p>
        </details>
      ))}
    </div>
  );
}
