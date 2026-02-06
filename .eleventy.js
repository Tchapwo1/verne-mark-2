const { DateTime } = require("luxon");

const syntaxHighlight = require("@11ty/eleventy-plugin-syntaxhighlight");
const pluginRss = require("@11ty/eleventy-plugin-rss");
const pluginTOC = require("eleventy-plugin-toc");
const markdownIt = require("markdown-it");
const markdownItAnchor = require("markdown-it-anchor");
const markdownItFootnote = require("markdown-it-footnote");
const markdownItKatex = require("markdown-it-katex");
const markdownItContainer = require("markdown-it-container");
const Image = require("@11ty/eleventy-img");

module.exports = function (eleventyConfig) {
  eleventyConfig.addPlugin(syntaxHighlight);
  eleventyConfig.addPlugin(pluginRss);

  // TOC Plugin
  eleventyConfig.addPlugin(pluginTOC, {
    tags: ['h2', 'h3'],
    wrapper: 'nav',
    wrapperClass: 'toc-nav',
    ul: true
  });

  // Markdown Configuration
  const mdOptions = {
    html: true,
    breaks: true,
    linkify: true,
    typographer: true
  };
  const mdLib = markdownIt(mdOptions)
    .use(markdownItAnchor, { permalink: markdownItAnchor.permalink.headerLink() })
    .use(markdownItFootnote)
    .use(markdownItKatex)
    .use(markdownItContainer, 'note')
    .use(markdownItContainer, 'warning')
    .use(markdownItContainer, 'tech');

  eleventyConfig.setLibrary("md", mdLib);

  // Image Shortcode
  async function imageShortcode(src, alt, sizes) {
    let metadata = await Image(src, {
      widths: [300, 600, 900],
      formats: ["avif", "webp", "jpeg"],
      outputDir: "./_site/img/",
      urlPath: "/img/"
    });
    let imageAttributes = { alt, sizes, loading: "lazy", decoding: "async" };
    return Image.generateHTML(metadata, imageAttributes);
  }
  eleventyConfig.addNunjucksAsyncShortcode("image", imageShortcode);

  eleventyConfig.addPassthroughCopy({ "src/assets": "assets" });
  eleventyConfig.addPassthroughCopy({ "src/manifest.json": "manifest.json" });

  eleventyConfig.addFilter("readableDate", (dateObj) => {
    return DateTime.fromJSDate(dateObj).toFormat("d LLL yyyy");
  });

  // Sidenote Shortcode
  // Usage: {% sidenote "unique-id" %}Markdown content here{% endsidenote %}
  eleventyConfig.addPairedShortcode("sidenote", function (content, id) {
    // Render the content inside the sidenote as markdown
    const mdContent = mdLib.renderInline(content);

    // Output 1: The Reference Number/Label in the main text
    // We use a checkbox hack or button for interaction
    const labelHtml = `<label for="sn-${id}" class="sidenote-ref" aria-describedby="sn-content-${id}">⊕</label>`;

    // Output 2: The Sidenote Content (hidden in main flow, moved via CSS/JS)
    // We output it right next to the label, but CSS will move it to the margin.
    const noteHtml = `
    <span class="sidenote-wrapper">
      <input type="checkbox" id="sn-${id}" class="sidenote-toggle hidden" />
      <span class="sidenote-content" id="sn-content-${id}" role="complementary">
        <span class="sidenote-marker">⊕</span>
        ${mdContent}
      </span>
    </span>`;

    return `${labelHtml}${noteHtml}`;
  });

  eleventyConfig.addFilter("readingTime", (content) => {
    const contentWithoutHtml = content.replace(/(<([^>]+)>)/gi, "");
    const words = contentWithoutHtml.match(/[\w\d\’\'-]+/gi);
    const numberOfWords = words ? words.length : 0;
    const wordsPerMinute = 200;
    const minutes = Math.ceil(numberOfWords / wordsPerMinute);
    return `${minutes} min read`;
  });

  eleventyConfig.addFilter("urlencoded", (str) => {
    return encodeURIComponent(str);
  });

  // Helper to filter drafts
  const livePosts = (post) => !post.data.draft;

  eleventyConfig.addCollection("daily", (collectionApi) =>
    collectionApi.getFilteredByGlob("src/daily/*.md").filter(livePosts)
  );

  eleventyConfig.addCollection("weekly", (collectionApi) =>
    collectionApi.getFilteredByGlob("src/weekly/*.md").filter(livePosts)
  );

  eleventyConfig.addCollection("learn", (collectionApi) =>
    collectionApi.getFilteredByGlob("src/learn/*.md").filter(livePosts)
  );

  eleventyConfig.addFilter("getRelatedPosts", (collection, currentUrl, tags) => {
    if (!tags) return [];
    // Filter out the current post
    const otherPosts = collection.filter(post => post.url !== currentUrl);

    // Score posts based on matching tags
    const scoredPosts = otherPosts.map(post => {
      let score = 0;
      if (post.data.tags) {
        post.data.tags.forEach(tag => {
          if (tags.includes(tag) && tag !== 'post') {
            score++;
          }
        });
      }
      return { post, score };
    });

    // Sort by score (descending) and take top 2
    return scoredPosts
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 2)
      .map(item => item.post);
  });

  return {
    dir: {
      input: "src",
      includes: "_includes",
      output: "_site",
    },
  };
};
