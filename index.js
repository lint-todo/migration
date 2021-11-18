#!/usr/bin/env node

const {
  applyTodoChanges,
  getTodoStorageFilePath,
} = require('@ember-template-lint/todo-utils');
const {
  buildTodoOperations,
} = require('@ember-template-lint/todo-utils/lib/builders');
const { readTodoData } = require('legacy-todo-utils');
const { success, warning } = require('log-symbols');

function migrate() {
  let baseDir = process.cwd();

  // We're in legacy lint todo mode
  if (todoStorageDirExists(baseDir)) {
    let todos = readTodoData(baseDir);

    applyTodoChanges(
      getTodoStorageFilePath(baseDir),
      new Set(todos),
      new Set()
    );

    process.stdout.write(
      `${success} Successfully migrated ${todos.length} todos to single file format`
    );
  } else {
    process.stdout.write(
      '${warning} Skipped migration (detected .lint-todo file)'
    );
  }
}
