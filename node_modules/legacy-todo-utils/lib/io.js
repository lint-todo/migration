"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.applyTodoChanges = exports.getTodoBatches = exports.readTodoData = exports.readTodosForFilePath = exports.readTodos = exports.writeTodos = exports.todoFileNameFor = exports.todoDirFor = exports.todoFilePathFor = exports.getTodoStorageDirPath = exports.ensureTodoStorageDir = exports.todoStorageDirExists = void 0;
const tslib_1 = require("tslib");
/* eslint-disable @typescript-eslint/no-non-null-assertion */
const path_1 = require("path");
const fs_extra_1 = require("fs-extra");
const todo_matcher_1 = tslib_1.__importDefault(require("./todo-matcher"));
const todo_batch_generator_1 = tslib_1.__importDefault(require("./todo-batch-generator"));
const builders_1 = require("./builders");
/**
 * Determines if the .lint-todo storage directory exists.
 *
 * @param baseDir - The base directory that contains the .lint-todo storage directory.
 * @returns - true if the todo storage directory exists, otherwise false.
 */
function todoStorageDirExists(baseDir) {
    return fs_extra_1.existsSync(getTodoStorageDirPath(baseDir));
}
exports.todoStorageDirExists = todoStorageDirExists;
/**
 * Creates, or ensures the creation of, the .lint-todo directory.
 *
 * @param baseDir - The base directory that contains the .lint-todo storage directory.
 * @returns - The todo storage directory path.
 */
function ensureTodoStorageDir(baseDir) {
    const path = getTodoStorageDirPath(baseDir);
    fs_extra_1.ensureDirSync(path);
    return path;
}
exports.ensureTodoStorageDir = ensureTodoStorageDir;
/**
 * @param baseDir - The base directory that contains the .lint-todo storage directory.
 * @returns - The todo storage directory path.
 */
function getTodoStorageDirPath(baseDir) {
    return path_1.posix.join(baseDir, '.lint-todo');
}
exports.getTodoStorageDirPath = getTodoStorageDirPath;
/**
 * Creates a file path from the linting data. Excludes extension.
 *
 * @example
 * 42b8532cff6da75c5e5895a6f33522bf37418d0c/6e3be839
 *
 * @param baseDir - The base directory that contains the .lint-todo storage directory.
 * @param todoData - The linting data for an individual violation.
 * @returns - The todo file path for a {@link https://github.com/ember-template-lint/ember-template-lint-todo-utils/blob/master/src/types/todo.ts#L61|TodoDataV2} object.
 */
function todoFilePathFor(todoData) {
    return path_1.posix.join(todoDirFor(todoData.filePath), todoFileNameFor(todoData));
}
exports.todoFilePathFor = todoFilePathFor;
/**
 * Creates a short hash for the todo's file path.
 *
 * @param filePath - The filePath from linting data for an individual violation.
 * @returns - The todo directory for a specific filepath.
 */
function todoDirFor(filePath) {
    return builders_1.generateHash(filePath);
}
exports.todoDirFor = todoDirFor;
/**
 * Generates a unique filename for a todo lint data.
 *
 * @param todoData - The linting data for an individual violation.
 * @returns - The todo file name for a {@link https://github.com/ember-template-lint/ember-template-lint-todo-utils/blob/master/src/types/todo.ts#L61|TodoDataV2} object.
 */
function todoFileNameFor(todoData) {
    const fileContentsHash = `${todoData.engine}${todoData.ruleId}${todoData.range.start.line}${todoData.range.start.column}`;
    return builders_1.generateHash(fileContentsHash, 'sha256').slice(0, 8);
}
exports.todoFileNameFor = todoFileNameFor;
/**
 * Writes files for todo lint violations. One file is generated for each violation, using a generated
 * hash to identify each.
 *
 * Given a list of todo lint violations, this function will also delete existing files that no longer
 * have a todo lint violation.
 *
 * @param baseDir - The base directory that contains the .lint-todo storage directory.
 * @param maybeTodos - The linting data, converted to TodoDataV2 format.
 * @param options - An object containing write options.
 * @returns - The counts of added and removed todos.
 */
function writeTodos(baseDir, maybeTodos, options) {
    options = Object.assign({ shouldRemove: () => true }, options !== null && options !== void 0 ? options : {});
    const todoStorageDir = ensureTodoStorageDir(baseDir);
    const existing = options.filePath
        ? readTodosForFilePath(baseDir, options.filePath)
        : readTodos(baseDir);
    const { add, remove, stable, expired } = getTodoBatches(maybeTodos, existing, options);
    applyTodoChanges(todoStorageDir, add, remove);
    return {
        addedCount: add.size,
        removedCount: remove.size,
        stableCount: stable.size,
        expiredCount: expired.size,
    };
}
exports.writeTodos = writeTodos;
/**
 * Reads all todo files in the .lint-todo directory.
 *
 * @param baseDir - The base directory that contains the .lint-todo storage directory.
 * @returns - A {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map|Map} of {@link https://github.com/ember-template-lint/ember-template-lint-todo-utils/blob/master/src/types/todo.ts#L26|TodoFilePathHash}/{@link https://github.com/ember-template-lint/ember-template-lint-todo-utils/blob/master/src/todo-matcher.ts#L4|TodoMatcher}.
 */
