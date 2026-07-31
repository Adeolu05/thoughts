"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { IconFeed, IconMemories, IconWrite } from "@/components/icons";

const tabs = [
  { href: "/", label: "Feed", icon: IconFeed, match: (p: string) => p === "/" },
  {
    href: "/create",
    label: "Write",
    icon: IconWrite,
    match: (p: string) => p.startsWith("/create"),
    primary: true,
  },
  {
    href: "/memories",
    label: "Memories",
    icon: IconMemories,
    match: (p: string) => p.startsWith("/memories"),
  },
] as const;

export function BottomTabBar() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-50 px-4 sm:hidden"
      style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
      aria-label="Primary"
    >
      <div className="tab-dock mx-auto flex h-[3.85rem] max-w-sm items-center justify-around px-2">
        {tabs.map((tab) => {
          const active = tab.match(pathname);
          const Icon = tab.icon;

          if ("primary" in tab && tab.primary) {
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className="relative -top-4 flex flex-col items-center"
              >
                <span
                  className={`flex h-[3.25rem] w-[3.25rem] items-center justify-center rounded-[1.15rem] transition-all duration-300 ${
                    active
                      ? "scale-105 bg-slate-900 text-white shadow-[0_12px_28px_-8px_rgba(15,23,42,0.45)] dark:bg-white dark:text-slate-900 dark:shadow-white/10"
                      : "bg-gradient-to-br from-violet-600 to-violet-500 text-white shadow-[0_12px_28px_-8px_rgba(124,58,237,0.55)]"
                  }`}
                >
                  <Icon />
                </span>
              </Link>
            );
          }

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex min-h-[44px] min-w-[4.5rem] flex-col items-center justify-center gap-0.5 rounded-xl px-2 py-1 transition-colors ${
                active
                  ? "text-violet-700 dark:text-violet-300"
                  : "text-slate-400 active:text-slate-600 dark:text-slate-500 dark:active:text-slate-300"
              }`}
            >
              <Icon />
              <span className="text-[10px] font-semibold tracking-wide">
                {tab.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
