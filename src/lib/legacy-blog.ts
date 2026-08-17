import { readFileSync } from "node:fs";
import { join } from "node:path";

type LegacySourceRoot = "main" | "body";

type LegacyBlogSourceOptions = {
  legacyFile: string;
  stylesheet?: string | null;
  sourceRoot: LegacySourceRoot;
};

const extractTagContents = (html: string, tagName: string) => {
  const expression = new RegExp(`<${tagName}[^>]*>([\\s\\S]*?)<\\/${tagName}>`, "i");
  return html.match(expression)?.[1]?.trim() ?? "";
};

const stripGoogleTagManagerSnippets = (html: string) =>
  html
    .replace(/\s*<!-- Google Tag Manager -->[\s\S]*?<!-- End Google Tag Manager -->/gi, "")
    .replace(
      /\s*<!-- Google Tag Manager \(noscript\) -->[\s\S]*?<!-- End Google Tag Manager \(noscript\) -->/gi,
      ""
    )
    .trim();

export const loadLegacyBlogSource = ({
  legacyFile,
  stylesheet,
  sourceRoot
}: LegacyBlogSourceOptions) => {
  const projectRoot = process.cwd();
  const htmlSource = readFileSync(join(projectRoot, legacyFile), "utf-8");
  const content = stripGoogleTagManagerSnippets(
    sourceRoot === "body" ? extractTagContents(htmlSource, "body") : extractTagContents(htmlSource, "main")
  );

  let styles = "";

  if (stylesheet) {
    styles = readFileSync(join(projectRoot, stylesheet), "utf-8");
  } else {
    styles = extractTagContents(htmlSource, "style");
  }

  return {
    content,
    styles
  };
};
