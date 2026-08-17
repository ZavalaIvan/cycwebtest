import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

const projectRoot = process.cwd();
const distDir = join(projectRoot, "dist");

const legacyFiles = [
  "bluedrop.html",
  "bluedrop.css",
  "bluedrop.js",
  "css",
  "page-loader.html",
  "page-loader.css",
  "page-loader.js"
];

for (const relativePath of legacyFiles) {
  const source = join(projectRoot, relativePath);
  const destination = join(distDir, relativePath);

  if (!existsSync(source)) continue;

  mkdirSync(dirname(destination), { recursive: true });
  cpSync(source, destination, { recursive: true, force: true });
}

const distEntries = readdirSync(distDir, { withFileTypes: true });

for (const entry of distEntries) {
  if (!entry.isDirectory() || !entry.name.endsWith(".html")) continue;

  const nestedHtml = join(distDir, entry.name, "index.html");
  const flatHtml = join(distDir, entry.name);

  if (!existsSync(nestedHtml)) continue;

  const htmlContents = readFileSync(nestedHtml);
  rmSync(join(distDir, entry.name), { force: true, recursive: true });
  writeFileSync(flatHtml, htmlContents);
}
