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
    loader: glob({ pattern: ['**/*.md'], base: './src/posts/' }),
    schema: z.object({
        title: z.string(),
        published: z.coerce.date(),
        modified: z.coerce.date().optional(),
        description: z.string().optional(),
        tags: TAG_TYPE,
    }),
});

export const collections = { blog };