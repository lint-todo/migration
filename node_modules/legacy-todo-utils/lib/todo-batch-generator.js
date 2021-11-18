"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const date_utils_1 = require("./date-utils");
const io_1 = require("./io");
function copyLintResult(todoDatum, unmatchedTodoData) {
    // this is a key transfer of information that allows us to match the identify
    // of the original lint result to the todo data. This is important as it allows
    // us to subsequently modify the severity of the original lint result. This is
    // only required for todo data that is generated for the stable batch, as those
    // are the only ones that are use to match back to the original lint result.
    todoDatum.originalLintResult = unmatchedTodoData.originalLintResult;
}
/**
 * Creates todo batches based on lint results.
 */
class TodoBatchGenerator {
    /**
     * Create a TodoBatchGenerator
     *
     * @param options - An object containing write options.
     */
    constructor(options) {
        this.options = options;
    }
    /**
     * Matches todos to their associated {@link https://github.com/ember-template-lint/ember-template-lint-todo-utils/blob/master/src/types/todo.ts#L61|TodoDataV2} object.
     *
     * The matching algorithm uses the following logic:
     *
     * For each unmatched lint result
     *   Find associated TodoMatcher by filePath
     *   Try to exact match against any of the TodoMatcher's Todos
     *
     *   if is exact match
     *     if expired && shouldRemove then add to "expired"
     *     else then add to "stable"
     *     remove from unmatched for either case above
     *
     * For each remaining unmatched lint result
     *   Find associated TodoMatcher by filePath
     *   Try to fuzzy match against any of the TodoMatcher's Todos
     *
     *   if is fuzzy match
     *     if expired && shouldRemove then add to "expired"
     *     else then add to "stable"
     *     remove from unmatched for either case above
     *   else
     *     then add to "add"
     *
     * For each remaining existing todos
     *   if shouldRemove then add to "remove
     *
     * Exact matches match on engine, ruleID, line and column
     * Fuzzy matches match on engine, ruleID and source
     *
     * @param maybeTodos - The linting data, converted to TodoDataV2 format.
     * @param existingTodos - Existing todo lint data.
     * @returns
     */
    generate(maybeTodos, existingTodos) {
        var _a, _b, _c, _d, _e;
        const add = new Map();
        const expired = new Map();
        const stable = new Map();
        let remove = new Map();
        maybeTodos = new Set(maybeTodos);
        for (const unmatchedTodoData of maybeTodos) {
            const todoFilePathHash = io_1.todoDirFor(unmatchedTodoData.filePath);
            const matcher = existingTodos.get(todoFilePathHash);
            if (matcher) {
                const todoDatum = matcher.exactMatch(unmatchedTodoData);
                if (todoDatum) {
                    const todoFilePath = io_1.todoFilePathFor(todoDatum);
                    if (date_utils_1.isExpired(todoDatum.errorDate) && ((_b = (_a = this.options) === null || _a === void 0 ? void 0 : _a.shouldRemove) === null || _b === void 0 ? void 0 : _b.call(_a, todoDatum))) {
                        expired.set(todoFilePath, todoDatum);
                    }
                    else {
                        copyLintResult(todoDatum, unmatchedTodoData);
                        stable.set(todoFilePath, todoDatum);
                    }
                    maybeTodos.delete(unmatchedTodoData);
                }
            }
        }
        for (const unmatchedTodoData of maybeTodos) {
            const todoFilePathHash = io_1.todoDirFor(unmatchedTodoData.filePath);
            const matcher = existingTodos.get(todoFilePathHash);
            if (matcher) {
                const todoDatum = matcher.fuzzyMatch(unmatchedTodoData);
                if (todoDatum) {
                    const todoFilePath = io_1.todoFilePathFor(todoDatum);
                    if (date_utils_1.isExpired(todoDatum.errorDate) && ((_d = (_c = this.options) === null || _c === void 0 ? void 0 : _c.shouldRemove) === null || _d === void 0 ? void 0 : _d.call(_c, todoDatum))) {
                        expired.set(todoFilePath, todoDatum);
                    }
                    else {
                        copyLintResult(todoDatum, unmatchedTodoData);
                        stable.set(todoFilePath, todoDatum);
                    }
                }
                else {
                    add.set(io_1.todoFilePathFor(unmatchedTodoData), unmatchedTodoData);
                }
            }
            else {
                add.set(io_1.todoFilePathFor(unmatchedTodoData), unmatchedTodoData);
            }
            maybeTodos.delete(unmatchedTodoData);
        }
        for (const matcher of [...existingTodos.values()]) {
            remove = new Map([...remove, ...matcher.unmatched((_e = this.options) === null || _e === void 0 ? void 0 : _e.shouldRemove)]);
        }
        return {
            add,
            expired,
            stable,
            remove,
        };
    }
}
exports.default = TodoBatchGenerator;
//# sourceMappingURL=todo-batch-generator.js.map