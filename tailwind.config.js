module.exports = {
  mode: "jit",
  purge: ["./index.html", "./pages/**/*.tsx", "./pkg/**/*.tsx"],
  darkMode: "media", // or 'media' or 'class'
  theme: {
    screens: {
      sm: "640px",
      md: "768px",
      lg: "1024px",
      xl: "1280px",
      "2xl": "1536px",
      all: "1px",
    },
    extend: {},
  },
  variants: {
    extend: {},
  },
  plugins: [],
};
