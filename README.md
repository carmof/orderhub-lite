# 📦 Working in this repository

| &nbsp; | Section                                             | Read it when you…                                 |
| ------ | --------------------------------------------------- | ------------------------------------------------- |
| 📦     | [**Package management**](#package-management)       | work with dependencies                            |
| 📥     | &emsp;└ [Adding dependencies](#adding)              | add a library to a package                        |
| 🔗     | &emsp;└ [Adding a workspace dependency](#workspace) | make one package of this repo use another         |
| 🛠️     | &emsp;└ [Root tooling](#root-tooling)               | add or remove repo-wide tools (lint, test, hooks) |
| 🗑️     | &emsp;└ [Removing dependencies](#removing)          | remove something and clean up after it            |
| 🪝     | [**Git hooks and commit checks**](#hooks)           | wonder why a commit was rejected                  |
| 🔄     | &emsp;└ [How they relate](#how-they-relate)         | want the commit flow at a glance                  |

---

<a id="package-management"></a>

## 📦 Package management

<a id="adding"></a>

### 📥 Adding dependencies

This repository uses pnpm's catalog (`catalogMode: manual`): versions shared between
packages live in the `catalog` section of `pnpm-workspace.yaml`, and package manifests refer
to them with `catalog:`. Which one you get depends on the `--save-catalog` flag:

| Command                                  | Result in the package manifest | `pnpm-workspace.yaml` |
| ---------------------------------------- | ------------------------------ | --------------------- |
| `pnpm add {package_name} --save-catalog` | `"{package_name}": "catalog:"` | Adds a catalog entry  |
| `pnpm add {package_name}`                | `"{package_name}": "^1.2.3"`   | Unchanged             |

Use `--save-catalog` for dependencies whose version should be shared by the whole repository:

```sh
pnpm add {package_name} --save-catalog
```

For a development-only dependency, include `-D`:

```sh
pnpm add {package_name} -D --save-catalog
```

> 💡 **Tip**
> Without the flag, the version is written directly into that package's manifest, which is
> fine for a dependency only that package uses. If the dependency already has a catalog entry,
> pnpm reuses it and writes `catalog:`, so the flag is only needed for the first package.

Run the command from the package that should use the dependency. For a specific
workspace package, you can target it from the repository root with `--filter`:

```sh
pnpm --filter {workspace_package} add {package_name} --save-catalog
```

> ⚠️ **Important**
> These commands are meant for workspace packages (`packages/*` and `apps/*`), not the
> repository root. Run them from inside the package directory, or from the root with
> `--filter`. Running a plain `pnpm add` at the root is refused by pnpm. Tools for the root
> have their own commands, see [Root tooling](#root-tooling).

<a id="workspace"></a>

### 🔗 Adding a workspace dependency

To depend on another package of this repository (for example `@orderhub/tsconfig`), use
the `--workspace` flag. Run it from inside the package that needs the dependency:

```sh
pnpm add -D --workspace {package_name}
```

`--workspace` makes pnpm resolve the package only from the workspace. If no workspace
package has that name, the command fails with `ERR_PNPM_WORKSPACE_PACKAGE_NOT_FOUND`
instead of installing a package with the same name from the registry.

The manifest gets `"{package_name}": "workspace:*"` directly, and nothing is added to the
catalog, so there is no catalog entry to clean up when you remove it.

<a id="root-tooling"></a>

### 🛠️ Root tooling

The root `package.json` is private and is not a deployable package. It holds only
the tooling shared by the whole repository: linting, formatting, type checking,
testing, commit hooks and the TypeScript toolchain (for example `eslint`,
`prettier`, `typescript`, `vitest`, `husky`, `commitlint`, `lint-staged` and `tsx`).
Anything a package needs at build time or runtime belongs in that package, not in
the root.

To add a root tool, use `-Dw`, the shorthand for `-D` (`--save-dev`) plus `-w`
(`--workspace-root`). Root tools are kept in the catalog, so include `--save-catalog`:

```sh
pnpm add {package_name} -Dw --save-catalog
```

To remove one:

```sh
pnpm remove {package_name} -w
```

The catalog entry is not removed automatically, see [Removing dependencies](#removing).

<a id="removing"></a>

### 🗑️ Removing dependencies

As with adding, run these from inside the package (or use `--filter`), not the
repository root. To remove a root tool, see [Root tooling](#root-tooling).

Remove a dependency from the package that uses it with:

```sh
pnpm remove {package_name}
```

Use `--filter {workspace_package}` to target a workspace package from the root:

```sh
pnpm --filter {workspace_package} remove {package_name}
```

This removes the dependency from that package's manifest, but does not delete its shared
catalog entry. If the dependency was a `catalog:` one and no other package uses it, remove
its entry from the `catalog` section of `pnpm-workspace.yaml`. Dependencies with a direct
version or `workspace:*` have no catalog entry, so there is nothing to clean up.

---

<a id="hooks"></a>

## 🪝 Git hooks and commit checks

Three root tools work together to check code and commit messages before a commit is created.

- **[Husky](https://typicode.github.io/husky/)** manages Git hooks. It runs the scripts in
  `.husky/` at specific points in the Git workflow, and is installed for every contributor by
  the `prepare` script when running `pnpm install`.
- **[lint-staged](https://github.com/lint-staged/lint-staged)** runs commands only on the files
  staged for the commit, so checks stay fast. Its file patterns and commands are configured
  in the `lint-staged` section of `package.json` (ESLint and Prettier for code, Prettier for
  JSON, Markdown and YAML).
- **[commitlint](https://commitlint.js.org/)** checks that the commit message follows the
  Conventional Commits format, using the rules in `commitlint.config.js`.

<a id="how-they-relate"></a>

### 🔄 How they relate

Husky is the trigger; the other two are the checks it runs. If either check fails, the
commit is aborted.

![Commit flow: git commit triggers the Husky pre-commit hook, which runs lint-staged, then the commit-msg hook, which runs commitlint. A failure in either check aborts the commit.](docs/git-hooks.svg)
