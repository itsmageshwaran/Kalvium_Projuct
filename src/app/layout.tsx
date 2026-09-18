import type { Metadata } from "next";
import React from "react";
import { Outfit } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider } from "@/context/ThemeContext";
import DemoSwitcherBar from "@/components/DemoSwitcherBar";
import Navbar from "@/components/Navbar";
import SmoothScroll from "@/components/SmoothScroll";
import ScrollProgress from "@/components/ScrollProgress";
import KalviumLogo from "@/components/KalviumLogo";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  weight: ["400", "500", "700", "900"],
  display: "swap",
});


export const metadata: Metadata = {
  title: "CampusHub — Verified campus events",
  description:
    "Discover verified campus events, save what matters, and never double-book yourself. Powered by AI poster analysis and certified by campus leadership.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`light ${outfit.variable}`} suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Caacupe+One&display=swap"
          rel="stylesheet"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('campushub_theme')||'light';document.documentElement.classList.remove('dark','light');document.documentElement.classList.add(t);}catch(e){}})()`,
          }}
        />
      </head>
      <body className="font-sans antialiased bg-[#F7F7F5] dark:bg-[#111111] text-[#111111] dark:text-[#FFFFFF] flex flex-col min-h-screen selection:bg-[#E5391F] selection:text-white transition-colors duration-200">
        <AuthProvider>
          <ThemeProvider>
            <ScrollProgress />
            <SmoothScroll>
              <div className="sticky top-0 z-40 w-full">
                <DemoSwitcherBar />
                <Navbar />
              </div>
              <main className="flex-1">{children}</main>

              <footer className="relative border-t-4 border-black bg-white py-16 px-8 sm:px-10">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
                  <div>
                    <div className="flex items-center justify-center md:justify-start gap-3 mb-4">
                      <div className="text-white bg-[#E5391F] p-2 border-2 border-black shadow-[2px_2px_0px_0px_black]">
                        <KalviumLogo size={24} className="text-white" />
                      </div>
                      <span className="font-display font-black text-3xl uppercase tracking-tighter text-black">
                        CampusHub
                      </span>
                    </div>
                    <p className="text-black font-black uppercase tracking-widest max-w-md text-[10px] leading-relaxed">
                      Student-focused event discovery. AI-powered extraction. Human verification.
                    </p>
                  </div>
                  <div className="flex flex-col items-center md:items-end gap-2 text-[10px] font-black tracking-widest uppercase">
                    <p className="inline-flex items-center gap-2 text-[10px] font-black text-black bg-[#FFF8E1] px-4 py-2 border-2 border-black shadow-[4px_4px_0px_0px_black]">
                      <span>Constructed by</span>
                      <span className="text-[#E5391F] font-black text-[12px]">
                        Squad 83
                      </span>
                    </p>
                    <p className="text-[10px] text-black font-black mt-2">
                      © 2026 CampusHub.
                    </p>
                  </div>
                </div>
              </footer>
            </SmoothScroll>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
