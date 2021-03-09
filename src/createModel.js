const { newMigration } = require("@graphcms/management");

const createModel = async (url, token, model, modelName = "Post") => {
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
      console.log(errors);
      throw errors;
    }

    if (name) {
      console.log(name);
    }
  } catch (e) {
    console.log("errors creating model", e);
  }
};

module.exports = createModel;
