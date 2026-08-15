import type { Metadata } from "next";
import "./globals.css";

import {
  PwaProvider,
  InstallBanner,
  UpdateBanner,
} from "@/components/pwa";

import AppHeader from "@/components/navigation/AppHeader";

export const metadata: Metadata = {
  title: "این کارته",
  description: "مدیریت کارهای روزانه",
  manifest: "/manifest.json",
  icons: {
    icon: [
      {
        url: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
    ],
    apple: [
      {
        url: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fa" dir="rtl">
      <body className="min-h-screen bg-slate-100 dark:bg-slate-900">
        <PwaProvider>
          <InstallBanner />
          <UpdateBanner />

          <div className="mx-auto max-w-xl px-3 pt-5 sm:px-5">
            <AppHeader />
          </div>

          {children}
        </PwaProvider>
      </body>
    </html>
  );
}