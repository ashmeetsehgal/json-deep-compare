/**
 * @fileoverview Path utilities for JSONCompare
 * @author AshmeetSehgal.com
 */

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
    if (obj === null || typeof obj !== 'object') {
      paths.push(currentPath);
      return paths;
    }

    if (Array.isArray(obj)) {
      if (obj.length === 0) {
        paths.push(currentPath);
      } else {
        for (let i = 0; i < obj.length; i++) {
          const newPath = currentPath ? `${currentPath}[${i}]` : `[${i}]`;
          PathUtils.getAllPaths(obj[i], newPath, paths);
        }
      }
    } else {
      const keys = Object.keys(obj);
      if (keys.length === 0) {
        paths.push(currentPath);
      } else {
        for (const key of keys) {
          const newPath = currentPath ? `${currentPath}.${key}` : key;
          PathUtils.getAllPaths(obj[key], newPath, paths);
        }
      }
    }

    return paths;
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
    return path ? `${path}.${key}` : key;
  }

  /**
   * Build a new path for an array item
   * @param {string} path - Base path
   * @param {number} index - Array index
   * @returns {string} New path
   */
  static buildArrayPath(path, index) {
    return `${path}[${index}]`;
  }
}

module.exports = PathUtils;