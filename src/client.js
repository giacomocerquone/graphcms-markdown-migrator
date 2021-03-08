const { GraphQLClient } = require("graphql-request");
const queries = require("./queries");

let client;

const getGqlClient = () => client;

const buildGqlClient = (endpoint, token) => {
  client = new GraphQLClient(endpoint, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

module.exports = {
  getGqlClient,
  buildGqlClient,
};
