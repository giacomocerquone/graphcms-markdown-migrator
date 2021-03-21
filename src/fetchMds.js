const glob = require("glob");
const path = require("path");
const process = require("process");
const fs = require("fs/promises");
const { spinner, logger } = require("./utils");

const fetchFilenames = (mdsPath) =>
  new Promise((resolve, reject) => {
    const joinedPath = path.join(process.cwd(), mdsPath, "**/*.md");
    glob(joinedPath, function (er, files) {
      if (er) {
        return reject(er);
      }
      resolve(files);
    });
  });

const fetchMds = async (mdsPath) => {
  const fileNames = await fetchFilenames(mdsPath);
  try {
    const readMds = await Promise.all(
      fileNames.map((fN) => fs.readFile(fN, "utf8"))
    );
    return fileNames.map((fN, i) => ({ path: fN, fileRead: readMds[i] }));
  } catch (e) {
    spinner.fail();
    logger.error("Something went wrong reading the md files", e);
    process.exit();
  }
};

module.exports = fetchMds;
