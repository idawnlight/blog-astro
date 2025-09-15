import { getCollection } from "astro:content";

const excerpt = (body?: string) => {
    if (!body) return "";
    if (body.includes("<!--more-->")) {
        return body.split('<!--more-->')[0];
    }
    if (body.includes("<!-- more -->")) {
        return body.split('<!-- more -->')[0];
    }
    return body.slice(0, 200) + (body.length > 200 ? "(...)" : "");
};

export async function getBlogPosts(withHidden = false) {
    let posts = (await getCollection<"blog">("blog"))
        .sort((a, b) => b.data.published.getTime() - a.data.published.getTime())
        .filter((post) => withHidden || !post.data.hidden);

    posts.forEach((post) => {
        if (!post.data.description) {
            post.data.description = excerpt(post.body);
        }
    });

    return posts;
}

export async function getPages() {
    const pages = (await getCollection<"pages">("pages")).sort((a, b) => {
        return (b.data.modified?.getTime() ?? 0) - (a.data.modified?.getTime() ?? 0);
    });
    
    return pages;
}