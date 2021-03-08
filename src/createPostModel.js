const { newMigration, FieldType } = require("@graphcms/management");

const createPostModel = async (url, token, postModel) => {
  try {
    const migration = newMigration({
      authToken: token,
      endpoint: url,
      name: "Creatig post model",
    });

    migration.deleteModel("Author");

    migration
      .createModel({
        apiId: "Author",
        apiIdPlural: "Authors",
        displayName: "Author",
      })
      // Add a required name field
      .addSimpleField({
        apiId: "name",
        displayName: "Name",
        isRequired: true,
        type: FieldType.String,
      });

    const { errors, name } = await migration.run(true);
    if (errors) {
      console.log(errors);
    }

    if (name) {
      console.log(name);
    }
  } catch (e) {
    console.log("errors creating post model");
  }
};

module.exports = createPostModel;
