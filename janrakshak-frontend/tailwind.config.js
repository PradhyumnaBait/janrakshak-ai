/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        background: {
          DEFAULT: "#EEF0F6",
          soft1: "#E6E8F2",
          soft2: "#D8DBEA",
          soft3: "#C9CDE3"
        },
        accent: {
          primary: "#6C63FF",
          primarySoft: "#5B5BD6",
          primaryAlt: "#7C72FF",
          primaryDeep: "#4F46E5"
        },
        deep: {
          DEFAULT: "#2E2E5E",
          darker: "#1F1F3A"
        },
        card: {
          DEFAULT: "#FFFFFF",
          soft: "#F7F8FC",
          softer: "#F2F4FA"
        },
        text: {
          primary: "#111827",
          secondary: "#4B5563",
          muted: "#6B7280",
          light: "#9CA3AF"
        },
        status: {
          success: "#10B981",
          danger: "#EF4444",
          warning: "#F59E0B"
        }
      },
      boxShadow: {
        soft: "0 10px 30px rgba(0,0,0,0.05)"
      },
      borderRadius: {
        card: "16px",
        hero: "24px",
        pill: "999px"
      },
      fontFamily: {
        sans: ["Helvetica", "system-ui", "sans-serif"],
        sora: ["Sora", "system-ui", "sans-serif"],
        jakarta: ["Plus Jakarta Sans", "system-ui", "sans-serif"]
      }
    }
  },
  plugins: []
};

