import typography from "npm:@tailwindcss/typography";

const themeColors = [
  "brand",
  "brand-dark",
  "brand-darker",
  "brand-darkest",
  "fg",
  "fg-dimmed",
  "navbar-bg",
  "navbar-fg",
  "navbar-border",
  "bg",
  "bg-deemphasized",
];

const colors = {
  youtube: "#d02525",
  bilibili: "#00a1d6",
  github: "#fafafa",
  "pronouns-page": "#c71585",
  discord: "#5865f2",
  mastodon: "#6364ff",
};
for (const themeColor of themeColors) {
  colors[themeColor] = `rgba(var(--${themeColor}) / <alpha-value>)`;
}

export default {
  theme: {
    extend: {
      colors,
      spacing: {
        navbar: "4rem",
      },
      gridTemplateColumns: {
        "main-screen": "20rem auto 20rem",
      },
      height: {
        "main-screen": "calc(100vh - 4 * 4rem)",
      },
    },
    fontFamily: {
      sans: ["Rubik", "sans-serif"],
    },
  },
  plugins: [typography],
};
