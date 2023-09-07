import {
  defineConfig,
  presetIcons,
  presetTypography,
  presetUno,
  presetWebFonts,
  transformerDirectives,
  transformerVariantGroup,
} from "npm:unocss";
import presetRemToPx from "npm:@unocss/preset-rem-to-px";

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

const colors: Record<string, string> = {
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

export default defineConfig({
  theme: {
    colors,
  },
  rules: [
    ["grid-cols-main-screen", { "grid-template-columns": "20rem auto 20rem" }],
    ["h-main-screen", { height: "calc(100vh - 4 * 4rem)" }],
    ["h-navbar", { height: "4rem" }],
  ],
  presets: [
    presetUno(),
    presetIcons(),
    presetTypography(),

    //@ts-ignore TS is drunk
    presetRemToPx(),
    presetWebFonts({
      provider: "bunny",
      fonts: {
        sans: "Rubik:400,700",
        mono: ["Iosevka Nerd Font", "Iosevka", "JetBrains Mono"],
      },
    }),
  ],
  transformers: [transformerDirectives(), transformerVariantGroup()],
});
