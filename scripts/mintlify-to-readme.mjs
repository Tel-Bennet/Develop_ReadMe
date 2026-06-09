#!/usr/bin/env node
/**
 * Mintlify → ReadMe converter.
 *
 * Reads .mdx files from a Mintlify project (with a docs.json) and emits
 * ReadMe-flavored .md files into an output directory, organized by category.
 *
 * Handles the high-frequency JSX components mechanically; leaves a TODO
 * comment for components that need human review (Cards, Tabs, Latex, etc.).
 *
 * Usage:
 *   node scripts/mintlify-to-readme.mjs \
 *     --src /Users/bennettelegent/WorkRepos/Dashboard/API_Dashboard \
 *     --out /Users/bennettelegent/WorkRepos/DEV_ReadMe_Dashboard/_converted
 *
 *   # dry run (no writes):
 *   node scripts/mintlify-to-readme.mjs --src ... --out ... --dry
 */

import fs from "node:fs";
import path from "node:path";

// -------------------- args --------------------
const args = Object.fromEntries(
  process.argv.slice(2).reduce((acc, cur, i, arr) => {
    if (cur.startsWith("--")) {
      const key = cur.slice(2);
      const next = arr[i + 1];
      acc.push([key, !next || next.startsWith("--") ? true : next]);
    }
    return acc;
  }, [])
);

const SRC = args.src && path.resolve(args.src);
const OUT = args.out && path.resolve(args.out);
const DRY = !!args.dry;

if (!SRC || !OUT) {
  console.error("Usage: --src <mintlify-root> --out <output-dir> [--dry]");
  process.exit(1);
}

const docsJsonPath = path.join(SRC, "docs.json");
if (!fs.existsSync(docsJsonPath)) {
  console.error(`docs.json not found at ${docsJsonPath}`);
  process.exit(1);
}

const docsJson = JSON.parse(fs.readFileSync(docsJsonPath, "utf8"));

// -------------------- nav model --------------------
/**
 * Build a map of `relativePagePath` → { category, group, order, tab }
 * by walking docs.json -> navigation -> tabs -> groups -> pages.
 *
 * Mintlify `pages` entries are file paths without extension, relative to
 * the project root (e.g. "onboarding/phase-1").
 */
function buildNavIndex(json) {
  const index = new Map();
  const tabs = json?.navigation?.tabs || [];
  for (const tab of tabs) {
    const tabName = tab.tab || "Untitled Tab";
    const groups = tab.groups || [];
    for (const group of groups) {
      const groupName = group.group || tabName;
      const pages = group.pages || [];
      pages.forEach((page, i) => {
        if (typeof page !== "string") return; // skip nested page groups for now
        index.set(page, {
          tab: tabName,
          category: tabName,
          group: groupName,
          order: i,
        });
      });
    }
  }
  return index;
}

const navIndex = buildNavIndex(docsJson);

// -------------------- frontmatter --------------------
function parseFrontmatter(src) {
  const m = src.match(/^---\n([\s\S]*?)\n---\n?/);
  if (!m) return { data: {}, body: src };
  const block = m[1];
  const data = {};
  // Naive YAML: key: value (string), value may be quoted
  for (const line of block.split(/\n/)) {
    const mm = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
    if (!mm) continue;
    let v = mm[2].trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
      v = v.slice(1, -1);
    }
    data[mm[1]] = v;
  }
  return { data, body: src.slice(m[0].length) };
}

