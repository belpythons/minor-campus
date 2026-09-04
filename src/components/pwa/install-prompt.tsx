"use client";

import * as React from "react";
import Image from "next/image";
import { Download, Share, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AnimatePresence, motion } from "@/components/motion/motion-primitives";

const DISMISS_KEY = "qol.install-prompt.dismissed";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

function isStandalone() {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as { standalone?: boolean }).standalone === true
  );
}

function isIos() {
  if (typeof navigator === "undefined") return false;
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

/**
 * Offers installation once, and only when it can actually succeed.
 *
 * Chrome/Edge fire `beforeinstallprompt`, so the real install dialog is used.
 * iOS Safari never fires it and has no API, so there the card explains the
 * Share -> "Add to Home Screen" path instead of pretending to have a button.
 * A dismissal is remembered so the card never nags.
 */
export function InstallPrompt() {
  const [deferred, setDeferred] = React.useState<BeforeInstallPromptEvent | null>(null);
  const [showIosHint, setShowIosHint] = React.useState(false);

  React.useEffect(() => {
    if (isStandalone()) return;

    let dismissed = false;
    try {
      dismissed = localStorage.getItem(DISMISS_KEY) === "1";
    } catch {
      // Private mode can throw on access; treat as not dismissed.
    }
    if (dismissed) return;

    const onBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstall);

    // iOS gets the manual instructions after a short delay so the card does
    // not compete with the page's first paint.
    const iosTimer = isIos() ? setTimeout(() => setShowIosHint(true), 2500) : undefined;

    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
      if (iosTimer) clearTimeout(iosTimer);
    };
  }, []);

  function remember() {
    try {
      localStorage.setItem(DISMISS_KEY, "1");
    } catch {
      // Nothing to do — the card simply reappears next session.
    }
  }

  function dismiss() {
    remember();
    setDeferred(null);
    setShowIosHint(false);
  }

  async function install() {
    if (!deferred) return;
    await deferred.prompt();
    await deferred.userChoice;
    remember();
    setDeferred(null);
  }

  const visible = Boolean(deferred) || showIosHint;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 16 }}
          transition={{ type: "spring", stiffness: 380, damping: 32 }}
          className="fixed inset-x-3 bottom-[calc(4.75rem+env(safe-area-inset-bottom,0px))] z-40 lg:inset-x-auto lg:bottom-5 lg:right-5 lg:w-80"
        >
          <Card className="flex items-start gap-3 p-3.5 shadow-pop">
            <Image
              src="/icons/icon-192.png"
              alt=""
              width={40}
              height={40}
              className="shrink-0 rounded-lg border border-border"
            />

            <div className="min-w-0 flex-1 space-y-2">
              <div>
                <p className="text-[13px] font-bold">Pasang Student Hub</p>
                <p className="mt-0.5 text-[12px] leading-relaxed text-muted-foreground">
                  {deferred
                    ? "Buka langsung dari layar utama, tanpa membuka browser."
                    : "Ketuk ikon Bagikan, lalu pilih “Tambahkan ke Layar Utama”."}
                </p>
              </div>

              {deferred ? (
                <Button size="sm" onClick={install} className="w-full">
                  <Download aria-hidden />
                  Pasang Aplikasi
                </Button>
              ) : (
                <p className="flex items-center gap-1.5 text-[12px] font-medium text-primary">
                  <Share className="size-3.5" aria-hidden />
                  Bagikan → Tambahkan ke Layar Utama
                </p>
              )}
            </div>

            <Button
              variant="ghost"
              size="icon-sm"
              onClick={dismiss}
              aria-label="Tutup tawaran pasang aplikasi"
              className="-mr-1 -mt-1 shrink-0 text-muted-foreground"
            >
              <X aria-hidden />
            </Button>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
