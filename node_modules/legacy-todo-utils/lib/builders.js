"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateHash = exports.normalizeToV2 = exports.buildTodoDatum = void 0;
const path_1 = require("path");
const slash = require("slash");
const crypto_1 = require("crypto");
const types_1 = require("./types");
const date_utils_1 = require("./date-utils");
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
function buildTodoDatum(baseDir, genericLintData, todoConfig) {
    // Note: If https://github.com/nodejs/node/issues/13683 is fixed, remove slash() and use posix.relative
    // provided that the fix is landed on the supported node versions of this lib
    const filePath = path_1.isAbsolute(genericLintData.filePath)
        ? path_1.relative(baseDir, genericLintData.filePath)
        : genericLintData.filePath;
    const todoDatum = Object.assign(genericLintData, {
        source: generateHash(genericLintData.source),
        filePath: slash(filePath),
        fileFormat: types_1.TodoFileFormat.Version2,
    }, getTodoDates(genericLintData.ruleId, todoConfig));
    return todoDatum;
}
exports.buildTodoDatum = buildTodoDatum;
function normalizeToV2(todoDatum) {
    // if we have a range property, we're already in V2 format
    if ('range' in todoDatum) {
        todoDatum.fileFormat = types_1.TodoFileFormat.Version2;
        return todoDatum;
    }
    const todoDatumV1 = todoDatum;
    const todoDatumV2 = {
        engine: todoDatumV1.engine,
        filePath: todoDatumV1.filePath,
        ruleId: todoDatumV1.ruleId,
        range: getRange(todoDatumV1),
        source: '',
        createdDate: todoDatumV1.createdDate,
        fileFormat: types_1.TodoFileFormat.Version1,
    };
    if (todoDatumV1.warnDate) {
        todoDatumV2.warnDate = todoDatumV1.warnDate;
    }
    if (todoDatumV1.errorDate) {
        todoDatumV2.errorDate = todoDatumV1.errorDate;
    }
    return todoDatumV2;
}
exports.normalizeToV2 = normalizeToV2;
function generateHash(input, algorithm = 'sha1') {
    return crypto_1.createHash(algorithm).update(input).digest('hex');
}
exports.generateHash = generateHash;
function getTodoDates(ruleId, todoConfig) {
    const createdDate = getCreatedDate();
    const todoDates = {
        createdDate: createdDate.getTime(),
    };
    const daysToDecay = getDaysToDecay(ruleId, todoConfig);
    if (daysToDecay === null || daysToDecay === void 0 ? void 0 : daysToDecay.warn) {
        todoDates.warnDate = addDays(createdDate, daysToDecay.warn).getTime();
    }
    if (daysToDecay === null || daysToDecay === void 0 ? void 0 : daysToDecay.error) {
        todoDates.errorDate = addDays(createdDate, daysToDecay.error).getTime();
    }
    return todoDates;
}
function getRange(loc) {
    var _a, _b;
    return {
        start: {
            line: loc.line,
            column: loc.column,
        },
        end: {
            // eslint-disable-next-line unicorn/no-null
            line: (_a = loc.endLine) !== null && _a !== void 0 ? _a : loc.line,
            // eslint-disable-next-line unicorn/no-null
            column: (_b = loc.endColumn) !== null && _b !== void 0 ? _b : loc.column,
        },
    };
}
function getDaysToDecay(ruleId, todoConfig) {
    if (!todoConfig) {
        return;
    }
    if ((todoConfig === null || todoConfig === void 0 ? void 0 : todoConfig.daysToDecayByRule) && todoConfig.daysToDecayByRule[ruleId]) {
        return todoConfig.daysToDecayByRule[ruleId];
    }
    else if (todoConfig === null || todoConfig === void 0 ? void 0 : todoConfig.daysToDecay) {
        return todoConfig.daysToDecay;
    }
}
function getCreatedDate() {
    const date = process.env.TODO_CREATED_DATE ? new Date(process.env.TODO_CREATED_DATE) : new Date();
    return date_utils_1.getDatePart(date);
}
function addDays(createdDate, days) {
    const datePlusDays = new Date(createdDate.valueOf());
    datePlusDays.setDate(datePlusDays.getDate() + days);
    return datePlusDays;
}
//# sourceMappingURL=builders.js.map