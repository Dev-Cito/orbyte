import { Building2, CreditCard, Gauge, LockKeyhole, ShieldCheck, SquareKanban } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Eyebrow, Section } from "./section";

// Only what the product does today.
const FEATURES: { icon: LucideIcon; title: string; body: string }[] = [
  {
    icon: Building2,
    title: "An organization for every team",
    body: "Each account starts with its own organization. Members have a role (owner, admin or member), and billing stays in the hands of owners and admins.",
  },
  {
    icon: SquareKanban,
    title: "Projects and task boards",
    body: "Create projects and move their tasks across To do, In progress and Done, on a simple board everyone understands.",
  },
  {
    icon: ShieldCheck,
    title: "Isolation built into the database",
    body: "Every query is scoped to your organization, and Postgres row-level security enforces it again underneath. Other tenants cannot see your data.",
  },
  {
    icon: CreditCard,
    title: "Plans that grow with you",
    body: "Start free with 3 projects. Upgrade to Pro or Business for unlimited projects, with payments handled by Stripe.",
  },
  {
    icon: Gauge,
    title: "Usage at a glance",
    body: "The dashboard shows your plan and how many projects you use against its limit, so there are no surprises.",
  },
  {
    icon: LockKeyhole,
    title: "Sessions done carefully",
    body: "Sign-in tokens live in secure, HTTP-only cookies that scripts cannot read, and are checked by the server on every request.",
  },
];

export function Features() {
  return (
    <Section id="features" labelledBy="features-title">
      <div className="max-w-2xl">
        <Eyebrow>Features</Eyebrow>
        <h2 id="features-title" className="mt-3 text-3xl font-[700] tracking-[-0.02em] sm:text-5xl">
          The essentials, done properly.
        </h2>
        <p className="mt-4 text-lg text-fg-secondary">
          No feature sprawl: a focused tool for organizing work across teams, on a foundation you
          can trust.
        </p>
      </div>
      <ul className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map(({ icon: Icon, title, body }) => (
          <li key={title} className="flex flex-col gap-4 rounded-card border border-border bg-surface p-6">
            <span className="flex size-10 items-center justify-center rounded-xl bg-brand text-fg-inverse">
              <Icon aria-hidden="true" className="size-5" strokeWidth={1.75} />
            </span>
            <h3 className="text-lg font-semibold tracking-tight">{title}</h3>
            <p className="text-[15px] leading-relaxed text-fg-secondary">{body}</p>
          </li>
        ))}
      </ul>
    </Section>
  );
}
