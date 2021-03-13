const ora = require("ora");
const winston = require("winston");

const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1);
const winLogger = winston.createLogger({
  level: "info",
  transports: [new winston.transports.Console()],
  format: winston.format.combine(
    winston.format.colorize({ all: true }),
    winston.format.simple()
  ),
});
const spinner = new ora({
  text: "",
  spinner: "dots",
});

const loggerWrapper = (level, params) => {
  spinner.clear();
  if (params.length > 1) {
    return winLogger[level](params);
  } else {
    return winLogger[level](params[0] || "");
  }
};

const logger = {
  ...winLogger,
  error: (...t) => loggerWrapper("error", t),
  info: (...t) => loggerWrapper("info", t),
  warn: (...t) => loggerWrapper("warn", t),
};

const restartSpinner = (text) => {
  if (spinner.text !== "") {
    spinner.succeed();
  }
  spinner.text = text;
  spinner.start();
};

module.exports = {
  capitalize,
  logger,
  spinner,
  restartSpinner,
};
