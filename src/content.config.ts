import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const TAG_TYPE = z
    .union([z.string(), z.array(z.string())])
    .nullish()
    .transform((val: null | undefined | string | string[]) => {
        if (!val) return [];
        if (typeof val === 'string') return [val];
        return val;
    });

const blog = defineCollection({
    loader: glob({ pattern: ['[^_pages]*/*.{md,mdx}', '*.{md,mdx}'], base: './src/posts/' }),
    schema: z.object({
        title: z.string(),
        published: z.coerce.date(),
        modified: z.coerce.date().optional(),
        description: z.string().optional(),
        comment: z.boolean().optional(),
        hidden: z.boolean().optional(),
        thumbnail: z.string().optional(),
        tags: TAG_TYPE,
    }),
});

const pages = defineCollection({
    loader: glob({ pattern: ['**/*.{md,mdx}'], base: './src/posts/_pages/' }),
    schema: z.object({
        title: z.string(),
        description: z.string().optional(),
        modified: z.coerce.date().optional(),
    }),
});

export const collections = { blog, pages };