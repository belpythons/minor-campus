"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Landmark, Plus, RotateCcw, Save, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Field, fieldAria } from "@/components/shared/field";
import { FilePicker } from "@/components/shared/file-picker";
import { ConfirmDialog, useConfirm } from "@/components/shared/confirm-dialog";
import { createClient } from "@/lib/supabase/client";
import { removePublicFile, uploadPublicFile } from "@/lib/upload";
import { MAX_LOGO_SIZE, STORAGE_BUCKET_ORG_LOGOS } from "@/lib/constants";
import { resolveLetterhead, type Letterhead, type LetterheadSettings } from "@/lib/letterhead";
import { describeError, notifyError, notifySuccess } from "@/lib/notify";
import { resetLetterhead, saveLetterhead } from "@/app/(app)/account/actions";

/** Miniature render of both document letterheads — what print.css will do. */
function KopPreview({ lh }: { lh: Letterhead }) {
  const navy = "#001e41";
  return (
    <div className="space-y-3 rounded-md border border-border bg-white p-4 text-black">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-neutral-500">
        Pratinjau kop — Rekap Magang
      </p>
      <div style={{ display: "flex", alignItems: "center", gap: 12, borderBottom: `3px solid ${navy}`, paddingBottom: 10 }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={lh.logoSrc}
          alt=""
          style={lh.customLogo
            ? { height: 46, width: "auto", maxWidth: 120, objectFit: "contain" }
            : { width: 46, height: 46, objectFit: "contain" }}
        />
        <div>
          <p style={{ margin: 0, fontWeight: 800, fontSize: 18, color: navy }}>{lh.kopBaris[0]}</p>
          {lh.kopBaris.slice(1).map((b) => (
            <p key={b} style={{ margin: "2px 0 0", fontSize: 11, color: "#45566e" }}>{b}</p>
          ))}
        </div>
      </div>
      <p style={{ textAlign: "center", margin: 0, fontWeight: 800, fontSize: 16, color: navy, letterSpacing: "0.02em" }}>
        {lh.judulDokumen}
      </p>

      <p className="pt-2 text-[10px] font-semibold uppercase tracking-wide text-neutral-500">
        Pratinjau kop — Formulir 2
      </p>
      <div style={{ display: "flex", alignItems: "stretch", border: "1.5px solid #000" }}>
        <div style={{ width: 72, display: "flex", alignItems: "center", justifyContent: "center", borderRight: "1px solid #000", padding: 6 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={lh.logoSrc}
            alt=""
            style={lh.customLogo
              ? { height: 48, width: "auto", maxWidth: 84, objectFit: "contain" }
              : { width: 48, height: "auto", objectFit: "contain" }}
          />
        </div>
        <div style={{ flex: 1, padding: "8px 10px", borderRight: "1px solid #000" }}>
          <p style={{ margin: 0, fontWeight: 700, fontSize: 12 }}>{lh.kampusUpper}</p>
          <p style={{ margin: "2px 0 0", fontSize: 11 }}>{lh.prodiUpper}</p>
        </div>
        <div style={{ width: 170, padding: "8px 10px" }}>
          <p style={{ margin: 0, fontWeight: 700, fontSize: 10.5 }}>{lh.formulirTitle}</p>
          <p style={{ margin: "2px 0 0", fontSize: 10.5 }}>{lh.kodeSop}</p>
        </div>
      </div>
    </div>
  );
}

export function LetterheadForm({
  userId,
  initial,
}: {
  userId: string;
  initial: LetterheadSettings | null;
}) {
  const router = useRouter();
  const confirm = useConfirm();

  const initialState = React.useMemo(
    () => ({
      kopBaris: initial?.kop_baris?.length
        ? initial.kop_baris
        : ["PT BADAK NGL", "Program Magang / Praktik Kerja Lapangan · Bontang, Kalimantan Timur"],
      judul: initial?.judul_dokumen ?? "LAPORAN KEGIATAN MAGANG",
      kampus: initial?.kampus_upper ?? "SEKOLAH TINGGI TEKNOLOGI BONTANG",
      prodi: initial?.prodi_upper ?? "PROGRAM STUDI TEKNIK INFORMATIKA",
      formulir: initial?.formulir_title ?? "FORM KEHADIRAN DAN AKTIFITAS KERJA PRAKTEK",
      kodeSop: initial?.kode_sop ?? "TI-SOP-17/FM-01",
      lokasi: initial?.lokasi_ttd ?? "Bontang",
      logoUrl: initial?.logo_url ?? null,
    }),
    [initial],
  );

  const [form, setForm] = React.useState(initialState);
  const [logoFile, setLogoFile] = React.useState<File | null>(null);
  const [logoError, setLogoError] = React.useState<string | null>(null);
  const [progress, setProgress] = React.useState<number | null>(null);
  const [busy, setBusy] = React.useState(false);

  React.useEffect(() => setForm(initialState), [initialState]);

  function set<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  // Live preview: run the same resolver the print pages use.
  const previewUrl = React.useMemo(
    () => (logoFile ? URL.createObjectURL(logoFile) : null),
    [logoFile],
  );
  React.useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const preview = resolveLetterhead({
    user_id: userId,
    kop_baris: form.kopBaris.filter((b) => b.trim()),
    judul_dokumen: form.judul,
    kampus_upper: form.kampus,
    prodi_upper: form.prodi,
    formulir_title: form.formulir,
    kode_sop: form.kodeSop,
    lokasi_ttd: form.lokasi,
    logo_url: previewUrl ?? form.logoUrl,
    logo_versi: initial?.logo_versi ?? 0,
    updated_at: null,
  });

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);

    const supabase = createClient();
    const previousLogo = initial?.logo_url ?? null;

    try {
      let logoUrl = form.logoUrl;
      const logoVersi = (initial?.logo_versi ?? 0) + (logoFile ? 1 : 0);

      if (logoFile) {
        setProgress(0);
        logoUrl = await uploadPublicFile(
          supabase,
          STORAGE_BUCKET_ORG_LOGOS,
          userId,
          logoFile,
          setProgress,
        );
      }

      const result = await saveLetterhead({
        kop_baris: form.kopBaris.map((b) => b.trim()).filter(Boolean),
        judul_dokumen: form.judul.trim(),
        kampus_upper: form.kampus.trim(),
        prodi_upper: form.prodi.trim(),
        formulir_title: form.formulir.trim(),
        kode_sop: form.kodeSop.trim(),
        lokasi_ttd: form.lokasi.trim(),
        logo_url: logoUrl,
        logo_versi: logoVersi,
      });
      if ("error" in result) throw new Error(result.error);

      // Row saved — the replaced/removed logo file can go now.
      if (previousLogo && previousLogo !== logoUrl) {
        await removePublicFile(supabase, STORAGE_BUCKET_ORG_LOGOS, previousLogo);
      }

      setLogoFile(null);
      setProgress(null);
      notifySuccess("Kop surat tersimpan", {
        description: "Kedua dokumen cetak dan export kini memakai identitas ini.",
      });
      router.refresh();
    } catch (err) {
      notifyError("Gagal menyimpan kop surat", { description: describeError(err) });
    } finally {
      setBusy(false);
      setProgress(null);
    }
  }

  async function onReset() {
    confirm.setLoading(true);
    const result = await resetLetterhead();
    if ("error" in result) {
      notifyError("Gagal mereset kop surat", { description: describeError(result.error) });
      confirm.close();
      return;
    }
    if (initial?.logo_url) {
      await removePublicFile(createClient(), STORAGE_BUCKET_ORG_LOGOS, initial.logo_url);
    }
    setLogoFile(null);
    notifySuccess("Kop surat kembali ke bawaan", {
      description: "Identitas Badak NGL / STITEK dipakai lagi untuk semua dokumen.",
    });
    confirm.close();
    router.refresh();
  }

  return (
    <>
      <form onSubmit={onSubmit} noValidate className="mt-4 space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Landmark className="size-4 text-muted-foreground" aria-hidden />
              Kop Surat &amp; Logo
            </CardTitle>
            <CardDescription>
              Ganti identitas kop kedua dokumen cetak dengan kampus/instansi Anda. Tanpa
              setelan, dokumen memakai identitas bawaan Badak NGL / STITEK. Ikon aplikasi
              (PWA) tidak ikut berubah.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <Field
              label="Baris Kop Dokumen Rekap"
              htmlFor="kop-0"
              hint="1–4 baris; baris pertama tampil besar sebagai nama organisasi."
            >
              <div className="space-y-2">
                {form.kopBaris.map((baris, i) => (
                  <div key={i} className="flex gap-2">
                    <Input
                      id={`kop-${i}`}
                      maxLength={200}
                      value={baris}
                      onChange={(e) =>
                        set(
                          "kopBaris",
                          form.kopBaris.map((b, j) => (j === i ? e.target.value : b)),
                        )
                      }
                    />
                    {form.kopBaris.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="icon-sm"
                        aria-label={`Hapus baris ${i + 1}`}
                        onClick={() =>
                          set("kopBaris", form.kopBaris.filter((_, j) => j !== i))
                        }
                      >
                        <X aria-hidden />
                      </Button>
                    )}
                  </div>
                ))}
                {form.kopBaris.length < 4 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => set("kopBaris", [...form.kopBaris, ""])}
                  >
                    <Plus aria-hidden />
                    Tambah baris
                  </Button>
                )}
              </div>
            </Field>

            <Field label="Judul Dokumen Rekap" htmlFor="lh-judul">
              <Input
                {...fieldAria("lh-judul")}
                maxLength={160}
                value={form.judul}
                onChange={(e) => set("judul", e.target.value)}
              />
            </Field>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Nama Kampus (Formulir 2)" htmlFor="lh-kampus">
                <Input
                  {...fieldAria("lh-kampus")}
                  maxLength={160}
                  value={form.kampus}
                  onChange={(e) => set("kampus", e.target.value)}
                />
              </Field>
              <Field label="Program Studi (Formulir 2)" htmlFor="lh-prodi">
                <Input
                  {...fieldAria("lh-prodi")}
                  maxLength={160}
                  value={form.prodi}
                  onChange={(e) => set("prodi", e.target.value)}
                />
              </Field>
              <Field label="Judul Formulir" htmlFor="lh-formulir">
                <Input
                  {...fieldAria("lh-formulir")}
                  maxLength={160}
                  value={form.formulir}
                  onChange={(e) => set("formulir", e.target.value)}
                />
              </Field>
              <Field label="Kode SOP / Formulir" htmlFor="lh-sop">
                <Input
                  {...fieldAria("lh-sop")}
                  maxLength={60}
                  value={form.kodeSop}
                  onChange={(e) => set("kodeSop", e.target.value)}
                />
              </Field>
            </div>

            <Field label="Lokasi Tanda Tangan Bawaan" htmlFor="lh-lokasi">
              <Input
                {...fieldAria("lh-lokasi")}
                maxLength={120}
                value={form.lokasi}
                onChange={(e) => set("lokasi", e.target.value)}
              />
            </Field>

            <Field
              label="Logo Organisasi"
              htmlFor="lh-logo"
              optional="PNG/JPG/SVG, maks 2 MB"
              error={logoError ?? undefined}
            >
              <div className="space-y-2">
                <FilePicker
                  id="lh-logo"
                  accept="image/png,image/jpeg,image/svg+xml"
                  maxBytes={MAX_LOGO_SIZE}
                  file={logoFile}
                  progress={progress}
                  disabled={busy}
                  hint="Logo persegi ataupun landscape sama-sama didukung."
                  existingUrl={form.logoUrl}
                  onRemoveExisting={() => set("logoUrl", null)}
                  onFileChange={(next, error) => {
                    setLogoFile(next);
                    setLogoError(error ?? null);
                  }}
                />
                {(form.logoUrl || logoFile) && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setLogoFile(null);
                      set("logoUrl", null);
                    }}
                  >
                    Kembalikan ke logo bawaan
                  </Button>
                )}
              </div>
            </Field>

            <KopPreview lh={preview} />
          </CardContent>
        </Card>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <Button type="submit" variant="gradient" loading={busy}>
            {!busy && <Save aria-hidden />}
            {busy ? "Menyimpan…" : "Simpan Kop Surat"}
          </Button>

          {initial && (
            <Button type="button" variant="outline-destructive" onClick={confirm.ask} disabled={busy}>
              <RotateCcw aria-hidden />
              Reset ke bawaan
            </Button>
          )}
        </div>
      </form>

      <ConfirmDialog
        open={confirm.open}
        onOpenChange={confirm.onOpenChange}
        loading={confirm.loading}
        title="Reset kop surat ke bawaan?"
        description="Seluruh identitas kop kembali ke Badak NGL / STITEK dan logo unggahan dihapus."
        consequences={[
          "Kedua dokumen cetak memakai kop bawaan lagi",
          ...(initial?.logo_url ? ["Berkas logo unggahan ikut terhapus"] : []),
        ]}
        confirmLabel="Ya, reset"
        onConfirm={onReset}
      />
    </>
  );
}
