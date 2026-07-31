import type { ReactNode } from "react";

/**
 * Shared horizontal rhythm.
 * Mobile: phone-native column
 * Tablet: breathing room
 * Desktop: editorial max-width (never stretched wall-to-wall)
 */
export function PageShell({
  children,
  wide = false,
  className = "",
}: {
  children: ReactNode;
  /** Wider canvas for grids / dual panes */
  wide?: boolean;
  className?: string;
}) {
  return (
    <div
      className={`mx-auto w-full px-4 sm:px-6 lg:px-8 ${
        wide ? "max-w-6xl" : "max-w-lg sm:max-w-2xl lg:max-w-5xl"
      } ${className}`}
    >
      {children}
    </div>
  );
}
