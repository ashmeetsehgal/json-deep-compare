# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Open source community files (CODE_OF_CONDUCT.md, CONTRIBUTING.md, etc.)

### Changed
- Improved documentation for public repository

### Security
- Additional security policy documentation

## [2.0.2] - 2025-10-15

### Fixed
- **Critical cache collision fix**: Replaced truncated JSON-based cache keys with robust SHA256 hashing
- **Type differentiation**: Fixed cache collisions between different types (e.g., `1` vs `"1"`)
- **Circular reference handling**: Added safe serialization for objects with circular references
- **Non-JSON value support**: Proper handling of functions, symbols, BigInt, Date, RegExp, and Error objects

### Technical
- Implemented deterministic object key ordering for stable cache keys
- Added comprehensive type metadata in serialized form to prevent collisions
- Enhanced cache key generation with full-length SHA256 hashes
- Improved serializer with cycle-safe handling using Node.js crypto and util modules

## [2.0.1] - 2025-09-28

### Performance
- Added regex pattern caching to reduce compilation overhead by 25-35% for regex-heavy workloads
- Optimized string operations in PathUtils for better performance with deep objects
- Enhanced RegexValidator with pre-compiled patterns and improved validation flow
- Reduced memory allocation overhead in comparison operations

### Added
- Comprehensive performance optimization report documenting all improvements
- Summary count testing guide for validation accuracy

### Technical
- All functionality preserved with 100% backward compatibility
- Zero breaking changes - all existing tests pass
- Improved internal efficiency without changing public API

## [1.0.9] - 2025-04-06

### Added
- Initial public release version
- Deep comparison of JSON objects
- Advanced type checking
- Regex pattern validation
- Customizable comparison options
- TypeScript type definitions

### Fixed
- Path utility handling of array notation
- Type mismatch detection in non-strict mode