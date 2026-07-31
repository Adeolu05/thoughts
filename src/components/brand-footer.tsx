export function BrandFooter() {
  return (
    <footer className="relative z-10 mt-auto hidden border-t border-slate-900/[0.05] bg-white/40 py-7 backdrop-blur-sm dark:border-white/[0.06] dark:bg-[#14121f]/80 sm:block">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 sm:flex-row sm:px-6 lg:px-8">
        <p className="text-center text-[13px] text-slate-500 dark:text-slate-400 sm:text-left">
          <span className="font-display text-[17px] text-slate-800 dark:text-slate-100">
            Thoughts
          </span>
          <span className="mx-2.5 text-slate-300 dark:text-slate-600">·</span>
          A product by{" "}
          <a
            href="https://dpeluola.com"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-violet-700 underline decoration-violet-200 underline-offset-4 transition hover:decoration-violet-500 dark:text-violet-300 dark:decoration-violet-500/40"
          >
            David Peluola
          </a>
        </p>
        <div className="flex items-center gap-4 text-[12px] text-slate-400 dark:text-slate-500">
          <a
            href="https://dpeluola.com"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium transition hover:text-slate-700 dark:hover:text-slate-200"
          >
            dpeluola.com
          </a>
          <span className="h-1 w-1 rounded-full bg-slate-300 dark:bg-slate-600" />
          <span className="tracking-wide">thoughts.dpeluola.com</span>
        </div>
      </div>
    </footer>
  );
}
