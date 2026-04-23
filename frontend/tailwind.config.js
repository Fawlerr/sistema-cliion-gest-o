/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        surface: "#f6f3ee",
        panel: "#fffdfa",
        panelSoft: "#edf5f4",
        accent: "#2f6f85",
        accentSoft: "#e8b072",
        accentDeep: "#214f62",
        sand: "#f3e2ca",
        coral: "#eea88c"
      },
      fontFamily: {
        sans: ["Manrope", "ui-sans-serif", "system-ui", "sans-serif"]
      },
      boxShadow: {
        glow: "0 22px 60px rgba(47, 111, 133, 0.12)"
      },
      animation: {
        floatIn: "floatIn 600ms ease-out forwards",
        pulseGlow: "pulseGlow 2.6s ease-in-out infinite"
      },
      keyframes: {
        floatIn: {
          "0%": { opacity: "0", transform: "translateY(14px)" },
          "100%": { opacity: "1", transform: "translateY(0)" }
        },
        pulseGlow: {
          "0%, 100%": { boxShadow: "0 0 0 rgba(232, 176, 114, 0.12)" },
          "50%": { boxShadow: "0 0 24px rgba(232, 176, 114, 0.22)" }
        }
      }
    }
  },
  plugins: []
};
