import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { MobileNav } from "@/components/layout/mobile-nav";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LocaleProvider } from "@/lib/i18n";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PokerTrainer — Learn Poker From Zero to Hero",
  description: "Interactive poker training app with hand rankings, position strategy, preflop ranges, and key concepts.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#0a0a0a] text-white`}>
        <LocaleProvider>
          <TooltipProvider>
            <Sidebar />
            <div className="lg:pl-64 pb-16 lg:pb-0">
              <Header />
              <main className="min-h-[calc(100vh-3.5rem)] px-4 py-6 sm:px-6 lg:px-8">{children}</main>
            </div>
            <MobileNav />
          </TooltipProvider>
        </LocaleProvider>
      </body>
    </html>
  );
}
