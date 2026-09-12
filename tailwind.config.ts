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
          bg: "#FAF6F0",
          surface: "#FFFFFF",
          "surface-alt": "#F5F0E6",
          text: "#111318",
          muted: "#5B6572",
          border: "#E7E2D8",
          "border-subtle": "#F0ECE3",
          coral: {
            DEFAULT: "#E8492D",
            hover: "#C93A22",
            dark: "#C93A22",
            tint: "#FDEDE7",
            light: "#FFF5F2",
          },
          success: {
            DEFAULT: "#2F855A",
            tint: "#EBF6EE",
            border: "#C4E3D0",
          },
          warning: {
            DEFAULT: "#B7791F",
            tint: "#FEF7E8",
            border: "#F3DCAB",
          },
          dark: {
            bg: "#17140F",
            surface: "#211E18",
            "surface-alt": "#2A261F",
            border: "#2E2922",
            text: "#FAF6F0",
            muted: "#A8A196",
            "coral-tint": "#381B15",
            "success-tint": "#182C21",
            "warning-tint": "#322512",
          },
        },
      },
      fontFamily: {
        sans: ["var(--font-body)", "Plus Jakarta Sans", "Inter", "system-ui", "sans-serif"],
        body: ["var(--font-body)", "Plus Jakarta Sans", "Inter", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "Caveat", "cursive", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "JetBrains Mono", "SFMono-Regular", "Menlo", "monospace"],
      },
      fontSize: {
        "display-2xl": ["clamp(3rem, 7vw, 5.5rem)", { lineHeight: "0.92", letterSpacing: "-0.04em" }],
        "display-xl": ["clamp(2.5rem, 5.5vw, 4.25rem)", { lineHeight: "0.96", letterSpacing: "-0.035em" }],
        "display-lg": ["clamp(2rem, 4vw, 3rem)", { lineHeight: "1.04", letterSpacing: "-0.03em" }],
        "display-md": ["clamp(1.5rem, 3vw, 2.25rem)", { lineHeight: "1.12", letterSpacing: "-0.02em" }],
      },
      boxShadow: {
        xs: "0 1px 2px 0 rgba(0, 0, 0, 0.04)",
        "soft-xs": "0 1px 2px 0 rgba(0, 0, 0, 0.04)",
        "soft-sm": "0 2px 8px -1px rgba(17, 19, 24, 0.05), 0 1px 3px 0 rgba(17, 19, 24, 0.03)",
        "soft-md": "0 6px 16px -2px rgba(17, 19, 24, 0.06), 0 2px 6px -1px rgba(17, 19, 24, 0.03)",
        kalvium: "0 4px 20px -2px rgba(17, 19, 24, 0.05), 0 2px 6px -1px rgba(17, 19, 24, 0.03)",
        "kalvium-sm": "0 2px 8px -1px rgba(17, 19, 24, 0.04), 0 1px 3px 0 rgba(17, 19, 24, 0.02)",
        "kalvium-md": "0 12px 32px -4px rgba(17, 19, 24, 0.08), 0 4px 12px -2px rgba(17, 19, 24, 0.04)",
        "kalvium-lg": "0 24px 48px -12px rgba(17, 19, 24, 0.12), 0 8px 24px -4px rgba(17, 19, 24, 0.06)",
        "kalvium-card": "0 1px 3px rgba(17, 19, 24, 0.04), 0 8px 24px -4px rgba(17, 19, 24, 0.05)",
      },
      transitionTimingFunction: {
        editorial: "cubic-bezier(0.16, 1, 0.3, 1)",
        smooth: "cubic-bezier(0.4, 0, 0.2, 1)",
      },
      animation: {
        "fade-in": "fadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "slide-up": "slideUp 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "scale-in": "scaleIn 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards",
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
