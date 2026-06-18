import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import "./globals.css";
import AppShell from "@/components/ui/AppShell";
import { cn } from "@/lib/utils";

const inter = Inter({subsets:['latin'],variable:'--font-sans'});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Gia Phả Việt Nam",
  description: "Ứng dụng quản lý gia phả dòng họ",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Gia Phả",
  },
  other: {
    "mobile-web-app-capable": "yes",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="vi"
      className={cn("antialiased", geistSans.variable, geistMono.variable, "font-sans", inter.variable)}
    >
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
