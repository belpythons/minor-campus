"use client";

import Link from "next/link";
import { ChevronLeft, Printer } from "lucide-react";

import { Button } from "@/components/ui/button";

/**
 * Screen-only header for the two printable documents. Hidden by print.css at
 * print time so it never appears in the saved PDF.
 */
export function PrintToolbar({
  title,
  backHref,
  hint,
  extra,
}: {
  title: string;
  backHref: string;
  /** One line telling the user what to do next; PDF export is not obvious. */
  hint?: string;
  extra?: React.ReactNode;
}) {
  return (
    <div className="print-toolbar">
      <div className="min-w-0">
        <strong className="block truncate">{title}</strong>
        {hint && <span className="mt-0.5 block text-[11.5px] text-muted-foreground">{hint}</span>}
      </div>

      <div className="flex flex-wrap gap-2">
        {extra}
        <Button type="button" variant="gradient" size="sm" onClick={() => window.print()}>
          <Printer aria-hidden />
          Cetak / Simpan PDF
        </Button>
        <Button asChild variant="outline" size="sm">
          <Link href={backHref}>
            <ChevronLeft aria-hidden />
            Kembali
          </Link>
        </Button>
      </div>
    </div>
  );
}
