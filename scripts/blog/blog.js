import fs from "node:fs";
import { promises as files } from "node:fs";
import { createHash } from "node:crypto";
import markdownit from "markdown-it";
import markdownitFootnote from "markdown-it-footnote";
import markdownitTaskLists from "markdown-it-task-lists";
import { full as markdownitEmoji } from "markdown-it-emoji";
import markdownitKatex from "@ruanyf/markdown-it-katex";
import { align as markdownitAlign } from "@mdit/plugin-align";
import markdownitSup from "markdown-it-sup";
import markdownitSub from "markdown-it-sub";
import markdownitAbbr from "markdown-it-abbr";
import hljs from "highlight.js";

const blogPath = "../../content/blog.json";
const cachePath = "./blog-cache.json";
const template = await files.readFile("../../assets/templates/blog/post.html", "utf8");
const topbar = await files.readFile("../../assets/templates/topbar.html", "utf8");
const favicon = await files.readFile("../../assets/templates/favicon.html", "utf8");
const googleAnalytics = await files.readFile("../../assets/templates/googleAnalytics.html", "utf8");
const generatorSource = await files.readFile(new URL(import.meta.url), "utf8");
const renderSignature = createHash("sha256")
    .update(generatorSource).update(template).update(topbar).update(favicon).update(googleAnalytics)
    .digest("hex");

const markdown = markdownit({
    html: true,
    highlight(source, language) {
        if (language && hljs.getLanguage(language)) {
            try {
                return hljs.highlight(source, { language }).value;
            } catch (_) {
                // Let markdown-it escape unrecognized code blocks.
            }
        }
        return "";
    }
})
    .use(markdownitFootnote)
    .use(markdownitTaskLists)
    .use(markdownitEmoji)
    .use(markdownitKatex)
    .use(markdownitAlign)
    .use(markdownitSup)
    .use(markdownitSub)
    .use(markdownitAbbr);

const originalBlogJSON = await files.readFile(blogPath, "utf8");
const blogJSON = JSON.parse(originalBlogJSON).sort((a, b) => dateValue(b.date) - dateValue(a.date));
if (JSON.stringify(JSON.parse(originalBlogJSON)) !== JSON.stringify(blogJSON)) {
    await files.writeFile(blogPath, JSON.stringify(blogJSON, null, 2), "utf8");
}

let blogCache = {};
try {
    blogCache = JSON.parse(await files.readFile(cachePath, "utf8"));
} catch (_) {
    // Build every post when the cache is absent or invalid.
}

let processed = 0;
let skipped = 0;
for (const post of blogJSON) {
    const source = await files.readFile(`../../content/blog/${post.file}.md`, "utf8");
    const mdHash = createHash("sha256").update(source).digest("hex");
    const meta = JSON.stringify({ title: post.title, file: post.file, tag: post.tag, date: post.date });
    const previous = blogCache[post.file];
    const outputPath = `../../pages/blog/${post.file}.html`;
    if (previous?.mdHash === mdHash && previous.meta === meta
            && previous.renderSignature === renderSignature && fs.existsSync(outputPath)) {
        skipped += 1;
        continue;
    }

    await files.writeFile(outputPath, renderPost(post, source), "utf8");
    blogCache[post.file] = { mdHash, meta, renderSignature };
    processed += 1;
}
await files.writeFile(cachePath, JSON.stringify(blogCache, null, 2), "utf8");
console.log(`Finished blog generation (${blogJSON.length} posts): skipped ${skipped}, processed ${processed}.`);

function dateValue(value) {
    const [day, month, year] = value.split("/").map(Number);
    return Date.UTC(year, month - 1, day);
}

