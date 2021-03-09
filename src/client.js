const { GraphQLClient } = require("graphql-request");

let client;

const getGqlClient = () => client;

const buildGqlClient = (endpoint, token) => {
  client = new GraphQLClient(endpoint, {
    headers: { authorization: `Bearer ${token}` },
  });
};

module.exports = {
  getGqlClient,
  buildGqlClient,
};
