import Link from "next/link";
import Image from "next/image";
import { FileQuestion, Home } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export const metadata = { title: "Halaman tidak ditemukan" };

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md p-6 text-center">
        <Image
          src="/logo.png"
          alt="STITEK Bontang"
          width={48}
          height={48}
          className="mx-auto rounded-lg"
        />
        <span
          className="mx-auto mt-5 flex size-11 items-center justify-center rounded-full bg-muted text-muted-foreground"
          aria-hidden
        >
          <FileQuestion className="size-5" />
        </span>
        <h1 className="mt-4 text-base font-bold">Halaman atau data tidak ditemukan</h1>
        <p className="mx-auto mt-1.5 max-w-sm text-[13px] leading-relaxed text-muted-foreground">
          Tautannya mungkin sudah berubah, atau catatan yang dituju sudah dihapus.
          Bisa juga catatan itu milik peserta lain.
        </p>
        <Button asChild className="mt-5">
          <Link href="/dashboard">
            <Home aria-hidden />
            Ke Dashboard
          </Link>
        </Button>
      </Card>
    </main>
  );
}
