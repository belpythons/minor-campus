"use client";

import * as React from "react";
import { toast } from "sonner";

/**
 * Registers the service worker and surfaces the two states a user needs to
 * know about but browsers keep silent:
 *
 *   - a new version is waiting  -> offer a reload instead of serving stale code
 *   - the connection dropped    -> say so, and say when it returns
 */
export function ServiceWorkerRegistrar() {
  React.useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (!("serviceWorker" in navigator)) return;

    let registration: ServiceWorkerRegistration | undefined;

    const onUpdateFound = () => {
      const waiting = registration?.waiting;
      if (!waiting) return;

      toast("Versi baru tersedia", {
        description: "Muat ulang untuk memakai versi terbaru.",
        duration: Infinity,
        action: {
          label: "Muat ulang",
          onClick: () => {
            waiting.postMessage("SKIP_WAITING");
            window.location.reload();
          },
        },
      });
    };

    navigator.serviceWorker
      .register("/sw.js", { scope: "/" })
      .then((reg) => {
        registration = reg;
        if (reg.waiting) onUpdateFound();
        reg.addEventListener("updatefound", () => {
          reg.installing?.addEventListener("statechange", () => {
            if (reg.waiting) onUpdateFound();
          });
        });
      })
      .catch(() => {
        // A failed registration only costs offline support; never block the app.
      });
  }, []);

  React.useEffect(() => {
    let offlineToast: string | number | undefined;

    const onOffline = () => {
      offlineToast = toast.warning("Anda sedang offline", {
        description: "Perubahan belum bisa disimpan sampai koneksi kembali.",
        duration: Infinity,
      });
    };

    const onOnline = () => {
      if (offlineToast !== undefined) toast.dismiss(offlineToast);
      offlineToast = undefined;
      toast.success("Koneksi kembali tersambung");
    };

    window.addEventListener("offline", onOffline);
    window.addEventListener("online", onOnline);

    if (typeof navigator !== "undefined" && !navigator.onLine) onOffline();

    return () => {
      window.removeEventListener("offline", onOffline);
      window.removeEventListener("online", onOnline);
    };
  }, []);

  return null;
}
