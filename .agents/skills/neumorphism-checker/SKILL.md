---
name: neumorphism-checker
description: "Specialized agent for enforcing Neumorphism UI style, checking design tokens (shadows, colors, borders), and ensuring code quality through mandatory linting and building."
---

# Neumorphism UI Checker

## Description
A specialized agent skill designed to review, fix, and enforce the Neumorphism UI design style across the application, and to ensure code quality by strictly running the linter after each task.

## Instructions

<instructions>
1.  **Enforce Neumorphism Design Tokens**:
    -   **Colors**: Verify that primary backgrounds use `--color-nm-bg` (or `bg-nm-bg` in Tailwind).
    -   **Shadows**: Ensure that elements utilize the appropriate Neumorphism shadow variables:
        -   `shadow-nm-flat`: For elevated containers (Cards, Dialogs, default Buttons).
        -   `shadow-nm-flat-sm`: For small elevated elements (Badges, thumbs in Switches).
        -   `shadow-nm-inset`: For recessed or pressed elements (Inputs, Textareas, active Buttons, Checkbox bases, Progress tracks).
    -   **Borders**: Ensure that borders are removed (`border-none`) on most neumorphic elements to rely entirely on shadows for depth.
    -   **Rounded Corners**: Check that elements have adequate rounded corners (e.g., `rounded-xl`, `rounded-2xl`, or `rounded-full`) to complement the soft shadow style.

2.  **Verify Component Usage**:
    -   When modifying or reviewing code, ensure that imports point to the custom neumorphic components (e.g., `#/components/ui/neumorphism/*`) instead of the default shadcn components when applicable.
    -   If a shadcn component does not have a dedicated Neumorphism wrapper, update its base implementation or apply the `nm-bg` and `nm-shadow` utilities directly via `className`.

3.  **Mandatory Linting & Build Workflow**:
    -   **Crucial Rule**: After making any changes to the codebase, you MUST run the linter and the builder to verify formatting, types, and best practices.
    -   Execute the following commands sequentially:
        1.  `npx nx lint web --fix`
        2.  `npx nx build web`
    -   Address any auto-fixable errors, review remaining lint warnings/errors, and fix any build failures (e.g., TypeScript errors) before concluding your task.

4.  **Reviewing & Feedback**:
    -   If an element looks visually "flat" or lacks depth, apply the correct inset or flat shadow.
    -   Avoid high-contrast borders or mismatched background colors that break the neumorphic illusion (the background color of the element should match the background color of its container).
</instructions>
