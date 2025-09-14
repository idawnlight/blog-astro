// @ts-check
import { defineConfig } from 'astro/config';

import icon from 'astro-icon';
import unocss from 'unocss/astro'
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
    site: "https://idawnlight.com",
    integrations: [icon(), unocss(), sitemap()],
    // it behaves differently for dev and build
    // https://github.com/withastro/astro/issues/4252
    trailingSlash: 'never',
    vite: {
        css: {
            preprocessorOptions: {
                scss: {
                    additionalData: `@use "@styles/_global.scss" as *;`
                },
            },
        },
    },
    markdown: {
        remarkRehype: {
            footnoteLabel: ' ',
            footnoteLabelTagName: 'hr'
        },
        shikiConfig: {
            themes: {
                light: 'github-light',
                dark: 'github-dark'
            }
        }
    }
});