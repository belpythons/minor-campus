"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { LogIn } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, fieldAria } from "@/components/shared/field";
import { createClient } from "@/lib/supabase/client";
import { describeError } from "@/lib/notify";
import { AnimatePresence, motion } from "@/components/motion/motion-primitives";

export default function LoginForm({ next }: { next?: string }) {
  const router = useRouter();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [busy, setBusy] = React.useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError(
        error.message === "Invalid login credentials"
          ? "Email atau password salah."
          : error.message === "Email not confirmed"
            ? "Email belum dikonfirmasi. Cek kotak masuk Anda."
            : describeError(error),
      );
      setBusy(false);
      return;
    }

    router.push(next || "/dashboard");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3.5">
      <AnimatePresence initial={false}>
        {error && (
          <motion.div
            role="alert"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <p className="rounded-md border border-destructive/35 bg-destructive/8 px-3.5 py-2.5 text-[13px] font-medium text-destructive">
              {error}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <Field label="Email" htmlFor="email" required error={null}>
        <Input
          {...fieldAria("email")}
          type="email"
          placeholder="nama@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
          autoFocus
        />
      </Field>

      <Field label="Password" htmlFor="password" required>
        <Input
          {...fieldAria("password")}
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="current-password"
        />
      </Field>

      <Button type="submit" variant="gradient" loading={busy} className="w-full">
        {!busy && <LogIn aria-hidden />}
        {busy ? "Memproses…" : "Masuk"}
      </Button>
    </form>
  );
}
