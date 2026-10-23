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
      <ul className={cn("flex gap-0.5", vertical ? "flex-col" : "gap-1 overflow-x-auto")}>
        {items.map((item) => {
          const active =
            pathname !== null &&
            (item.href === "/app" ? pathname === "/app" : pathname.startsWith(item.href));
          return (
            <li key={item.href} className="relative">
              {/* Active: a lime bar AND bolder text AND aria-current, never
                  color alone. The bar is lime-600 on the white sidebar
                  (3.1:1); vivid lime would be 1.5:1 there. */}
              {active && (
                <span
                  aria-hidden="true"
                  className={cn(
                    "absolute bg-accent-strong",
                    vertical
                      ? "-left-3 inset-y-1.5 w-[3px] rounded-r-full"
                      : "inset-x-3 bottom-0 h-0.5 rounded-t-full",
                  )}
                />
              )}
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex items-center rounded-lg px-3 text-sm transition-colors duration-[180ms]",
                  vertical ? "h-9" : "h-11 whitespace-nowrap",
                  active
                    ? cn("font-semibold text-fg", vertical && "bg-surface-subtle")
                    : "text-fg-secondary hover:bg-surface-subtle hover:text-fg",
                )}
              >
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
