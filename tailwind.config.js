const colors = require("tailwindcss/colors");
const theme = require("tailwindcss/defaultTheme");

const px12 = {
  "0/12": "0%",
  "1/12": (1 / 12) * 100 + "%",
  "2/12": (2 / 12) * 100 + "%",
  "3/12": "25%",
  "4/12": "30%",
  "5/12": (5 / 12) * 100 + "%",
  "6/12": "50%",
  "7/12": (7 / 12) * 100 + "%",
  "8/12": "60%",
  "9/12": "75%",
  "10/12": (10 / 12) * 100 + "%",
  "11/12": (11 / 12) * 100 + "%",
  "12/12": "100%",
};

module.exports = {
  mode: "jit",
  purge: ["./index.html", "./pages/**/*.tsx", "./pkg/**/*.tsx"],
  darkMode: "media", // or 'media' or 'class'
  theme: {
    colors: {
      primary: "var(--color-primary)",
      "primary-light": "var(--color-primary-light)",
      "primary-dark": "var(--color-primary-dark)",
      secondary: "var(--color-secondary)",
      "secondary-light": "var(--color-secondary-light)",
      "secondary-dark": "var(--color-secondary-dark)",
      transparent: "transparent",
      current: "currentColor",
      ...colors,
    },
    boxShadow: {
      sm: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
      DEFAULT: "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
      md: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
      lg: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
      xl: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
      "2xl": "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
      "3xl": "0 35px 60px -15px rgba(0, 0, 0, 0.3)",
      inner: "inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)",
      none: "none",
      "sm-weak": "0 1px 2px 0 rgba(0, 0, 0, 0.03)",
      "md-weak": "0 4px 6px -1px rgba(0, 0, 0, 0.06), 0 2px 4px -1px rgba(0, 0, 0, 0.03)",
      "lg-weak": "0 10px 15px -3px rgba(0, 0, 0, 0.06), 0 4px 6px -2px rgba(0, 0, 0, 0.03)",
      "xl-weak": "0 20px 25px -5px rgba(0, 0, 0, 0.05), 0 10px 10px -5px rgba(0, 0, 0, 0.02)",
      "2xl-weak": "0 25px 50px -12px rgba(0, 0, 0, 0.07)",
      "3xl-weak": "0 35px 60px -15px rgba(0, 0, 0, 0.07)",
      "inner-weak": "inset 0 2px 4px 0 rgba(0, 0, 0, 0.07)",
      "2xl-weak": "0 25px 50px -12px rgba(0, 0, 0, 0.07)",
    },
    screens: {
      sm: "640px",
      md: "768px",
      lg: "1024px",
      xl: "1280px",
      "2xl": "1536px",
      all: "1px",
    },
    maxWidth: { ...px12, ...theme.maxWidth },
    maxHeight: { ...px12, ...theme.maxHeight },
    extend: {},
  },
  variants: {
    extend: {},
  },
  plugins: [],
};
