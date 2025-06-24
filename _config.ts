import lume from "lume/mod.ts";
import inline from "lume/plugins/inline.ts";
import date from "lume/plugins/date.ts";
import vento from "lume/plugins/vento.ts";
import metas from "lume/plugins/metas.ts";
import extractDate from "lume/plugins/extract_date.ts";
import multilanguage from "lume/plugins/multilanguage.ts";
import esbuild from "lume/plugins/esbuild.ts";
import tailwindcss from "lume/plugins/tailwindcss.ts";
import feed from "lume/plugins/feed.ts";
import sitemap from "lume/plugins/sitemap.ts";

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
    minify: true,
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
