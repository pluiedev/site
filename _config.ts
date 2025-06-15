import lume from "lume/mod.ts";
import inline from "lume/plugins/inline.ts";
import date from "lume/plugins/date.ts";
import vento from "lume/plugins/vento.ts";
import metas from "lume/plugins/metas.ts";
import extractDate from "lume/plugins/extract_date.ts";
import multilanguage from "lume/plugins/multilanguage.ts";
import esbuild from "lume/plugins/esbuild.ts";

// Due to how Deno works we must manually import icons to add them in the dependency pool.
import tailwindcss from "lume/plugins/tailwindcss.ts";

// Remark plugins
import remark from "lume/plugins/remark.ts";
import emoji from "npm:remark-emoji";
import a11yEmoji from "npm:@fec/remark-a11y-emoji";
import smartyPants from "npm:@ngsctt/remark-smartypants";

import stripIndent from "npm:strip-indent";

const site = lume({ src: "./src" })
  .add("assets", ".")
  .add([".css", ".ts"])
  .use(remark({ remarkPlugins: [emoji, a11yEmoji, smartyPants] }))
  .use(esbuild())
  .use(date())
  .use(tailwindcss({
    includes: "_styles",
  }))
  .use(inline())
  .use(vento())
  .use(extractDate())
  .use(metas())
  .use(multilanguage({
    languages: ["en", "zh"],
    defaultLanguage: "en",
  }))
  .filter("strip_indent", stripIndent);

export default site;
