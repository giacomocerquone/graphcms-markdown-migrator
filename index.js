#!/usr/bin/env node
const yargs = require("yargs/yargs");
const { hideBin } = require("yargs/helpers");
const { buildGqlClient } = require("./src/client");
const createModel = require("./src/createModel");
const prompts = require("prompts");
const fetchMds = require("./src/fetchMds");
const extractModel = require("./src/extractModel");
const uploadMds = require("./src/uploadMds");
const { capitalize, logger, spinner, restartSpinner } = require("./src/utils");

const argv = hideBin(process.argv);

yargs(argv).command(
  "$0 [path] [url] [token]",
  "start the migration of the md files in the specified path.",
  (yargs) => {
    return yargs
      .positional("path", {
        describe: "Path of the folder of the md files to migrate.",
      })
      .option("url", {
        alias: "u",
        type: "string",
        description: "Your graphCMS URL",
      })
      .option("publish", {
        alias: "p",
        type: "boolean",
        description:
          "Set this if you want your post to be published (defaults to draft posts)",
      })
      .option("token", {
        alias: "t",
        type: "string",
        description: "Your graphCMS token",
      })
      .option("post-thumbnail", {
        alias: "pt",
        type: "string",
        description:
          'The name of the yaml field to recognize as a post thumbnail (it will be uploaded automatically to the "Asset" model)',
      })
      .option("exclude", {
        alias: "exc",
        type: "string",
        description:
          "Comma separated list of fields to exclude from your mds frontmatter",
      });
  },
  async (argv) => {
    if (!argv.path) {
      return logger.error("You must specify a path");
    }
    if (!argv.url) {
      return logger.error("You must specify your graphcms url");
    }
    if (!argv.token) {
      return logger.error("You must specify your graphcms token");
    }

    const response = await prompts(
      {
        type: "text",
        name: "modelName",
        message: 'How do you want to call the model? (Defaults to "Post")',
      },
      { onCancel: () => process.exit() }
    );

    if (!response.modelName) {
      response.modelName = "Post";
    }

    try {
      restartSpinner("Fetching and parsing mds file");
      const mds = await fetchMds(argv.path);
      restartSpinner("Extracting model from first md file");
      const model = extractModel(mds?.[0]);
      restartSpinner("Creating the model inside your graphCMS instance");
      await createModel(
        argv.url,
        argv.token,
        model,
        capitalize(response.modelName)
      );
      restartSpinner("Creating the mds inside your graphCMS instance");
      await buildGqlClient(argv.url, argv.token);
      await uploadMds(
        mds,
        capitalize(response.modelName),
        argv.token,
        argv.url
      );
      spinner.succeed();
    } catch (e) {
      logger.error("Something went wrong", e);
    }
  }
).argv;
