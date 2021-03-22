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

const asyncStringReplace = (str, regex, aReplacer, selfArg) => {
  let substrs = [],
    accstr = "";
  let resetIndex = 0;
  let pendingPromises = 0;
  let accept = null;
  for (let match = regex.exec(str); match !== null; match = regex.exec(str)) {
    if (resetIndex === regex.lastIndex) {
      regex.lastIndex += 1;
      continue;
    }
    // call the async replacer function with the matched array
    const retValue = aReplacer.apply(selfArg, match);
    if (retValue instanceof Promise) {
      const index = substrs.push(accstr, "") - 1;
      accstr = "";
      pendingPromises += 1;
      const thenAfter = (returnValue) => {
        substrs[index] = returnValue += "";
        pendingPromises -= 1;
        if (pendingPromises === 0 && accept !== null) accept(substrs.join(""));
      };
      retValue.then(thenAfter, thenAfter);
    } else {
      accstr += retValue;
    }
    resetIndex = regex.lastIndex;
  }
  accstr += str.substring(resetIndex);
  // wait for aReplacer calls to finish and join them back into string
  if (pendingPromises === 0) {
    return accstr;
  } else {
    // put the rest of str
    substrs.push(accstr);
    accstr = "";
    return new Promise(function (acceptFunc) {
      accept = acceptFunc;
      if (pendingPromises === 0) accept(substrs.join(""));
    });
  }
};

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

        queryVars.data.content = await asyncStringReplace(
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
