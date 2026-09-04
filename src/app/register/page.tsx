import Link from "next/link";

import AuthCard from "@/components/layout/AuthCard";
import RegisterForm from "./RegisterForm";

export const metadata = { title: "Daftar" };

export default function RegisterPage() {
  return (
    <AuthCard title="Daftar Akun" subtitle="Student Hub & Internship Logbook">
      <RegisterForm />
      <p className="text-center text-[12.5px] text-muted-foreground">
        Sudah punya akun?{" "}
        <Link href="/login" className="font-semibold text-primary hover:underline">
          Masuk di sini
        </Link>
      </p>
    </AuthCard>
  );
}
