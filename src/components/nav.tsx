"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "@/components/theme-toggle";

const links = [
  { href: "/", label: "Feed" },
  { href: "/memories", label: "Memories" },
];

export function Nav() {
  const pathname = usePathname();
  const onCreate = pathname.startsWith("/create");

  return (
    <header className="app-nav sticky top-0 z-40 border-b backdrop-blur-2xl">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4 sm:h-[4.25rem] sm:px-6 lg:px-8">
        <Link href="/" className="group flex shrink-0 items-center gap-2.5">
          <span className="relative flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 via-violet-500 to-fuchsia-500 text-xs font-bold text-white shadow-[0_8px_20px_-6px_rgba(124,58,237,0.55)] transition duration-300 group-hover:scale-[1.04] sm:h-10 sm:w-10 sm:text-sm">
            T
            <span className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-t from-transparent to-white/20" />
          </span>
          <div className="flex flex-col leading-none">
            <span className="font-display text-[18px] tracking-tight text-slate-900 dark:text-slate-50 sm:text-[20px]">
              Thoughts
            </span>
            <span className="mt-1 hidden text-[10px] font-semibold tracking-[0.16em] text-slate-400 dark:text-slate-500 sm:block">
              {onCreate ? "STUDIO" : "BY DAVID PELUOLA"}
            </span>
          </div>
        </Link>

        <nav className="hidden items-center gap-0.5 rounded-full border border-slate-900/[0.06] bg-white/70 p-1 shadow-sm dark:border-white/10 dark:bg-[#1c1930] sm:flex">
          {links.map((link) => {
            const active =
              link.href === "/"
                ? pathname === "/"
                : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-full px-4 py-2 text-[13px] font-medium transition-all ${
                  active
                    ? "bg-slate-900 text-white shadow-sm dark:bg-white dark:text-slate-900"
                    : "text-slate-500 hover:bg-slate-900/[0.04] hover:text-slate-800 dark:text-slate-400 dark:hover:bg-white/[0.06] dark:hover:text-slate-100"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
          <a
            href="https://dpeluola.com"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full px-3.5 py-2 text-[12px] font-medium text-slate-400 transition hover:text-slate-700 dark:hover:text-slate-200"
          >
            Portfolio
          </a>
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle className="h-11 w-11 sm:h-9 sm:w-9" />

          {onCreate ? (
            <span className="hidden items-center gap-1.5 rounded-full border border-emerald-200/80 bg-emerald-50 px-3 py-1.5 text-[11px] font-semibold text-emerald-700 dark:border-emerald-500/25 dark:bg-emerald-500/10 dark:text-emerald-300 lg:inline-flex">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
              </span>
              Live
            </span>
          ) : (
            /* Desktop only - mobile uses bottom Write tab as primary CTA */
            <Link
              href="/create"
              className="btn-primary !hidden sm:!inline-flex !px-5 !py-2.5"
            >
              Write a thought
            </Link>
          )}

          {onCreate && (
            <span className="text-[11px] font-semibold tracking-[0.16em] text-violet-700 dark:text-violet-300 sm:hidden">
              STUDIO
            </span>
          )}
        </div>
      </div>
    </header>
  );
}
