import lume from "lume/mod.ts";
import { Page, Site } from "lume/core.ts";
import minify_html from "lume/plugins/minify_html.ts";
import sass from "lume/plugins/sass.ts";
import imagick from "lume/plugins/imagick.ts";
import pug from "lume/plugins/pug.ts";

import { datetime } from "https://deno.land/x/ptera@v1.0.2/mod.ts";

const site = lume({
  src: "./src",
});

site
  .use(minify_html())
  .use(sass())
  .use(imagick())
  .use(pug())
  .use((site: Site) =>
    site.preprocess([".md"], (page: Page) => {
      page.data.dateString = datetime(page.data.date).toDateTimeFormat({
        dateStyle: "long",
      });
    })
  )
  .copy("assets", ".");

export default site;
