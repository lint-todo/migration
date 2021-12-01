# @lint-todo/migrator

Migration tool to migrate lint todo files from multi-file storage to single-file storage.

## Usage

```bash
  A migration tool for lint todos

  Usage
    $ todo-migrator <working directory>

  Options
    --removeV1, -r  Remove v1 todos from migration

  Examples
    $ todo-migrator .
```

From within the project directory, run:

```bash
npx @lint-todo/migrator
```

### Options

```bash
npx @lint-todo/migrator --removeV1
```

The new single file storage format does not support Version 1 of the todo format. You can optionally remove all Version 1 todos and convert the remaining Version 2 todos to single-file format. Doing so will effectively convert them back to error or warn severity, so you should only do this if you are OK with exposing those lint violations to the user.

You should ensure that all your todos are using the new format
by regenerating them in Version 2 format (using `ember-template-lint@3.6.0` or later and `@scalvert/eslint-formatter-todo@1.4.0` or later).

## License

This project is licensed under the [MIT License](LICENSE).
