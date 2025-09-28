/**
 * @fileoverview Path utilities for JSONCompare
 * @author AshmeetSehgal.com
 */

/**
 * Optimized path builder for reducing string concatenation overhead
 * @private
 */
class PathBuilder {
  constructor() {
    this.parts = [];
  }
  
  /**
   * Add a key to the path
   * @param {string} key - Key to add
   * @returns {PathBuilder} This instance for chaining
   */
  addKey(key) {
    this.parts.push(key);
    return this;
  }
  
  /**
   * Add an array index to the path
   * @param {number} index - Array index to add
   * @returns {PathBuilder} This instance for chaining
   */
  addIndex(index) {
    if (this.parts.length === 0) {
      this.parts.push(`[${index}]`);
    } else {
      this.parts[this.parts.length - 1] += `[${index}]`;
    }
    return this;
  }
  
  /**
   * Build the final path string
   * @returns {string} The constructed path
   */
  build() {
    return this.parts.join('.');
  }
  
  /**
   * Reset the builder for reuse
   * @returns {PathBuilder} This instance for chaining
   */
  reset() {
    this.parts.length = 0;
    return this;
  }
  
  /**
   * Get current depth (number of parts)
   * @returns {number} Current depth
   */
  depth() {
    return this.parts.length;
  }
}

/**
 * Class for path-related utility functions
 */
class PathUtils {
  /**
   * Get all paths in an object
   * @param {Object} obj - Object to get paths from
   * @param {string} [currentPath=''] - Current path being processed
   * @param {string[]} [paths=[]] - Array to collect paths
   * @returns {string[]} All paths in the object
   */
  static getAllPaths(obj, currentPath = '', paths = []) {
    return this._getAllPathsOptimized(obj, currentPath, paths);
  }

  /**
   * Optimized version of getAllPaths using PathBuilder for better performance
   * @param {Object} obj - Object to get paths from
   * @param {string} currentPath - Current path being processed
   * @param {string[]} paths - Array to collect paths
   * @param {PathBuilder} [pathBuilder] - Reusable path builder
   * @returns {string[]} All paths in the object
   * @private
   */
  static _getAllPathsOptimized(obj, currentPath = '', paths = [], pathBuilder = null) {
    if (obj === null || typeof obj !== 'object') {
      paths.push(currentPath);
      return paths;
    }

    // Use PathBuilder for deep objects to reduce string concatenation
    const useBuilder = !pathBuilder && typeof obj === 'object' && this._estimateDepth(obj) > 3;
    if (useBuilder) {
      pathBuilder = new PathBuilder();
      if (currentPath) {
        // Parse existing path into builder
        const parts = currentPath.split('.');
        for (const part of parts) {
          if (part.includes('[')) {
            const [key, ...indexParts] = part.split('[');
            if (key) pathBuilder.addKey(key);
            for (const indexPart of indexParts) {
              const index = parseInt(indexPart.replace(']', ''), 10);
              pathBuilder.addIndex(index);
            }
          } else {
            pathBuilder.addKey(part);
          }
        }
      }
    }

    if (Array.isArray(obj)) {
      if (obj.length === 0) {
        paths.push(currentPath);
      } else {
        for (let i = 0; i < obj.length; i++) {
          let newPath;
          if (useBuilder) {
            const currentDepth = pathBuilder.depth();
            pathBuilder.addIndex(i);
            newPath = pathBuilder.build();
            // Restore builder state
            pathBuilder.parts.length = currentDepth;
          } else {
            newPath = currentPath ? `${currentPath}[${i}]` : `[${i}]`;
          }
          this._getAllPathsOptimized(obj[i], newPath, paths, useBuilder ? pathBuilder : null);
        }
      }
    } else {
      const keys = Object.keys(obj);
      if (keys.length === 0) {
        paths.push(currentPath);
      } else {
        for (const key of keys) {
          let newPath;
          if (useBuilder) {
            const currentDepth = pathBuilder.depth();
            pathBuilder.addKey(key);
            newPath = pathBuilder.build();
            // Restore builder state for next iteration
            pathBuilder.parts.length = currentDepth;
          } else {
            newPath = currentPath ? `${currentPath}.${key}` : key;
          }
          this._getAllPathsOptimized(obj[key], newPath, paths, useBuilder ? pathBuilder : null);
        }
      }
    }

    return paths;
  }

  /**
   * Estimate the depth of an object to decide whether to use PathBuilder
   * @param {Object} obj - Object to estimate
   * @param {number} [maxDepth=5] - Maximum depth to check
   * @returns {number} Estimated depth
   * @private
   */
  static _estimateDepth(obj, maxDepth = 5) {
    if (maxDepth <= 0 || obj === null || typeof obj !== 'object') {
      return 0;
    }

    if (Array.isArray(obj)) {
      return obj.length > 0 ? 1 + this._estimateDepth(obj[0], maxDepth - 1) : 1;
    }

    const keys = Object.keys(obj);
    if (keys.length === 0) return 1;

    // Check first key for depth estimation
    return 1 + this._estimateDepth(obj[keys[0]], maxDepth - 1);
  }

  /**
   * Get value at a specific path in an object
   * @param {Object} obj - Object to traverse
   * @param {string} path - Path to the value
   * @returns {*} Value at the path
   */
  static getValueAtPath(obj, path) {
    const parts = path.replace(/\[(\d+)\]/g, '.$1').split('.');
    let current = obj;
    
    for (const part of parts) {
      if (current === null || typeof current !== 'object') {
        return undefined;
      }
      current = current[part];
    }
    
    return current;
  }

  /**
   * Extract key name from a path (last part after dot or array notation)
   * @param {string} path - Path to extract from
   * @returns {string} Key name
   */
  static getKeyNameFromPath(path) {
    return path.split('.').pop()?.split('[')[0];
  }

  /**
   * Build a new path by combining a base path and a key
   * @param {string} path - Base path
   * @param {string} key - Key to add
   * @returns {string} New path
   */
  static buildPath(path, key) {
    // Optimize for common cases
    if (!path) return key;
    if (!key) return path;
    
    // Use array join for better performance than template literals for long paths
    if (path.length > 50) {
      return [path, key].join('.');
    }
    return `${path}.${key}`;
  }

  /**
   * Build a new path for an array item
   * @param {string} path - Base path
   * @param {number} index - Array index
   * @returns {string} New path
   */
  static buildArrayPath(path, index) {
    // Optimize for common cases and cache small indices
    if (index < 10) {
      return path + '[' + index + ']';  // Faster than template literal for small numbers
    }
    return `${path}[${index}]`;
  }
}

module.exports = PathUtils;