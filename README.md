# graphcms-markdown-migrator

This package aims to help the migration from static markdown files to GraphCMS for your blog (or whatever you've built using markdowns).

[GraphCMS is a headless CMS](https://graphcms.com/academy/headless-cms) and allows you to create entities (which are called models) and expose GraphQL mutations and queries to manage them.<br/>
It also gives you an admin UI to create instances of these entities. They also have a [gatsby connector](https://www.gatsbyjs.com/docs/sourcing-from-graphcms/), and therefore it might be just perfect for your blog, whereas you'll have a "Post" entity, and you'll manage your posts in their UI.

## What does this migrator do?

Basically, you can give it a folder full of MD files, and it will try to create a "Post" entity on your GraphCMS instance, and it will just create as many posts as the number of your MD files with their content in it. (it will recursively find the files between all your folders).
<br/><br/>
**This package will try to recreate the model from the first markdown it encounters.**<br/>
It means that if you have markdowns with different YAML sections, you need to create two separate folders where you'll run this migrator.<br/>

## Prerequisites

- The URL of your GraphCMS instance
- A token with the "Management API Access" turned on![Management API access graph cms token](./assets/token-creation.png)

## Usage

Run:

```sh
npx md-to-graphcms --path ./your-path --url https://your-istance.com --token <token>
```

### Options

You can provide the following optional parameters to the CLI:

```
-v for verbose mode
-p to publish also the created entities over graphCMS (defaults to draft)
```

### TODO

- Add tests
- Add possibility to exclude specific fields from the extracted model
- Implement auto-publish option
