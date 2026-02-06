const { DateTime } = require("luxon");
module.exports = function(eleventyConfig) {
  eleventyConfig.addPassthroughCopy({ "src/assets": "assets" });
  eleventyConfig.addFilter("readableDate", d => DateTime.fromJSDate(d).toFormat("d LLL yyyy"));
  return { dir: { input: "src", includes: "_includes", output: "_site" } };
};