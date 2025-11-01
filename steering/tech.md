# Technology Stack

## Framework & Build System

- **WXT**: Next-gen browser extension framework (primary build system)
- **Vite**: Bundler (via WXT)
- **TypeScript**: Strict typing with ES2020 target
- **React 18**: UI framework with JSX

## UI & Styling

- **Tailwind CSS**: Utility-first CSS framework
- **Shadcn UI**: Component library (default style, slate base color)
- **Lucide React**: Icon library
- **CSS Variables**: Theme system with dark/light mode support

## APIs & External Services

- **OpenAI Chat Completions API**: GPT-3.5 Turbo model
- **Google Gemini Pro API**: Alternative AI provider
- **localStorage**: Settings and API key storage

## Development Tools

- **PostCSS**: CSS processing with Autoprefixer
- **ESLint**: Code linting (via TypeScript strict mode)

## Common Commands

### Development
```bash
npm run dev          # Chrome development with hot reload
npm run dev:firefox  # Firefox development with hot reload
```

### Building
```bash
npm run build         # Production build for Chrome
npm run build:firefox # Production build for Firefox
npm run zip          # Package Chrome extension
npm run zip:firefox  # Package Firefox extension
```

### Preview
```bash
npm run preview      # Preview built extension
```

## Path Aliases

- `@/*` maps to `./src/*` for clean imports
- Components: `@/components`
- Utils: `@/lib/utils`

## Browser Extension Architecture

- **Manifest V3**: Modern extension format
- **Content Scripts**: Field monitoring and icon injection
- **Popup**: Settings and configuration interface
- **No Background Script**: Lightweight architecture