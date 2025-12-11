# Changelog

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
