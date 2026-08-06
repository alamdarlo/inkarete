import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "این کارته",
  description: "مدیریت کارهای روزانه",
  manifest: "/manifest.json",
  icons: {
    icon: "/icons/icon-192.png",
    apple: "/icons/icon-192.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fa" dir="rtl">
      <body className="min-h-screen bg-slate-100">
        {children}
      </body>
    </html>
  );
}