import {
  defineConfig,
  presetIcons,
  presetTypography,
  presetUno,
  presetWebFonts,
  transformerDirectives,
  transformerVariantGroup,
} from "npm:unocss";
import logos from "npm:@iconify-json/logos/icons.json" with { type: "json" };
import simpleIcons from "npm:@iconify-json/simple-icons/icons.json" with { type: "json" };
import devicon from "npm:@iconify-json/devicon/icons.json" with { type: "json" };
import vscodeIcons from "npm:@iconify-json/vscode-icons/icons.json" with { type: "json" };
import twemoji from "npm:@iconify-json/twemoji/icons.json" with { type: "json" };
import mdi from "npm:@iconify-json/mdi/icons.json" with { type: "json" };

const themeColors = [
  "brand",
  "brand-dark",
  "brand-darker",
  "brand-darkest",
  "fg",
  "bg",
  "main-bg",
  "main-fg",
  "main-fg-sub",
  "main-border",
];

const colors: Record<string, string> = {};
for (const themeColor of themeColors) {
  colors[themeColor] = `rgba(var(--${themeColor}) / <alpha-value>)`;
}


export default {
  options: {
    theme: {
      colors,
    },
    rules: [
      [
        "grid-cols-main-screen",
        { "grid-template-columns": "20rem auto 20rem" },
      ],
      ["h-main-screen", { height: "calc(100vh - 4 * 3.5rem)" }],
      ["h-navbar", { height: "3.5rem" }],
    ],
    presets: [
      presetUno(),
      presetIcons({
        collections: {
          logos: () => logos,
          "simple-icons": () => simpleIcons,
          devicon: () => devicon,
          "vscode-icons": () => vscodeIcons,
          twemoji: () => twemoji,
          mdi: () => mdi,
        },
      }),
      presetTypography(),
      presetWebFonts({
        provider: "google",
        fonts: {
          sans: "Rethink Sans:400,700",
          mono: ["Iosevka Nerd Font", "Iosevka", "JetBrains Mono"],
        },
      }),
    ],
  },
  cssFile: "uno.css",
  transformers: [transformerDirectives(), transformerVariantGroup()],
  reset: "tailwind",
};
