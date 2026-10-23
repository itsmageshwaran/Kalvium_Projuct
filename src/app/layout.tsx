import type { Metadata } from "next";
import { Caveat, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider } from "@/context/ThemeContext";

import Navbar from "@/components/Navbar";
import { ToastProvider } from "@/components/Toast";
import SmoothScroll from "@/components/SmoothScroll";
import Footer from "@/components/Footer";

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
  manifest: "/manifest.json",
};

export const viewport = {
  themeColor: "#F35D5D",
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
          <ToastProvider>
          <ThemeProvider>
            <SmoothScroll>
              <div className="sticky top-0 z-40 w-full">

                <Navbar />
              </div>
              <main className="flex-1">{children}</main>

              <Footer />
            </SmoothScroll>
          </ThemeProvider>
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
