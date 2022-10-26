export const layout = "post-list.pug";

const RANGE = 2;

export default function* ({ search, paginate }) {
  const pages = search.pages("post");
  const options = {
    url: (n) => `/blog/${n}/`,
    size: 5,
  };
  const pagination = paginate(pages, options);

  for (const page of pagination) {
    const current = page.pagination.page;
    const last = page.pagination.totalPages;
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

    page.title = `Blog (${current}/${last})`;
    page.indices = indices;
    yield page;
  }
}