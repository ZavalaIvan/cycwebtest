import { getCollection } from "astro:content";
import { absoluteUrl, sitemapPages } from "../lib/seo";

const lastmod = "2026-06-30";

const escapeXml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

export async function GET() {
  const articles = (await getCollection("blog")).sort(
    (left, right) => left.data.order - right.data.order
  );

  const urls = [
    ...sitemapPages,
    ...articles.map((article) => ({
      path: `/blog/${article.data.canonicalSlug}/`,
      changefreq: "monthly",
      priority: "0.7"
    }))
  ];

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (url) => `  <url>
    <loc>${escapeXml(absoluteUrl(url.path))}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`
  )
  .join("\n")}
</urlset>
`;

  return new Response(body, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8"
    }
  });
}
