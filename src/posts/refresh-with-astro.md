---
title: Refresh with Astro
published: 2025-09-15
description: 自豪地采用 Astro，构建并托管于 Cloudflare。
---

## Bye Hexo

[2021 年，我从 Typecho 转向 Hexo 构建部落格](/archives/new-blog)，使用修改后的 [giuem/hexo-theme-iris](https://github.com/giuem/hexo-theme-iris) 作为主题。事实上 Hexo 的确能够满足我对一个博客框架的所有功能需求：把 Markdown 渲染成好看的 HTML，并且配合 Iris 主题在这一点上做得很好。当时 Cloudflare Pages 刚刚达到 Generally Available，在控制台上点几下就能与 GitHub 项目集成，非常方便地持续构建每一个 commit，并直接部署到 Cloudflare 的网络上。Everything just works.

![Cloudflare Integration with GitHub](https://i.dawnlab.me/50e06b3884da4c6c3e22dbbcd7c20941.png)

但现在是 2025 年，新建一个前端项目时绝对不再是从 `index.html` 开始。Hexo 作为上一代的 static site generator 解决方案，渲染的核心还是 EJS 等模板引擎[^template-engine]，这意味着每个页面其实是从零开始拼起来的 HTML，当然也意味着你放弃了所有现代前端工程化。也许你可以缝一点 gulp 之类的东西进去，但整体上还是非常难以维护。除此之外：

- [Hexo 上次的更新 7.3.0 是在 2024-07-02](https://github.com/hexojs/hexo/releases/tag/v7.3.0)，可能他们也维护不下去上个世代的代码了（
- 一个博客框架会预设你可以做什么 —— 虽然你可以通过插件之类的机制来改变一些行为，但是几乎所有的插件接口实现都没那么优雅，意味着即使是想要实现一个很小的功能，大概率你也得理解整个系统是如何工作的，并确定所有你需要注入的地方，比如 [隐藏一篇文章](https://prinsss.github.io/hexo-plugin-to-make-posts-sage-unlisted/)。
- 因为没有前端工程化，当然也没有 HMR 这样可以大幅提升开发体验的技术。在这之前如果要更新样式之类的，往往是得重新构建一遍才能看到最终的效果，但是构建又是非常的麻烦。此外 Iris 毕竟不是我自己写的主题，整个工作流我也没太搞明白，甚至不能保证我本地和 Cloudflare 上构建的流程是一致的。很多时候我推送变更时基本是靠赌，赌它不会爆炸（

[^template-engine]: 近两年还在大规模使用模版引擎的唯一领域，可能就是各种 CTF 题目了。

虽然最近几年更新的内容非常少，但我其实还是有不少想写的，都因为 Hexo 复杂的工作流和缺乏灵活性给劝退了。事已至此，先重构吧。

## Hello Astro

如你所见，现在这篇文章是完全使用 Astro 渲染的。也许整个 Layout 有些眼熟，~~对没错我基本是照搬了 Iris，~~ 但是在一些细节上还是有一些区别。实际上这应该不算是我的第一个 Astro 项目，上一个是[seu-mirrors/frontend-astro](https://github.com/seu-mirrors/frontend-astro)，所以这次可以比较快地构建起来。

### 配色

现在配色实际上是基于 [Android Monet](https://siddroid.com/post/android/chasing-monet-inside-the-android-framework/) 算法对 [之前一个博客的 Hero Image (PilotsEYE ITALIANFOG)](https://pilotseye.tv/wp-content/gallery/italianfog/pilotseye_italianfog_2560.jpg) 进行 [取色](https://material-foundation.github.io/material-theme-builder/) 得到的。当然在实际使用的时候没怎么遵守语义，属于是看到什么合适就用什么，毕竟我也没打算遵守 Material 设计规范（

不过即使是随便乱用颜色的情况，也非常惊喜地发现直接切到生成出的 dark 配色毫无问题。配合 Scss 与非常新的 CSS `light-dark()`[^light-dark]，现在博客的自适应颜色主题是这样实现的：

[^light-dark]: 这个特性在 [MDN 上的标注是 Newly Available](https://developer.mozilla.org/en-US/docs/Web/CSS/color_value/light-dark#browser_compatibility)，不知道在更旧的浏览器上会是什么样，我也同样祝你们好运（

```scss
@function md-color($name, $theme: both) {
    @if map.has-key($md-colors, $name) {
        $colors: map.get($md-colors, $name);
        @if $theme == light {
            @return list.nth($colors, 1);
        } @else if $theme == dark {
            @return list.nth($colors, 2);
        } @else {
            @return light-dark(list.nth($colors, 1), list.nth($colors, 2));
        }
    } @else {
        @error "Color `#{$name}` not found in \$md-colors map.";
    }
}
```

不过我个人其实从来不用深色主题，所以也没打算加一个手动切换的按钮。万一配色上爆炸了，那么只能祝正在用深色主题的读者自求多福吧（

### RSS & Atom

现在右上角的 RSS 他真的指向一个 [RSS Feed](/rss.xml) 了，在这之前实际上它指向的是 [Atom Feed](/atom.xml)，似乎是因为在 Hexo 上我当时只是随便配了一下便没多管。现在这两个 Feed 都是可用的，并且尽量保持了与原先 Hexo 生成的格式保持一致，但愿你的阅读器不会认为过去所有的文章都是新文章（

目前在 Astro 上的 Feed 实现是大体上参考了[这篇文章](https://gsong.dev/articles/astro-feed-unified/)，但是对于原始文档的渲染（Markdown、MDX 或是别的什么格式）我不太想另外实现一套与 Astro 内部不同的 unified 生态 remark / rehype 渲染管线[^pipeline]，但是直接调 `astro:content` 的 `render()` 拿到的 `content.Content` 似乎只能作为 Astro Component 使用，那怎么把它变成 HTML 呢？

翻了下 Astro 的文档，发现有一个实验性的 [Astro Container API](https://docs.astro.build/en/reference/container-reference/)，可以在一个独立的环境中将组件渲染成 HTML。虽然这样看起来是 rehype 转为 HTML 后由 Astro 封装成组件，再创建一个容器将组件渲染回 HTML，但我一时也没找到更好的解决方案，所以[现在是这样做的](https://github.com/idawnlight/blog-astro/blob/220f29a541ad6b1d88c37490ccb6ae61ae5ba0ce/src/lib/feeds.ts#L40-L64)：

```typescript
import { render } from "astro:content";
import { experimental_AstroContainer } from "astro/container";

async function addArticlesToFeed(
    // ...
): Promise<void> {
    const articles = await getBlogPosts();

    for (const article of articles) {
        // ...
        const content = await render(article);
        const container = await experimental_AstroContainer.create();
        const htmlContent = await container.renderToString(content.Content);

        feed.addItem({
            // ...
            content: htmlContent,
        });
    }
}
```

[^pipeline]: 写成「渲染管线」总感觉我好像在做计算机图形学或是游戏开发。

### SukkaW/DisqusJS

这是老朋友了，3.0.0 版本使用 React 进行了重写，虽然在我原来的博客上从来没有更新过，但毕竟是重写了，当然直接配合 Astro Island 作为 React 组件引入：

```astro
---
// ...
import "@styles/disqusjs.scss";
import { DisqusJS } from "disqusjs/react/es2022";
---

<>
    {
        config.disqusJs && (
            <DisqusJS
                client:idle
                siteName={config.name}
                identifier={slug}
                url={Astro.url.href}
                {...config.disqusJs}
            />
        )
    }
</>
```

在测试的过程中发现 Local Storage 中的 `dsqjs_mode` 并不能被正确更新，所以提交了 [pr #88](https://github.com/SukkaW/DisqusJS/pull/88)，感觉也是经典 typo 了：

```diff
diff --git a/src/context/mode.ts b/src/context/mode.ts
index ac998cc..9c5135b 100644
--- a/src/context/mode.ts
+++ b/src/context/mode.ts
@@ -20,7 +20,7 @@ function useSetMode() {
 
   return useCallback((mode: DisqusJsMode) => {
     setDisqusJsMode(mode);
-    void Promise.resolve(() => {
+    void Promise.resolve().then(() => {
       if (mode === null) {
         localStorage.removeItem('dsqjs_mode');
       } else {
```

### 灵活性

使用 Astro 意味着我现在可以控制整个博客的构建流程，选择性地实现部分我需要的页面。例如，现在的产物里没有文章标签页了，或是基于年份分类的文章页。毕竟总共就这么几篇内容，若无必要还是不要徒增复杂度了。

另一个计划是试验更多的 Web 新特性，比如上面提到的 `light-dark()`、还没加上的 [View Transition API](https://developer.mozilla.org/en-US/docs/Web/API/View_Transition_API) 等。如果要在原来的 Hexo 上测试，那是真的要命了。

## 总结

希望重构完后续能想起来写点啥。如果你还怀念旧版的部落格，可以在 [这里](https://dawn-blog.pages.dev/) 找到它。如果你想看一眼现在这个部落格的源代码，可以点页脚的 commit。

以上。