import { getCollection } from "astro:content";

export async function getBlogPosts() {
    const posts = (await getCollection<"blog">("blog")).sort((a, b) => {
        return b.data.date.getTime() - a.data.date.getTime();
    });

    return posts;
}