import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        kalvium: {
          ink: "#111111",
          "dark-ink": "#FFFFFF",
          muted: "#777777",
          "dark-muted": "#AAAAAA",
          "surface-alt": "#F7F7F5",
          "dark-surface": "#111111",
          "dark-surface-alt": "#222222",
          border: "#D6D6D2",
          "dark-border": "#444444",
          coral: {
            DEFAULT: "#EF321F",
            hover: "#D13019",
            tint: "#FDEAE7"
          },
          success: {
            DEFAULT: "#10B981",
            border: "#A7F3D0",
            tint: "#ECFDF5"
          },
          warning: {
            DEFAULT: "#F59E0B",
            border: "#FDE68A",
            tint: "#FFFBEB"
          }
        },
        bauhaus: {
          bg: "#F0F0F0",
          surface: "#FFFFFF",
          "surface-alt": "#E0E0E0",
          text: "#121212",
          muted: "#E0E0E0",
          border: "#121212",
          red: {
            DEFAULT: "#D02020",
          },
          blue: {
            DEFAULT: "#1040C0",
          },
          yellow: {
            DEFAULT: "#F0C020",
          },
          dark: {
            bg: "#121212",
            surface: "#1A1A1A",
            "surface-alt": "#222222",
            border: "#333333",
            text: "#F0F0F0",
            muted: "#888888",
          },
        },
      },
      fontFamily: {
        sans: ["var(--font-caacupe)", "Caacupé One", "cursive"],
        display: ["var(--font-caacupe)", "Caacupé One", "cursive"],
        caacupe: ["var(--font-caacupe)", "Caacupé One", "cursive"],
        mono: ["var(--font-mono)", "JetBrains Mono", "SFMono-Regular", "Menlo", "monospace"],
      },
      fontSize: {
        "display-2xl": ["clamp(3rem, 7vw, 6rem)", { lineHeight: "0.9", letterSpacing: "-0.04em" }],
        "display-xl": ["clamp(2.5rem, 5.5vw, 4.5rem)", { lineHeight: "0.9", letterSpacing: "-0.035em" }],
        "display-lg": ["clamp(2rem, 4vw, 3rem)", { lineHeight: "1.0", letterSpacing: "-0.03em" }],
        "display-md": ["clamp(1.5rem, 3vw, 2.25rem)", { lineHeight: "1.1", letterSpacing: "-0.02em" }],
      },
      boxShadow: {
        "bauhaus-sm": "4px 4px 0px 0px #121212",
        "bauhaus-md": "6px 6px 0px 0px #121212",
        "bauhaus-lg": "8px 8px 0px 0px #121212",
      },
      transitionTimingFunction: {
        mechanical: "cubic-bezier(0.0, 0, 0.2, 1)",
      },
      animation: {
        "fade-in": "fadeIn 0.2s cubic-bezier(0.0, 0, 0.2, 1) forwards",
        "slide-up": "slideUp 0.2s cubic-bezier(0.0, 0, 0.2, 1) forwards",
        "scale-in": "scaleIn 0.2s cubic-bezier(0.0, 0, 0.2, 1) forwards",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        scaleIn: {
          "0%": { opacity: "0", transform: "scale(0.97)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