function stringifyFrontmatter(data) {
  const lines = ["---"];
  for (const [k, v] of Object.entries(data)) {
    if (v === undefined || v === null || v === "") continue;
    const needsQuote = /[:#&*!?{}\[\],\"']/.test(String(v));
    lines.push(`${k}: ${needsQuote ? JSON.stringify(String(v)) : v}`);
  }
  lines.push("---", "");
  return lines.join("\n");
}

// -------------------- body transforms --------------------

/**
 * Replace simple wrapper components: opening + closing tags removed entirely.
 * These are wrappers Mintlify uses purely for layout/grouping that have no
 * ReadMe equivalent; their children render fine as plain Markdown.
 */
const STRIP_WRAPPERS = ["CodeGroup", "Frame", "AccordionGroup", "Steps", "Tabs", "CardGroup", "RequestExample", "ResponseExample"];

/**
 * Mintlify callout-style components → ReadMe blockquote callouts.
 * ReadMe convention: blockquote starting with an emoji marker.
 *   📘 Info / Note   👍 Tip   🚧 Warning   ❗️ Danger   ✅ Check
 */
const CALLOUTS = {
  Note: { emoji: "📘", label: "Note" },
  Info: { emoji: "📘", label: "Info" },
  Tip: { emoji: "👍", label: "Tip" },
  Warning: { emoji: "🚧", label: "Warning" },
  Check: { emoji: "✅", label: "Success" },
  Update: { emoji: "📘", label: "Update" },
};

function blockquote(text) {
  return text
    .split(/\n/)
    .map((l) => (l.length ? `> ${l}` : ">"))
    .join("\n");
}

function transformCallouts(src) {
  let out = src;
  for (const [tag, cfg] of Object.entries(CALLOUTS)) {
    const re = new RegExp(`<${tag}(?![A-Za-z])([^>]*)>([\\s\\S]*?)</${tag}>`, "g");
    out = out.replace(re, (_, attrs, inner) => {
      // optional title="..." on the tag
      const titleMatch = attrs && attrs.match(/title=["']([^"']+)["']/);
      const title = titleMatch ? titleMatch[1] : cfg.label;
      const body = inner.trim();
      return `\n${blockquote(`${cfg.emoji} **${title}**\n\n${body}`)}\n`;
    });
  }
  return out;
}

function transformAccordion(src) {
  // <Accordion title="X" ...>body</Accordion>  →  ### X\n\nbody
  return src.replace(/<Accordion(?![A-Za-z])([^>]*)>([\s\S]*?)<\/Accordion>/g, (_, attrs, inner) => {
    const t = attrs.match(/title=["']([^"']+)["']/);
    const title = t ? t[1] : "Details";
    return `\n### ${title}\n\n${inner.trim()}\n`;
  });
}

function transformExpandable(src) {
  // <Expandable title="X">body</Expandable>  →  <details><summary>X</summary>...</details>
  return src.replace(/<Expandable(?![A-Za-z])([^>]*)>([\s\S]*?)<\/Expandable>/g, (_, attrs, inner) => {
    const t = attrs.match(/title=["']([^"']+)["']/);
    const title = t ? t[1] : "Details";
    return `\n<details>\n<summary>${title}</summary>\n\n${inner.trim()}\n\n</details>\n`;
  });
}

function transformStep(src) {
  // <Step title="X">body</Step>  →  #### X\n\nbody
  // (After Steps wrapper is stripped, these become standalone subsections.)
  return src.replace(/<Step(?![A-Za-z])([^>]*)>([\s\S]*?)<\/Step>/g, (_, attrs, inner) => {
    const t = attrs.match(/title=["']([^"']+)["']/);
    const title = t ? t[1] : "Step";
    return `\n#### ${title}\n\n${inner.trim()}\n`;
  });
}

function transformCard(src) {
  // <Card title="X" href="Y" icon="Z" ...>body</Card>  →  - **[X](Y)** — body
  // Handles self-closing too.
  let out = src.replace(/<Card(?![A-Za-z])([^>]*)>([\s\S]*?)<\/Card>/g, (_, attrs, inner) => {
    const t = attrs.match(/title=["']([^"']+)["']/);
    const h = attrs.match(/href=["']([^"']+)["']/);
    const title = t ? t[1] : "Link";
    const href = h ? h[1] : "#";
    const body = inner.trim();
    return body ? `- **[${title}](${href})** — ${body}\n` : `- **[${title}](${href})**\n`;
  });
  // Self-closing <Card ... />
  out = out.replace(/<Card(?![A-Za-z])([^>]*)\/>/g, (_, attrs) => {
    const t = attrs.match(/title=["']([^"']+)["']/);
    const h = attrs.match(/href=["']([^"']+)["']/);
    const title = t ? t[1] : "Link";
    const href = h ? h[1] : "#";
    return `- **[${title}](${href})**\n`;
  });
  return out;
}

function transformTab(src) {
  // <Tab title="X">body</Tab>  →  **X**\n\nbody  (flattened; user reviews)
  return src.replace(/<Tab(?![A-Za-z])([^>]*)>([\s\S]*?)<\/Tab>/g, (_, attrs, inner) => {
    const t = attrs.match(/title=["']([^"']+)["']/);
    const title = t ? t[1] : "Tab";
    return `\n**${title}**\n\n${inner.trim()}\n`;
  });
}

function stripWrappers(src) {
  let out = src;
  for (const tag of STRIP_WRAPPERS) {
    // Opening tag (with optional attrs / self-close ignored — these are wrappers, not self-closing)
    out = out.replace(new RegExp(`<${tag}(?![A-Za-z])[^>]*>`, "g"), "");
    out = out.replace(new RegExp(`</${tag}>`, "g"), "");
  }
  return out;
}

function stripMintlifyImgAttrs(src) {
  // Mintlify <img className="block dark:hidden" .../> → keep src/alt only.
  return src.replace(/<img([^>]*)\/?>/g, (full, attrs) => {
    const s = attrs.match(/src=["']([^"']+)["']/);
    const a = attrs.match(/alt=["']([^"']*)["']/);
    if (!s) return full;
    return `<img src="${s[1]}"${a ? ` alt="${a[1]}"` : ""} />`;
  });
}

/** Wrap residual JSX-only components in HTML comments so they survive but flag review. */
const TODO_TAGS = ["ResponseField", "ParamField", "Latex", "Tooltip", "Snippet", "SnippetIntro", "MyComponent", "MySnippet"];

function flagTodoComponents(src) {
  let out = src;
  for (const tag of TODO_TAGS) {
    const reBlock = new RegExp(`<${tag}(?![A-Za-z])([^>]*)>([\\s\\S]*?)</${tag}>`, "g");
    out = out.replace(reBlock, (m) => `\n<!-- TODO(readme-port): convert ${tag} — move into OpenAPI or rewrite. Original:\n${m}\n-->\n`);
    const reSelf = new RegExp(`<${tag}(?![A-Za-z])([^>]*)/>`, "g");
    out = out.replace(reSelf, (m) => `\n<!-- TODO(readme-port): convert ${tag} self-closing. Original: ${m} -->\n`);
  }
  return out;
}

function convertBody(body) {
  let out = body;
  // Order matters: callouts before wrappers (some callouts could be inside wrappers).
  out = transformCallouts(out);
  out = transformAccordion(out);
  out = transformExpandable(out);
  out = transformStep(out);
  out = transformCard(out);
  out = transformTab(out);
  out = stripWrappers(out);
  out = stripMintlifyImgAttrs(out);
  out = flagTodoComponents(out);
  // Collapse 3+ blank lines.
  out = out.replace(/\n{3,}/g, "\n\n");
  return out.trim() + "\n";
}

// -------------------- frontmatter mapping --------------------
function buildReadmeFrontmatter(srcRelNoExt, mintData, nav) {
  const slug = srcRelNoExt.split("/").pop();
  const title = mintData.title || slug;
  const excerpt = mintData.description || mintData.excerpt || "";
  const fm = {
    title,
    slug,
    excerpt,
  };
  if (nav) {
    fm.category = nav.category;
    fm.order = nav.order;
    // ReadMe doesn't have a "group" concept distinct from category;
    // we surface the Mintlify group as metadata for the human reviewer.
    if (nav.group && nav.group !== nav.category) fm["x-mintlify-group"] = nav.group;
  } else {
    fm["x-mintlify-orphan"] = true; // not referenced in docs.json
  }
  if (mintData.icon) fm["x-mintlify-icon"] = mintData.icon;
  return fm;
}

// -------------------- filesystem walk --------------------
function walk(dir, acc = []) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    if (ent.name.startsWith(".")) continue;
    if (ent.name === "node_modules") continue;
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) walk(p, acc);
    else if (ent.isFile() && ent.name.endsWith(".mdx")) acc.push(p);
  }
  return acc;
}

