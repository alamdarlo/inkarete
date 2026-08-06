import type { Metadata } from "next";
import "./globals.css";
import { PwaProvider, InstallBanner, UpdateBanner } from "@/components/pwa";

export const metadata: Metadata = {
  title: "این کارته",
  description: "مدیریت کارهای روزانه",

  manifest: "/manifest.json",

  icons:{
    icon:[
      {
        url:"/icons/icon-192.png",
        sizes:"192x192",
        type:"image/png"
      }
    ],

    apple:[
      {
        url:"/icons/icon-192.png",
        sizes:"192x192",
        type:"image/png"
      }
    ]
  }
};
<link rel="apple-touch-startup-image"></link>
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fa" dir="rtl">
      <body className="min-h-screen bg-slate-100">
        <PwaProvider>
          <InstallBanner />
           <UpdateBanner />
          {children}
        </PwaProvider>
      </body>
    </html>
  );
}
