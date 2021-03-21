const { newMigration } = require("@graphcms/management");
const { logger, spinner } = require("./utils");

const createModel = async (url, token, model, modelName) => {
  try {
    const migration = newMigration({
      authToken: token,
      endpoint: url,
    });

    model.reduce(
      (acc, modelField) => {
        if (modelField.model) {
          acc.addRelationalField({
            apiId: modelField.name,
            displayName: modelField.name,
            relationType: modelField.relationType,
            model: modelField.model,
          });
        } else {
          acc.addSimpleField({
            apiId: modelField.name,
            displayName: modelField.name,
            type: modelField.type,
            ...(modelField.formRenderer && {
              formRenderer: modelField.formRenderer,
            }),
          });
        }

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
    spinner.fail();
    logger.error("errors creating model", e);
    process.exit();
  }
};

module.exports = createModel;
