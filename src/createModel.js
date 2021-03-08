const { newMigration, FieldType } = require("@graphcms/management");

const createModel = async (url, token, model, modelName = "Post") => {
  try {
    const migration = newMigration({
      authToken: token,
      endpoint: url,
      name: "Creating post model",
    });

    migration.createModel({
      apiId: modelName,
      apiIdPlural: `${modelName}s`,
      displayName: modelName,
    });

    model.forEach((modelField) => {
      migration.addSimpleField({
        apiId: modelField.name,
        displayName: modelField.name,
        type: FieldType.String,
      });
    });

    const { errors, name } = await migration.run(true);

    if (errors) {
      console.log(errors);
      throw errors;
    }

    if (name) {
      console.log(name);
    }
  } catch (e) {
    console.log("errors creating model");
  }
};

module.exports = createModel;
