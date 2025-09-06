import rss from '@astrojs/rss';
import { getBlogPosts } from "@/lib/posts";
import config from '@config';

export async function GET(context: { site: any; }) {
    const blog = await getBlogPosts();
    return rss({
        // `<title>` field in output xml
        title: config.name,
        // `<description>` field in output xml
        description: config.description,
        // Pull in your project "site" from the endpoint context
        // https://docs.astro.build/en/reference/api-reference/#site
        site: context.site,
        // Array of `<item>`s in output xml
        // See "Generating items" section for examples using content collections and glob imports
        items: blog.map((post) => ({
            title: post.data.title,
            pubDate: post.data.published,
            description: post.data.description,
            // Compute RSS link from post `id`
            // This example assumes all posts are rendered as `/blog/[id]` routes
            link: `/archives/${post.id}/`,
        })),
        // (optional) inject custom xml
        // customData: `<language>en-us</language>`,
    });
}