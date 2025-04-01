"use strict";
/**
 * This is a test file to verify TypeScript type definitions
 * It's not meant to be executed, just to check that types are working correctly
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const json_deep_compare_1 = __importDefault(require("json-deep-compare"));
// Test constructor with options
const options = {
    ignoredKeys: ['createdAt', 'updatedAt'],
    equivalentValues: {
        'booleanTypes': [true, 'true', 1],
        'emptyValues': [null, undefined, '']
    },
    regexChecks: {
        'email': /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
        'phone': '\\+\\d{1,3}-\\d{3,14}',
    },
    strictTypes: true,
    ignoreExtraKeys: false,
    matchKeysByName: true
};
// Create instance with and without options
const compareWithOptions = new json_deep_compare_1.default(options);
const compareWithoutOptions = new json_deep_compare_1.default();
// Test objects
const obj1 = {
    id: 1,
    name: "Product",
    price: 19.99
};
const obj2 = {
    id: "1",
    name: "Product",
    price: "19.99"
};
// Test compare method
const result = compareWithOptions.compare(obj1, obj2);
// Access result properties
const matchPercentage = result.summary.matchPercentage;
const totalMatched = result.summary.totalMatched;
// Check if there are type mismatches
if (result.unmatched.types.length > 0) {
    const typeMismatch = result.unmatched.types[0];
    console.log(`Path: ${typeMismatch.path}`);
    console.log(`Expected: ${typeMismatch.expected}, Actual: ${typeMismatch.actual}`);
}
// Test compareAndValidate method
const validationResult = compareWithOptions.compareAndValidate(obj1, obj2);
// Test validate method
const singleObjValidation = compareWithOptions.validate(obj1);
// Test getOptions method
const currentOptions = compareWithOptions.getOptions();
