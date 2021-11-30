# @lint-todo/migrator

Migration tool to migrate lint todo files from multi-file storage to single-file storage.

## Usage

From within the project directory, run:

```ssh-shell
npx @lint-todo/migrator
```

All done!

:warning: The new single file storage format does not support Version 1 of the todo format. You should ensure that all your todos are using the new format
by regenerating them in Version 2 format (using `ember-template-lint@3.6.0` or later and `@scalvert/eslint-formatter-todo@1.4.0` or later).

## License

This project is licensed under the [MIT License](LICENSE).
