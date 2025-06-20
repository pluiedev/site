import {
  presetIcons,
  presetTypography,
  presetWebFonts,
  transformerVariantGroup,
} from "npm:unocss";

import presetWind4 from "npm:@unocss/preset-wind4";

import logos from "npm:@iconify-json/logos/icons.json" with { type: "json" };
import simpleIcons from "npm:@iconify-json/simple-icons/icons.json" with {
  type: "json",
};
import devicon from "npm:@iconify-json/devicon/icons.json" with {
  type: "json",
};
import vscodeIcons from "npm:@iconify-json/vscode-icons/icons.json" with {
  type: "json",
};
import twemoji from "npm:@iconify-json/twemoji/icons.json" with {
  type: "json",
};
import mdi from "npm:@iconify-json/mdi/icons.json" with { type: "json" };

const themeColors = [
  "fg",
  "bg",
  "main-bg",
  "main-fg",
  "main-fg-sub",
  "main-border",
];

const colors = Object.fromEntries(
  themeColors.map((c) => [c, `rgb(var(--${c}) / <alpha-value>)`]),
);

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
      presetWind4({
        preflights: {
          reset: true,
        },
      }),
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
        themeKey: "font", // Required by Wind4
        provider: "google",
        fonts: {
          sans: ["DM Sans:400,700", "Noto Sans SC:400,700"],
          mono: ["Iosevka Nerd Font", "Iosevka", "JetBrains Mono"],
        },
      }),
    ],
  },
  cssFile: "uno.css",
  transformers: [transformerVariantGroup()],
};