function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, character => ({
        "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    })[character]);
}

function headingText(inline) {
    const parts = (inline?.children || []).map(token => {
        if (token.type === "image") return token.content;
        if (["text", "code_inline", "emoji", "math_inline"].includes(token.type)) return token.content;
        return "";
    });
    return parts.join("").trim() || inline?.content.trim() || "Section";
}

function renderTocList(headings) {
    const root = { level: 0, children: [] };
    const parents = [root];
    for (const heading of headings) {
        while (parents.length > 1 && parents.at(-1).level >= heading.level) parents.pop();
        const node = { ...heading, children: [] };
        parents.at(-1).children.push(node);
        parents.push(node);
    }

    function renderNodes(nodes) {
        return `<ul class="blog-post-toc__list">${nodes.map(node =>
            `<li><a href="#${node.id}">${escapeHtml(node.label)}</a>${node.children.length ? renderNodes(node.children) : ""}</li>`
        ).join("")}</ul>`;
    }

    return `<ul class="blog-post-toc__list"><li><a href="#post-top">Top</a></li>`
        + root.children.map(node =>
            `<li><a href="#${node.id}">${escapeHtml(node.label)}</a>${node.children.length ? renderNodes(node.children) : ""}</li>`
        ).join("") + "</ul>";
}

// A top-level heading that is only a link (e.g. "[**Try it yourself**](demo.html)")
// becomes a button instead of a large underlined heading. A following "---" is dropped.
function callToActionFrom(tokens, index) {
    const open = tokens[index];
    const inline = tokens[index + 1];
    if (open.type !== "heading_open" || open.level !== 0 || open.tag !== "h1"
            || inline?.type !== "inline" || tokens[index + 2]?.type !== "heading_close") return null;
    const children = (inline.children || []).filter(child => !(child.type === "text" && !child.content.trim()));
    if (children[0]?.type !== "link_open" || children.at(-1)?.type !== "link_close") return null;
    const inner = children.slice(1, -1);
    if (!inner.every(child => ["text", "strong_open", "strong_close", "em_open", "em_close"].includes(child.type))) return null;
    const label = inner.filter(child => child.type === "text").map(child => child.content).join("").trim();
    const href = children[0].attrGet("href");
    if (!label || !href) return null;
    return {
        end: index + 2,
        html: `<p class="blog-post-cta"><a class="blog-post-cta__button" href="${escapeHtml(href)}">`
            + `<i class="fa-solid fa-play" aria-hidden="true"></i>${escapeHtml(label)}`
            + `<i class="fa-solid fa-arrow-right" aria-hidden="true"></i></a></p>\n`
    };
}

function renderMarkdown(source) {
    const environment = {};
    const tokens = markdown.parse(source.replaceAll("assets/", "../../content/blog/assets/"), environment);
    const contentTokens = [];
    const headings = [];
    let tocRequested = false;
    let afterToc = false;

    for (let index = 0; index < tokens.length; index += 1) {
        const token = tokens[index];
        const callToAction = callToActionFrom(tokens, index);
        if (callToAction) {
            const html = new token.constructor("html_block", "", 0);
            html.content = callToAction.html;
            contentTokens.push(html);
            index = callToAction.end;
            if (tokens[index + 1]?.type === "hr") index += 1;
            continue;
        }
        if (token.type === "paragraph_open" && token.level === 0
                && tokens[index + 1]?.type === "inline"
                && tokens[index + 1].content.trim() === "[toc]"
                && tokens[index + 2]?.type === "paragraph_close") {
            tocRequested = true;
            afterToc = true;
            index += 2;
            continue;
        }

        if (afterToc && token.type === "heading_open" && token.level === 0
                && /^h[1-4]$/.test(token.tag)) {
            const id = `post-section-${headings.length + 1}`;
            token.attrSet("id", id);
            token.attrSet("tabindex", "-1");
            headings.push({ id, level: Number(token.tag[1]), label: headingText(tokens[index + 1]) });
        }
        contentTokens.push(token);
    }

    let content = markdown.renderer.render(contentTokens, markdown.options, environment);
    content = content.replaceAll(">#rowspan=2 ", " rowspan=2>")
        .replaceAll(">#rowspan=3 ", " rowspan=3>")
        .replaceAll(">#rowspan=4 ", " rowspan=4>")
        .replaceAll(">#rowspan=5 ", " rowspan=5>")
        .replaceAll(">#colspan=2 ", " colspan=2>")
        .replaceAll(">#colspan=3 ", " colspan=3>")
        .replaceAll(">#colspan=4 ", " colspan=4>")
        .replaceAll(">#colspan=5 ", " colspan=5>")
        .replaceAll(/<td[^>]*>#remove<\/td>/g, "");
    return { content, headings: tocRequested ? headings : [] };
}

function renderPost(post, source) {
    const { content, headings } = renderMarkdown(source);
    const hasToc = headings.length > 0;
    const tocList = hasToc ? renderTocList(headings) : "";
    const values = {
        title: escapeHtml(post.title),
        tag: escapeHtml(post.tag),
        date: escapeHtml(formatDatePost(post.date)),
        isoDate: post.date.split("/").reverse().join("-"),
        readingTime: calculateReadingTime(source),
        backHref: post.tag === "WIP" ? "../blog.html#wip" : "../blog.html",
        tocClass: hasToc ? "blog-post-page--with-toc" : "",
        desktopToc: hasToc
            ? `<aside class="blog-post-sidebar"><nav class="blog-post-toc" aria-label="On this page"><p class="blog-post-toc__title">On this page</p>${tocList}</nav></aside>`
            : "",
        mobileToc: hasToc
            ? `<details class="blog-post-toc-mobile"><summary>On this page <i class="fa-solid fa-chevron-down" aria-hidden="true"></i></summary><nav aria-label="On this page">${tocList}</nav></details>`
            : "",
        content,
        HTMLtopbar: topbar,
        favicon,
        googleAnalytics,
        rootFolder: "../../"
    };
    return Object.entries(values).reduce((html, [key, value]) =>
        html.replaceAll(`{{${key}}}`, String(value)), template);
}

function formatDatePost(inputDate) {
    const [day, month, year] = inputDate.split("/").map(Number);
    const monthName = new Intl.DateTimeFormat("en-US", { month: "long", timeZone: "UTC" })
        .format(new Date(Date.UTC(year, month - 1, day)));
    const suffix = [11, 12, 13].includes(day % 100) ? "th"
        : day % 10 === 1 ? "st" : day % 10 === 2 ? "nd" : day % 10 === 3 ? "rd" : "th";
    return `${monthName} ${day}${suffix}, ${year}`;
}

function calculateReadingTime(source) {
    return Math.max(1, Math.ceil(source.trim().split(/\s+/).length / 225));
}
