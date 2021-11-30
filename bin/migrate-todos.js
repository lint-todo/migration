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

function migrate(baseDir = process.cwd()) {
  if (todoStorageFileExists(baseDir)) {
    process.stdout.write(
      `${warning} Skipped migration (detected .lint-todo file)`
    );
  } else if (todoStorageDirExists(baseDir)) {
    let todos = readTodoData(baseDir);

    if (todos.some((todoDatum) => todoDatum.fileFormat === 1)) {
      process.stderr.write(
        `${error} Cannot migrate .lint-todo directory to single file format. Version 1 todo format detected. Please regenerate your todos before migrating.`
      );
      process.exit(1);
    }

    let oldStorageDir = getTodoStorageDirPath(baseDir);
    let tmpStorageDir = `${oldStorageDir}__`;

    renameSync(oldStorageDir, tmpStorageDir);

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
  migrate();
}
