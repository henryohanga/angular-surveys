# Premium Flow Submodule Setup

This document describes how to set up and integrate the premium "Question by Question" flow feature, which is hosted in a separate private repository.

## Overview

The **Question by Question** answering flow is a premium feature that allows survey respondents to navigate through surveys one question at a time, while still respecting jump rules and conditional logic.

This feature is implemented as a Git submodule to:

- Keep the premium code in a private repository
- Allow independent versioning and releases
- Enable licensing and access control

## Repository Structure

```
angular-surveys/
├── apps/
│   ├── web/                    # Main web application (open source)
│   ├── api/                    # Backend API (open source)
│   └── premium-flow/           # Premium submodule (private)
│       ├── src/
│       │   ├── lib/
│       │   │   ├── question-flow.component.ts
│       │   │   ├── question-flow.service.ts
│       │   │   └── question-flow.module.ts
│       │   └── index.ts
│       ├── package.json
│       └── README.md
```

## Initial Setup (For Repository Maintainers)

### 1. Create the Private Repository

```bash
# Create a new private repository on GitHub
# Repository name: angular-surveys-premium-flow
# Make sure it's set to PRIVATE
```

### 2. Initialize the Submodule

```bash
# From the main angular-surveys directory
cd /path/to/angular-surveys

# Add the submodule (already configured in .gitmodules)
git submodule add git@github.com:henryohanga/angular-surveys-premium-flow.git apps/premium-flow

# Initialize and fetch the submodule
git submodule update --init --recursive
```

### 3. Set Up the Premium Flow App

The premium-flow app should be an Angular library that exports:

- `QuestionFlowComponent` - The main component for question-by-question navigation
- `QuestionFlowService` - Service to manage question flow state and jump rules
- `QuestionFlowModule` - NgModule for easy integration

## For Contributors/Developers

### Cloning with Submodules

If you have access to the premium repository:

```bash
# Clone with submodules
git clone --recurse-submodules git@github.com:henryohanga/angular-surveys.git

# Or if you already cloned without submodules:
git submodule update --init --recursive
```

### Without Premium Access

If you don't have access to the premium repository, the application will still work with the default "continuous" flow. The premium flow option will be visible but won't function until the submodule is properly set up.

## Integration Points

### 1. Survey Settings

The answering flow is configured in the survey settings:

```typescript
interface SurveySettings {
  // ... other settings
  answeringFlow?: "continuous" | "question-by-question";
}
```

### 2. Public Survey Component

The `PublicSurveyComponent` checks the answering flow setting and renders either:

- The standard page-by-page flow (continuous)
- The premium question-by-question flow

### 3. Feature Detection

```typescript
// Check if premium flow is available
import { isPremiumFlowAvailable } from "@angular-surveys/premium-flow";

if (settings.answeringFlow === "question-by-question" && isPremiumFlowAvailable()) {
  // Use premium flow
} else {
  // Fall back to continuous flow
}
```

## Licensing

The premium flow feature requires a valid license. Contact the repository maintainers for licensing options.

## Troubleshooting

### Submodule Not Initializing

```bash
# Reset and reinitialize
git submodule deinit -f apps/premium-flow
git submodule update --init apps/premium-flow
```

### Permission Denied

Ensure you have:

1. SSH keys configured for GitHub
2. Access granted to the private repository
3. Correct repository URL in `.gitmodules`
