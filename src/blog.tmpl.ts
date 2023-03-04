import { Page } from "lume/core.ts";
import { Search } from "lume/plugins/search.ts";
import { Paginator } from "lume/plugins/paginate.ts";

export const layout = "layouts/post-list.pug";

const RANGE = 2;

export default function* ({ search, paginate }: { search: Search, paginate: Paginator }) {
	const pages = search.pages("post", "date=desc") as Page[];
	const options = {
		url: (n: number) => n == 1 ? `/blog/` : `/blog/${n}/`,
		size: 5,
	};
	
	for (const page of paginate(pages, options)) {
		const { page: current, totalPages: last } = page.pagination;

		const indices = [];
		if (current - 1 > RANGE) {
			indices.push(1, -1);
		}
		for (let i = current - RANGE; i < current + RANGE + 1; i++) {
			if (i > 0 && i <= last) {
				indices.push(i);
			}
		}
		if (last - current > RANGE) {
			indices.push(-1, last);
		}

		yield {
			title: `Blog (${current}/${last})`,
			category: "blog",
			indices,
			...page
		};
	}
}
