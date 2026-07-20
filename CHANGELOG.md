# Changelog

# [1.4.0](https://github.com/henryohanga/angular-surveys/compare/v1.3.2...v1.4.0) (2026-07-20)


### Features

* **auth:** add CP-Auth organization roles and update CurrentUser interface ([202e958](https://github.com/henryohanga/angular-surveys/commit/202e9584abfe63951e7afafa52da19d69131cb0f))

## [1.3.2](https://github.com/henryohanga/angular-surveys/compare/v1.3.1...v1.3.2) (2026-07-20)


### Bug Fixes

* **libs:** add publish:libs script for correct npm publish from dist ([eace2cf](https://github.com/henryohanga/angular-surveys/commit/eace2cfc7f926e81493ba2a4912f792fe526fb88))

## [1.3.1](https://github.com/henryohanga/angular-surveys/compare/v1.3.0...v1.3.1) (2026-07-20)


### Bug Fixes

* **libs:** redirect npm publish to compiled dist via publishConfig.directory ([8cacd67](https://github.com/henryohanga/angular-surveys/commit/8cacd6794bb819c21910ab3102a207c301349649))

# [1.3.0](https://github.com/henryohanga/angular-surveys/compare/v1.2.1...v1.3.0) (2026-07-20)


### Bug Fixes

* **ci:** resolve lint and test failures blocking release pipeline ([2c299ef](https://github.com/henryohanga/angular-surveys/commit/2c299ef47a94f85624743b4f74964b37513ecda5))
* **libs:** enable partial compilation and public publish config ([e96f385](https://github.com/henryohanga/angular-surveys/commit/e96f3859b6921442df3f5e6ebaeeeb7495fb22b0))


### Features

* add survey renderer components and services ([94d2257](https://github.com/henryohanga/angular-surveys/commit/94d225747847a67554c7f54746e13a38088da7fe))
* **auth:** enhance authentication flow with workspace support and identity validation ([2fba392](https://github.com/henryohanga/angular-surveys/commit/2fba392ba5c8efcb31c755baa59f4ed48c0751b4))
* **shared-types:** add shared TypeScript interfaces and types for Angular Surveys ([a8e9d9b](https://github.com/henryohanga/angular-surveys/commit/a8e9d9b15c5fe7208e9f1a69832eeed6b5e56444))

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.2.0] - 2024-12-11

### Added

- Comprehensive documentation suite (ARCHITECTURE.md, STYLE_GUIDE.md, ROADMAP.md)
- Angular Style Guide compliance across the codebase
- Protected and readonly modifiers for proper encapsulation
- Memory leak prevention with takeUntil pattern
- Enhanced TypeScript type safety

### Changed

- **BREAKING**: Migrated from constructor injection to `inject()` function
- Refactored all components to use protected members for template access
- Updated to Angular 21 and NestJS 11
- Improved component structure with grouped Angular properties
- Enhanced README with documentation links and code quality badges

### Fixed

- TypeScript errors in builder component (null vs undefined handling)
- Memory leaks in AppComponent subscription management
- Proper cleanup in OnDestroy lifecycle hooks

### Performance

- Implemented OnPush change detection strategy where applicable
- Added trackBy functions for optimized list rendering
- Improved dependency injection with readonly modifiers

## [1.1.0] - 2024-11-15

### Added

- Analytics dashboard with charts and statistics
- Response export to CSV
- Survey templates (Customer Satisfaction, Employee Feedback, etc.)
- Public survey sharing with short URLs
- Survey status management (draft/published)

### Changed

- Upgraded to Angular 18
- Improved Material Design 3 theming
- Enhanced mobile responsiveness

### Fixed

- Grid question rendering issues
- File upload validation
- Survey preview synchronization

## [1.0.0] - 2024-10-01

### Added

- Initial release
- 18+ question types (text, choice, advanced, media)
- Drag & drop survey builder
- Multi-page surveys with conditional logic
- JWT authentication
- PostgreSQL database integration
- Docker deployment support
- IndexedDB local storage
- Material Design UI
- Real-time survey preview
- Response collection and storage

### Features

- Survey creation and management
- Question types: text, textarea, email, phone, number, URL, date, time
- Choice types: radio, checkbox, select
- Advanced types: scale, rating, NPS, grid, priority
- Media types: file upload, signature
- Page flow control and skip logic
- Survey dashboard
- Response analytics

[1.2.0]: https://github.com/henryohanga/angular-surveys/compare/v1.1.0...v1.2.0
[1.1.0]: https://github.com/henryohanga/angular-surveys/compare/v1.0.0...v1.1.0
[1.0.0]: https://github.com/henryohanga/angular-surveys/releases/tag/v1.0.0
