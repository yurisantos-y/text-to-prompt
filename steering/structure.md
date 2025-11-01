# Project Structure & Conventions

## Directory Organization

```
src/
├── components/
│   ├── ui/                    # Shadcn UI components (reusable)
│   │   ├── button.tsx         # Button component
│   │   ├── dialog.tsx         # Modal dialog
│   │   ├── input.tsx          # Text input
│   │   ├── label.tsx          # Form label
│   │   ├── select.tsx         # Dropdown select
│   │   └── toast.tsx          # Toast notifications
│   └── ModalOptions.tsx       # Feature-specific components
├── entrypoints/               # WXT extension entry points
│   ├── popup/                 # Extension popup (settings)
│   │   ├── index.html         # Popup HTML template
│   │   └── App.tsx            # Main popup component
│   └── content/               # Content script (field monitoring)
│       └── index.tsx          # Content script entry
├── lib/
│   └── utils.ts               # Utility functions (cn helper)
├── styles/
│   └── globals.css            # Global CSS + Tailwind imports
├── types/
│   └── index.ts               # TypeScript type definitions
└── utils/
    └── api.ts                 # API integration layer
```

## File Naming Conventions

- **Components**: PascalCase (e.g., `ModalOptions.tsx`)
- **Utilities**: camelCase (e.g., `api.ts`, `utils.ts`)
- **Types**: camelCase files, PascalCase exports (e.g., `AIProvider`)
- **Styles**: kebab-case (e.g., `globals.css`)

## Code Organization Patterns

### Component Structure
- Use functional components with hooks
- Import order: React → external libs → internal components → utils → types → styles
- Export default for main components, named exports for utilities

### API Layer (`src/utils/api.ts`)
- Centralized API calls for OpenAI and Gemini
- Storage helpers for localStorage operations
- Validation functions for API keys
- Prompt template management

### Type Definitions (`src/types/index.ts`)
- All TypeScript interfaces and types
- API response types for external services
- Internal application state types

### Content Script Architecture
- WeakMap for tracking active icons (memory efficient)
- MutationObserver for dynamic content detection
- Event delegation for performance
- React portal rendering for modals

## Key Architectural Decisions

1. **No Background Script**: Lightweight approach using only content scripts and popup
2. **WeakMap Usage**: Prevents memory leaks when tracking DOM elements
3. **React Portals**: Render React components in page context from content script
4. **CSS Variables**: Enable theme switching without JavaScript
5. **localStorage**: Simple, secure storage for settings (no external dependencies)

## Import Patterns

```typescript
// Standard import order
import React from 'react';
import { createRoot } from 'react-dom/client';
import { Button } from '@/components/ui/button';
import { validateApiKey } from '@/utils/api';
import { AIProvider } from '@/types';
import '@/styles/globals.css';
```

## Extension-Specific Patterns

- **Content Scripts**: Use `@ts-nocheck` for DOM manipulation heavy files
- **Event Handling**: Always dispatch synthetic events for framework compatibility
- **Icon Positioning**: Absolute positioning with CSS transforms
- **Modal Rendering**: Create separate DOM containers to avoid conflicts