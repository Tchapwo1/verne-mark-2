const { DateTime } = require("luxon");

module.exports = function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy({ "src/assets": "assets" });

  eleventyConfig.addFilter("readableDate", (dateObj) => {
    return DateTime.fromJSDate(dateObj).toFormat("d LLL yyyy");
  });

  eleventyConfig.addCollection("daily", (collectionApi) =>
    collectionApi.getFilteredByGlob("src/daily/*.md")
  );

  eleventyConfig.addCollection("weekly", (collectionApi) =>
    collectionApi.getFilteredByGlob("src/weekly/*.md")
  );

  eleventyConfig.addCollection("learn", (collectionApi) =>
    collectionApi.getFilteredByGlob("src/learn/*.md")
  );

  return {
    dir: {
      input: "src",
      includes: "_includes",
      output: "_site",
    },
  };
};
