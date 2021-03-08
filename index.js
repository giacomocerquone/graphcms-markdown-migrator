#!/usr/bin/env node
const yargs = require("yargs/yargs");
const { hideBin } = require("yargs/helpers");
const chalk = require("chalk");
const { buildGqlClient } = require("./src/client");
const { createModel } = require("./src/createModel");
const prompts = require("prompts");
const fetchMds = require("./src/fetchMds");
const extractModel = require("./src/extractModel");

const argv = hideBin(process.argv);

yargs(argv)
  .command(
    "migrate [path] [url] [token]",
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
        .option("token", {
          alias: "t",
          type: "string",
          description: "Your graphCMS token",
        });
    },
    async (argv) => {
      if (argv.verbose) console.info(`start server on :${argv.port}`);
      // serve(argv.port);
      if (!argv.path) {
        return console.error(chalk.red("You must specify a path"));
      }
      // if (!argv.url) {
      //   return console.error(chalk.red("You must specify your graphcms url"));
      // }
      // if (!argv.token) {
      //   return console.error(chalk.red("You must specify your graphcms token"));
      // }

      const response = await prompts({
        type: "text",
        name: "modelName",
        message: 'How do you want to call the model? (Defaults to "Post")',
      });

      const files = await fetchMds(argv.path);
      const model = extractModel(files?.[0]);

      await createModel(argv.url, argv.token, model, response.modelName);

      console.log(model);

      // await buildGqlClient(argv.url, argv.token);
    }
  )
  .option("verbose", {
    alias: "v",
    type: "boolean",
    description: "Run with verbose logging",
  }).argv;
