import { GenericLintData, TodoConfig, TodoData, TodoDataV2 } from './types';
/**
 * Adapts a {@link https://github.com/ember-template-lint/ember-template-lint-todo-utils/blob/master/src/types/lint.ts#L31|LintResult} to a {@link https://github.com/ember-template-lint/ember-template-lint-todo-utils/blob/master/src/types/todo.ts#L61|TodoDataV2}. FilePaths are absolute
 * when received from a lint result, so they're converted to relative paths for stability in
 * serializing the contents to disc.
 *
 * @param lintResult - The lint result object.
 * @param lintMessage - A lint message object representing a specific violation for a file.
 * @param todoConfig - An object containing the warn or error days, in integers.
 * @returns - A {@link https://github.com/ember-template-lint/ember-template-lint-todo-utils/blob/master/src/types/todo.ts#L61|TodoDataV2} object.
 */
export declare function buildTodoDatum(baseDir: string, genericLintData: GenericLintData, todoConfig?: TodoConfig): TodoDataV2;
export declare function normalizeToV2(todoDatum: TodoData): TodoDataV2;
export declare function generateHash(input: string, algorithm?: string): string;
//# sourceMappingURL=builders.d.ts.map