import Image from "next/image";

import { Card } from "@/components/ui/card";
import { FadeIn } from "@/components/motion/motion-primitives";
import { ORG } from "@/lib/constants";

export default function AuthCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-background to-accent/50 p-4">
      <FadeIn className="w-full max-w-[420px]">
        <Card className="overflow-hidden">
          <div className="bg-[linear-gradient(135deg,var(--navy)_0%,#0a2a5e_100%)] px-6 py-7 text-center">
            <Image
              src="/logo.png"
              alt="STITEK Bontang"
              width={54}
              height={54}
              priority
              className="mx-auto rounded-xl bg-white p-1"
            />
            <h1 className="mt-3 text-lg font-bold text-white">{title}</h1>
            <p className="mt-0.5 text-[12.5px] text-[#b9cbe4]">{subtitle}</p>
          </div>

          <div className="space-y-3.5 p-6">{children}</div>
        </Card>

        <p className="mt-4 text-center text-[11.5px] text-muted-foreground">
          {ORG.kampus} · Program Studi Teknik Informatika
        </p>
      </FadeIn>
    </main>
  );
}
