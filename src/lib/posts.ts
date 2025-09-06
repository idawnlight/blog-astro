import { getCollection } from "astro:content";

export async function getBlogPosts() {
    const posts = (await getCollection<"blog">("blog")).sort((a, b) => {
        return b.data.published.getTime() - a.data.published.getTime();
    });

    return posts;
}