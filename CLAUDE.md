# Frontend Design Rules

## General style

- Build polished, production-quality interfaces.
- Do not create generic AI-looking layouts.
- Prioritize visual hierarchy, alignment, spacing, and consistency.
- Follow the provided screenshot exactly when a reference image exists.
- Do not redesign or add unnecessary elements without permission.
- Do not use emojis as interface icons.
- Do not use gradients unless they appear in the reference design.
- Avoid excessive shadows and rounded cards.

## Layout

- Use a consistent 8px spacing system.
- Main page maximum width: 1440px.
- Keep header, sidebar, content, and form sections visually aligned.
- Avoid large empty spaces unless present in the reference.
- Use CSS Grid or Flexbox appropriately.
- Ensure the layout works at 1440px, 1280px, 1024px, and mobile width.

## Typography

- Use Inter or the font already configured in the project.
- Page title: 24px–28px, font-weight 600.
- Section title: 18px–20px, font-weight 600.
- Body text: 14px–16px.
- Secondary text: 12px–14px.
- Avoid overly bold text.

## Colors

- Use CSS variables for all major colors.
- Do not invent new colors inside individual components.
- Use neutral gray colors for borders and secondary text.
- Maintain sufficient text contrast.
- Active states must use the project's primary color.

## Components

- Reuse existing components before creating new ones.
- Separate Header, Sidebar, Navbar, Button, Input, Table and Modal components.
- Buttons, inputs, cards and tables must share consistent dimensions.
- Add hover, active, focus, disabled and error states.
- Use a consistent icon library throughout the project.

## CSS quality

- Do not use excessive absolute positioning.
- Do not hard-code layout using many arbitrary pixel values.
- Do not duplicate CSS.
- Use design tokens for spacing, radius, shadow, color and typography.
- Keep component files readable and maintainable.

## Workflow

Before implementing a UI:

1. Inspect the existing project structure.
2. Analyze the reference screenshot.
3. Describe the layout and design system.
4. List files that need to be created or modified.
5. Implement the UI.
6. Run the project and fix errors.
7. Perform a visual audit against the reference.