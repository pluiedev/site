import { defaults, Options } from "lume/plugins/vento.ts";
import engine from "https://deno.land/x/vento@v0.7.1/mod.ts";
import { Environment } from "https://deno.land/x/vento@v0.7.1/src/environment.ts";
import { FileLoader } from "https://deno.land/x/vento@v0.7.1/src/loader.ts";

import { Data, Engine, FS, Helper, Site } from "lume/core.ts";
import loader from "lume/core/loaders/text.ts";
import { merge, normalizePath } from "lume/core/utils.ts";

export type Tag = (
  env: Environment,
  code: string,
  output: string,
  tokens: Token[]
) => string | undefined;

class LumeLoader extends FileLoader {
  fs: FS;
  constructor(includes: string, fs: FS) {
    super(includes);
    this.fs = fs;
  }
  async load(file: string) {
    const entry = this.fs.entries.get(normalizePath(file));
    if (!entry) {
      throw new Error(`File not found: ${file}`);
    }
    const data = await entry.getContent(loader);
    return { source: data.content as string, data };
  }
}

/** Template engine to render Vento files */
export class VentoEngine implements Engine {
  engine: Environment;
  constructor(engine: Environment) {
    this.engine = engine;
  }
  deleteCache(file: string) {
    this.engine.cache.delete(file);
  }
  render(content: string, data: Data = {}, filename?: string) {
    return this.engine
      .runString(content, data, filename)
      .then((m) => m.content);
  }
  renderSync(content: string, data: Data = {}, filename?: string): string {
    return this.engine.runStringSync(content, data, filename).content;
  }

  addHelper(name: string, fn: Helper) {
    this.engine.filters[name] = fn;
  }
}

export default function (userOptions?: Partial<Options>) {
  const options = merge(defaults, userOptions);
  const extensions = Array.isArray(options.extensions)
    ? { pages: options.extensions, components: options.extensions }
    : options.extensions;

  return (site: Site) => {
    const env = engine({
      includes: new LumeLoader(normalizePath(site.options.includes), site.fs),
      dataVarname: options.options.dataVarname,
    });

    const patch = {
      async load(file: string, from?: string): Promise<Template> {
        const path = from ? this.options.loader.resolve(from, file) : file;

        if (!this.cache.has(path)) {
          const { source, data } = await this.options.loader.load(path);
          const template = this.compile(source, path, data);

          // BUGFIX: use `path`, not `file`
          this.cache.set(path, template);
        }

        // BUGFIX: use `path`, not `file`
        return this.cache.get(path)!;
      },
    };

    const vento = Object.assign(env, patch);
    vento.tags.push(filterTag);

    const ventoEngine = new VentoEngine(vento);

    site.loadPages(extensions.pages, loader, ventoEngine);
    site.loadComponents(extensions.components, loader, ventoEngine);
  };
}

const filterTag = (env, code, output, tokens) => {
  const match = code.match(/^filter (.*)$/);
  if (!match) return;
  const [_, filter] = match;
  tokens.unshift(["filter", filter]);

  const varname = "__content";
  const filters = env.compileFilters(tokens, varname);
  const content = env.compileTokens(tokens, varname, ["/filter"]);

  const tok = tokens.shift();
  if (tok && (tok[0] !== "tag" || tok[1] !== "/filter")) {
    throw new Error(`Missing closing tag for filter '${filter.name}': ${code}`);
  }

  const res = [
    `{let ${varname} = "";`,
    ...content,
    `${output} += ${filters};}`,
  ].join("\n");
  return res;
};
