import { getCollection } from "astro:content";

export async function getBlogPosts() {
    const posts = (await getCollection<"blog">("blog")).sort((a, b) => {
        return b.data.published.getTime() - a.data.published.getTime();
    });

    return posts;
}

export async function getPages() {
    const pages = (await getCollection<"pages">("pages")).sort((a, b) => {
        return (b.data.modified?.getTime() ?? 0) - (a.data.modified?.getTime() ?? 0);
    });
    
    return pages;
}