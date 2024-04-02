export const layout = "layouts/blog.vto";

const RANGE = 2;

export default function* ({
  search,
  paginate,
}: {
  search: Lume.Search;
  paginate: Lume.Paginator;
}) {
  const pages = search.pages("post", "date=desc") as Lume.Page[];
  const options = {
    url: (n: number) => (n == 1 ? `/blog/` : `/blog/${n}/`),
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
      title: "Blog",
      currentPage: current,
      totalPages: last,
      category: "blog",
      indices,
      ...page,
    };
  }
}
