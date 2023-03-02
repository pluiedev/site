import * as flags from "https://deno.land/std@0.178.0/flags/mod.ts";

const BULMA_VERSION = "0.9.4";
const BULMA_DIR = "./_bulma";

type Repo = {
  dir: string;
  src: string;
  branch: string;
  sparseDir?: string;
};

const REPOS: Repo[] = [
  {
    dir: BULMA_DIR,
    src: github("jgthms/bulma"),
    branch: BULMA_VERSION,
    sparseDir: "sass",
  },
  {
    dir: `${BULMA_DIR}/bulma-tooltip`,
    src: github("CreativeBulma/bulma-tooltip"),
    branch: "master",
    sparseDir: "src/sass",
  },
];

async function trySparseClone(
  repo: Repo,
  verbose: boolean,
  errorOnFailure = false,
) {
  console.log(`> Cloning repository ${repo.src} to ${repo.dir}`);

  const clone = Deno.run({
    cmd: [
      "git",
      "clone",
      "--depth",
      "1",
      "--filter=blob:none",
      "--sparse",
      "--branch",
      repo.branch,
      repo.src,
      repo.dir,
    ],
    stdout: verbose ? "inherit" : "null",
    stderr: "piped",
  });

  if ((await clone.status()).success) {
    if (repo.sparseDir) {
      console.log(`> Configuring sparse checkout for ${repo.src}`);
      await Deno.run({
        cwd: repo.dir,
        cmd: ["git", "sparse-checkout", "set", repo.sparseDir],
        stdout: verbose ? "inherit" : "null",
        stderr: verbose ? "inherit" : "null",
      }).status();
    }
  } else {
    const error = new TextDecoder().decode(await clone.stderrOutput());
    const msg =
      `Failed to clone repository ${repo.src} to ${repo.dir}:\n${error}`;
    if (errorOnFailure) {
      throw new Error(msg);
    } else if (verbose) {
      console.error("> " + msg);
    }
  }
}
function github(repo: string): string {
  return `https://github.com/${repo}.git`;
}

async function main() {
  const args: {
    _: ["force" | "clean"];
    verbose: boolean;
    v: boolean;
  } = flags.parse(Deno.args);

  const verbose = args.verbose || args.v || false;

  let action = (repo: Repo) => trySparseClone(repo, verbose, false);
  switch (args._[0]) {
    case "force":
      action = (repo: Repo) => trySparseClone(repo, verbose, true);
      break;
    case "clean":
      action = async (repo: Repo) => {
        try {
          await Deno.remove(repo.dir, { recursive: true });
          await Deno.remove(repo.dir);
        } catch (_) { /* ignored */ }
      };
      break;
  }

  await Promise.all(REPOS.map(action));
}

await main();
