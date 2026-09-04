"use client";

import { CheckCircle2, Target } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { SKM_KATEGORI, SKM_TARGET_POIN } from "@/lib/constants";
import { CountUp, FadeIn } from "@/components/motion/motion-primitives";
import { cn } from "@/lib/utils";

export function SkmProgress({
  totalPoin,
  countByKategori,
}: {
  totalPoin: number;
  countByKategori: Record<string, number>;
}) {
  const pct = Math.min(100, Math.round((totalPoin / SKM_TARGET_POIN) * 100));
  const terpenuhi = totalPoin >= SKM_TARGET_POIN;
  const sisa = Math.max(0, SKM_TARGET_POIN - totalPoin);

  return (
    <FadeIn>
      <Card className="p-4 sm:p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.06em] text-muted-foreground">
              <Target className="size-3.5" aria-hidden />
              Total Poin SKM
            </p>
            <p className="mt-1 text-3xl font-extrabold leading-none tracking-tight text-foreground">
              <CountUp value={totalPoin} />
              <span className="ml-1 text-base font-semibold text-muted-foreground">
                / {SKM_TARGET_POIN} Poin
              </span>
            </p>
          </div>

          <Badge variant={terpenuhi ? "success" : "warning"} className="text-[11.5px]">
            {terpenuhi && <CheckCircle2 aria-hidden />}
            {terpenuhi ? "Syarat kelulusan terpenuhi" : `Terpenuhi ${pct}%`}
          </Badge>
        </div>

        <Progress
          value={pct}
          className="mt-4 h-2.5"
          indicatorClassName={cn(terpenuhi ? "bg-success" : "bg-primary")}
          aria-label={`Progres poin SKM ${totalPoin} dari ${SKM_TARGET_POIN}`}
        />

        {/* States what is still needed, rather than only how far along you are. */}
        <p className="mt-2 text-[12px] text-muted-foreground">
          {terpenuhi
            ? "Target poin kelulusan sudah tercapai. Kegiatan berikutnya menambah nilai portofolio."
            : `Butuh ${sisa} poin lagi untuk memenuhi syarat kelulusan.`}
        </p>

        <div className="mt-4 flex flex-wrap gap-2 border-t border-border pt-3.5">
          {SKM_KATEGORI.map((k) => {
            const n = countByKategori[k.value] ?? 0;
            return (
              <Badge key={k.value} variant={n > 0 ? "primary" : "outline"}>
                <span aria-hidden>{k.emoji}</span>
                {k.short}: <span className="tnum font-bold">{n}</span>
              </Badge>
            );
          })}
        </div>
      </Card>
    </FadeIn>
  );
}
