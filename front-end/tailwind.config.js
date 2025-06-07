// tailwind.config.js
/** @type {import("tailwindcss").Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: { offwhite: "#F9F3E7", vintage: "#F8EBD7" },
      fontFamily: {
        heading: ['"Playfair Display"', "serif"],
        body: ["Roboto", "sans-serif"],
      },
    },
  },
  plugins: [],
};
