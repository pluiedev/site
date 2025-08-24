import lume from "lume/mod.ts";
import date from "lume/plugins/date.ts";
import esbuild from "lume/plugins/esbuild.ts";
import extractDate from "lume/plugins/extract_date.ts";
import feed from "lume/plugins/feed.ts";
import inline from "lume/plugins/inline.ts";
import metas from "lume/plugins/metas.ts";
import multilanguage from "lume/plugins/multilanguage.ts";
import sitemap from "lume/plugins/sitemap.ts";
import tailwindcss from "lume/plugins/tailwindcss.ts";
import vento from "lume/plugins/vento.ts";
import googleFonts from "lume/plugins/google_fonts.ts";
import prism from "lume/plugins/prism.ts";

// Remark plugins
import remark from "lume/plugins/remark.ts";
import a11yEmoji from "npm:@fec/remark-a11y-emoji";
import smartyPants from "npm:@ngsctt/remark-smartypants";
import emoji from "npm:remark-emoji";

// Prism langugages
import "npm:prismjs@1.30.0/components/prism-zig.js";
import "npm:prismjs@1.30.0/components/prism-shell-session.js";
import "npm:prismjs@1.30.0/components/prism-rust.js";

import stripIndent from "npm:strip-indent";

const site = lume({ src: "./src" })
  .add("assets", ".")
  .add([".css", ".ts"])
  .use(remark({ remarkPlugins: [emoji, a11yEmoji, smartyPants] }))
  .use(esbuild())
  .use(date())
  .use(prism())
  .use(googleFonts({
    fonts:
      "https://fonts.googleapis.com/css2?family=Bitter:ital,wght@0,100..900;1,100..900&family=Manrope:wght@200..800&display=swap",
  }))
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
  .use(feed({
    output: ["/posts.rss", "/posts.json"],
    query: "post",
    info: {
      title: "=site.title",
      description: "=site.description",
    },
    items: {
      title: "=title",
      description: "=excerpt",
    },
  }))
  .use(sitemap({
    query: "post|main",
  }))
  .filter("strip_indent", stripIndent);

export default site;
