/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#090C0B",
        elev: "#0E1312",
        surface: "#121917",
        surfaceHi: "#18211F",
        border: "#1D2926",
        borderHi: "#294039",
        ink: "#EAF2EE",
        mute: "#8CA097",
        faint: "#586B63",
        accent: "#35D9A2",
        accentDim: "#12352A",
        purple: "#A78BFA",
        amber: "#F5B544",
        danger: "#F2726B",
        info: "#5AB0E0",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "Segoe UI", "sans-serif"],
        mono: ["ui-monospace", "SF Mono", "Cascadia Code", "Menlo", "monospace"],
      },
      borderColor: {
        DEFAULT: "#1D2926",
      },
    },
  },
  plugins: [],
};
