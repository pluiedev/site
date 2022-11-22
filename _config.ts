import lume from "lume/mod.ts";
import { Page, Site } from "lume/core.ts";
import minify_html from "lume/plugins/minify_html.ts";
import sass from "lume/plugins/sass.ts";
import imagick from "lume/plugins/imagick.ts";
import pug from "lume/plugins/pug.ts";
import inline from "lume/plugins/inline.ts";

// remark plugins
import remark from "lume/plugins/remark.ts";
import emoji from "npm:remark-emoji";
import a11yEmoji from "npm:@fec/remark-a11y-emoji";
import smartyPants from "npm:@ngsctt/remark-smartypants";

// postcss plugins
import postcss from "lume/plugins/postcss.ts";
import purgecss from "npm:@fullhuman/postcss-purgecss";

import { datetime } from "https://deno.land/x/ptera@v1.0.2/mod.ts";

const site = lume({
	src: "./src",
});

site
	.use(
		remark({
			remarkPlugins: [emoji, a11yEmoji, smartyPants],
		})
	)
	.use(minify_html())
	.use(
		sass({
			includes: ["_styles"],
		})
	)
	.use(imagick())
	.use(pug())
	.use(inline())
	.use(
		postcss({
			keepDefaultPlugins: true,
			plugins: [
				purgecss({
					content: ["./**/*.html", "./**/*.pug"],
					safelist: {
						greedy: [/button/],
					},
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
	.copy("assets", ".")
	.copy("scripts", "scripts");

export default site;
