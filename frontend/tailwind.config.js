/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",

  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],

  theme: {
    extend: {

      colors: {
        glassLight: "rgba(255,255,255,0.6)",
        glassDark: "rgba(15,15,15,0.6)",

        aurora1: "#f8fafc",
        aurora2: "#eef2ff",
        aurora3: "#f1f5f9",

        primarySoft: "#6366f1",
        dangerSoft: "#ef4444",
      },

      borderRadius: {
        glass: "20px",
        soft: "16px",
        xl2: "24px",
      },

      backdropBlur: {
        glass: "20px",
        soft: "12px",
      },

      boxShadow: {
        soft: "0 8px 30px rgba(0,0,0,0.06)",
        glass: "0 8px 32px rgba(31,38,135,0.12)",
        neumorph: "6px 6px 12px rgba(0,0,0,0.05), -6px -6px 12px rgba(255,255,255,0.8)",
      },

      backgroundImage: {
        aurora:
          "linear-gradient(120deg, #f8fafc 0%, #eef2ff 50%, #f1f5f9 100%)",
        auroraDark:
          "linear-gradient(120deg, #0f172a 0%, #020617 50%, #020617 100%)",
      },

      transitionTimingFunction: {
        soft: "cubic-bezier(0.4, 0, 0.2, 1)",
      },

    },
  },

  plugins: [],
};
