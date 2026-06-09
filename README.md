# Develop_ReadMe

Source content for the **Telegent mPaaS** documentation site on [ReadMe.com](https://readme.com). This repo is the source of truth; ReadMe is the published artifact.

## Layout

```
docs/                          # Guides (ReadMe "Guides" category)
  Getting Started/
reference/                     # API Reference category
  ReadMeConfig/                # ReadMe-only landing pages (auth, getting-started, my-requests)
  mPaaS Core APIs/             # One subfolder per OpenAPI tag, one .md stub per operation
  openapi.json                 # OpenAPI 3.0.3 spec (143 operations)
  _order.yaml                  # Sidebar ordering for the API Reference category
scripts/
  mintlify-to-readme.mjs       # One-shot Mintlify → ReadMe converter (see below)
```

Each `_order.yaml` controls the order of its sibling pages/folders in the ReadMe sidebar. Each endpoint `.md` is a thin stub whose frontmatter points at an OpenAPI operation:

```yaml
---
api:
  file: openapi.json
  operationId: get_v1-0-account
hidden: false
---
```

Stub filenames follow `<method>_<path-with-dashes>.md` and the `operationId` is the same slug.

## Syncing to ReadMe (Git Sync)

This repo is connected to the ReadMe project via **ReadMe Git Sync** (the ReadMe GitHub App). Sync is bi-directional and automatic:

- **Push to the `v1.0` branch** → the docs site updates automatically. No CI, CLI, or API keys required.
- **Edits made in the ReadMe web editor** → ReadMe commits them back to this repo on `v1.0`.

Because ReadMe can commit to this repo, **always `git pull` before starting local work** to avoid conflicts.

The branch name (`v1.0`) corresponds to the ReadMe version slug. New ReadMe versions get their own branches.

## Mintlify → ReadMe converter

`scripts/mintlify-to-readme.mjs` is a one-shot migration utility used when porting content from a Mintlify project. Output lands in `_converted/` for human review before being promoted into `docs/` or `reference/`. The folder is gitignored.

```bash
node scripts/mintlify-to-readme.mjs \
  --src /path/to/mintlify-project \
  --out ./_converted \
  --dry          # optional: don't write files
```

It rewrites `Callout`, `Accordion`, `Card`, `Tab`, `Step`, `Expandable`, strips layout wrappers (`CodeGroup`, `Frame`, `Tabs`, `CardGroup`, ...), and flags unhandled JSX (`ResponseField`, `ParamField`, `Latex`, ...) with `<!-- TODO(readme-port): ... -->` comments. Search converted files for `TODO(readme-port)` before promoting them.

## Conventions

- **Folder names with spaces** (e.g. `mPaaS Core APIs/`) match ReadMe category titles. Keep them.
- **`hidden: true`** in frontmatter keeps a page out of the published sidebar. Use it for WIP pages.
- **`_order.yaml`** entries must reference the slug (filename without `.md`), not the title.
- **Never edit OpenAPI operations without updating the matching `_order.yaml`** in the relevant tag folder.

## Known follow-ups

- OpenAPI operations currently have no explicit `operationId` field; ReadMe resolves stubs via the auto-generated `method_path` slug, which is fragile.
- See the in-repo audit by running:
  ```bash
  jq -r '[.paths[][].operationId] | unique' reference/openapi.json
  ```
