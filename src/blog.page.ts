export const layout = "layouts/blog.vto";

const RANGE = 2;

// TODO: figure out all the types here

export default async function* ({ search, paginate, lang }: Lume.Helpers) {
  const pages = search.pages(`post lang=${lang}`, "date=desc");

  yield* paginate(pages, {
    url: (n: number) => (n === 1 ? `/blog/` : `/blog/${n}/`),
    size: 5,
    each(page: any, n: number) {
      const { totalPages } = page.pagination;

      page.id = `blog-${n}`;
      page.currentPage = n;
      page.totalPages = totalPages;

      page.indices = [];
      if (n - 1 > RANGE) {
        page.indices.push(1, -1);
      }
      for (let i = n - RANGE; i < n + RANGE + 1; i++) {
        if (i > 0 && i <= totalPages) {
          page.indices.push(i);
        }
      }
      if (totalPages - n > RANGE) {
        page.indices.push(-1, totalPages);
      }
    },
  });
}
