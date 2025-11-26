# AngularSurveys

Angular 18 application that implements a survey/form builder and renderer inspired by Google Forms.

This project modernizes an older Angular-based idea with a clean JSON schema, an accessible UI, and a path to extend into a full-featured builder. It uses Angular Material and Playwright for e2e.

## Getting Started

- Install dependencies: `npm install`
- Run dev server: `npm run start` and open `http://localhost:4200/`
- Lint: `npm run lint`
- Unit tests: `npm run test -- --watch=false`
- E2E tests: `npm run e2e`
- Build: `npm run build`
- Builder: open `http://localhost:4200/builder`

## Features

- JSON-driven survey schema: pages and questions (`text`, `textarea`, `radio`, `checkbox`)
- Accessible keyboard interactions and Material components
- Unit tests with Karma/Jasmine and e2e tests with Playwright
- Dynamic question registry for pluggable question types
- Multi-page navigation with branching page flow (`goToPage`)

## Roadmap

- Add `grid` and `priority` question types
- Implement page flow and multi-page navigation
- Build a drag-and-drop form builder UI

## Contributing

We welcome issues and PRs. See `CONTRIBUTING.md` for guidelines.

## Code of Conduct

Please adhere to our `CODE_OF_CONDUCT.md`.

## License

MIT

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 10.0.0.

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `--prod` flag for a production build.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via [Protractor](http://www.protractortest.org/).

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI README](https://github.com/angular/angular-cli/blob/master/README.md).
