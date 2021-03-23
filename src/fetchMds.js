const process = require("process");
const fs = require("fs/promises");
const { spinner, logger } = require("./utils");

const fetchMds = async (fileNames) => {
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
