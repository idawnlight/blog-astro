// @ts-check
import { defineConfig } from 'astro/config';

import icon from 'astro-icon';
import unocss from 'unocss/astro'
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
    site: "https://idawnlight.com",
    integrations: [icon(), unocss(), sitemap()]
});