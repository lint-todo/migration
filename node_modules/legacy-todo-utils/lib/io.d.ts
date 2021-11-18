import { TodoFileHash, TodoDataV2, TodoBatchCounts, WriteTodoOptions, TodoFilePathHash, TodoBatches } from './types';
import TodoMatcher from './todo-matcher';
/**
 * Determines if the .lint-todo storage directory exists.
 *
 * @param baseDir - The base directory that contains the .lint-todo storage directory.
 * @returns - true if the todo storage directory exists, otherwise false.
 */
export declare function todoStorageDirExists(baseDir: string): boolean;
/**
 * Creates, or ensures the creation of, the .lint-todo directory.
 *
 * @param baseDir - The base directory that contains the .lint-todo storage directory.
 * @returns - The todo storage directory path.
 */
export declare function ensureTodoStorageDir(baseDir: string): string;
/**
 * @param baseDir - The base directory that contains the .lint-todo storage directory.
 * @returns - The todo storage directory path.
 */
export declare function getTodoStorageDirPath(baseDir: string): string;
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
export declare function todoFilePathFor(todoData: TodoDataV2): string;
/**
 * Creates a short hash for the todo's file path.
 *
 * @param filePath - The filePath from linting data for an individual violation.
 * @returns - The todo directory for a specific filepath.
 */
export declare function todoDirFor(filePath: string): string;
/**
 * Generates a unique filename for a todo lint data.
 *
 * @param todoData - The linting data for an individual violation.
 * @returns - The todo file name for a {@link https://github.com/ember-template-lint/ember-template-lint-todo-utils/blob/master/src/types/todo.ts#L61|TodoDataV2} object.
 */
export declare function todoFileNameFor(todoData: TodoDataV2): string;
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
export declare function writeTodos(baseDir: string, maybeTodos: Set<TodoDataV2>, options?: Partial<WriteTodoOptions>): TodoBatchCounts;
/**
 * Reads all todo files in the .lint-todo directory.
 *
 * @param baseDir - The base directory that contains the .lint-todo storage directory.
 * @returns - A {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map|Map} of {@link https://github.com/ember-template-lint/ember-template-lint-todo-utils/blob/master/src/types/todo.ts#L26|TodoFilePathHash}/{@link https://github.com/ember-template-lint/ember-template-lint-todo-utils/blob/master/src/todo-matcher.ts#L4|TodoMatcher}.
 */
export declare function readTodos(baseDir: string): Map<TodoFilePathHash, TodoMatcher>;
/**
 * Reads todo files in the .lint-todo directory for a specific filePath.
 *
 * @param todoStorageDir - The .lint-todo storage directory.
 * @param filePath - The relative file path of the file to return todo items for.
 * @returns - A {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map|Map} of {@link https://github.com/ember-template-lint/ember-template-lint-todo-utils/blob/master/src/types/todo.ts#L26|TodoFilePathHash}/{@link https://github.com/ember-template-lint/ember-template-lint-todo-utils/blob/master/src/todo-matcher.ts#L4|TodoMatcher}.
 */
export declare function readTodosForFilePath(baseDir: string, filePath: string): Map<TodoFilePathHash, TodoMatcher>;
/**
 * Reads todo files in the .lint-todo directory and returns Todo data in an array.
 *
 * @param baseDir - The base directory that contains the .lint-todo storage directory.
 * @returns An array of {@link https://github.com/ember-template-lint/ember-template-lint-todo-utils/blob/master/src/types/todo.ts#L61|TodoDataV2}
 */
export declare function readTodoData(baseDir: string): TodoDataV2[];
/**
 * Gets 4 maps containing todo items to add, remove, those that are expired, or those that are stable (not to be modified).
 *
 * @param maybeTodos - The linting data for violations.
 * @param existing - Existing todo lint data.
 * @param options - An object containing write options.
 * @returns - An object of {@link https://github.com/ember-template-lint/ember-template-lint-todo-utils/blob/master/src/types/todo.ts#L36|TodoBatches}.
 */
export declare function getTodoBatches(maybeTodos: Set<TodoDataV2>, existing: Map<TodoFilePathHash, TodoMatcher>, options: Partial<WriteTodoOptions>): TodoBatches;
/**
 * Applies todo changes, either adding or removing, based on batches from `getTodoBatches`.
 *
 * @param todoStorageDir - The .lint-todo storage directory.
 * @param add - Batch of todos to add.
 * @param remove - Batch of todos to remove.
 */
export declare function applyTodoChanges(todoStorageDir: string, add: Map<TodoFileHash, TodoDataV2>, remove: Map<TodoFileHash, TodoDataV2>): void;
//# sourceMappingURL=io.d.ts.map