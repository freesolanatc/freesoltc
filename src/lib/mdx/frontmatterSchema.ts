import { z } from "zod";

export const articleFaqItemSchema = z.object({
  question: z.string().min(1),
  answer: z.string().min(1),
});

export const articleFrontmatterSchema = z.object({
  title: z.string().min(1).max(160),
  slug: z
    .string()
    .min(1)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "slug must be lowercase kebab-case"),
  metaDescription: z.string().min(1).max(320),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "date must be YYYY-MM-DD"),
  updatedDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "updatedDate must be YYYY-MM-DD")
    .optional(),
  tags: z.array(z.string().min(1)).min(1),
  coverImage: z.string().optional(),
  author: z.string().optional().default("Free Solana Token Creator Team"),
  faq: z.array(articleFaqItemSchema).optional(),
});

export type ArticleFrontmatterInput = z.infer<typeof articleFrontmatterSchema>;
