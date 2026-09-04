import Image from "next/image";
import { WifiOff } from "lucide-react";

import { Card } from "@/components/ui/card";
import { ReloadButton } from "./reload-button";

export const metadata = { title: "Offline" };

/**
 * Served by the service worker when a navigation fails. Static on purpose —
 * it must render with no network and no session.
 */
export default function OfflinePage() {
  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md p-6 text-center">
        <Image
          src="/logo.png"
          alt="STITEK Bontang"
          width={52}
          height={52}
          className="mx-auto rounded-lg"
        />

        <span
          className="mx-auto mt-5 flex size-11 items-center justify-center rounded-full bg-warning/15 text-warning"
          aria-hidden
        >
          <WifiOff className="size-5" />
        </span>

        <h1 className="mt-4 text-base font-bold">Anda sedang offline</h1>
        <p className="mx-auto mt-1.5 max-w-sm text-[13px] leading-relaxed text-muted-foreground">
          Halaman ini butuh koneksi internet. Data laporan dan log book hanya
          diambil langsung dari server, jadi tidak disimpan di perangkat.
        </p>

        <div className="mt-5">
          <ReloadButton />
        </div>

        <p className="mt-4 text-[11.5px] text-muted-foreground">
          Catatan yang sudah tersimpan aman di server dan akan muncul kembali
          begitu koneksi tersambung.
        </p>
      </Card>
    </main>
  );
}
