# CLAUDE.md

Guidance for Claude Code when working in this repository.

## What this repo is

Source content for the **Telegent mPaaS** documentation site, published to ReadMe.com. This is **not** a runtime application — it is a docs repo. The published artifact is the ReadMe project; this repo is the source of truth. Content is synced via the **ReadMe GitHub App (Git Sync)**: any commit pushed to the `v1.0` branch updates the live site automatically. ReadMe can also commit back to `v1.0` when someone edits in the web UI, so always `git pull` before starting local work.

## Repository layout

```
docs/                          # Guides (ReadMe "Guides" category)
  Getting Started/             # Landing page, quick start, knowledge bank
  Onboarding/                  # 8-page partner onboarding flow
  Best Practices/              # MVNO Guide (overview + reference + appendix)
  AI Tools/                    # (currently hidden — Mintlify-era pages)
  Changelog/                   # Release notes
  _order.yaml                  # Top-level category order
docs/<category>/_order.yaml    # Per-category page order; entries are slugs (filename minus .md)

reference/                     # API Reference category
  ReadMeConfig/                # ReadMe-only landing pages (auth, getting-started, my-requests)
  mPaaS Core APIs/             # One subfolder per OpenAPI tag, one .md stub per operation
    <tag>/_order.yaml          # Endpoint order within a tag
  openapi.json                 # OpenAPI 3.0.3 spec (143 operations, ~52k lines)

scripts/
  mintlify-to-readme.mjs       # One-shot Mintlify -> ReadMe converter (only re-run for migrations)

_converted/                    # Output of the converter; gitignored. Promote into docs/ or reference/.
```

## File conventions

### Endpoint stub files (`reference/mPaaS Core APIs/<tag>/*.md`)

Five-line stubs whose frontmatter binds the page to an OpenAPI operation:

```yaml
---
api:
  file: openapi.json
  operationId: get_v1-0-account
hidden: false
---
```

- **Filename pattern:** `<method>_<path-with-dashes>.md`. Example: `/v1.0/numbers/provision` POST -> `post_v1-0-numbers-provision.md`.
- **`operationId` must match the filename** (without `.md`). The OpenAPI spec itself does not currently set `operationId` on operations — ReadMe auto-derives them from method+path. Keep the slug pattern stable.
- **Never leave a stub orphaned.** Every stub must have a corresponding operation in `openapi.json` and an entry in the tag's `_order.yaml`.

### Guide pages (`docs/<category>/*.md`)

Standard ReadMe Markdown frontmatter:

```yaml
---
title: Page Title
slug: page-slug              # only when slug must differ from filename (e.g. avoid 'index')
excerpt: One-line summary    # used for sidebar tooltip and meta description
hidden: false
---
```

- **`hidden: true`** keeps the page out of the published sidebar (use for WIP).
- **Per-category overview pages** (`<category>/index.md`) use a non-`index` slug to avoid collisions — e.g. `onboarding-overview`, `changelog-overview`, `best-practices-overview`.

### `_order.yaml`

Plain list of slugs (filenames without `.md`) controlling sidebar order. The top-level `docs/_order.yaml` lists category folder names.

## OpenAPI conventions (`reference/openapi.json`)

- **Server URL:** `https://api.telegent.com` (paths already include `/v1.0/...` — never re-add the prefix at the server level or you double up).
- **Security:** every operation uses `BearerAuth` (HTTP Bearer / JWT). The scheme is defined under `components.securitySchemes.BearerAuth` — capitalisation matters and must match every reference.
- **Examples (persistent display in ReadMe):**
  - **Request examples** belong at `requestBody.content.application/json.example`. ReadMe uses these to populate code snippets and pre-fill the Try It form on page load.
  - **Response examples** belong at `responses.<status>.content.application/json.examples.<name>.value`.
  - **Do not use `x-codeSamples`** — they override ReadMe's live, Try-It-synced snippets. The repo had 125 of these and they were all migrated/removed.
