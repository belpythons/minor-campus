"use client";

import * as React from "react";
import Link from "next/link";
import { Award, Check, ClipboardCopy, FileCode2, Plus } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EmptyState } from "@/components/shared/empty-state";
import { notifyError, notifySuccess } from "@/lib/notify";
import {
  LINKEDIN_SECTIONS,
  defaultSectionFor,
  formatForLinkedIn,
  portfolioMarkdown,
  type LinkedInSection,
} from "@/lib/linkedin-format";
import { formatBulanSingkat } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { SkmActivity } from "@/lib/types";
import { FadeIn } from "@/components/motion/motion-primitives";

/** Copies text, falling back for non-secure contexts (e.g. plain-HTTP LAN). */
async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    return;
  } catch {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(ta);
    if (!ok) throw new Error("Peramban menolak akses papan klip.");
  }
}

function CopyButton({
  text,
  label,
  variant = "gradient",
}: {
  text: string;
  label: string;
  variant?: "gradient" | "outline";
}) {
  const [done, setDone] = React.useState(false);

  async function copy() {
    try {
      await copyText(text);
      setDone(true);
      notifySuccess("Teks tersalin", { description: "Tempel langsung ke LinkedIn." });
      setTimeout(() => setDone(false), 1800);
    } catch (err) {
      notifyError("Gagal menyalin", {
        description:
          err instanceof Error
            ? `${err.message} Pilih teksnya lalu tekan Ctrl+C.`
            : "Pilih teksnya lalu tekan Ctrl+C.",
      });
    }
  }

  return (
    <Button type="button" variant={done ? "success" : variant} onClick={copy}>
      {done ? <Check aria-hidden /> : <ClipboardCopy aria-hidden />}
      {done ? "Tersalin!" : label}
    </Button>
  );
}

export function LinkedInAssistant({
  activities,
  nama,
}: {
  activities: SkmActivity[];
  nama: string;
}) {
  const [selectedId, setSelectedId] = React.useState(activities[0]?.id ?? "");
  const selected = activities.find((a) => a.id === selectedId) ?? null;

  const [section, setSection] = React.useState<LinkedInSection>(
    activities[0] ? defaultSectionFor(activities[0].kategori) : "experience",
  );

  const output = React.useMemo(
    () => (selected ? formatForLinkedIn(selected, section) : ""),
    [selected, section],
  );

  const markdown = React.useMemo(() => portfolioMarkdown(activities, nama), [activities, nama]);

  function pick(a: SkmActivity) {
    setSelectedId(a.id);
    setSection(defaultSectionFor(a.kategori));
  }

  if (activities.length === 0) {
    return (
      <Card>
        <EmptyState
          icon={Award}
          title="Belum ada kegiatan SKM untuk diubah menjadi teks"
          description="Tambahkan minimal satu kegiatan — prestasi, organisasi, atau sertifikasi — lalu kembali ke sini."
          action={
            <Button asChild variant="gradient">
              <Link href="/skm/new">
                <Plus aria-hidden />
                Tambah Kegiatan SKM
              </Link>
            </Button>
          }
        />
      </Card>
    );
  }

  return (
    <div className="grid items-start gap-4 lg:grid-cols-[320px_minmax(0,1fr)]">
      {/* ---- Entry picker. A horizontal rail on mobile, a list on desktop. ---- */}
      <Card className="overflow-hidden">
        <div className="border-b border-border px-4 py-3">
          <p className="text-2xs font-bold uppercase tracking-wider text-muted-foreground">
            Pilih entri SKM
          </p>
        </div>

        <div className="flex gap-2 overflow-x-auto scrollbar-thin p-3 lg:max-h-[32rem] lg:flex-col lg:gap-0 lg:overflow-y-auto lg:p-0">
          {activities.map((a) => {
            const active = a.id === selectedId;
            return (
              <button
                key={a.id}
                type="button"
                onClick={() => pick(a)}
                aria-pressed={active}
                className={cn(
                  "flex min-w-56 shrink-0 flex-col items-start gap-1 rounded-md border p-3 text-left transition-colors",
                  "lg:w-full lg:min-w-0 lg:rounded-none lg:border-0 lg:border-b lg:border-l-[3px] lg:border-b-border",
                  active
                    ? "border-primary bg-primary/[0.07] lg:border-l-primary"
                    : "border-border hover:bg-accent/50 lg:border-l-transparent",
                )}
              >
                <span className="text-[13px] font-semibold leading-snug text-foreground">
                  {a.judul}
                </span>
                <span className="text-[11.5px] text-muted-foreground">
                  {a.penyelenggara} · {formatBulanSingkat(a.tanggal_mulai)}
                </span>
                <Badge variant="outline" className="mt-0.5">
                  {a.kategori}
                </Badge>
              </button>
            );
          })}
        </div>
      </Card>

      <div className="space-y-4">
        <FadeIn>
          <Card>
            <CardHeader>
              <CardTitle>Teks Siap-Paste</CardTitle>
              <CardDescription>
                Bagian sudah dipilih otomatis sesuai kategori entri, dan tetap bisa Anda ganti.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-3.5">
              <div className="space-y-1.5">
                <Label htmlFor="section">Target section LinkedIn</Label>
                <Select value={section} onValueChange={(v) => setSection(v as LinkedInSection)}>
                  <SelectTrigger id="section">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {LINKEDIN_SECTIONS.map((s) => (
                      <SelectItem key={s.value} value={s.value}>
                        {s.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-[12px] text-muted-foreground">
                  {LINKEDIN_SECTIONS.find((s) => s.value === section)?.hint}
                </p>
              </div>

              <pre className="max-h-[26rem] overflow-auto scrollbar-thin whitespace-pre-wrap break-words rounded-md bg-[#0d1c33] p-4 font-mono text-[12.5px] leading-relaxed text-[#e4ecf7]">
                {output}
              </pre>

              <CopyButton text={output} label="Copy to Clipboard" />
            </CardContent>
          </Card>
        </FadeIn>

        <FadeIn delay={0.06}>
          <Card>
            <CardHeader>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <FileCode2 className="size-4 text-muted-foreground" aria-hidden />
                    Markdown Export
                  </CardTitle>
                  <CardDescription className="mt-1">
                    Seluruh portofolio dalam format Markdown, siap untuk README GitHub personal.
                  </CardDescription>
                </div>
                <CopyButton text={markdown} label="Copy Markdown" variant="outline" />
              </div>
            </CardHeader>

            <CardContent>
              <pre className="max-h-64 overflow-auto scrollbar-thin whitespace-pre-wrap break-words rounded-md bg-[#0d1c33] p-4 font-mono text-[12.5px] leading-relaxed text-[#e4ecf7]">
                {markdown}
              </pre>
            </CardContent>
          </Card>
        </FadeIn>
      </div>
    </div>
  );
}
