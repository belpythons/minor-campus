"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Plus } from "lucide-react";

import { BOTTOM_TABS, isNavItemActive } from "@/lib/navigation";
import { cn } from "@/lib/utils";
import { motion } from "@/components/motion/motion-primitives";

/** Which "create" screen the floating action button should open, per section. */
function quickCreateHref(pathname: string): string {
  if (pathname.startsWith("/skm")) return "/skm/new";
  if (pathname.startsWith("/logbook")) return "/logbook/new";
  return "/reports/new";
}

/**
 * Mobile primary navigation.
 *
 * Fixed to the bottom because that is where a thumb reaches on a phone; the
 * desktop rail stays the source of truth for the full menu. Height accounts
 * for the iOS home indicator via env(safe-area-inset-bottom).
 */
export function BottomTabBar() {
  const pathname = usePathname();
  const createHref = quickCreateHref(pathname);
  const onCreateScreen = pathname.endsWith("/new");

  return (
    <>
      {!onCreateScreen && (
        <Link
          href={createHref}
          aria-label="Buat catatan baru"
          className={cn(
            "fixed bottom-[calc(4.5rem+env(safe-area-inset-bottom,0px))] right-4 z-40 lg:hidden",
            "flex size-14 items-center justify-center rounded-full shadow-pop",
            "bg-[linear-gradient(135deg,var(--navy)_0%,var(--blue)_100%)] text-white",
            "transition-transform active:scale-95",
          )}
        >
          <Plus className="size-6" aria-hidden />
        </Link>
      )}

      <nav
        aria-label="Navigasi cepat"
        className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 pb-safe shadow-nav backdrop-blur-md lg:hidden"
      >
        <ul className="flex h-[3.75rem] items-stretch">
          {BOTTOM_TABS.map((tab) => {
            const active = isNavItemActive(pathname, tab);
            return (
              <li key={tab.href} className="flex-1">
                <Link
                  href={tab.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "relative flex h-full min-h-[3.25rem] flex-col items-center justify-center gap-1 px-1 py-2 text-[10.5px] font-semibold transition-colors",
                    active ? "text-primary" : "text-muted-foreground",
                  )}
                >
                  {active && (
                    <motion.span
                      layoutId="bottom-tab-active"
                      className="absolute inset-x-3 top-0 h-[2.5px] rounded-full bg-primary"
                      transition={{ type: "spring", stiffness: 500, damping: 40 }}
                    />
                  )}
                  <tab.icon className="size-[18px]" aria-hidden />
                  <span className="truncate">{tab.shortLabel ?? tab.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );
}
