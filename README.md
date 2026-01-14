# PathoAssist

**Offline WSI Pathology Report Generator**

PathoAssist is a medical-grade web application designed for pathology professionals to analyze whole slide images (WSI) and generate AI-assisted pathology reports offline.

## Features

- **Whole Slide Image Analysis**: Support for multiple formats (.SVS, .TIFF, .NDPI, .MRXS)
- **Patient Management**: Integration with EHR systems (Epic, Cerner, HL7, FHIR)
- **6-Step Workflow**: Upload → Viewer → ROI Selection → AI Analysis → Review → Export
- **Offline Functionality**: Full local AI processing without internet connectivity
- **Interactive Viewer**: High-resolution slide navigation with zoom/pan
- **ROI Selection**: Mark tumor, inflammatory, and normal tissue regions
- **AI-Assisted Analysis**: Automated pathology analysis with confidence scoring
- **Report Generation**: Human-validated reports with export capabilities
- **Local Case Archiving**: Store and reference cases locally

## Tech Stack

- **React** 18.3 + **TypeScript** 5.8
- **Vite** - Build tool and dev server
- **shadcn/ui** + **Radix UI** - Accessible component library
- **Tailwind CSS** - Utility-first styling
- **TanStack React Query** - Server state management
- **React Hook Form** + **Zod** - Form validation

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

```bash
# Clone the repository
git clone <repository-url>

# Navigate to the project directory
cd pathoassist-ui

# Install dependencies
npm install

# Start the development server
npm run dev
```

The application will be available at `http://localhost:8080`

## Development

```bash
# Start development server
npm run dev

# Run tests
npm run test

# Run tests in watch mode
npm run test:watch

# Lint code
npm run lint

# Build for production
npm run build

# Preview production build
npm run preview
```

## Project Structure

```
src/
├── components/
│   ├── ui/              # shadcn/ui component library
│   ├── layout/          # Header and sidebar components
│   ├── screens/         # Workflow screen components
│   ├── modals/          # Modal dialogs
│   └── patient/         # Patient management components
├── pages/               # Main application pages
├── hooks/               # Custom React hooks
├── types/               # TypeScript type definitions
└── lib/                 # Utility functions
```

## License

Proprietary - All rights reserved

## Medical Device Notice

This software is intended for research and decision support purposes only. It is not intended to replace professional medical judgment or diagnosis by healthcare professionals.
