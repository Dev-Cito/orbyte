import { Eyebrow, Section } from "./section";

// A CSS rendition of the app (graphite shell, glass top bar, usage, board):
// no screenshot to download. Decorative, described by its label.
export function ProductPreview() {
  return (
    <Section id="product" tone="dark" labelledBy="product-title">
      <div className="max-w-2xl">
        <Eyebrow tone="dark">The product</Eyebrow>
        <h2 id="product-title" className="mt-3 text-3xl font-[700] tracking-[-0.02em] sm:text-5xl">
          One calm workspace for every project.
        </h2>
        <p className="mt-4 text-lg text-fg-inverse/70">
          A dashboard that shows where your plan stands, and boards that move work from to-do to
          done.
        </p>
      </div>

      <div
        role="img"
        aria-label="Preview of the Orbyte app: a dashboard with the organization's plan and project usage, and a task board with To do, In progress and Done columns."
        className="mt-14 overflow-hidden rounded-panel border border-white/10 bg-brand shadow-[0_30px_80px_rgba(0,0,0,0.45)]"
      >
        <div className="flex h-10 items-center gap-2 border-b border-white/10 px-4">
          <span className="size-2.5 rounded-full bg-white/15" />
          <span className="size-2.5 rounded-full bg-white/15" />
          <span className="size-2.5 rounded-full bg-white/15" />
        </div>
        <div className="flex min-h-[420px]">
          <MockSidebar />
          <div className="flex min-w-0 flex-1 flex-col gap-5 p-4 sm:p-6">
            <div className="glass-panel flex h-12 items-center justify-between px-4">
              <span className="text-sm font-semibold">Acme Studio</span>
              <span className="rounded-full border border-white/15 px-2 py-0.5 text-xs text-fg-inverse/80">
                Pro plan
              </span>
            </div>
            <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
              <MockUsage />
              <MockBoard />
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
}

function MockSidebar() {
  return (
    <div className="hidden w-48 shrink-0 flex-col gap-1 border-r border-white/10 p-4 md:flex">
      <div className="mb-5 flex items-center gap-2 text-sm font-semibold">
        <span className="size-4 rounded-md bg-accent" />
        Orbyte
      </div>
      {["Dashboard", "Projects", "Billing"].map((item, i) => (
        <div
          key={item}
          className={
            i === 1
              ? "relative rounded-lg bg-white/5 px-3 py-2 text-xs font-semibold"
              : "px-3 py-2 text-xs text-fg-inverse/60"
          }
        >
          {i === 1 && <span className="absolute inset-y-1.5 left-0 w-1 rounded-full bg-accent" />}
          {item}
        </div>
      ))}
    </div>
  );
}

function MockUsage() {
  return (
    <div className="flex flex-col gap-3 rounded-card border border-white/10 bg-surface-dark-raised p-4">
      <span className="text-xs font-semibold text-fg-inverse/60">Projects</span>
      <span className="text-2xl font-semibold">
        12 <span className="text-sm font-normal text-fg-inverse/60">projects · Unlimited</span>
      </span>
      <div className="mt-1 flex flex-col gap-2">
        {["Website relaunch", "Mobile app", "Q3 hiring"].map((p) => (
          <div key={p} className="flex items-center justify-between rounded-lg bg-white/5 px-3 py-2 text-xs">
            <span>{p}</span>
            <span className="text-fg-inverse/50">Oct 2026</span>
          </div>
        ))}
      </div>
    </div>
  );
}

const COLUMNS = [
  { title: "To do", tasks: ["Write the brief", "Pick a font pairing"] },
  { title: "In progress", tasks: ["Wireframes", "API pagination"] },
  { title: "Done", tasks: ["Audit current pages"] },
];

function MockBoard() {
  return (
    <div className="grid grid-cols-3 gap-3">
      {COLUMNS.map((column) => (
        <div key={column.title} className="flex flex-col gap-2 rounded-card border border-white/10 bg-surface-dark p-3">
          <div className="flex items-center justify-between text-xs font-semibold">
            {column.title}
            <span className="rounded-full border border-white/15 px-1.5 text-[10px] text-fg-inverse/70">
              {column.tasks.length}
            </span>
          </div>
          {column.tasks.map((task) => (
            <div key={task} className="rounded-lg border border-white/10 bg-surface-dark-raised px-2.5 py-2 text-[11px] leading-snug">
              {task}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
