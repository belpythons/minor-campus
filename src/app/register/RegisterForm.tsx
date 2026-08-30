"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, UserPlus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, fieldAria } from "@/components/shared/field";
import { createClient } from "@/lib/supabase/client";
import { describeError } from "@/lib/notify";
import { ORG } from "@/lib/constants";
import { AnimatePresence, motion } from "@/components/motion/motion-primitives";

const MIN_PASSWORD = 6;

export default function RegisterForm() {
  const router = useRouter();
  const [form, setForm] = React.useState({
    nama_lengkap: "",
    nim: "",
    email: "",
    instansi: ORG.kampus,
    tempat_kp: ORG.perusahaanMixed,
    password: "",
  });
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [formError, setFormError] = React.useState<string | null>(null);
  const [notice, setNotice] = React.useState<string | null>(null);
  const [busy, setBusy] = React.useState(false);

  function set<K extends keyof typeof form>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
    // Clear the field's error the moment the user starts fixing it.
    setErrors((e) => {
      if (!e[key]) return e;
      const next = { ...e };
      delete next[key];
      return next;
    });
  }

  function validate() {
    const next: Record<string, string> = {};
    if (!form.nama_lengkap.trim()) next.nama_lengkap = "Nama lengkap wajib diisi.";
    if (!form.nim.trim()) next.nim = "NIM wajib diisi.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) next.email = "Format email belum benar.";
    if (form.password.length < MIN_PASSWORD) {
      next.password = `Password minimal ${MIN_PASSWORD} karakter.`;
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    setNotice(null);

    if (!validate()) return;

    setBusy(true);
    const supabase = createClient();
    const { data, error } = await supabase.auth.signUp({
      email: form.email.trim(),
      password: form.password,
      options: {
        data: {
          nama_lengkap: form.nama_lengkap.trim(),
          nim: form.nim.trim(),
          instansi: form.instansi.trim(),
          tempat_kp: form.tempat_kp.trim(),
        },
      },
    });

    if (error) {
      setFormError(
        /already registered|already been registered/i.test(error.message)
          ? "Email ini sudah terdaftar. Silakan masuk."
          : describeError(error),
      );
      setBusy(false);
      return;
    }

    // No session means the project still requires email confirmation.
    if (!data.session) {
      setNotice(
        "Akun berhasil dibuat. Buka email Anda dan klik tautan konfirmasi, lalu masuk.",
      );
      setBusy(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  const strength =
    form.password.length === 0
      ? null
      : form.password.length < MIN_PASSWORD
        ? "kurang"
        : form.password.length < 10
          ? "cukup"
          : "kuat";

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-3">
      <AnimatePresence initial={false}>
        {formError && (
          <motion.div
            role="alert"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <p className="rounded-md border border-destructive/35 bg-destructive/8 px-3.5 py-2.5 text-[13px] font-medium text-destructive">
              {formError}
            </p>
          </motion.div>
        )}

        {notice && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <p className="flex items-start gap-2 rounded-md border border-success/35 bg-success/8 px-3.5 py-2.5 text-[13px] font-medium text-success">
              <CheckCircle2 className="mt-px size-4 shrink-0" aria-hidden />
              {notice}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <Field label="Nama Lengkap" htmlFor="nama" required error={errors.nama_lengkap}>
        <Input
          {...fieldAria("nama", errors.nama_lengkap)}
          value={form.nama_lengkap}
          onChange={(e) => set("nama_lengkap", e.target.value)}
          autoComplete="name"
        />
      </Field>

      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="NIM" htmlFor="nim" required error={errors.nim}>
          <Input
            {...fieldAria("nim", errors.nim)}
            value={form.nim}
            onChange={(e) => set("nim", e.target.value)}
          />
        </Field>

        <Field label="Email" htmlFor="email" required error={errors.email}>
          <Input
            {...fieldAria("email", errors.email)}
            type="email"
            value={form.email}
            onChange={(e) => set("email", e.target.value)}
            autoComplete="email"
          />
        </Field>
      </div>

      <Field label="Instansi / Sekolah" htmlFor="instansi">
        <Input
          {...fieldAria("instansi")}
          value={form.instansi}
          onChange={(e) => set("instansi", e.target.value)}
        />
      </Field>

      <Field label="Tempat Kerja Praktek" htmlFor="tempat">
        <Input
          {...fieldAria("tempat")}
          value={form.tempat_kp}
          onChange={(e) => set("tempat_kp", e.target.value)}
        />
      </Field>

      <Field
        label="Password"
        htmlFor="password"
        required
        error={errors.password}
        hint={
          strength
            ? `Panjang ${form.password.length} karakter — kekuatan ${strength}.`
            : `Minimal ${MIN_PASSWORD} karakter.`
        }
      >
        <Input
          {...fieldAria("password", errors.password, true)}
          type="password"
          value={form.password}
          onChange={(e) => set("password", e.target.value)}
          autoComplete="new-password"
        />
      </Field>

      <Button type="submit" variant="gradient" loading={busy} className="w-full">
        {!busy && <UserPlus aria-hidden />}
        {busy ? "Memproses…" : "Daftar"}
      </Button>
    </form>
  );
}
