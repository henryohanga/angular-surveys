# Angular Surveys

A modern, component-based survey builder for Angular applications. Create beautiful, interactive surveys with drag-and-drop ease, conditional logic, and real-time preview.

> This project is a modern translation of the original [angular-surveys](https://github.com/mwasiluk/angular-surveys) by Marcin Wasiluk, rebuilt for Angular 18 with Material Design.

![Angular Surveys](https://img.shields.io/badge/Angular-18-red?style=flat-square)
![Material Design](https://img.shields.io/badge/Material-Design-blue?style=flat-square)
![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)

## ✨ Features

### Survey Builder

- **Drag & Drop Interface** - Intuitive drag-and-drop to arrange questions and pages
- **10+ Question Types** - Text, textarea, radio, checkbox, dropdown, rating scale, grid, priority, date, time
- **Live Preview** - Preview your survey in real-time as you build
- **Page Management** - Create multi-page surveys with custom page names

### Conditional Logic

- **Page Flow Control** - Define which page to show next based on responses
- **Answer-Based Branching** - Skip logic based on selected answers
- **Required Fields** - Mark questions as required with validation

### Data Management

- **JSON Import/Export** - Export surveys as JSON, import existing definitions
- **Local Storage** - Auto-save progress to browser storage
- **File Upload** - Upload JSON files directly

### Modern UI

- **Material Design** - Clean, accessible UI with Angular Material
- **Responsive Layout** - Works on desktop, tablet, and mobile
- **Dark/Light Theme** - Customizable theme colors

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/henryohanga/angular-surveys.git

# Navigate to project directory
cd angular-surveys

# Install dependencies
npm install

# Start development server
npm run start
```

Open `http://localhost:4200` in your browser.

## 📖 Usage

### Routes

| Route      | Description                         |
| ---------- | ----------------------------------- |
| `/`        | Landing page with features overview |
| `/builder` | Survey builder interface            |
| `/surveys` | Survey runner/preview               |

### Building a Survey

1. Navigate to `/builder`
2. Drag question types from the left panel to the form area
3. Click on a question to edit its properties in the right panel
4. Add pages using the "Add Page" button
5. Configure page flow and conditions as needed
6. Click "Preview" to test your survey
7. Export as JSON or save/publish

### Question Types

| Type       | Description                            |
| ---------- | -------------------------------------- |
| `text`     | Single-line text input                 |
| `textarea` | Multi-line text area                   |
| `radio`    | Single selection from options          |
| `checkbox` | Multiple selection from options        |
| `select`   | Dropdown selection                     |
| `scale`    | Numeric rating scale (1-5, 1-10, etc.) |
| `grid`     | Matrix/grid with rows and columns      |
| `priority` | Drag-to-rank priority list             |
| `date`     | Date picker                            |
| `time`     | Time picker                            |

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
# Development server
npm run start

# Build for production
npm run build

# Run unit tests
npm run test

# Run e2e tests
npm run e2e

# Lint code
npm run lint
```

### Project Structure

```
src/app/
├── builder/           # Survey builder components
│   ├── builder.component.*
│   ├── question-editor.component.*
│   └── survey-preview-dialog.component.ts
├── home/              # Landing page
│   └── home.component.*
├── surveys/           # Survey runner & question components
│   ├── components/    # Individual question type components
│   ├── survey.component.*
│   └── models.ts      # TypeScript interfaces
└── app.module.ts      # Root module
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
