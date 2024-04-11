export const layout = "layouts/blog.vto";

const RANGE = 2;

export default function* ({
  search,
  paginate,
}: {
  search: Lume.Search;
  paginate: Lume.Paginator;
}) {
  const langs = {
    en: "Blog",
    zh: "文章",
  };

  for (const lang of Object.keys(langs)) {
    const pfx = lang === "en" ? "" : `/${lang}`;
    const pages = search.pages(`post lang=${lang}`, "date=desc") as Lume.Page[];

    const options = {
      url: (n: number) => (n === 1 ? `/${lang}/blog/` : `/${lang}/blog/${n}/`),
      size: 5,
    };
    for (const page of paginate(pages, options)) {
      const { page: currentPage, totalPages } = page.pagination;

      const indices = [];
      if (currentPage - 1 > RANGE) {
        indices.push(1, -1);
      }
      for (let i = currentPage - RANGE; i < currentPage + RANGE + 1; i++) {
        if (i > 0 && i <= totalPages) {
          indices.push(i);
        }
      }
      if (totalPages - currentPage > RANGE) {
        indices.push(-1, totalPages);
      }

      yield {
        lang,
        id: `blog-${currentPage}`,
        title: langs[lang],
        currentPage,
        totalPages,
        indices,
        ...page,
      };
    }
    // const options = {
    //   url: (n: number) => {
    //     const a = n === 1 ? `${pfx}/blog/` : `${pfx}/blog/${n}/`;
    //     console.log(a, n);
    //     return a;
    //   },
    //   size: 5,
    // };
    //
    // for (const page of paginate(pages, options)) {
    //   const { page: current, totalPages: last } = page.pagination;
    //
    //
    //   yield {
    //     title: "Blog",
    //     currentPage: current,
    //     totalPages: last,
    //     category: "blog",
    //     id: `blog-${current}`,
    //     indices,
    //     ...page,
    //   };
    // }
  }
}
