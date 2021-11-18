"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const io_1 = require("./io");
const types_1 = require("./types");
const ExactMatchers = new Map([
    [
        types_1.TodoFileFormat.Version1,
        {
            match: (todoDataToFind, todoDatum) => {
                return (todoDataToFind.engine === todoDatum.engine &&
                    todoDataToFind.ruleId === todoDatum.ruleId &&
                    todoDataToFind.range.start.line === todoDatum.range.start.line &&
                    todoDataToFind.range.start.column === todoDatum.range.start.column);
            },
        },
    ],
    [
        types_1.TodoFileFormat.Version2,
        {
            match: (todoDataToFind, todoDatum) => {
                return (todoDataToFind.engine === todoDatum.engine &&
                    todoDataToFind.ruleId === todoDatum.ruleId &&
                    todoDataToFind.range.start.line === todoDatum.range.start.line &&
                    todoDataToFind.range.start.column === todoDatum.range.start.column &&
                    todoDataToFind.range.end.line === todoDatum.range.end.line &&
                    todoDataToFind.range.end.column === todoDatum.range.end.column &&
                    todoDataToFind.source === todoDatum.source);
            },
        },
    ],
]);
class TodoMatcher {
    constructor() {
        this.unprocessed = new Set();
    }
    unmatched(predicate = () => false) {
        return new Map([...this.unprocessed]
            .filter((todoDatum) => predicate(todoDatum))
            .map((todoDatum) => {
            return [io_1.todoFilePathFor(todoDatum), todoDatum];
        }));
    }
    add(todoDatum) {
        this.unprocessed.add(todoDatum);
    }
    find(todoFilePathHash) {
        return [...this.unprocessed].find((todoDatum) => io_1.todoFileNameFor(todoDatum) === todoFilePathHash);
    }
    exactMatch(todoDataToFind) {
        var _a;
        let found;
        for (const todoDatum of this.unprocessed) {
            if ((_a = ExactMatchers.get(todoDatum.fileFormat)) === null || _a === void 0 ? void 0 : _a.match(todoDataToFind, todoDatum)) {
                found = todoDatum;
                this.unprocessed.delete(todoDatum);
                break;
            }
        }
        return found;
    }
    fuzzyMatch(todoDataToFind) {
        let found;
        for (const todoDatum of this.unprocessed) {
            const hasSource = todoDataToFind.source && todoDatum.source;
            const sourceMatches = todoDataToFind.source === todoDatum.source;
            if (todoDataToFind.engine === todoDatum.engine &&
                todoDataToFind.ruleId === todoDatum.ruleId &&
                hasSource &&
                sourceMatches) {
                found = todoDatum;
                this.unprocessed.delete(todoDatum);
                break;
            }
        }
        return found;
    }
}
exports.default = TodoMatcher;
//# sourceMappingURL=todo-matcher.js.map