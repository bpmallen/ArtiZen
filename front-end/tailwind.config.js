/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        heading: ["Playfair Display", "serif"],
        body: ["Cormorant Garamond", "serif"],
      },
      fontSize: {
        // optional extra‐large display size
        "7xl": ["5rem", { lineHeight: "1.1" }],
      },
    },
  },
  plugins: [],
};
