module.exports = {
  content: ["./index.html", "./pages/**/*.tsx", "./pkg/**/*.tsx"],
  theme: {
    extend: {
      colors: {
        primary: "var(--color-primary)",
        secondary: "var(--color-secondary)",
      },
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
};
