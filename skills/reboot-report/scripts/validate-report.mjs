#!/usr/bin/env node

import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const MINIMUM_HTML_COMMENT_COUNT = 18;
const MINIMUM_CSS_COMMENT_COUNT = 13;
const MINIMUM_SLIDE_COUNT = 17;
const templatePath = fileURLToPath(new URL("../assets/template.html", import.meta.url));

const reportPath = process.argv[2];
if (!reportPath) {
  console.error("Usage: node validate-report.mjs <report.html>");
  process.exit(2);
}

const absolutePath = resolve(reportPath);
const [html, template] = await Promise.all([
  readFile(absolutePath, "utf8"),
  readFile(templatePath, "utf8"),
]);
const failures = [];

if (html === template) {
  failures.push("report is identical to the bundled example template");
}

const htmlCommentCount = html.match(/<!--[\s\S]*?-->/g)?.length ?? 0;
if (htmlCommentCount < MINIMUM_HTML_COMMENT_COUNT) {
  failures.push(
    `expected at least ${MINIMUM_HTML_COMMENT_COUNT} preserved HTML comments, found ${htmlCommentCount}`,
  );
}

const cssCommentCount = html.match(/\/\*[\s\S]*?\*\//g)?.length ?? 0;
if (cssCommentCount < MINIMUM_CSS_COMMENT_COUNT) {
  failures.push(
    `expected at least ${MINIMUM_CSS_COMMENT_COUNT} preserved CSS comments, found ${cssCommentCount}`,
  );
}

const slideCount = html.match(/<section\s+class=["'][^"']*\bslide\b[^"']*["']/g)?.length ?? 0;
if (slideCount < MINIMUM_SLIDE_COUNT) {
  failures.push(`expected at least ${MINIMUM_SLIDE_COUNT} slides, found ${slideCount}`);
}

if (!/<html\b[^>]*\blang=/i.test(html)) failures.push("missing html lang attribute");
if (!/<meta\b[^>]*\bname=["']viewport["']/i.test(html)) failures.push("missing viewport metadata");
if (!/<title>[^<]+<\/title>/i.test(html)) failures.push("missing non-empty title");

if (failures.length > 0) {
  console.error(`Report validation failed for ${absolutePath}:`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(
  JSON.stringify({
    ok: true,
    path: absolutePath,
    slideCount,
  }),
);
