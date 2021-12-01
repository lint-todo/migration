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
      `${warning} Skipped migration (.lint-todo file found)`
    );
  } else if (todoStorageDirExists(baseDir)) {
    let todos = readTodoData(baseDir);
    let removeV1 = flags.removeV1;
    let hasV1 = todos.some((todoDatum) => todoDatum.fileFormat === 1);
    let counts = {
      v1: 0,
      v2: todos.length,
    };

    if (!removeV1 && hasV1) {
      process.stderr.write(
        `${error} Cannot migrate .lint-todo directory to single file format. Version 1 todo format found. Please rerun with the --remove-v1 option or regenerate your todos before migrating.`
      );
      process.exit(1);
    }

    let oldStorageDir = getTodoStorageDirPath(baseDir);
    let tmpStorageDir = `${oldStorageDir}__`;

    renameSync(oldStorageDir, tmpStorageDir);

    if (removeV1 && hasV1) {
      todos = todos.filter((todoDatum) => todoDatum.fileFormat === 2);

      let v2Count = todos.length;
      counts.v1 = counts.v2 - v2Count;
      counts.v2 = v2Count;
    }

    applyTodoChanges(
      getTodoStorageFilePath(baseDir),
      new Set(todos),
      new Set()
    );

    rmSync(tmpStorageDir, { recursive: true, force: true });

    let message = `${success} Successfully migrated ${counts.v2} todos to single file format`;

    if (counts.v1 > 0) {
      message += ` (${counts.v1} version 1 todos were removed)`;
    }

    process.stdout.write(message);
  } else {
    process.stdout.write(
      `${warning} Skipped migration (no .lint-todo directory found)`
    );
  }
}

if (require.main === module) {
  migrate(cli.input[0], cli.flags);
}
