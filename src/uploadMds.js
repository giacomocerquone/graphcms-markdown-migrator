const { gql } = require("graphql-request");
const { getGqlClient } = require("./client");
const matter = require("gray-matter");

const produceMutation = (modelName = "Post") => gql`
mutation uploadMds($data: ${modelName}CreateInput!) {
  create${modelName}(data: $data) {
    id
  }
}
`;

const uploadMds = (mds, modelName) => {
  const client = getGqlClient();
  return Promise.all(
    mds.map((md) => {
      const { content, data } = matter(md);
      return client.request(produceMutation(modelName), {
        data: { content, ...data },
      });
    })
  );
};

module.exports = uploadMds;