const glob = require("glob");
const path = require("path");

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

module.exports = {
  fetchFilenames,
};
