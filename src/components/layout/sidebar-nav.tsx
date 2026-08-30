"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut } from "lucide-react";

import { NAV_GROUPS, isNavItemActive } from "@/lib/navigation";
import { cn } from "@/lib/utils";
import { motion } from "@/components/motion/motion-primitives";

/**
 * Navigation list shared by the fixed desktop rail and the mobile drawer.
 * `onNavigate` lets the drawer close itself when a link is followed.
 */
export function SidebarNav({
  onNavigate,
  logoSrc = "/logo.png",
  subtitle = "STITEK · PT Badak NGL",
}: {
  onNavigate?: () => void;
  logoSrc?: string;
  subtitle?: string;
}) {
  const pathname = usePathname();

  return (
    <div className="flex h-full flex-col bg-sidebar text-sidebar-foreground">
      <Link
        href="/dashboard"
        onClick={onNavigate}
        className="flex items-center gap-2.5 border-b border-white/10 px-4 py-4"
      >
        <Image
          src={logoSrc}
          alt=""
          width={38}
          height={38}
          priority
          className="shrink-0 rounded-md bg-white object-contain p-0.5"
        />
        <span className="flex min-w-0 flex-col leading-tight">
          <strong className="truncate text-sm font-bold text-white">Student Hub</strong>
          <small className="truncate text-[10.5px] text-sidebar-muted">{subtitle}</small>
        </span>
      </Link>

      <nav aria-label="Navigasi utama" className="flex-1 overflow-y-auto scrollbar-thin px-2.5 py-3">
        {NAV_GROUPS.map((group) => (
          <div key={group.title} className="mb-3.5 last:mb-0">
            <p className="mb-1.5 px-2.5 text-[9.5px] font-bold uppercase tracking-[0.1em] text-sidebar-muted">
              {group.title}
            </p>

            {group.items.map((item) => {
              const active = isNavItemActive(pathname, item);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onNavigate}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "relative mb-0.5 flex min-h-10 items-center gap-2.5 rounded-md px-2.5 py-2 text-[13px] font-medium transition-colors",
                    active
                      ? "text-white"
                      : "text-sidebar-foreground hover:bg-white/[0.07] hover:text-white",
                  )}
                >
                  {/* Shared layout id slides the highlight between items. */}
                  {active && (
                    <motion.span
                      layoutId="sidebar-active"
                      className="absolute inset-0 -z-10 rounded-md bg-white/[0.14]"
                      transition={{ type: "spring", stiffness: 480, damping: 38 }}
                    />
                  )}
                  <item.icon className="size-4 shrink-0" aria-hidden />
                  <span className="truncate">{item.label}</span>
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      <form action="/auth/signout" method="post" className="border-t border-white/10 p-2.5">
        <button
          type="submit"
          className="flex min-h-10 w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-[13px] font-medium text-sidebar-foreground transition-colors hover:bg-white/[0.07] hover:text-white"
        >
          <LogOut className="size-4 shrink-0" aria-hidden />
          Keluar
        </button>
      </form>
    </div>
  );
}