function readTodos(baseDir) {
    const existingTodos = new Map();
    const todoStorageDir = ensureTodoStorageDir(baseDir);
    const todoFileDirs = fs_extra_1.readdirSync(todoStorageDir);
    for (const todoFileDir of todoFileDirs) {
        const todoFileHashes = fs_extra_1.readdirSync(path_1.posix.join(todoStorageDir, todoFileDir));
        if (!existingTodos.has(todoFileDir)) {
            existingTodos.set(todoFileDir, new todo_matcher_1.default());
        }
        const matcher = existingTodos.get(todoFileDir);
        for (const todoFileHash of todoFileHashes) {
            const todoDatum = fs_extra_1.readJSONSync(path_1.posix.join(todoStorageDir, todoFileDir, todoFileHash));
            matcher.add(builders_1.normalizeToV2(todoDatum));
        }
    }
    return existingTodos;
}
exports.readTodos = readTodos;
/**
 * Reads todo files in the .lint-todo directory for a specific filePath.
 *
 * @param todoStorageDir - The .lint-todo storage directory.
 * @param filePath - The relative file path of the file to return todo items for.
 * @returns - A {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map|Map} of {@link https://github.com/ember-template-lint/ember-template-lint-todo-utils/blob/master/src/types/todo.ts#L26|TodoFilePathHash}/{@link https://github.com/ember-template-lint/ember-template-lint-todo-utils/blob/master/src/todo-matcher.ts#L4|TodoMatcher}.
 */
function readTodosForFilePath(baseDir, filePath) {
    const existingTodos = new Map();
    const todoStorageDir = ensureTodoStorageDir(baseDir);
    const todoFileDir = todoDirFor(filePath);
    const todoFilePathDir = path_1.posix.join(todoStorageDir, todoFileDir);
    try {
        if (!existingTodos.has(todoFileDir)) {
            existingTodos.set(todoFileDir, new todo_matcher_1.default());
        }
        const matcher = existingTodos.get(todoFileDir);
        const fileNames = fs_extra_1.readdirSync(todoFilePathDir);
        for (const fileName of fileNames) {
            const todoDatum = fs_extra_1.readJSONSync(path_1.posix.join(todoFilePathDir, fileName));
            matcher === null || matcher === void 0 ? void 0 : matcher.add(builders_1.normalizeToV2(todoDatum));
        }
    }
    catch (error) {
        if (error.code === 'ENOENT') {
            return existingTodos;
        }
        throw error;
    }
    return existingTodos;
}
exports.readTodosForFilePath = readTodosForFilePath;
/**
 * Reads todo files in the .lint-todo directory and returns Todo data in an array.
 *
 * @param baseDir - The base directory that contains the .lint-todo storage directory.
 * @returns An array of {@link https://github.com/ember-template-lint/ember-template-lint-todo-utils/blob/master/src/types/todo.ts#L61|TodoDataV2}
 */
function readTodoData(baseDir) {
    return [...readTodos(baseDir).values()].reduce((matcherResults, matcher) => {
        return [...matcherResults, ...matcher.unprocessed];
    }, []);
}
exports.readTodoData = readTodoData;
/**
 * Gets 4 maps containing todo items to add, remove, those that are expired, or those that are stable (not to be modified).
 *
 * @param maybeTodos - The linting data for violations.
 * @param existing - Existing todo lint data.
 * @param options - An object containing write options.
 * @returns - An object of {@link https://github.com/ember-template-lint/ember-template-lint-todo-utils/blob/master/src/types/todo.ts#L36|TodoBatches}.
 */
function getTodoBatches(maybeTodos, existing, options) {
    const todoBatchGenerator = new todo_batch_generator_1.default(options);
    return todoBatchGenerator.generate(maybeTodos, existing);
}
exports.getTodoBatches = getTodoBatches;
/**
 * Applies todo changes, either adding or removing, based on batches from `getTodoBatches`.
 *
 * @param todoStorageDir - The .lint-todo storage directory.
 * @param add - Batch of todos to add.
 * @param remove - Batch of todos to remove.
 */
function applyTodoChanges(todoStorageDir, add, remove) {
    for (const [fileHash, todoDatum] of add) {
        const { dir } = path_1.posix.parse(fileHash);
        fs_extra_1.ensureDirSync(path_1.posix.join(todoStorageDir, dir));
        fs_extra_1.writeJsonSync(path_1.posix.join(todoStorageDir, `${fileHash}.json`), todoDatum);
    }
    for (const [fileHash] of remove) {
        const { dir } = path_1.posix.parse(fileHash);
        const todoDir = path_1.posix.join(todoStorageDir, dir);
        fs_extra_1.unlinkSync(path_1.posix.join(todoStorageDir, `${fileHash}.json`));
        if (fs_extra_1.readdirSync(todoDir).length === 0) {
            fs_extra_1.rmdirSync(todoDir);
        }
    }
}
exports.applyTodoChanges = applyTodoChanges;
//# sourceMappingURL=io.js.map