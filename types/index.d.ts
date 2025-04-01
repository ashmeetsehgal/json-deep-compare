/**
 * Type definitions for json-deep-compare
 * @author AshmeetSehgal.com
 */

declare module 'json-deep-compare' {
  /**
   * Options for configuring JSONCompare behavior
   */
  export interface JSONCompareOptions {
    /**
     * Keys to ignore during comparison
     */
    ignoredKeys?: string[];
    
    /**
     * Values to treat as equivalent
     */
    equivalentValues?: Record<string, any[]>;
    
    /**
     * Regex patterns for value validation
     */
    regexChecks?: Record<string, RegExp | string>;
    
    /**
     * Whether to strictly compare types
     */
    strictTypes?: boolean;
    
    /**
     * Whether to ignore keys in obj2 that aren't in obj1
     */
    ignoreExtraKeys?: boolean;
    
    /**
     * Whether to match regex by key name instead of only by path
     */
    matchKeysByName?: boolean;
  }
  
  /**
   * Represents a result item for a matched key
   */
  export interface MatchedKey {
    path: string;
  }

  /**
   * Represents a result item for a matched value
   */
  export interface MatchedValue {
    path: string;
    value: any;
    type?: string;
    type1?: string;
    type2?: string;
    message?: string;
  }

  /**
   * Represents a result item for an unmatched key
   */
  export interface UnmatchedKey {
    path: string;
    value: any;
    message: string;
  }

  /**
   * Represents a result item for an unmatched value
   */
  export interface UnmatchedValue {
    path: string;
    expected: any;
    actual: any;
    expectedType?: string;
    actualType?: string;
    message: string;
  }

  /**
   * Represents a result item for an unmatched type
   */
  export interface UnmatchedType {
    path: string;
    expected: string;
    actual: string;
    message: string;
  }

  /**
   * Represents a result item for a passed regex check
   */
  export interface PassedRegexCheck {
    path: string;
    value: any;
    pattern: string | RegExp;
    matchedByName?: boolean;
  }

  /**
   * Represents a result item for a failed regex check
   */
  export interface FailedRegexCheck {
    path: string;
    value: any;
    pattern: string | RegExp;
    message: string;
    matchedByName?: boolean;
  }

  /**
   * Summary statistics for the comparison result
   */
  export interface ResultSummary {
    matchPercentage: number;
    totalKeysCompared: number;
    totalMatched: number;
    totalUnmatched: number;
    totalRegexChecks: number;
  }

  /**
   * Structured result of the JSONCompare operation
   */
  export interface JSONCompareResult {
    matched: {
      keys: string[];
      values: MatchedValue[];
    };
    unmatched: {
      keys: UnmatchedKey[];
      values: UnmatchedValue[];
      types: UnmatchedType[];
    };
    regexChecks: {
      passed: PassedRegexCheck[];
      failed: FailedRegexCheck[];
    };
    summary: ResultSummary;
  }

  /**
   * Main class for comparing JSON objects
   */
  export default class JSONCompare {
    /**
     * Creates a new JSONCompare instance
     * @param options - Configuration options
     */
    constructor(options?: JSONCompareOptions);
    
    /**
     * Compare two objects
     * @param obj1 - First object
     * @param obj2 - Second object
     * @returns Structured comparison result
     */
    compare(obj1: any, obj2: any): JSONCompareResult;
    
    /**
     * Compare two objects and validate against regex patterns
     * @param obj1 - First object
     * @param obj2 - Second object
     * @returns Structured comparison result with regex validation
     */
    compareAndValidate(obj1: any, obj2: any): JSONCompareResult;
    
    /**
     * Validate an object against regex patterns
     * @param obj - Object to validate
     * @returns Structured validation result
     */
    validate(obj: any): JSONCompareResult;
    
    /**
     * Get the current options
     * @returns Current options
     */
    getOptions(): JSONCompareOptions;
  }
}