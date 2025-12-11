# Angular Surveys - Style Guide

This document outlines the coding standards and best practices for the Angular Surveys project. We follow the official [Angular Style Guide](https://angular.dev/style-guide) with some project-specific conventions.

## Table of Contents

- [General Principles](#general-principles)
- [TypeScript](#typescript)
- [Angular Components](#angular-components)
- [Services](#services)
- [Naming Conventions](#naming-conventions)
- [File Organization](#file-organization)
- [Testing](#testing)
- [Git Workflow](#git-workflow)

## General Principles

### Consistency First

When in doubt, prefer consistency with the existing codebase over personal preference.

### Code Quality

- Write self-documenting code with clear variable and function names
- Keep functions small and focused (single responsibility)
- Avoid deep nesting (max 3 levels)
- Use TypeScript's type system to catch errors early

### Performance

- Use OnPush change detection where possible
- Implement trackBy functions for \*ngFor loops
- Unsubscribe from observables to prevent memory leaks
- Lazy load feature modules

## TypeScript

### Use Modern TypeScript Features

```typescript
// ✅ Good - Use const for immutable values
const MAX_RETRIES = 3;

// ❌ Bad - Don't use var
var count = 0;

// ✅ Good - Use arrow functions
const add = (a: number, b: number): number => a + b;

// ✅ Good - Use optional chaining
const userName = user?.profile?.name;

// ✅ Good - Use nullish coalescing
const displayName = userName ?? "Anonymous";
```

### Type Safety

```typescript
// ✅ Good - Explicit types
interface Survey {
  id: string;
  name: string;
  status: "draft" | "published";
}

// ❌ Bad - Using 'any'
function processSurvey(data: any) {}

// ✅ Good - Proper typing
function processSurvey(data: Survey): void {}
```

### Readonly and Protected Modifiers

```typescript
// ✅ Good - Use readonly for immutable properties
@Injectable({ providedIn: "root" })
export class AuthService {
  private readonly http = inject(HttpClient);
  readonly currentUser$ = this.userSubject.asObservable();
}

// ✅ Good - Use protected for template-only members
@Component({
  /* ... */
})
export class DashboardComponent {
  private readonly surveyApi = inject(SurveyApiService);

  protected surveys: Survey[] = [];

  protected async loadSurveys(): Promise<void> {
    this.surveys = await firstValueFrom(this.surveyApi.getAllSurveys());
  }
}
```

## Angular Components

### Dependency Injection

Use the `inject()` function instead of constructor injection:

```typescript
// ✅ Good - Use inject() function
@Component({
  /* ... */
})
export class MyComponent {
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);

  protected navigateHome(): void {
    this.router.navigate(["/"]);
  }
}

// ❌ Bad - Constructor injection (old style)
@Component({
  /* ... */
})
export class MyComponent {
  constructor(private router: Router, private authService: AuthService) {}
}
```

### Component Structure

Group Angular-specific properties before methods:

```typescript
@Component({
  /* ... */
})
export class SurveyBuilderComponent implements OnInit, OnDestroy {
  // 1. Injected dependencies (private, readonly)
  private readonly formState = inject(FormStateService);
  private readonly dialog = inject(MatDialog);
  private readonly destroy$ = new Subject<void>();

  // 2. Component properties (protected for template access)
  protected survey: Survey | null = null;
  protected isLoading = false;
  protected readonly questions$ = this.formState.questions$;

  // 3. Lifecycle hooks
  ngOnInit(): void {
    this.loadSurvey();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // 4. Public methods (if needed for parent components)

  // 5. Protected methods (template access)
  protected async saveSurvey(): Promise<void> {
    // Implementation
  }

  // 6. Private methods
  private loadSurvey(): void {
    // Implementation
  }
}
```

### Template Best Practices

```html
<!-- ✅ Good - Use trackBy for lists -->
<div *ngFor="let survey of surveys; trackBy: trackBySurvey">{{ survey.name }}</div>

<!-- ✅ Good - Use async pipe for observables -->
<div *ngIf="surveys$ | async as surveys">
  <div *ngFor="let survey of surveys">{{ survey.name }}</div>
</div>

<!-- ✅ Good - Use [class] binding over ngClass -->
<div [class.active]="isActive" [class.disabled]="isDisabled">
  <!-- ❌ Bad - Using ngClass unnecessarily -->
  <div [ngClass]="{'active': isActive, 'disabled': isDisabled}"></div>
</div>
```

### Lifecycle Hooks

Always implement the corresponding interface:

```typescript
// ✅ Good
export class MyComponent implements OnInit, OnDestroy {
  ngOnInit(): void {}
  ngOnDestroy(): void {}
}

// ❌ Bad - Missing interface
export class MyComponent {
  ngOnInit(): void {}
}
```

### Memory Management

Always unsubscribe from observables:

```typescript
// ✅ Good - Using takeUntil pattern
export class MyComponent implements OnInit, OnDestroy {
  private readonly destroy$ = new Subject<void>();

  ngOnInit(): void {
    this.dataService.getData()
      .pipe(takeUntil(this.destroy$))
      .subscribe(data => this.handleData(data));
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}

// ✅ Also good - Using async pipe (no manual unsubscribe needed)
protected readonly data$ = this.dataService.getData();
```

## Services

### Service Structure

```typescript
@Injectable({ providedIn: "root" })
export class SurveyApiService {
  // 1. Injected dependencies
  private readonly http = inject(HttpClient);

  // 2. Private properties
  private readonly apiUrl = environment.apiUrl;

  // 3. Public observables (readonly)
  readonly surveys$ = this.surveysSubject.asObservable();

  // 4. Constructor (if needed for initialization)
  constructor() {
    this.loadInitialData();
  }

  // 5. Public methods
  getAllSurveys(): Observable<Survey[]> {
    return this.http.get<Survey[]>(`${this.apiUrl}/surveys`);
  }

  // 6. Private methods
  private loadInitialData(): void {
    // Implementation
  }
}
```

### Error Handling

```typescript
// ✅ Good - Proper error handling
getSurvey(id: string): Observable<Survey> {
  return this.http.get<Survey>(`${this.apiUrl}/surveys/${id}`).pipe(
    catchError(error => {
      console.error('Failed to load survey:', error);
      return throwError(() => new Error('Survey not found'));
    })
  );
}
```

## Naming Conventions

### Files

```
// ✅ Good - Kebab-case with type suffix
survey-builder.component.ts
auth.service.ts
survey-api.service.ts
auth.guard.ts

// ❌ Bad
SurveyBuilder.ts
authService.ts
```

### Classes and Interfaces

```typescript
// ✅ Good - PascalCase
export class SurveyBuilderComponent {}
export interface Survey {}
export class AuthService {}

// ❌ Bad
export class surveyBuilder {}
export interface survey {}
```

### Constants

```typescript
// ✅ Good - UPPER_SNAKE_CASE for true constants
const MAX_FILE_SIZE = 10 * 1024 * 1024;
const API_BASE_URL = "https://api.example.com";

// ✅ Good - camelCase for configuration objects
const defaultSurveyConfig = {
  maxPages: 10,
  allowAnonymous: true,
};
```

### Functions and Variables

```typescript
// ✅ Good - camelCase
const userName = "John";
function calculateTotal(): number {}
const isValid = true;

// ❌ Bad
const UserName = "John";
function CalculateTotal(): number {}
```

### Component Selectors

```typescript
// ✅ Good - Use app prefix with kebab-case
@Component({
  selector: 'app-survey-builder'
})

// ❌ Bad
@Component({
  selector: 'surveyBuilder'
})
```

## File Organization

### Module Structure

```
feature-module/
├── components/
│   ├── feature-list/
│   │   ├── feature-list.component.ts
│   │   ├── feature-list.component.html
│   │   ├── feature-list.component.scss
│   │   └── feature-list.component.spec.ts
│   └── feature-detail/
├── services/
│   └── feature.service.ts
├── models/
│   └── feature.model.ts
├── feature-routing.module.ts
└── feature.module.ts
```

### Import Order

```typescript
// 1. Angular core imports
import { Component, OnInit, inject } from "@angular/core";
import { Router } from "@angular/router";

// 2. Third-party imports
import { Observable } from "rxjs";
import { map, filter } from "rxjs/operators";

// 3. Application imports
import { AuthService } from "@app/core/services/auth.service";
import { Survey } from "@app/shared/models/survey.model";
```

## Testing

### Unit Tests

```typescript
describe("SurveyBuilderComponent", () => {
  let component: SurveyBuilderComponent;
  let fixture: ComponentFixture<SurveyBuilderComponent>;
  let mockSurveyService: jasmine.SpyObj<SurveyService>;

  beforeEach(async () => {
    mockSurveyService = jasmine.createSpyObj("SurveyService", ["getSurvey"]);

    await TestBed.configureTestingModule({
      declarations: [SurveyBuilderComponent],
      providers: [{ provide: SurveyService, useValue: mockSurveyService }],
    }).compileComponents();

    fixture = TestBed.createComponent(SurveyBuilderComponent);
    component = fixture.componentInstance;
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  it("should load survey on init", () => {
    const mockSurvey = { id: "1", name: "Test Survey" };
    mockSurveyService.getSurvey.and.returnValue(of(mockSurvey));

    component.ngOnInit();

    expect(mockSurveyService.getSurvey).toHaveBeenCalled();
  });
});
```

### Test Coverage

- Aim for >80% code coverage
- Focus on critical business logic
- Test edge cases and error scenarios
- Use meaningful test descriptions

## Git Workflow

### Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```bash
# ✅ Good
feat: add drag-and-drop for survey questions
fix: resolve memory leak in survey builder
docs: update README with deployment instructions
refactor: migrate to inject() function per style guide
test: add unit tests for auth service

# ❌ Bad
updated stuff
fixed bug
changes
```

### Branch Naming

```bash
# ✅ Good
feature/advanced-analytics
fix/survey-validation-bug
refactor/inject-migration
docs/architecture-guide

# ❌ Bad
my-changes
updates
fix
```

### Pull Requests

- Keep PRs focused and small
- Write clear descriptions
- Link related issues
- Request reviews from relevant team members
- Ensure CI passes before merging

## Code Review Checklist

- [ ] Follows Angular style guide
- [ ] Uses `inject()` for dependency injection
- [ ] Proper use of `protected` and `readonly` modifiers
- [ ] No memory leaks (observables unsubscribed)
- [ ] Proper error handling
- [ ] Tests included and passing
- [ ] No console.log statements in production code
- [ ] Accessibility considerations (ARIA labels, keyboard navigation)
- [ ] Responsive design (mobile-friendly)
- [ ] Performance optimizations (OnPush, trackBy, etc.)

## Resources

- [Angular Style Guide](https://angular.dev/style-guide)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [RxJS Best Practices](https://rxjs.dev/guide/overview)
- [Angular Material Guidelines](https://material.angular.io/guide/getting-started)

---

_Last Updated: December 2024_
