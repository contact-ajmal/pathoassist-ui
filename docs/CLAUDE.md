# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

PathoAssist UI is a React-based pathology slide analysis application with a multi-step workflow interface. The application guides users through uploading slides, viewing them, selecting regions of interest (ROI), running AI analysis, reviewing reports, and exporting results.

## Tech Stack

- **Build Tool**: Vite
- **Framework**: React 18 with TypeScript
- **UI Components**: shadcn/ui (Radix UI primitives)
- **Styling**: Tailwind CSS with CSS variables for theming
- **Routing**: React Router v6
- **State Management**: React hooks (local state), TanStack Query for server state
- **Testing**: Vitest with React Testing Library
- **Linting**: ESLint with TypeScript support

## Development Commands

```bash
# Development server (runs on port 8080)
npm run dev

# Production build
npm run build

# Development build (with source maps)
npm run build:dev

# Lint code
npm run lint

# Run tests (single run)
npm run test

# Run tests in watch mode
npm run test:watch

# Preview production build
npm run preview
```

## Architecture

### Application Structure

The application uses a **single-page, workflow-driven architecture**:

1. **Main Entry** (`src/main.tsx`): Renders the root App component
2. **App Component** (`src/App.tsx`): Sets up global providers:
   - QueryClientProvider (TanStack Query)
   - TooltipProvider, Toaster, Sonner (UI utilities)
   - BrowserRouter with routes
3. **Index Page** (`src/pages/Index.tsx`): The main application container that manages:
   - Workflow state (current step, completed steps)
   - Patient selection state
   - Modal visibility (settings, patient management)
   - Screen rendering based on workflow step

### Workflow System

The application implements a **6-step linear workflow** defined in `src/types/workflow.ts`:

1. **Upload**: Slide file upload
2. **Viewer**: Slide visualization
3. **ROI**: Region of Interest selection
4. **Analysis**: AI-powered analysis
5. **Review**: Report review and editing
6. **Export**: Export and archiving

Each step is a separate screen component in `src/components/screens/` and must be completed before proceeding to the next. The `WorkflowSidebar` component displays progress and allows navigation to completed steps.

### Patient Management

Patient data is managed through:
- **PatientRecord** type (`src/types/patient.ts`): Comprehensive patient data model including demographics, medical history, insurance, and emergency contacts
- **PatientManagementModal**: Main UI for patient operations (search, view, edit)
- **ManualPatientEntry**: Form for creating/editing patient records
- **SystemConnectionModal**: Interface for connecting to external EHR systems (Epic, Cerner, HL7, FHIR, etc.)

Patient records can be sourced from manual entry or external systems.

### Component Organization

```
src/
├── components/
│   ├── screens/          # Main workflow screen components
│   ├── layout/           # Header, WorkflowSidebar
│   ├── patient/          # Patient management components
│   ├── modals/           # Modal dialogs (Settings, etc.)
│   └── ui/               # shadcn/ui components (DO NOT EDIT DIRECTLY)
├── types/                # TypeScript type definitions
│   ├── workflow.ts       # Workflow-related types and constants
│   └── patient.ts        # Patient-related types and constants
├── hooks/                # Custom React hooks
├── lib/                  # Utility functions
└── pages/                # Top-level page components
```

### Key Design Patterns

1. **Component Props Pattern**: Screen components receive `onProceed` callbacks to signal workflow completion
2. **Controlled Components**: All form inputs are controlled via React Hook Form with Zod validation
3. **Modal Management**: Modals are controlled by state in the parent Index component
4. **Type Safety**: Strict TypeScript with discriminated unions for workflow steps and patient sources

## Styling System

- **Tailwind CSS** with custom theme extensions in `tailwind.config.ts`
- **CSS Variables** for colors (supports dark mode via class strategy)
- **Custom Colors**: header, sidebar, success, warning semantic colors
- **Component Variants**: Using `class-variance-authority` (cva) for component variants
- **Path Alias**: `@/` maps to `src/`

## shadcn/ui Components

- Located in `src/components/ui/`
- **DO NOT manually edit these files** - use the shadcn CLI to update/add components
- Components are configured in `components.json`
- To add new components: Use the shadcn CLI (not included in scripts, must be installed globally)

## Testing

- Tests use **Vitest** with jsdom environment
- Setup file: `src/test/setup.ts` (includes jest-dom matchers and matchMedia mock)
- Test files: `**/*.{test,spec}.{ts,tsx}` in src/
- Run a single test file: `npm run test -- path/to/test.test.ts`

## Important Conventions

1. **Import Paths**: Always use `@/` alias for imports from src/
2. **Component Exports**: Use default exports for page/screen components, named exports for utilities
3. **Type Definitions**: Keep types close to their usage or in `src/types/` for shared types
4. **Workflow State**: Never skip workflow steps - always maintain step completion order
5. **Patient Data**: Patient records are immutable once created from external systems (source !== 'manual')

## External Systems Integration

The application supports integration with:
- Epic MyChart
- Cerner PowerChart
- HL7 v2 Interface
- FHIR R4 API
- Allscripts EHR
- MEDITECH Expanse

Connection status and configuration are managed through the SystemConnectionModal component.

## Notes

- The application uses Lovable's `lovable-tagger` plugin in development mode for enhanced debugging
- HMR overlay is disabled in vite config
- ESLint has `@typescript-eslint/no-unused-vars` disabled
- Server runs on IPv6 (`::`) with port 8080
