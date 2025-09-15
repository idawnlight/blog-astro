// https://gsong.dev/articles/astro-feed-unified/

import type { APIContext } from "astro";
import type { Author, FeedOptions } from "feed";

import { render } from "astro:content";
import { Feed } from "feed";
import config from "@config";
import { getBlogPosts } from "./posts";

export async function generateFeed(context: APIContext): Promise<Feed> {
    const site = context.site!.toString();
    const author: Author = {
        name: config.author,
    };
    const feed = createFeedInstance(site, author); // Initialize Feed object
    await addArticlesToFeed(feed, site, author); // Add processed articles
    return feed;
}

function createFeedInstance(site: string, author: Author): Feed {
    const feedOptions: FeedOptions = {
        title: config.name,
        description: config.description,
        id: site,
        link: site,
        copyright: `Copyleft ${new Date().getFullYear()} ${config.name}`,
        author,
        generator: "blog@idawnlight, with Astro and jpmonette/feed",
    };
    return new Feed(feedOptions);
}

const createUrl = (path: string, site: string) => {
    return new URL(path, site).toString();
}

import { experimental_AstroContainer } from "astro/container";

async function addArticlesToFeed(
    feed: Feed,
    site: string,
    author: Author,
): Promise<void> {
    const articles = await getBlogPosts();

    for (const article of articles) {
        const link = createUrl(`/archives/${article.id}/`, site) as string;
        const content = await render(article);
        const container = await experimental_AstroContainer.create();
        const htmlContent = await container.renderToString(content.Content);

        feed.addItem({
            title: article.data.title,
            id: link,
            link,
            published: article.data.published,
            date: article.data.modified || article.data.published,
            author: [author],
            description: article.data.description,
            content: htmlContent,
        });
    }
}