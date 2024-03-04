import lume from "lume/mod.ts";
import minify_html from "lume/plugins/minify_html.ts";
import sass from "lume/plugins/sass.ts";
// import transformImages from "lume/plugins/transform_images.ts";
import pug from "lume/plugins/pug.ts";
import inline from "lume/plugins/inline.ts";
import date from "lume/plugins/date.ts";
import vento from "lume/plugins/vento.ts";
import esbuild from "lume/plugins/esbuild.ts";
import unocss from "lume/plugins/unocss.ts";
// import unocss from "./ersatz/unocss.ts";
import unoConfig from "./uno.config.ts";

// remark plugins
import remark from "lume/plugins/remark.ts";
import emoji from "npm:remark-emoji";
import a11yEmoji from "npm:@fec/remark-a11y-emoji";
import smartyPants from "npm:@ngsctt/remark-smartypants";

// postcss plugins
import postcss from "lume/plugins/postcss.ts";
import stripIndent from "npm:strip-indent";

const site = lume({ src: "./src" });
site
  .copy("assets", ".")
  .use(remark({ remarkPlugins: [emoji, a11yEmoji, smartyPants] }))
  .use(minify_html())
  .use(sass({ includes: "_styles" }))
  // .use(transformImages())
  .use(pug())
  .use(date())
  .use(postcss())
  .use(esbuild())
  .use(inline())
  .use(vento())
  .use(unocss(unoConfig))
  .filter("strip_indent", stripIndent);

export default site;