// Skip Mintlify starter template files that aren't real content.
const SKIP_PATTERNS = [
  /\/essentials\//,
  /\/development\.mdx$/,
  /\/snippets\//,
  /\/scripts\/sample_endpoint\.mdx$/,
];

function shouldSkip(absPath) {
  return SKIP_PATTERNS.some((re) => re.test(absPath));
}

// -------------------- main --------------------
function slugify(s) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function main() {
  const files = walk(SRC);
  const report = {
    total: files.length,
    converted: 0,
    skipped: 0,
    orphans: [],
    todos: [], // files that ended up with TODO markers
  };

  for (const abs of files) {
    const rel = path.relative(SRC, abs);
    const relNoExt = rel.replace(/\.mdx$/, "");

    if (shouldSkip(abs)) {
      report.skipped++;
      continue;
    }

    const raw = fs.readFileSync(abs, "utf8");
    const { data, body } = parseFrontmatter(raw);
    const nav = navIndex.get(relNoExt);
    if (!nav) report.orphans.push(relNoExt);

    const fm = buildReadmeFrontmatter(relNoExt, data, nav);
    const converted = convertBody(body);
    const out = stringifyFrontmatter(fm) + "\n" + converted;

    // Output path: <OUT>/<category-slug>/<basename>.md
    // Falls back to a "_uncategorized" bucket for orphans.
    const categoryDir = nav ? slugify(nav.category) : "_uncategorized";
    const outDir = path.join(OUT, categoryDir);
    const outPath = path.join(outDir, path.basename(rel).replace(/\.mdx$/, ".md"));

    if (converted.includes("TODO(readme-port)")) report.todos.push(path.relative(OUT, outPath));

    if (!DRY) {
      fs.mkdirSync(outDir, { recursive: true });
      fs.writeFileSync(outPath, out, "utf8");
    }
    report.converted++;
  }

  // -------------------- report --------------------
  console.log("\n=== Mintlify → ReadMe conversion report ===");
  console.log(`Source:      ${SRC}`);
  console.log(`Output:      ${OUT}${DRY ? " (DRY RUN — no files written)" : ""}`);
  console.log(`Total mdx:   ${report.total}`);
  console.log(`Converted:   ${report.converted}`);
  console.log(`Skipped:     ${report.skipped}  (Mintlify template files)`);
  console.log(`Orphans:     ${report.orphans.length}  (not in docs.json nav)`);
  if (report.orphans.length) report.orphans.forEach((o) => console.log(`  - ${o}`));
  console.log(`Files w/ TODOs: ${report.todos.length}`);
  if (report.todos.length) report.todos.forEach((t) => console.log(`  - ${t}`));
  console.log("");
}

main();
