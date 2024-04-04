import lume from "lume/mod.ts";
import minify_html from "lume/plugins/minify_html.ts";
import sass from "lume/plugins/sass.ts";
import inline from "lume/plugins/inline.ts";
import date from "lume/plugins/date.ts";
import vento from "lume/plugins/vento.ts";
import unocss from "lume/plugins/unocss.ts";
import metas from "lume/plugins/metas.ts";
import unoConfig from "./uno.config.ts";

// remark plugins
import remark from "lume/plugins/remark.ts";
import emoji from "npm:remark-emoji";
import a11yEmoji from "npm:@fec/remark-a11y-emoji";
import smartyPants from "npm:@ngsctt/remark-smartypants";

import stripIndent from "npm:strip-indent";

const site = lume({ src: "./src" })
  .copy("assets", ".")
  .use(remark({ remarkPlugins: [emoji, a11yEmoji, smartyPants] }))
  .use(minify_html())
  .use(sass({ includes: "_styles", format: "expanded" }))
  .use(date())
  .use(inline())
  .use(vento())
  .use(metas())
  .use(unocss(unoConfig))
  .filter("strip_indent", stripIndent);

export default site;
