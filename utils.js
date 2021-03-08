const { GraphQLClient } = require("graphql-request");
const queries = require("./queries");

let client;

const getGqlClient = () => client;

const buildGqlClient = (endpoint, token) => {
  client = new GraphQLClient(endpoint, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

const createPostModel = async () => {
  try {
    const data = await client.request(queries.postModelCreation);
    console.log(data);
  } catch (e) {
    console.log(e);
  }
};

module.exports = {
  getGqlClient,
  buildGqlClient,
  createPostModel,
};
