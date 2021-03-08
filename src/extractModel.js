const { FieldType } = require("@graphcms/management");
const string = require("string-sanitizer");
const matter = require("gray-matter");

const extractModel = (post) => {
  const { data } = matter(post);

  if (!data) {
    throw new Error("The first MD doesn't seem to have a yaml frontmatter");
  }

  return Object.keys(data).map((frontKey) => {
    const value = data[frontKey];

    if (typeof value === "boolean") {
      return {
        name: string.sanitize(frontKey),
        type: FieldType.Boolean,
      };
    }
    if (value instanceof Date) {
      return {
        name: string.sanitize(frontKey),
        type: FieldType.Date,
      };
    }
    if (typeof value === "number") {
      return {
        name: string.sanitize(frontKey),
        type: FieldType.Int,
      };
    }
    if (typeof value === "string") {
      return {
        name: string.sanitize(frontKey),
        type: FieldType.String,
      };
    }
  });
};

module.exports = extractModel;
