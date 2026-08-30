import type { Metadata, Viewport } from "next";
import { Poppins } from "next/font/google";

import { ThemeProvider } from "@/components/layout/theme-provider";
import { MotionProvider } from "@/components/motion/motion-primitives";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ServiceWorkerRegistrar } from "@/components/pwa/service-worker-registrar";

import "./globals.css";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-poppins",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Student Hub & Internship Logbook",
    template: "%s · Student Hub",
  },
  description:
    "Sistem terpadu SKM, Task Report Magang PT Badak NGL, dan Log Book Konsultasi STITEK Bontang.",
  applicationName: "Student Hub",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "Student Hub",
    statusBarStyle: "black-translucent",
  },
  icons: {
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180" }],
  },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  // Zoom stays available — capping it would fail WCAG 1.4.4.
  maximumScale: 5,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#0a2a5e" },
    { media: "(prefers-color-scheme: dark)", color: "#071d42" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className={poppins.variable} suppressHydrationWarning>
      <body>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <MotionProvider>
            <TooltipProvider delayDuration={250}>
              {/* Lets keyboard users jump past the nav rail. */}
              <a
                href="#konten-utama"
                className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-primary-foreground"
              >
                Lompat ke konten utama
              </a>
              {children}
              <Toaster />
              <ServiceWorkerRegistrar />
            </TooltipProvider>
          </MotionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
