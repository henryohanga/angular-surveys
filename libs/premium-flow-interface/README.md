# Premium Flow Interface

This library provides the interface and service facade for the premium "Question by Question" flow feature.

## Purpose

This library serves as the integration point between the main Angular Surveys application and the premium flow submodule. It provides:

1. **Interfaces** - Type definitions that the premium submodule must implement
2. **Injection Tokens** - DI tokens for providing the premium implementation
3. **Facade Service** - A service that wraps premium functionality with fallback behavior

## Usage

### Checking Premium Availability

```typescript
import { PremiumFlowService } from '@angular-surveys/premium-flow-interface';

@Component({...})
export class MyComponent {
  constructor(private premiumFlow: PremiumFlowService) {}

  ngOnInit() {
    if (this.premiumFlow.isPremiumFlowAvailable()) {
      // Premium flow is available
    }
  }
}
```

### Implementing Premium Flow (in premium-flow submodule)

The premium-flow submodule should provide implementations for:

```typescript
import { PREMIUM_FLOW_SERVICE, PREMIUM_FLOW_AVAILABLE, IPremiumFlowService } from "@angular-surveys/premium-flow-interface";

@NgModule({
  providers: [
    { provide: PREMIUM_FLOW_AVAILABLE, useValue: true },
    { provide: PREMIUM_FLOW_SERVICE, useClass: PremiumFlowServiceImpl },
  ],
})
export class PremiumFlowModule {}
```

## API

### `PremiumFlowService`

- `isPremiumFlowAvailable(): boolean` - Check if premium flow is installed and available
- `initialize(config): Observable<QuestionFlowState>` - Start a new question flow session
- `nextQuestion(): Observable<QuestionFlowState>` - Navigate to next question
- `previousQuestion(): Observable<QuestionFlowState>` - Navigate to previous question
- `submitResponse(questionId, response): Observable<QuestionFlowState>` - Submit an answer
- `getProgress(): Observable<QuestionFlowProgress>` - Get current progress

### Interfaces

- `IPremiumFlowService` - Interface for the premium service implementation
- `QuestionFlowConfig` - Configuration for initializing a flow
- `QuestionFlowState` - Current state of the question flow
- `QuestionFlowProgress` - Progress information
