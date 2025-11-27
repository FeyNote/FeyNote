import { defineCollection, z } from 'astro:content';

const blog = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    featuredImageUrl: z.string().optional(),
    description: z.string(),
    preview: z.string(),
    readingTime: z.string().optional(),
    publishDate: z.date(),
    updatedDate: z.date().optional(),
    author: z.string().optional(),
    tags: z.array(z.string()).optional(),
  }),
});

export const collections = { blog };
