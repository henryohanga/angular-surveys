# Angular Surveys

[![CI](https://github.com/henryohanga/angular-surveys/actions/workflows/ci.yml/badge.svg?branch=master)](https://github.com/henryohanga/angular-surveys/actions/workflows/ci.yml)

A modern, full-stack survey platform built with Angular and NestJS. Create beautiful, interactive surveys with an intuitive drag-and-drop interface, 18+ question types, real-time preview, and seamless data management.

> This project is a modern evolution of the original [angular-surveys](https://github.com/mwasiluk/angular-surveys) by Marcin Wasiluk, completely rebuilt as an Nx monorepo with Angular 21, NestJS backend, and PostgreSQL. **Fully compliant with the [Angular Style Guide](https://angular.dev/style-guide)**.

![Angular Surveys](https://img.shields.io/badge/Angular-21-red?style=flat-square)
![NestJS](https://img.shields.io/badge/NestJS-11-red?style=flat-square)
![Nx](https://img.shields.io/badge/Nx-22-blue?style=flat-square)
![Material Design](https://img.shields.io/badge/Material-Design%203-blue?style=flat-square)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue?style=flat-square)
![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)
![Question Types](https://img.shields.io/badge/Question%20Types-18+-purple?style=flat-square)
![Style Guide](https://img.shields.io/badge/Angular-Style%20Guide-green?style=flat-square)

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

### Developer Integration

- **Developer Mode** - Enable API access and webhook integrations at workspace level
- **Webhooks** - Real-time notifications when survey responses are submitted
- **External ID Mappings** - Map questions to your own field names for API payloads
- **API Credentials** - Secure API key/secret for webhook signature verification
- **Signature Verification** - HMAC-SHA256 signed webhook payloads for security

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

### Docker Deployment

Run the entire stack with Docker Compose:

```bash
# Copy environment file
cp .env.example .env

# Build and start all services
docker compose up

# Or run in detached mode
docker compose up -d
```

This starts:

- **Web App:** `http://localhost` (Caddy server)
- **API:** `http://localhost:3000`
- **PostgreSQL:** `localhost:5432`

For development with hot-reload:

```bash
docker compose -f docker-compose.dev.yml up
```

## 📖 Usage

### Routes

| Route            | Description                             |
| ---------------- | --------------------------------------- |
| `/`              | Landing page with features overview     |
| `/dashboard`     | Survey management dashboard             |
| `/builder`       | Survey builder interface (new survey)   |
| `/builder/:id`   | Edit existing survey                    |
| `/settings`      | User settings & developer configuration |
| `/s/:id`         | Public survey URL for respondents       |
| `/responses/:id` | View survey responses and analytics     |

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
│   │   ├── e2e/                 # E2E tests (Playwright)
│   │   ├── Dockerfile           # Web production build
│   │   └── Caddyfile            # Static file serving config
│   │
│   └── api/                     # NestJS backend
│       ├── src/
│       │   └── app/
│       │       ├── auth/        # Authentication (JWT)
│       │       ├── users/       # User management
│       │       ├── surveys/     # Survey CRUD
│       │       ├── responses/   # Response handling
│       │       ├── webhooks/    # Webhook management
│       │       └── health/      # Health checks
│       └── Dockerfile           # API production build
│
├── libs/
│   └── shared-types/            # Shared TypeScript types
│       └── src/lib/
│           ├── survey.types.ts
│           ├── user.types.ts
│           ├── response.types.ts
│           └── api.types.ts
│
├── docker-compose.yml           # Production Docker services
├── docker-compose.dev.yml       # Development Docker services
├── Caddyfile                    # Root Caddy configuration
├── nx.json                      # Nx configuration
└── package.json                 # Root package.json
```

## 📚 Documentation

- **[Architecture Guide](ARCHITECTURE.md)** - System architecture and design patterns
- **[Style Guide](STYLE_GUIDE.md)** - Coding standards and best practices
- **[Roadmap](ROADMAP.md)** - Planned features and bug fixes
- **[Contributing Guide](CONTRIBUTING.md)** - How to contribute to the project
- **[Code of Conduct](CODE_OF_CONDUCT.md)** - Community guidelines

## 🎯 Code Quality

This project follows the official [Angular Style Guide](https://angular.dev/style-guide) with modern best practices:

- ✅ **inject() function** for dependency injection
- ✅ **Protected/readonly modifiers** for proper encapsulation
- ✅ **OnPush change detection** for performance
- ✅ **Proper memory management** with takeUntil pattern
- ✅ **Type-safe** with TypeScript 5.9
- ✅ **Comprehensive testing** with Jest and Playwright
- ✅ **Nx monorepo** for scalable architecture

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) and [Style Guide](STYLE_GUIDE.md) for guidelines.

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Follow the [Style Guide](STYLE_GUIDE.md)
4. Commit your changes using [Conventional Commits](https://www.conventionalcommits.org/)
5. Push to the branch (`git push origin feature/amazing-feature`)
6. Open a Pull Request

## 📜 Code of Conduct

Please adhere to our [Code of Conduct](CODE_OF_CONDUCT.md).

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔌 Developer Integration

### Enabling Developer Mode

1. Navigate to **Settings** → **Profile** tab
2. Toggle **Enable Developer Mode**
3. Access **Developer** tab for API credentials

### Webhooks

Configure webhooks to receive real-time notifications:

```bash
# Create a webhook for a survey
POST /api/webhooks/survey/:surveyId
{
  "url": "https://your-server.com/webhook",
  "events": ["response.submitted"],
  "name": "My Webhook"
}
```

### Webhook Payload

```json
{
  "deliveryId": "uuid",
  "event": "response.submitted",
  "timestamp": "2024-01-15T10:30:00Z",
  "survey": {
    "id": "survey-id",
    "name": "Customer Feedback",
    "status": "published"
  },
  "response": {
    "id": "response-id",
    "submittedAt": "2024-01-15T10:30:00Z",
    "isComplete": true,
    "answers": { "q-1": "John Doe" }
  }
}
```

### Webhook Headers

| Header                | Description                             |
| --------------------- | --------------------------------------- |
| `X-Webhook-Signature` | HMAC signature for verification         |
| `X-Webhook-Event`     | Event type (e.g., `response.submitted`) |
| `X-Webhook-Delivery`  | Unique delivery ID                      |

### Question Mappings

Configure external IDs directly in the question editor:

1. Open a question in the builder
2. Expand **Developer Settings** section
3. Set **External ID** and **Field Name**
4. For choice questions, set **External Value** per option

### File Uploads / Media (AWS S3 + CloudFront)

File questions (`type: "file"`) support uploading media (images, documents, video, audio) to **AWS S3**, optionally served via **CloudFront**.

#### Environment variables

Backend uses these env vars (see `.env.example`):

- `AWS_REGION` – AWS region for S3 (e.g. `us-east-1`)
- `AWS_S3_BUCKET` – S3 bucket used for uploads (e.g. `angular-surveys-uploads`)
- `AWS_CLOUDFRONT_DOMAIN` – optional CloudFront domain used to expose files
- `MAX_FILE_SIZE_MB` – max file size per upload in MB (default: `10`)
- `ALLOWED_MIME_TYPES` – comma-separated list of allowed mime types (supports wildcards like `image/*`)

You must also configure AWS credentials (not in `.env.example`):

- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`

#### API endpoints

- `POST /api/uploads/presigned-url`

  - Auth: `Bearer` token (requires logged-in user)
  - Body:

    ```json
    {
      "surveyId": "uuid",
      "filename": "photo.png",
      "mimeType": "image/png",
      "size": 123456
    }
    ```

  - Response:

    ```json
    {
      "uploadUrl": "https://s3.amazonaws.com/...",
      "key": "surveys/survey-id/uuid-photo.png",
      "cdnUrl": "https://your-cloudfront-domain/surveys/survey-id/uuid-photo.png"
    }
    ```

- `POST /api/uploads/:surveyId`

  - Multipart upload (`file` field) for direct API uploads.

- `DELETE /api/uploads/:key(*)` – delete an uploaded file.
- `GET /api/uploads/download/:key(*)` – get a signed download URL.

#### Frontend behavior

- The **file question component** uses the uploads API to:
  - Request a presigned URL for each selected file.
  - Upload files directly from the browser to S3.
  - Store metadata on the response (filename, size, mime type, S3 key, CloudFront URL).
- Validation respects `required` + `MAX_FILE_SIZE_MB` + `ALLOWED_MIME_TYPES`.
- The UI shows upload progress, success (cloud icon), and error states per file.

When building integrations that consume survey responses (via API or webhooks), you can use the stored `cdnUrl`/`key` to fetch or serve uploaded media.

## 🗺️ Roadmap

See our [Roadmap](ROADMAP.md) for planned features and improvements:

- **Version 2.0** - Advanced question types, collaboration features, enhanced analytics
- **Version 1.5** - Template marketplace, integrations, response management
- **Future** - AI features, enterprise capabilities, mobile apps

## 🙏 Acknowledgments

- Original [angular-surveys](https://github.com/mwasiluk/angular-surveys) by Marcin Wasiluk
- [Angular](https://angular.io/) team for the excellent framework and style guide
- [Angular Material](https://material.angular.io/) team for Material Design components
- [Nx](https://nx.dev/) team for monorepo tooling
- All our [contributors](https://github.com/henryohanga/angular-surveys/graphs/contributors)
