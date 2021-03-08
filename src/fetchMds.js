const glob = require("glob");
const path = require("path");
const process = require("process");
const fs = require("fs/promises");

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
  return Promise.all(fileNames.map((fN) => fs.readFile(fN, "utf8")));
};

module.exports = fetchMds;
