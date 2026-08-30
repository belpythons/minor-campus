"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Pencil, Plus, Save, Trash2, Users, X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { EmptyState } from "@/components/shared/empty-state";
import { Field, fieldAria } from "@/components/shared/field";
import { ConfirmDialog, useConfirm } from "@/components/shared/confirm-dialog";
import { createClient } from "@/lib/supabase/client";
import { describeError, notifyError, notifySuccess, notifyWarning } from "@/lib/notify";
import { Collapsible, Stagger, StaggerItem } from "@/components/motion/motion-primitives";
import type { Supervisor } from "@/lib/types";

export interface SupervisorRow extends Supervisor {
  jumlahKonsultasi: number;
}

const EMPTY_DRAFT = { nama: "", jabatan: "", departemen: "" };

export function SupervisorManager({
  rows,
  userId,
}: {
  rows: SupervisorRow[];
  userId: string;
}) {
  const router = useRouter();
  const confirm = useConfirm();

  const [mode, setMode] = React.useState<"idle" | "add" | { id: string }>("idle");
  const [draft, setDraft] = React.useState(EMPTY_DRAFT);
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [busy, setBusy] = React.useState(false);
  const [pendingDelete, setPendingDelete] = React.useState<SupervisorRow | null>(null);

  const editingId = typeof mode === "object" ? mode.id : null;
  const panelOpen = mode !== "idle";

  function startAdd() {
    setDraft(EMPTY_DRAFT);
    setErrors({});
    setMode("add");
  }

  function startEdit(s: Supervisor) {
    setDraft({ nama: s.nama, jabatan: s.jabatan ?? "", departemen: s.departemen ?? "" });
    setErrors({});
    setMode({ id: s.id });
  }

  function cancel() {
    setMode("idle");
    setErrors({});
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();

    if (!draft.nama.trim()) {
      setErrors({ nama: "Nama pembimbing wajib diisi." });
      return;
    }

    setBusy(true);
    const supabase = createClient();
    const payload = {
      nama: draft.nama.trim(),
      jabatan: draft.jabatan.trim() || null,
      departemen: draft.departemen.trim() || null,
    };

    const { error } = editingId
      ? await supabase.from("supervisors").update(payload).eq("id", editingId)
      : await supabase.from("supervisors").insert({ ...payload, user_id: userId });

    if (error) {
      notifyError("Gagal menyimpan pembimbing", { description: describeError(error) });
      setBusy(false);
      return;
    }

    /*
      Existing log book rows keep a denormalised copy of the name and title so
      an already-printed Formulir 2 stays reproducible. Renaming the supervisor
      therefore has to update those rows too, or the printed form and the list
      would disagree.
    */
    if (editingId) {
      const { error: syncError } = await supabase
        .from("logbook_entries")
        .update({ pembimbing_nama: payload.nama, pembimbing_jabatan: payload.jabatan })
        .eq("supervisor_id", editingId);

      if (syncError) {
        notifyWarning("Pembimbing tersimpan, tetapi entri lama belum ikut diperbarui", {
          description: describeError(syncError),
        });
      }
    }

    notifySuccess(editingId ? "Data pembimbing diperbarui" : "Pembimbing ditambahkan", {
      description: payload.nama,
    });

    setBusy(false);
    cancel();
    router.refresh();
  }

  function askDelete(s: SupervisorRow) {
    if (s.jumlahKonsultasi > 0) {
      notifyWarning("Pembimbing masih dipakai", {
        description: `${s.nama} tercatat pada ${s.jumlahKonsultasi} entri log book. Ubah atau hapus entri tersebut lebih dahulu.`,
      });
      return;
    }
    setPendingDelete(s);
    confirm.ask();
  }

  async function doDelete() {
    if (!pendingDelete) return;
    confirm.setLoading(true);

    const supabase = createClient();
    const { error } = await supabase.from("supervisors").delete().eq("id", pendingDelete.id);

    if (error) {
      notifyError("Gagal menghapus pembimbing", { description: describeError(error) });
      confirm.close();
      return;
    }

    notifySuccess("Pembimbing dihapus", { description: pendingDelete.nama });
    confirm.close();
    setPendingDelete(null);
    router.refresh();
  }

  return (
    <div className="space-y-4">
      {!panelOpen && (
        <Button variant="gradient" onClick={startAdd}>
          <Plus aria-hidden />
          Tambah Pembimbing
        </Button>
      )}

      <Collapsible open={panelOpen}>
        <Card className="p-4">
          <form onSubmit={save} className="space-y-4">
            <p className="text-[13px] font-bold text-foreground">
              {editingId ? "Ubah Data Pembimbing" : "Pembimbing Baru"}
            </p>

            <div className="grid gap-3 sm:grid-cols-3">
              <Field label="Nama" htmlFor="m-nama" required error={errors.nama}>
                <Input
                  {...fieldAria("m-nama", errors.nama)}
                  placeholder="mis. Saleh Nurdin"
                  value={draft.nama}
                  onChange={(e) => {
                    setDraft((d) => ({ ...d, nama: e.target.value }));
                    setErrors({});
                  }}
                />
              </Field>

              <Field label="Jabatan / Pangkat" htmlFor="m-jabatan">
                <Input
                  {...fieldAria("m-jabatan")}
                  placeholder="mis. Superintendent IT Planning"
                  value={draft.jabatan}
                  onChange={(e) => setDraft((d) => ({ ...d, jabatan: e.target.value }))}
                />
              </Field>

              <Field label="Departemen" htmlFor="m-dept">
                <Input
                  {...fieldAria("m-dept")}
                  placeholder="mis. IT / SHE-Q"
                  value={draft.departemen}
                  onChange={(e) => setDraft((d) => ({ ...d, departemen: e.target.value }))}
                />
              </Field>
            </div>

            {editingId && (
              <p className="text-[11.5px] leading-relaxed text-muted-foreground">
                Perubahan nama dan jabatan ikut diterapkan pada seluruh entri log book pembimbing
                ini, agar Formulir 2 tetap konsisten.
              </p>
            )}

            <div className="flex gap-2">
              <Button type="submit" loading={busy}>
                {!busy && <Save aria-hidden />}
                {busy ? "Menyimpan…" : "Simpan"}
              </Button>
              <Button type="button" variant="outline" onClick={cancel} disabled={busy}>
                <X aria-hidden />
                Batal
              </Button>
            </div>
          </form>
        </Card>
      </Collapsible>

      <Card className="overflow-hidden">
        {rows.length === 0 ? (
          <EmptyState
            icon={Users}
            title="Belum ada pembimbing terdaftar"
            description="Daftarkan atasan atau supervisor yang Anda ajak konsultasi agar bisa dipilih saat menambah entri log book."
            action={
              <Button variant="gradient" onClick={startAdd}>
                <Plus aria-hidden />
                Tambah Pembimbing
              </Button>
            }
          />
        ) : (
          <>
            {/* --- Mobile cards --- */}
            <Stagger className="divide-y divide-border lg:hidden" as="ul">
              {rows.map((s) => (
                <StaggerItem key={s.id} as="li" className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-[13.5px] font-semibold text-foreground">{s.nama}</p>
                      <p className="mt-0.5 text-[12px] text-muted-foreground">
                        {[s.jabatan, s.departemen].filter(Boolean).join(" · ") || "—"}
                      </p>
                    </div>
                    <Badge variant={s.jumlahKonsultasi > 0 ? "primary" : "outline"}>
                      {s.jumlahKonsultasi} konsultasi
                    </Badge>
                  </div>

                  <div className="mt-3 flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => startEdit(s)}
                    >
                      <Pencil aria-hidden />
                      Ubah
                    </Button>
                    <Button
                      variant="outline-destructive"
                      size="sm"
                      onClick={() => askDelete(s)}
                      aria-label={`Hapus ${s.nama}`}
                    >
                      <Trash2 aria-hidden />
                    </Button>
                  </div>
                </StaggerItem>
              ))}
            </Stagger>

            {/* --- Desktop table --- */}
            <div className="hidden lg:block">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead>Nama</TableHead>
                    <TableHead>Jabatan / Pangkat</TableHead>
                    <TableHead>Departemen</TableHead>
                    <TableHead className="text-right">Konsultasi</TableHead>
                    <TableHead>
                      <span className="sr-only">Aksi</span>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((s) => (
                    <TableRow key={s.id}>
                      <TableCell className="font-semibold text-foreground">{s.nama}</TableCell>
                      <TableCell className="text-muted-foreground">{s.jabatan || "—"}</TableCell>
                      <TableCell className="text-muted-foreground">{s.departemen || "—"}</TableCell>
                      <TableCell className="text-right font-bold text-primary tnum">
                        {s.jumlahKonsultasi}
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-right">
                        <Button variant="outline" size="xs" onClick={() => startEdit(s)}>
                          <Pencil aria-hidden />
                          Ubah
                        </Button>
                        <Button
                          variant="outline-destructive"
                          size="xs"
                          className="ml-1.5"
                          onClick={() => askDelete(s)}
                          aria-label={`Hapus ${s.nama}`}
                        >
                          <Trash2 aria-hidden />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </>
        )}
      </Card>

      <ConfirmDialog
        open={confirm.open}
        onOpenChange={(next) => {
          confirm.onOpenChange(next);
          if (!next) setPendingDelete(null);
        }}
        loading={confirm.loading}
        title="Hapus pembimbing ini?"
        description={
          <>
            <span className="font-semibold text-foreground">{pendingDelete?.nama}</span> akan
            dihapus dari daftar pembimbing Anda.
          </>
        }
        consequences={["Tidak ada entri log book yang terpengaruh — pembimbing ini belum dipakai"]}
        confirmLabel="Ya, hapus"
        onConfirm={doDelete}
      />
    </div>
  );
}
