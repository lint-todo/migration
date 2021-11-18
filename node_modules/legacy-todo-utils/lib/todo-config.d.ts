import { DaysToDecay, LintTodoPackageJson, TodoConfig } from './types';
declare type ConfigValidationResult = {
    pkg?: LintTodoPackageJson;
    lintTodorc?: TodoConfig;
    isValid: boolean;
    message?: string;
};
/**
 * Gets the todo configuration.
 * Config values can be present in
 *
 * The package.json
 *
 * @example
 * ```json
 * {
 *   "lintTodo": {
 *     "some-engine": {
 *       "daysToDecay": {
 *         "warn": 5,
 *         "error": 10
 *       },
 *       "daysToDecayByRule": {
 *         "no-bare-strings": { "warn": 10, "error": 20 }
 *       }
 *     }
 *   }
 * }
 * ```
 *
 * A .lint-todorc.js file
 *
 * @example
 * ```js
 * module.exports = {
 *   "some-engine": {
 *     "daysToDecay": {
 *       "warn": 5,
 *       "error": 10
 *     },
 *     "daysToDecayByRule": {
 *       "no-bare-strings": { "warn": 10, "error": 20 }
 *     }
 *   }
 * }
 * ```
 *
 * Environment variables (`TODO_DAYS_TO_WARN` or `TODO_DAYS_TO_ERROR`)
 * 	- Env vars override package.json config
 *
 * Passed in directly, such as from command line options.
 * 	- Passed in options override both env vars and package.json config
 *
 * @param baseDir - The base directory that contains the project's package.json.
 * @param engine - The engine for this configuration, eg. eslint
 * @param customDaysToDecay - The optional custom days to decay configuration.
 * @returns - The todo config object.
 */
export declare function getTodoConfig(baseDir: string, engine: string, customDaysToDecay?: DaysToDecay): TodoConfig;
/**
 * Validates whether we have a unique config in a single location.
 *
 * @param baseDir - The base directory that contains the project's package.json.
 * @returns A ConfigValidationResult that indicates whether a config is unique
 */
export declare function validateConfig(baseDir: string): ConfigValidationResult;
export {};
//# sourceMappingURL=todo-config.d.ts.map