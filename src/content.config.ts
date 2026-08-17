import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const blog = defineCollection({
  loader: glob({ base: "./src/content/blog", pattern: "*.json" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    excerpt: z.string(),
    category: z.string(),
    eyebrow: z.string(),
    legacyFile: z.string(),
    stylesheet: z.string().nullable().optional(),
    sourceRoot: z.enum(["main", "body"]).default("main"),
    pageClass: z.string(),
    order: z.number().int(),
    readingTime: z.string(),
    canonicalSlug: z.string()
  })
});

export const collections = { blog };
