"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";

export interface NavItem {
  href: string;
  label: string;
}

export function SidebarNav({ items }: { items: NavItem[] }) {
  const pathname = usePathname();
  return (
    <nav aria-label="Main">
      <ul className="flex flex-col gap-1">
        {items.map((item) => {
          const active =
            item.href === "/app" ? pathname === "/app" : pathname.startsWith(item.href);
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
                    className="absolute inset-y-2 left-0 w-1 rounded-full bg-accent"
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
