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
  static getAllPaths(obj) {
    var currentPath = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';
    var paths = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : [];
    if (obj === null || typeof obj !== 'object') {
      paths.push(currentPath);
      return paths;
    }
    if (Array.isArray(obj)) {
      if (obj.length === 0) {
        paths.push(currentPath);
      } else {
        for (var i = 0; i < obj.length; i++) {
          var newPath = currentPath ? "".concat(currentPath, "[").concat(i, "]") : "[".concat(i, "]");
          PathUtils.getAllPaths(obj[i], newPath, paths);
        }
      }
    } else {
      var keys = Object.keys(obj);
      if (keys.length === 0) {
        paths.push(currentPath);
      } else {
        for (var key of keys) {
          var _newPath = currentPath ? "".concat(currentPath, ".").concat(key) : key;
          PathUtils.getAllPaths(obj[key], _newPath, paths);
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
    var parts = path.replace(/\[(\d+)\]/g, '.$1').split('.');
    var current = obj;
    for (var part of parts) {
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
    var _path$split$pop;
    return (_path$split$pop = path.split('.').pop()) === null || _path$split$pop === void 0 ? void 0 : _path$split$pop.split('[')[0];
  }

  /**
   * Build a new path by combining a base path and a key
   * @param {string} path - Base path
   * @param {string} key - Key to add
   * @returns {string} New path
   */
  static buildPath(path, key) {
    return path ? "".concat(path, ".").concat(key) : key;
  }

  /**
   * Build a new path for an array item
   * @param {string} path - Base path
   * @param {number} index - Array index
   * @returns {string} New path
   */
  static buildArrayPath(path, index) {
    return "".concat(path, "[").concat(index, "]");
  }
}
module.exports = PathUtils;