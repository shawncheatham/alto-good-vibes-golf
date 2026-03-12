import type { Config } from "tailwindcss";

export default {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        gvg: {
          // Course-inspired palette
          "grass-dark": "#1a4d2e",
          grass: "#2d7a4f",
          "grass-light": "#4ea869",
          fairway: "#8bc34a",
          sand: "#d4a574",
          "sand-light": "#e8c9a1",
          sky: "#87ceeb",
          "sky-light": "#b8e6f7",
          dusk: "#4a5568",
          "dusk-light": "#718096",
          // Accent - Momentum moments
          accent: "#ff6b35",
          "accent-hover": "#ff5722",
          "accent-light": "#ff8a65",
          // Semantic colors
          success: "#4ea869",
          warning: "#ffa726",
          error: "#ef5350",
          positive: "#4ea869",
          negative: "#ef5350",
          // Neutrals
          white: "#ffffff",
          "gray-50": "#f9fafb",
          "gray-100": "#f3f4f6",
          "gray-200": "#e5e7eb",
          "gray-300": "#d1d5db",
          "gray-400": "#9ca3af",
          "gray-500": "#6b7280",
          "gray-600": "#4b5563",
          "gray-700": "#374151",
          "gray-800": "#1f2937",
          "gray-900": "#111827",
        },
      },
      fontFamily: {
        display: ["Outfit", "system-ui", "-apple-system", "sans-serif"],
        body: ["-apple-system", "BlinkMacSystemFont", "Segoe UI", "system-ui", "sans-serif"],
        mono: ["SF Mono", "Menlo", "monospace"],
      },
      fontSize: {
        xs: ["0.75rem", { lineHeight: "1rem" }], // 12px
        sm: ["0.875rem", { lineHeight: "1.25rem" }], // 14px
        base: ["1rem", { lineHeight: "1.5rem" }], // 16px
        lg: ["1.125rem", { lineHeight: "1.75rem" }], // 18px
        xl: ["1.25rem", { lineHeight: "1.75rem" }], // 20px
        "2xl": ["1.5rem", { lineHeight: "2rem" }], // 24px
        "3xl": ["1.875rem", { lineHeight: "2.25rem" }], // 30px
        "4xl": ["2.25rem", { lineHeight: "2.5rem" }], // 36px
        "5xl": ["3rem", { lineHeight: "1" }], // 48px (desktop hero)
      },
      spacing: {
        // 4px base scale
        1: "0.25rem", // 4px
        2: "0.5rem", // 8px
        3: "0.75rem", // 12px
        4: "1rem", // 16px
        5: "1.25rem", // 20px
        6: "1.5rem", // 24px
        8: "2rem", // 32px
        10: "2.5rem", // 40px
        12: "3rem", // 48px
        16: "4rem", // 64px
      },
      borderRadius: {
        sm: "0.25rem", // 4px
        DEFAULT: "0.5rem", // 8px
        md: "0.5rem", // 8px
        lg: "0.75rem", // 12px
        xl: "1rem", // 16px
        full: "9999px",
      },
      boxShadow: {
        sm: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
        DEFAULT:
          "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
        md: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
        lg: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
      },
      transitionDuration: {
        fast: "150ms",
        DEFAULT: "200ms",
        slow: "300ms",
      },
      transitionTimingFunction: {
        DEFAULT: "cubic-bezier(0.4, 0, 0.2, 1)",
      },
      minHeight: {
        touch: "48px", // Touch target minimum
      },
      minWidth: {
        touch: "48px", // Touch target minimum
      },
    },
  },
  plugins: [],
} satisfies Config;
