"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Handle Zod validation errors
 */
const handleZodError = (err) => {
    const errorSources = err.issues.map((issue) => {
        var _a;
        return ({
            path: String(((_a = issue === null || issue === void 0 ? void 0 : issue.path) === null || _a === void 0 ? void 0 : _a[issue.path.length - 1]) || ''),
            message: issue.message,
        });
    });
    return {
        statusCode: 400,
        message: 'Validation Error',
        errorSources,
    };
};
exports.default = handleZodError;
