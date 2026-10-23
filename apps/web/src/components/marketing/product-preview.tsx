import { Logo } from "@/components/brand/logo";
import { cn } from "@/lib/cn";

// A CSS rendition of Orbyte in use, shown in the landing's opening section: a
// project board full of work, with the dashboard floating over it. Decorative only (no data, no behavior, no
// image), described by its label. Faithful to the product: it shows only
// what Orbyte does today. Tasks have a title and a status, so cards carry no
// assignee, priority or due date.

const PROJECT = { name: "Website relaunch", created: "Sep 2, 2026" };

const BOARD: { label: string; moves: string[]; tasks: string[] }[] = [
  {
    label: "To do",
    moves: ["Start →"],
    tasks: [
      "Write the brief for the pricing page",
      "Audit accessibility on mobile",
      "Collect logos for the customer wall",
      "Draft the launch announcement",
      "Plan the blog content migration",
    ],
  },
  {
    label: "In progress",
    moves: ["← To do", "Done →"],
    tasks: [
      "Design new onboarding flow",
      "Build the pricing comparison table",
      "Fix auth token refresh on staging",
      "Wireframes for the blog index",
    ],
  },
  {
    label: "Done",
    moves: ["← Reopen"],
    tasks: [
      "Kickoff with stakeholders",
      "Audit current pages",
      "Define the new sitemap",
      "Pick a font pairing",
      "Set up the staging environment",
    ],
  },
];

// The card that "arrives" in In progress as the section scrolls into view.
const ARRIVING = "Design new onboarding flow";

const RECENT_PROJECTS = [
  { name: "Website relaunch", date: "Sep 2" },
  { name: "Mobile app v2", date: "Aug 28" },
  { name: "Q4 marketing plan", date: "Aug 21" },
  { name: "Customer portal", date: "Aug 14" },
  { name: "Hiring: design team", date: "Aug 3" },
];

const TASK_COUNT = BOARD.reduce((sum, column) => sum + column.tasks.length, 0);

// The mockup, floating: a slow vertical drift (.float-body) over a ground
// shadow that tightens as it comes down and spreads as it rises
// (.float-shadow). CSS only, transform/opacity only; still under reduced
// motion (see globals.css).
export function ProductMock() {
  return (
    <div id="product" className="float-stage relative scroll-mt-24">
      <div aria-hidden="true" className="float-shadow" />
      <div
        role="img"
        aria-label={`Preview of Orbyte in use: the Northwind Inc. workspace on the Pro plan, with the "${PROJECT.name}" project board showing ${TASK_COUNT} tasks across To do, In progress and Done, and a dashboard listing recent projects.`}
        className="float-body relative"
      >
        <BoardWindow />
        <DashboardWindow />
      </div>
    </div>
  );
}

