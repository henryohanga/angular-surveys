# UX Deviations Log

This document records intentional deviations from the provided reference design for engineering feasibility, accessibility, and consistency.

## Header Bar
- Used a simple avatar button with initial instead of a user photo to avoid bundling assets. Replaceable with real profile image.

## Component Palette
- Mapped available types to existing engine: Short Answer→`text`, Paragraph→`textarea`, Multiple Choice→`radio`, Checkboxes→`checkbox`, Dropdown→`select`, Linear Scale→`scale`, Date→`date`, Time→`time`. File Upload omitted because the data model does not include it.

## Properties Panel
- Reused existing `QuestionEditorComponent` inside the right panel instead of a custom property inspector to prevent code duplication and ensure feature parity.

## Animations
- Implemented subtle fade-in for question cards. Heavier micro-interactions are deferred to avoid performance regressions.

## Responsive Behavior
- Collapses to single-column at `1024px`. Reference shows three columns at desktop; our breakpoints follow Angular Material baselines.

## Accessibility
- Added labels and focus outlines across controls. Some contrast tuning relies on Material defaults; further per-component audits can be added.

## Color Tokens
- Introduced CSS custom properties for primary and surfaces approximating the reference. Final brand tokens can be plugged in via theme update.

