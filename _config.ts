import lume from "lume/mod.ts";
import minify_html from "lume/plugins/minify_html.ts";
import sass from "lume/plugins/sass.ts";
import imagick from "lume/plugins/imagick.ts";
import pug from "lume/plugins/pug.ts";
import inline from "lume/plugins/inline.ts";
import date from "lume/plugins/date.ts";
import vento from "./vento-improved.ts";

// remark plugins
import remark from "lume/plugins/remark.ts";
import emoji from "npm:remark-emoji";
import a11yEmoji from "npm:@fec/remark-a11y-emoji";
import smartyPants from "npm:@ngsctt/remark-smartypants";

// postcss plugins
import postcss from "lume/plugins/postcss.ts";
import tailwindcss from "lume/plugins/tailwindcss.ts";
import tailwindConfig from "./tailwind.config.ts";
import stripIndent from "npm:strip-indent";

const site = lume({ src: "./src" });
site
  .use(remark({ remarkPlugins: [emoji, a11yEmoji, smartyPants] }))
  .use(minify_html())
  .use(sass({ includes: "_styles" }))
  .use(
    tailwindcss({
      options: tailwindConfig,
    })
  )
  .use(imagick())
  .use(pug())
  .use(inline())
  .use(date())
  .use(postcss())
  .use(vento())
  .filter("strip_indent", stripIndent)
  .copy("assets", ".")
  .copy("scripts", "scripts");

export default site;
