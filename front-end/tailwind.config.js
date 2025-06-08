const defaultTheme = require("tailwindcss/defaultTheme");

module.exports = {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    colors: {
      black: "#111111",
      white: "#FAFAFA",

      gray: defaultTheme.colors.gray,
      red: defaultTheme.colors.red,
      blue: defaultTheme.colors.blue,
      green: defaultTheme.colors.green,
    },
    extend: {
      fontFamily: {
        heading: ["Playfair Display", "serif"],
        body: ["Cormorant Garamond", "serif"],
      },
      fontSize: {
        "7xl": ["5rem", { lineHeight: "1.1" }],
      },
    },
  },
  plugins: [],
};
