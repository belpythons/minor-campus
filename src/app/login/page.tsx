import Link from "next/link";

import AuthCard from "@/components/layout/AuthCard";
import LoginForm from "./LoginForm";

export const metadata = { title: "Masuk" };

export default function LoginPage({ searchParams }: { searchParams: { next?: string } }) {
  return (
    <AuthCard title="Masuk" subtitle="Student Hub & Internship Logbook">
      <LoginForm next={searchParams.next} />
      <p className="text-center text-[12.5px] text-muted-foreground">
        Belum punya akun?{" "}
        <Link href="/register" className="font-semibold text-primary hover:underline">
          Daftar di sini
        </Link>
      </p>
    </AuthCard>
  );
}
