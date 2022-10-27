import lume from "lume/mod.ts";
import { Page, Site } from "lume/core.ts";
import minify_html from "lume/plugins/minify_html.ts";
import sass from "lume/plugins/sass.ts";
import imagick from "lume/plugins/imagick.ts";
import pug from "lume/plugins/pug.ts";

// remark plugins
import remark from "lume/plugins/remark.ts";
import emoji from "npm:remark-emoji";
import smartyPants from "npm:@ngsctt/remark-smartypants";

// postcss plugins
import postcss from "lume/plugins/postcss.ts";
import "npm:postcss";
import cssnano from "npm:cssnano";
import "npm:cssnano-preset-advanced";

import { datetime } from "https://deno.land/x/ptera@v1.0.2/mod.ts";

const site = lume({
	src: "./src",
});

site
	.use(
		remark({
			remarkPlugins: [emoji, smartyPants],
		})
	)
	.use(minify_html())
	.use(sass())
	.use(imagick())
	.use(pug())
	.use(
		postcss({
			keepDefaultPlugins: true,
			plugins: [
				cssnano({
					preset: ["advanced"],
				}),
			],
		})
	)
	.use((site: Site) =>
		site.preprocess([".md"], (page: Page) => {
			page.data.dateString = datetime(page.data.date).toDateTimeFormat({
				dateStyle: "long",
			});
		})
	)
	.copy("assets", ".");

export default site;
