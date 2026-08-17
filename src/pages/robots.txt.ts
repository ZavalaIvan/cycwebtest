import { SITE } from "../lib/seo";

export function GET() {
  return new Response(
    [
      "User-agent: *",
      "Allow: /",
      "Disallow: /page-loader.html",
      "",
      `Sitemap: ${SITE.url}/sitemap.xml`,
      ""
    ].join("\n"),
    {
      headers: {
        "Content-Type": "text/plain; charset=utf-8"
      }
    }
  );
}
