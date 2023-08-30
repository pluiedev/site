import typography from "npm:@tailwindcss/typography";

export default {
  theme: {
    extend: {
      colors: {
        brand: "#d23773",
        "brand-dark": "#ba2c63",
        "brand-darker": "#851e46",
        "brand-darkest": "#57122d",

        youtube: "#d02525",
        twitter: "#0077d6",
        github: "#fafafa",
        "pronouns-page": "#c71585",
        blurple: "#5865f2",
      },
      backgroundSize: {
        wordmark: "75%",
      },
      backgroundImage: {
        wordmark: "url('/icons/wordmark.svg')",
      },
      height: {
        navbar: "4rem",
      },
      minHeight: {
        "main-screen": "calc(100vh - 2 * 4rem)",
      },
    },
    fontFamily: {
      sans: ["Rubik", "sans-serif"],
    },
  },
  plugins: [typography],
};
