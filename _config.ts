import lume from "lume/mod.ts";
import minify_html from "lume/plugins/minify_html.ts";
import sass from "lume/plugins/sass.ts";
import imagick from "lume/plugins/imagick.ts";
import pug from "lume/plugins/pug.ts";

const site = lume({
    src: "./src",
  });

site.use(minify_html());
site.use(sass());
site.use(imagick());
site.use(pug());
site.copy("public", ".");

export default site;
