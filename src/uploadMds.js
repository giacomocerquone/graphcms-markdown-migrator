const { gql } = require("graphql-request");
const { getGqlClient } = require("./client");
const matter = require("gray-matter");
const path = require("path");
const { logger, spinner, imgsInMdReg } = require("./utils");
const fs = require("fs");
const FormData = require("form-data");
const fetch = require("node-fetch");

const produceMutation = (modelName) => gql`
mutation uploadMds($data: ${modelName}CreateInput!) {
  create${modelName}(data: $data) {
    id
  }
}
`;

const uploadFile = (token, path, url) => {
  const form = new FormData();
  form.append("fileUpload", fs.createReadStream(path));
  return fetch(`${url}/upload`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: form,
  });
};

async function replaceAsync(str, regex, asyncFn) {
  const promises = [];
  str.replace(regex, (match, ...args) => {
    const promise = asyncFn(match, ...args);
    promises.push(promise);
  });
  const data = await Promise.all(promises);
  return str.replace(regex, () => data.shift());
}

const uploadMds = (mds, modelName, thumbField, token, url) => {
  const client = getGqlClient();
  return Promise.all(
    mds.map(async ({ fileRead: md, path: mdPath }) => {
      const {
        content,
        data: { [thumbField]: tF, ...frontMatter },
      } = matter(md);

      try {
        const queryVars = {
          data: { content, ...frontMatter },
        };

        if (tF) {
          const thumbUpload = await (
            await uploadFile(token, path.join(path.dirname(mdPath), tF), url)
          ).json();

          queryVars.data[thumbField] = {
            connect: {
              id: thumbUpload.id,
            },
          };
        }

        queryVars.data.content = await replaceAsync(
          content,
          imgsInMdReg,
          async (...groups) => {
            const assetUpload = await (
              await uploadFile(
                token,
                path.join(path.dirname(mdPath), groups?.[2]),
                url
              )
            ).json();
            const assetUrl = assetUpload.url;
            return `!${groups?.[1]}(${assetUrl})`;
          }
        );

        return client.request(produceMutation(modelName), queryVars);
      } catch (e) {
        spinner.fail();
        logger.error("Something went wrong upoading the assets", e);
        process.exit();
      }
    })
  );
};

module.exports = uploadMds;
