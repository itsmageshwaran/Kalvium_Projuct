import type { Metadata } from "next";
import { Caveat, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider } from "@/context/ThemeContext";

import Navbar from "@/components/Navbar";
import SmoothScroll from "@/components/SmoothScroll";
import CampusHubLogo from "@/components/CampusHubLogo";
import Image from "next/image";
const caveatDisplay = Caveat({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const jakartaBody = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-body",
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
    <html lang="en" className={`light ${caveatDisplay.variable} ${jakartaBody.variable}`} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('campushub_theme')||'light';document.documentElement.classList.remove('dark','light');document.documentElement.classList.add(t);}catch(e){}})()`,
          }}
        />
      </head>
      <body className="font-body antialiased bg-kalvium-bg dark:bg-kalvium-dark-bg text-kalvium-text dark:text-kalvium-dark-text flex flex-col min-h-screen selection:bg-kalvium-coral/20 selection:text-kalvium-coral transition-colors duration-200">
        <AuthProvider>
          <ThemeProvider>
            <SmoothScroll>
              <div className="sticky top-0 z-40 w-full">

                <Navbar />
              </div>
              <main className="flex-1">{children}</main>

              <footer className="relative border-t border-kalvium-border dark:border-kalvium-dark-border bg-kalvium-surface dark:bg-kalvium-dark-surface py-12 px-6 sm:px-10 text-xs text-kalvium-muted dark:text-kalvium-dark-muted transition-colors duration-200">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
                  <div>
                    <div className="mb-3 flex justify-center md:justify-start">
                      <Image
                        src="/brand/campus-hub-full-dark.png?v=2"
                        alt="CampusHub Logo"
                        width={200}
                        height={60}
                        className="w-48 h-auto object-contain dark:hidden"
                      />
                      <Image
                        src="/brand/campus-hub-full-light.png?v=2"
                        alt="CampusHub Logo"
                        width={200}
                        height={60}
                        className="w-48 h-auto object-contain hidden dark:block"
                      />
                    </div>
                    <p className="text-kalvium-muted dark:text-kalvium-dark-muted max-w-md text-xs leading-relaxed">
                      "AI makes event creation faster. Human verification makes event discovery trustworthy."
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center gap-6">
                    <div className="flex items-center gap-3 sm:gap-4 text-xs text-kalvium-muted dark:text-kalvium-dark-muted font-medium">
                      <span>Poster Truth</span>
                      <span className="text-kalvium-border dark:text-kalvium-dark-border">→</span>
                      <span>AI Extraction</span>
                      <span className="text-kalvium-border dark:text-kalvium-dark-border">→</span>
                      <span className="text-kalvium-success font-semibold inline-flex items-center gap-1">
                        ✓ Campus Verified
                      </span>
                    </div>

                    {/* Official Built for Kalvium Brand Lockup */}
                    <div className="pl-0 sm:pl-6 sm:border-l border-kalvium-border dark:border-kalvium-dark-border text-center sm:text-left">
                      <div className="text-xs font-bold tracking-tight text-kalvium-text dark:text-kalvium-dark-text">
                        <span>Built for </span>
                        <span className="text-kalvium-coral font-bold">Kalvium.</span>
                      </div>
                      <div className="w-8 h-0.5 bg-kalvium-coral my-1 mx-auto sm:mx-0 rounded-full" />
                      <p className="text-[9px] uppercase tracking-[0.16em] text-kalvium-muted dark:text-kalvium-dark-muted font-bold">
                        A Brighter Campus Together
                      </p>
                    </div>
                  </div>
                </div>

                {/* Bottom Bar Credit */}
                <div className="max-w-7xl mx-auto mt-8 pt-6 border-t border-kalvium-border/60 dark:border-kalvium-dark-border/60 flex flex-col items-center justify-center gap-2 text-center">
                  <p className="inline-flex items-center gap-2 text-sm sm:text-base font-medium text-kalvium-text dark:text-kalvium-dark-text">
                    <span>Built with</span>
                    <span className="text-kalvium-coral text-base sm:text-lg animate-pulse">♥</span>
                    <span>by</span>
                    <span className="font-display font-bold text-xl sm:text-2xl text-kalvium-coral">
                      Squad 83
                    </span>
                  </p>
                  <p className="text-xs text-kalvium-muted/70 dark:text-kalvium-dark-muted/70">
                    © 2026 CampusHub. All rights reserved.
                  </p>
                </div>
              </footer>
            </SmoothScroll>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