// Main window: the project page as the app renders it.
function BoardWindow() {
  return (
    <div className="overflow-hidden rounded-panel border border-white/10 bg-background text-fg shadow-[0_18px_40px_rgba(0,0,0,0.35)]">
      <WindowChrome />
      <TopBar />
      <div className="flex">
        <Sidebar />
        <div className="min-w-0 flex-1 p-4 sm:p-6 lg:pr-8">
          <p className="text-[11px] text-fg-muted">
            <span className="underline underline-offset-2">Projects</span> / {PROJECT.name}
          </p>
          <div className="mt-2 flex flex-wrap items-end justify-between gap-2">
            <div>
              <p className="text-lg font-semibold tracking-tight sm:text-xl">{PROJECT.name}</p>
              <p className="text-[11px] text-fg-muted">
                Created {PROJECT.created} · {TASK_COUNT} tasks
              </p>
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <div className="flex h-8 flex-1 items-center rounded-lg border border-border bg-surface px-3 text-[11px] text-fg-disabled">
              What needs to be done?
            </div>
            <div className="flex h-8 items-center rounded-lg border border-accent-strong bg-accent px-3 text-[11px] font-semibold text-fg-on-lime">
              Add task
            </div>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {BOARD.map((column) => (
              <div key={column.label} className="flex flex-col gap-2 rounded-card border border-border bg-background p-2.5">
                <div className="flex items-center justify-between px-0.5 text-[11px] font-semibold">
                  {column.label}
                  <span className="rounded-full border border-border bg-surface px-1.5 text-[10px] font-medium text-fg-secondary">
                    {column.tasks.length}
                  </span>
                </div>
                {column.tasks.map((task, i) => (
                  <TaskCard
                    key={task}
                    title={task}
                    moves={column.moves}
                    arriving={task === ARRIVING}
                    // Mobile keeps two cards per column.
                    className={cn(i >= 2 && "hidden sm:flex")}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function TaskCard({
  title,
  moves,
  arriving,
  className,
}: {
  title: string;
  moves: string[];
  arriving: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-2 rounded-lg border border-border bg-surface p-2.5 shadow-subtle",
        arriving && "mock-arrive",
        className,
      )}
    >
      <span className="text-[11px] font-medium leading-snug">{title}</span>
      <div className="flex items-center gap-1">
        {moves.map((move) => (
          <span key={move} className="rounded-md border border-border px-1.5 py-0.5 text-[9px] font-semibold">
            {move}
          </span>
        ))}
        <span className="ml-auto text-[9px] font-semibold text-fg-muted">Delete</span>
      </div>
    </div>
  );
}

// Floating window: the dashboard of the same workspace. Wide screens only,
// where the page margin takes its outward offset: it then covers the empty
// bottom of the sidebar, not the board.
function DashboardWindow() {
  return (
    <div className="float-parallax absolute -bottom-8 -left-20 hidden w-72 overflow-hidden rounded-panel border border-border bg-surface text-fg shadow-[0_24px_60px_rgba(0,0,0,0.5)] xl:block">
      <div className="border-b border-border px-4 py-3">
        <p className="text-[11px] text-fg-muted">Welcome back, Maya</p>
        <p className="text-sm font-semibold">Dashboard</p>
      </div>
      <div className="flex flex-col gap-4 p-4">
        <div className="rounded-card border border-border p-3">
          <p className="text-[11px] font-semibold text-fg-secondary">Projects</p>
          <p className="mt-1 text-xl font-semibold">
            8 <span className="text-xs font-normal text-fg-muted">projects · Unlimited</span>
          </p>
        </div>
        <div>
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-semibold text-fg-secondary">Recent projects</p>
            <span className="text-[10px] font-medium underline underline-offset-2">All projects</span>
          </div>
          <div className="mt-1 divide-y divide-border">
            {RECENT_PROJECTS.map((project) => (
              <div key={project.name} className="flex items-center justify-between py-1.5 text-[11px]">
                <span className="font-medium">{project.name}</span>
                <span className="text-fg-muted">{project.date}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function WindowChrome() {
  return (
    <div className="flex h-8 items-center gap-1.5 border-b border-border bg-surface-subtle px-3">
      <span className="size-2 rounded-full bg-border" />
      <span className="size-2 rounded-full bg-border" />
      <span className="size-2 rounded-full bg-border" />
    </div>
  );
}

function TopBar() {
  return (
    <div className="flex h-12 items-center gap-3 border-b border-border bg-surface px-4">
      <Logo href={null} height={20} />
      <span className="hidden h-4 w-px bg-border sm:block" />
      <span className="truncate text-xs font-semibold">Northwind Inc.</span>
      <span className="shrink-0 rounded-full border border-border px-2 py-0.5 text-[10px] text-fg-secondary">
        Pro plan
      </span>
      <div className="ml-auto flex items-center gap-2">
        <span className="hidden text-right leading-tight sm:block">
          <span className="block text-[11px] font-medium">Maya Chen</span>
          <span className="block text-[10px] text-fg-muted">Owner</span>
        </span>
        <span className="flex size-7 items-center justify-center rounded-full bg-brand text-[10px] font-semibold text-fg-inverse">
          MC
        </span>
      </div>
    </div>
  );
}

function Sidebar() {
  return (
    <div className="hidden w-44 shrink-0 flex-col gap-0.5 border-r border-border bg-surface px-3 py-5 md:flex">
      {["Dashboard", "Projects", "Billing"].map((item) => {
        const active = item === "Projects";
        return (
          <div key={item} className="relative">
            {active && <span className="absolute -left-3 inset-y-1 w-[3px] rounded-r-full bg-accent-strong" />}
            <div
              className={
                active
                  ? "rounded-md bg-surface-subtle px-2.5 py-1.5 text-xs font-semibold"
                  : "px-2.5 py-1.5 text-xs text-fg-secondary"
              }
            >
              {item}
            </div>
          </div>
        );
      })}
    </div>
  );
}
