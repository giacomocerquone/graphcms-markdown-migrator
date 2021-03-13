const { newMigration } = require("@graphcms/management");
const { logger } = require("./utils");

const createModel = async (url, token, model, modelName) => {
  try {
    const migration = newMigration({
      authToken: token,
      endpoint: url,
    });

    model.reduce(
      (acc, modelField) => {
        acc.addSimpleField({
          apiId: modelField.name,
          displayName: modelField.name,
          type: modelField.type,
          ...(modelField.formRenderer && {
            formRenderer: modelField.formRenderer,
          }),
        });
        return acc;
      },
      migration.createModel({
        apiId: modelName,
        apiIdPlural: `${modelName}s`,
        displayName: modelName,
      })
    );

    const { errors, name } = await migration.run(true);

    if (errors) {
      logger.error(errors);
      throw errors;
    }

    if (name) {
      logger.info(name);
    }
  } catch (e) {
    logger.error("errors creating model", e);
  }
};

module.exports = createModel;
