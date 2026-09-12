import type { Metadata } from "next";
import { Caveat, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider } from "@/context/ThemeContext";
import DemoSwitcherBar from "@/components/DemoSwitcherBar";
import Navbar from "@/components/Navbar";
import SmoothScroll from "@/components/SmoothScroll";
import ScrollProgress from "@/components/ScrollProgress";

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
            <ScrollProgress />
            <SmoothScroll>
              <div className="sticky top-0 z-40 w-full">
                <DemoSwitcherBar />
                <Navbar />
              </div>
              <main className="flex-1">{children}</main>

              <footer className="relative border-t border-kalvium-border dark:border-kalvium-dark-border bg-kalvium-surface dark:bg-kalvium-dark-surface py-12 px-6 sm:px-10 text-xs text-kalvium-muted dark:text-kalvium-dark-muted transition-colors duration-200">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
                  <div>
                    <div className="flex items-center justify-center md:justify-start gap-1.5 mb-1.5">
                      <span className="font-display font-bold text-base text-kalvium-text dark:text-kalvium-dark-text tracking-tight">
                        CampusHub
                      </span>
                      <span className="w-1.5 h-1.5 rounded-full bg-kalvium-coral" />
                    </div>
                    <p className="text-kalvium-muted dark:text-kalvium-dark-muted max-w-md text-xs leading-relaxed">
                      "AI makes event creation faster. Human verification makes event discovery trustworthy."
                    </p>
                  </div>
                  <div className="flex items-center gap-3 sm:gap-4 text-xs text-kalvium-muted dark:text-kalvium-dark-muted font-medium">
                    <span>Poster Truth</span>
                    <span className="text-kalvium-border dark:text-kalvium-dark-border">→</span>
                    <span>AI Extraction</span>
                    <span className="text-kalvium-border dark:text-kalvium-dark-border">→</span>
                    <span className="text-kalvium-success font-semibold inline-flex items-center gap-1">
                      ✓ Campus Verified
                    </span>
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
