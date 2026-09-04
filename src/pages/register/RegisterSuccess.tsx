import * as React from "react";
import { Link } from "react-router-dom";
import { MailCheck, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { FormAlert } from "@/components/shared/form-alert";
import supabase from "@/lib/supabase/client";
import { confirmUrl } from "@/lib/site-url";
import { describeError } from "@/lib/notify";

const COOLDOWN = 60;

/**
 * Menggantikan seluruh form pendaftaran setelah signUp berhasil.
 *
 * Sengaja bukan banner: form aslinya sepanjang delapan kolom dengan tombol
 * kirim di bawah, jadi pemberitahuan apa pun di atasnya berada di luar layar
 * persis pada saat dibutuhkan. Dengan formnya lenyap, halaman menyusut dan
 * narasi ini menjadi satu-satunya yang terlihat.
 */
export default function RegisterSuccess({ email }: { email: string }) {
  const [left, setLeft] = React.useState(COOLDOWN);
  const [busy, setBusy] = React.useState(false);
  const [note, setNote] = React.useState<{ tone: "error" | "success"; text: string } | null>(null);

  React.useEffect(() => {
    window.scrollTo({ top: 0 });
  }, []);

  React.useEffect(() => {
    if (left <= 0) return;
    const id = setInterval(() => setLeft((n) => n - 1), 1000);
    return () => clearInterval(id);
  }, [left]);

  async function resend() {
    setBusy(true);
    setNote(null);
    const { error } = await supabase.auth.resend({
      type: "signup",
      email,
      options: { emailRedirectTo: confirmUrl() },
    });
    setBusy(false);

    if (error) {
      setNote({ tone: "error", text: describeError(error) });
      return;
    }
    setLeft(COOLDOWN);
    setNote({ tone: "success", text: "Email dikirim ulang. Cek kotak masuk Anda sekali lagi." });
  }

  return (
    <div className="space-y-4 text-center">
      <span
        className="mx-auto flex size-14 items-center justify-center rounded-xl border border-foreground bg-success text-success-foreground"
        aria-hidden
      >
        <MailCheck className="size-7" />
      </span>

      <div>
        <h2 className="text-lg font-bold text-foreground">Cek email kamu</h2>
        <p className="mt-1.5 text-[13px] leading-relaxed text-muted-foreground">
          Kami mengirim satu tautan ke{" "}
          <strong className="break-all font-semibold text-foreground">{email}</strong>. Klik tombol
          di dalam email itu, lalu kamu bisa langsung masuk. Kalau belum ada dalam 2 menit, cek
          folder Spam atau Promosi.
        </p>
      </div>

      {note && <FormAlert tone={note.tone}>{note.text}</FormAlert>}

      <Button
        type="button"
        variant="outline"
        className="w-full"
        onClick={resend}
        loading={busy}
        disabled={left > 0}
      >
        {!busy && <RefreshCw aria-hidden />}
        {left > 0 ? `Kirim ulang email (${left}s)` : "Kirim ulang email"}
      </Button>

      <p className="text-[12.5px] text-muted-foreground">
        Sudah diverifikasi?{" "}
        <Link to="/login" className="font-semibold text-primary hover:underline">
          Masuk di sini
        </Link>
      </p>
    </div>
  );
}
