# Copilot Instructions

## Tech Stack
- Framework: Next.js 16.2.1
- Styling: Tailwind CSS ^4
- Routing: App Router ONLY (`app/` directory only)

## Coding Conventions
- Default to Server Components.
- Use Tailwind CSS only for styling.
- Do not introduce other CSS frameworks or CSS-in-JS libraries unless explicitly requested.

## Known AI Mistakes (Must Avoid)
- Do not use `next/router`; always use `next/navigation`.
- Do not use Pages Router (`pages/` directory is prohibited).
- In App Router, `params` must be awaited before use.
  