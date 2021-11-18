import { TodoDataV2, TodoFilePathHash } from './types';
export default class TodoMatcher {
    unprocessed: Set<TodoDataV2>;
    constructor();
    unmatched(predicate?: (todoDatum: TodoDataV2) => boolean): Map<TodoFilePathHash, TodoDataV2>;
    add(todoDatum: TodoDataV2): void;
    find(todoFilePathHash: TodoFilePathHash): TodoDataV2 | undefined;
    exactMatch(todoDataToFind: TodoDataV2): TodoDataV2 | undefined;
    fuzzyMatch(todoDataToFind: TodoDataV2): TodoDataV2 | undefined;
}
//# sourceMappingURL=todo-matcher.d.ts.map