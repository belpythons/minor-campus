"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { SidebarNav } from "@/components/layout/sidebar-nav";
import { BottomTabBar } from "@/components/layout/bottom-tab-bar";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { currentPageTitle } from "@/lib/navigation";
import { AnimatePresence, motion } from "@/components/motion/motion-primitives";

export function AppShell({
  nama,
  instansi,
  children,
}: {
  nama: string;
  instansi: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const inisial = nama.trim().charAt(0).toUpperCase() || "?";

  // Any route change closes the drawer, including browser Back.
  React.useEffect(() => setDrawerOpen(false), [pathname]);

  return (
    <div className="flex min-h-screen bg-background">
      {/* Desktop rail */}
      <aside className="hidden w-[250px] shrink-0 lg:block">
        <div className="fixed inset-y-0 left-0 z-30 w-[250px]">
          <SidebarNav />
        </div>
      </aside>

      {/*
        Mobile drawer. Radix Sheet supplies Escape, focus trap, focus restore
        and body scroll lock — all missing from the previous hand-rolled panel.
      */}
      <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
        <SheetContent side="left" className="w-[290px] gap-0 border-0 p-0" hideClose>
          <SheetTitle className="sr-only">Menu navigasi</SheetTitle>
          <SheetDescription className="sr-only">
            Semua halaman pada tiga modul: SKM, Task Report Magang, dan Log Book.
          </SheetDescription>
          <SidebarNav onNavigate={() => setDrawerOpen(false)} />
        </SheetContent>
      </Sheet>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex h-14 items-center gap-2 border-b border-border bg-card/90 px-3 backdrop-blur-md sm:px-6">
          <Button
            variant="outline"
            size="icon-sm"
            className="lg:hidden"
            onClick={() => setDrawerOpen(true)}
            aria-label="Buka menu navigasi"
          >
            <Menu aria-hidden />
          </Button>

          {/* On mobile the top bar states where you are; desktop has the rail. */}
          <p className="min-w-0 flex-1 truncate text-sm font-bold text-foreground lg:hidden">
            {currentPageTitle(pathname)}
          </p>
          <div className="hidden flex-1 lg:block" />

          <ThemeToggle />

          <Badge variant="primary" className="hidden sm:inline-flex">
            PESERTA
          </Badge>

          <Avatar className="size-8">
            <AvatarFallback>{inisial}</AvatarFallback>
          </Avatar>

          <div className="hidden min-w-0 flex-col leading-tight sm:flex">
            <strong className="truncate text-[13px] font-semibold text-foreground">{nama}</strong>
            <small className="truncate text-[10.5px] text-muted-foreground">{instansi}</small>
          </div>
        </header>

        {/* Bottom padding clears the mobile tab bar and its safe-area inset. */}
        <main className="w-full max-w-[1280px] flex-1 px-3 pb-[calc(5.5rem+env(safe-area-inset-bottom,0px))] pt-4 sm:px-6 sm:pt-6 lg:pb-10">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.2, ease: [0.22, 0.61, 0.36, 1] }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      <BottomTabBar />
    </div>
  );
}
