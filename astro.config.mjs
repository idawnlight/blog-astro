// @ts-check
import { defineConfig } from 'astro/config';

import icon from 'astro-icon';
import unocss from 'unocss/astro'
import sitemap from '@astrojs/sitemap';
import react from '@astrojs/react';

import rehypeExternalLinks from 'rehype-external-links'
import rehypeSlug from 'rehype-slug'
import rehypeAutolinkHeadings from 'rehype-autolink-headings'

import mdx from '@astrojs/mdx';

// https://astro.build/config
export default defineConfig({
    site: "https://idawnlight.com",
    integrations: [icon(), unocss(), sitemap(), react(), mdx()],
    // it behaves differently for dev and build
    // https://github.com/withastro/astro/issues/4252
    trailingSlash: 'never',
    vite: {
        css: {
            preprocessorOptions: {
                scss: {
                    additionalData: `@use "@styles/_global.scss" as *;\n`
                },
            },
        },
    },
    markdown: {
        remarkRehype: {
            footnoteLabel: ' ',
            footnoteLabelTagName: 'hr'
        },
        rehypePlugins: [
            [rehypeExternalLinks, { target: '_blank', rel: ['noopener'] }],
            rehypeSlug,
            [rehypeAutolinkHeadings, { behavior: 'append', content: { type: 'text', value: '' }, properties: { className: ['header-anchor'] } }]
        ],
        shikiConfig: {
            themes: {
                light: 'github-light',
                dark: 'github-dark'
            }
        }
    }
});