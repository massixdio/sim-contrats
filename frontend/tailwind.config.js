/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // Bleu Sim Assurance (couleur principale de marque)
        primary: {
          50: "#eaf3fc",
          100: "#cfe3f8",
          200: "#9fc8f1",
          300: "#6fade9",
          400: "#3f91e2",
          500: "#1f76cb",
          600: "#0a5fae",
          700: "#004b9c",
          800: "#003b7a",
          900: "#002c59",
        },
        // Bleu ciel Sim Assurance (accent secondaire)
        secondary: {
          50: "#f0f9fe",
          100: "#dcf0fc",
          200: "#b9e1f9",
          300: "#8dcef4",
          400: "#6dbeec",
          500: "#51aee2",
          600: "#2e8fc7",
          700: "#226fa0",
          800: "#1b577d",
          900: "#163f5a",
        },
      },
    },
  },
  plugins: [],
};
