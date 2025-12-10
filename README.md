# Angular Surveys

A modern, full-stack survey platform built with Angular and NestJS. Create beautiful, interactive surveys with an intuitive drag-and-drop interface, 18+ question types, real-time preview, and seamless data management.

> This project is a modern evolution of the original [angular-surveys](https://github.com/mwasiluk/angular-surveys) by Marcin Wasiluk, completely rebuilt as an Nx monorepo with Angular 18, NestJS backend, and PostgreSQL.

![Angular Surveys](https://img.shields.io/badge/Angular-18-red?style=flat-square)
![NestJS](https://img.shields.io/badge/NestJS-10-red?style=flat-square)
![Nx](https://img.shields.io/badge/Nx-Monorepo-blue?style=flat-square)
![Material Design](https://img.shields.io/badge/Material-Design-blue?style=flat-square)
![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)
![Question Types](https://img.shields.io/badge/Question%20Types-18+-purple?style=flat-square)

## ✨ Features

### Survey Builder

- **Drag & Drop Interface** - Intuitive drag-and-drop to arrange questions and pages
- **18+ Question Types** - Comprehensive question types for any survey need
- **Premium Question Dialog** - Modern, categorized question editor with live configuration
- **Live Preview** - Preview your survey in real-time with device toggle (desktop/mobile)
- **Multi-Page Surveys** - Create unlimited pages with custom names and descriptions
- **Survey Dashboard** - Manage all your surveys in one place with save/publish workflow

### Question Types

- **Input Types** - Short text, long text, email, phone, number, URL, date, time
- **Choice Types** - Multiple choice (radio), checkboxes, dropdown select
- **Advanced Types** - Rating scale, star rating, NPS (Net Promoter Score), matrix grid, ranking/priority
- **Media Types** - File upload (images, documents, video), signature capture

### Conditional Logic

- **Page Flow Control** - Define which page to show next based on responses
- **Answer-Based Branching** - Skip logic based on selected answers
- **Required Fields** - Mark questions as required with built-in validation
- **Field Validation** - Email, phone, URL, and custom validation patterns

### Data Management

- **IndexedDB Storage** - Persistent survey storage in browser database
- **JSON Import/Export** - Export surveys as JSON, import existing definitions
- **Auto-Save** - Automatic progress saving as you build
- **Survey Templates** - Quick start with pre-built templates

### Modern UI

- **Material Design 3** - Clean, accessible UI with Angular Material components
- **Responsive Layout** - Optimized for desktop, tablet, and mobile
- **Premium Dialogs** - Beautiful, responsive modal dialogs for editing and preview
- **Visual Question Cards** - Clear visual separation with colored accents and hover effects

## 🚀 Getting Started

### Prerequisites

- Node.js 20+
- npm or yarn
- Docker & Docker Compose (for database)
- PostgreSQL 16+ (or use Docker)

### Installation

```bash
# Clone the repository
git clone https://github.com/henryohanga/angular-surveys.git

# Navigate to project directory
cd angular-surveys

# Install dependencies
npm install

# Start PostgreSQL with Docker
docker-compose up -d postgres

# Copy environment file
cp .env.example .env.local

# Start the API (in one terminal)
npm run start:api

# Start the web app (in another terminal)
npm run start
```

- **Web App:** `http://localhost:4200`
- **API:** `http://localhost:3000/api`
- **API Docs:** `http://localhost:3000/api/docs`

## 📖 Usage

### Routes

| Route          | Description                           |
| -------------- | ------------------------------------- |
| `/`            | Landing page with features overview   |
| `/dashboard`   | Survey management dashboard           |
| `/builder`     | Survey builder interface (new survey) |
| `/builder/:id` | Edit existing survey                  |
| `/surveys`     | Demo survey runner/preview            |

### Building a Survey

1. Navigate to `/dashboard` and click "Create Survey"
2. Use the left toolbox to drag question types onto the canvas
3. Click "Add Question" button to open the question dialog
4. Configure question settings in the premium dialog interface
5. Add multiple pages using the page tabs
6. Click "Preview" to test your survey with device toggle
7. Save as draft or publish when ready

### Question Types

| Type        | Description                            | Category |
| ----------- | -------------------------------------- | -------- |
| `text`      | Single-line text input                 | Input    |
| `textarea`  | Multi-line text area                   | Input    |
| `email`     | Email address with validation          | Input    |
| `phone`     | Phone number input                     | Input    |
| `number`    | Numeric input with min/max/step        | Input    |
| `url`       | Website URL input                      | Input    |
| `date`      | Date picker                            | Input    |
| `time`      | Time picker                            | Input    |
| `radio`     | Single selection from options          | Choice   |
| `checkbox`  | Multiple selection from options        | Choice   |
| `select`    | Dropdown selection                     | Choice   |
| `scale`     | Numeric rating scale (1-5, 1-10, etc.) | Advanced |
| `rating`    | Star rating (1-5 stars)                | Advanced |
| `nps`       | Net Promoter Score (0-10)              | Advanced |
| `grid`      | Matrix/grid with rows and columns      | Advanced |
| `priority`  | Drag-to-rank priority list             | Advanced |
| `file`      | File upload (images, docs, video)      | Media    |
| `signature` | Signature capture pad                  | Media    |

### JSON Schema

```json
{
  "name": "My Survey",
  "description": "A sample survey",
  "pages": [
    {
      "id": "page-1",
      "number": 1,
      "name": "Introduction",
      "elements": [
        {
          "id": "q1",
          "type": "question",
          "question": {
            "id": "name",
            "text": "What is your name?",
            "type": "text",
            "required": true
          }
        }
      ],
      "pageFlow": {
        "nextPage": true
      }
    }
  ]
}
```

## 🛠️ Development

### Commands

```bash
# Start web app
npm run start

# Start API server
npm run start:api

# Start both (parallel)
npm run start:all

# Build for production
npm run build           # Web only
npm run build:api       # API only
npm run build:all       # All projects

# Run tests
npm run test            # Web tests
npm run test:api        # API tests
npm run test:all        # All tests

# Run e2e tests
npm run e2e

# Lint all projects
npm run lint

# View dependency graph
npm run graph

# Run affected commands (CI optimization)
npm run affected:build
npm run affected:test
npm run affected:lint
```

### Project Structure

```
angular-surveys/
├── apps/
│   ├── web/                     # Angular frontend
│   │   ├── src/
│   │   │   ├── app/
│   │   │   │   ├── builder/     # Survey builder module
│   │   │   │   ├── dashboard/   # Survey management
│   │   │   │   ├── home/        # Landing page
│   │   │   │   ├── surveys/     # Survey runner
│   │   │   │   ├── public-survey/ # Public survey view
│   │   │   │   └── core/        # Core services
│   │   │   └── environments/
│   │   └── e2e/                 # E2E tests (Playwright)
│   │
│   └── api/                     # NestJS backend
│       └── src/
│           └── app/
│               ├── auth/        # Authentication (JWT)
│               ├── users/       # User management
│               ├── surveys/     # Survey CRUD
│               ├── responses/   # Response handling
│               └── health/      # Health checks
│
├── libs/
│   └── shared-types/            # Shared TypeScript types
│       └── src/lib/
│           ├── survey.types.ts
│           ├── user.types.ts
│           ├── response.types.ts
│           └── api.types.ts
│
├── docker-compose.yml           # Local development services
├── nx.json                      # Nx configuration
└── package.json                 # Root package.json
```

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📜 Code of Conduct

Please adhere to our [Code of Conduct](CODE_OF_CONDUCT.md).

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Original [angular-surveys](https://github.com/mwasiluk/angular-surveys) by Marcin Wasiluk
- [Angular](https://angular.io/) team
- [Angular Material](https://material.angular.io/) team