- **Default code language order** is set via `x-readme.samples-languages` at the spec root: `http, curl, node, python, csharp, php`. `http` is first because it shows the JSON body verbatim.
- **Known schema gaps** (do not silently "fix" without asking):
  - All 143 `200` response schemas are bare `type: object` — typed response field tables are not yet authored.
  - 18 v1.1.0 request schemas (Webhooks, Thresholds, Features, Reactivate, account/webhooks) are bare `type: object`. `components.schemas` already contains ~34 named schemas (e.g. `Delete_Webhook_Request`) that may be the intended `$ref` targets.
  - 8 operations have no `200` response example: services/update, services/delete, account/webhooks, numbers/reactivate, and the four `/v1.0/webhook` CRUD ops.
  - 2 GET endpoints (`GET /v1.0/account/webhooks`, `GET /v1.0/webhook`) declare a `requestBody`. This is non-standard and should likely be query params or POSTs — verify against actual API behaviour before changing.

## How to make common changes

### Add a new endpoint
1. Add the operation to `reference/openapi.json` (path, method, tags, summary, description, parameters, requestBody schema + example, 200 response example, error responses).
2. Create `reference/mPaaS Core APIs/<tag>/<method>_<path-dashed>.md` using the five-line stub template.
3. Add the slug to `reference/mPaaS Core APIs/<tag>/_order.yaml` in the desired position.
4. Validate JSON: `python3 -c "import json; json.load(open('reference/openapi.json'))"`.

### Add a new guide page
1. Create `docs/<Category>/<slug>.md` with title/excerpt/hidden frontmatter.
2. Add the slug to `docs/<Category>/_order.yaml`.
3. If introducing a new category folder, also add it to `docs/_order.yaml`.

### Rename or move pages
ReadMe Git Sync keys pages by slug. **Changing a slug breaks deep links.** If you must rename, set the old slug as a redirect inside ReadMe's dashboard before the next sync.

## What NOT to do

- **Do not commit `_converted/`** — it's the converter's staging area; gitignored.
- **Do not introduce a CI workflow that calls `rdme`** — Git Sync is the sync mechanism. A second writer would race it.
- **Do not add new `x-codeSamples`** — use proper `requestBody` / response examples instead.
- **Do not edit `node_modules`-equivalent generated files** — there are none in this repo, but if a build step ever lands, treat its output as artifact-only.
- **Do not bulk-rewrite descriptions or examples without showing a sample diff first** — these often contain hand-authored copy.

## Useful one-liners

```bash
# Validate OpenAPI JSON
python3 -c "import json; json.load(open('reference/openapi.json')); print('JSON valid')"

# Find operations missing a 200 response example
jq -r '.paths | to_entries[] | .key as $p | .value | to_entries[] | select(.value.responses."200".content."application/json" | (.examples // .example) == null) | "\(.key | ascii_upcase) \($p)"' reference/openapi.json

# Find request schemas that are still bare type:object
jq -r '.paths | to_entries[] | .key as $p | .value | to_entries[] | select(.value.requestBody.content."application/json".schema != null) | select(.value.requestBody.content."application/json".schema.properties == null) | "\(.key | ascii_upcase) \($p)"' reference/openapi.json

# List every endpoint stub that has no matching operation in openapi.json (or vice versa)
diff \
  <(find 'reference/mPaaS Core APIs' -name '*.md' ! -name 'index.md' ! -name '_*' -exec basename {} .md \; | sort) \
  <(jq -r '.paths | to_entries[] | .key as $p | .value | to_entries[] | "\(.key)_\($p | gsub("[/\\.]"; "-") | ltrimstr("-"))"' reference/openapi.json | sort)
```

## Git workflow

- **Default branch:** `v1.0` (matches the ReadMe version slug). New ReadMe versions get their own branches.
- **Always `git pull --rebase` before starting work** — ReadMe may have committed web-editor changes.
- Commit messages: imperative mood, scoped to a single concern (e.g. `Move request payloads from x-codeSamples into requestBody examples`).
