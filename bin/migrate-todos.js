#!/usr/bin/env node

const {
  applyTodoChanges,
  getTodoStorageFilePath,
  todoStorageFileExists,
} = require('@ember-template-lint/todo-utils');
const {
  buildTodoOperations,
} = require('@ember-template-lint/todo-utils/lib/builders');
const { renameSync, rmSync } = require('fs-extra');
const {
  readTodoData,
  todoStorageDirExists,
  getTodoStorageDirPath,
} = require('legacy-todo-utils');
const { success, warning, error } = require('log-symbols');
const meow = require('meow');

const cli = meow(
  `
	Usage
	  $ todo-migrator <working directory>

	Options
	  --removeV1, -r  Remove v1 todos from migration

	Examples
	  $ todo-migrator .
`,
  {
    flags: {
      removeV1: {
        type: 'boolean',
        alias: 'r',
        default: false,
      },
    },
  }
);

function migrate(baseDir, flags) {
  if (baseDir === '.') {
    baseDir = process.cwd();
  }

  if (todoStorageFileExists(baseDir)) {
    process.stdout.write(
      `${warning} Skipped migration (detected .lint-todo file)`
    );
  } else if (todoStorageDirExists(baseDir)) {
    let todos = readTodoData(baseDir);
    let removeV1 = flags.removeV1;

    if (!removeV1 && todos.some((todoDatum) => todoDatum.fileFormat === 1)) {
      process.stderr.write(
        `${error} Cannot migrate .lint-todo directory to single file format. Version 1 todo format detected. Please rerun with the --remove-v1 option or regenerate your todos before migrating.`
      );
      process.exit(1);
    }

    let oldStorageDir = getTodoStorageDirPath(baseDir);
    let tmpStorageDir = `${oldStorageDir}__`;

    renameSync(oldStorageDir, tmpStorageDir);

    if (removeV1) {
      todos = todos.filter((todoDatum) => todoDatum.fileFormat === 2);
    }

    applyTodoChanges(
      getTodoStorageFilePath(baseDir),
      new Set(todos),
      new Set()
    );

    rmSync(tmpStorageDir, { recursive: true, force: true });

    process.stdout.write(
      `${success} Successfully migrated ${todos.length} todos to single file format`
    );
  } else {
    process.stdout.write(`${warning} Skipped migration (nothing to migrate)`);
  }
}

if (require.main === module) {
  migrate(cli.input[0], cli.flags);
}
