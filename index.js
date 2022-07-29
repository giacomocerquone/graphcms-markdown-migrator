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
const { fetchFilenames } = require("./src/fetchFilenames");
const path = require("path");

const argv = hideBin(process.argv);

yargs(argv).command(
  "$0 [path] [url] [token]",
  "start the migration of the md files from the specified path to the specified GraphCMS instance.",
  (yargs) => {
    return (
      yargs
        .option("path", {
          alias: "p",
          type: "string",
          description: "Path of the folder of the md files to migrate.",
        })
        .option("url", {
          alias: "u",
          type: "string",
          description: "Your graphCMS URL",
        })
        // .option("publish", {
        //   alias: "p",
        //   type: "boolean",
        //   description:
        //     "Set this if you want your post to be published (defaults to draft posts)",
        // })
        .option("token", {
          alias: "t",
          type: "string",
          description: "Your graphCMS token",
        })
        .option("thumb-field", {
          type: "string",
          description:
            'The name of the yaml field to recognize as a post thumbnail (it will be uploaded automatically to the "Asset" model)',
        })
        .option("exclude", {
          type: "string",
          description:
            'Comma separated list of fields to exclude from your mds frontmatter: "field1, field2, field3"',
        })
        .option("model-from", {
          type: "string",
          description:
            'The filename of the specific MD file to use to extract the model (you must add the ".md" extension when specifying it)',
        })
        .option("model-name", {
          type: "string",
          description:
            'The name of the model that will be created in GraphCMS (Defaults to "Post")',
        })
    );
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

    if (!argv["thumb-field"]) {
      logger.warn(
        "You didn't specify any yaml field to be used as post thumbnail"
      );
    }
    if (!argv["exclude"]) {
      logger.warn(
        "You didn't specify any yaml field to exclude, therefore all the fields will be taken"
      );
    }
    if (!argv["model-from"]) {
      logger.warn(
        "You didn't specify any MD file to extract the model from, therefore the first one will be used"
      );
    }
    if (!argv["model-name"]) {
      logger.warn(
        'You didn\'t specify a name for the model that will be created, therefore "Post" will be used'
      );
    }

    let promptsRes = {};

    if (!argv["model-name"]) {
      promptsRes = await prompts(
        {
          type: "text",
          name: "modelName",
          message: 'How do you want to call the model? (Defaults to "Post")',
        },
        { onCancel: () => process.exit() }
      );
    }

    promptsRes.modelName = promptsRes.modelName || argv["model-name"] || "Post";

    try {
      restartSpinner("Fetching and parsing mds file");
      const fileNames = await fetchFilenames(argv.path);
      const mds = await fetchMds(fileNames);
      if (!mds.length) {
        spinner.succeed();
        logger.error("No md file found!");
        process.exit();
      }
      const extractModelFrom = argv["model-from"]
        ? mds[
            fileNames.findIndex(
              (fN) => path.basename(fN) === argv["model-from"]
            )
          ]
        : mds[0];
      restartSpinner("Extracting model from first md file");
      const model = extractModel(
        extractModelFrom,
        argv["thumb-field"],
        argv.exclude ? argv.exclude.split(", ") : []
      );
      restartSpinner("Creating the model inside your graphCMS instance");
      await createModel(
        argv.url,
        argv.token,
        model,
        capitalize(promptsRes.modelName)
      );
      restartSpinner("Waiting 10 seconds for graphCMS to process the new model ¯\_(ツ)_/¯");
      await new Promise(r => setTimeout(r, 10000));
      restartSpinner("Creating the mds inside your graphCMS instance");
      await buildGqlClient(argv.url, argv.token);
      await uploadMds(
        mds,
        capitalize(promptsRes.modelName),
        argv["thumb-field"],
        argv.token,
        argv.url
      );
      spinner.succeed();
    } catch (e) {
      spinner.fail();
      logger.error("Something went wrong", e);
      process.exit();
    }
  }
).argv;
