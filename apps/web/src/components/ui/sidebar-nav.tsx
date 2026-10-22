"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";

export interface NavItem {
  href: string;
  label: string;
}

// Highlights the current section. usePathname() is request data on dynamic
// routes: render this inside <Suspense>, with <NavList pathname={null} /> as
// the fallback (same links, nothing marked active yet).
export function SidebarNav({
  items,
  orientation = "vertical",
}: {
  items: NavItem[];
  orientation?: Orientation;
}) {
  return <NavList items={items} pathname={usePathname()} orientation={orientation} />;
}

type Orientation = "vertical" | "horizontal";

// vertical: the sidebar. horizontal: the same links under the top nav on
// small screens, where the sidebar is hidden.
export function NavList({
  items,
  pathname,
  orientation = "vertical",
}: {
  items: NavItem[];
  pathname: string | null;
  orientation?: Orientation;
}) {
  const vertical = orientation === "vertical";
  return (
    <nav aria-label="Main">
      <ul className={cn("flex gap-1", vertical ? "flex-col" : "overflow-x-auto")}>
        {items.map((item) => {
          const active =
            pathname !== null &&
            (item.href === "/app" ? pathname === "/app" : pathname.startsWith(item.href));
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative flex h-10 items-center rounded-lg px-3 text-sm transition-colors duration-[180ms]",
                  active
                    ? "bg-white/5 font-semibold text-fg-inverse"
                    : "text-fg-inverse/70 hover:bg-white/5 hover:text-fg-inverse",
                )}
              >
                {/* Lime marks the active item, along with weight and
                    aria-current: never color alone. */}
                {active && (
                  <span
                    aria-hidden="true"
                    className={cn(
                      "absolute rounded-full bg-accent",
                      vertical ? "inset-y-2 left-0 w-1" : "inset-x-3 bottom-0 h-0.5",
                    )}
                  />
                )}
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
