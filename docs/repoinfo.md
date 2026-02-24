# PathoAssist Repository Information

## Project Overview
**PathoAssist** is a medical-grade web application designed for pathology professionals to analyze Whole Slide Images (WSI) and generate AI-assisted pathology reports. It prioritizes privacy and offline functionality, processing sensitive medical data entirely locally without reliance on cloud services.

## Core Features
- **Offline & Privacy-First**: Zero external API calls. All processing, including AI inference, happens locally to ensure patient data privacy/security.
- **Whole Slide Image (WSI) Support**: Handles multiple formats (SVS, TIFF, NDPI, MRXS) using OpenSlide.
- **AI-Assisted Analysis**: Uses **Google's MedGemma-2b** LLM for generating potential findings and observations.
- **Interactive Viewer**: High-performance deep-zoom viewer for navigating gigapixel-sized pathology slides.
- **Patient Management System**: 
  - Comprehensive patient records (demographics, history, insurance).
  - Simulates integration with major EHR systems (Epic, Cerner, HL7, FHIR).
- **Medical Safety Compliance**: Includes automated disclaimers, confidence scoring, audit logs, and diagnostic language filters.
- **6-Step Clinical Workflow**: Tightly guided process to ensure standardized analysis.

## Application Architecture

### Frontend (`/src`)
A modern, type-safe Single Page Application (SPA).
*   **Framework**: React 18 + TypeScript 5.8 + Vite.
*   **UI Library**: shadcn/ui (Radix UI primitives).
*   **Styling**: Tailwind CSS with custom medical-grade theme.
*   **State Management**: TanStack Query (Server State) + React Context (Global State).
*   **Validation**: React Hook Form + Zod.

### Backend (`/backend`)
A robust, asynchronous Python API server.
*   **Framework**: FastAPI (Async).
*   **WSI Engine**: OpenSlide + Pillow + OpenCV.
*   **AI Engine**: PyTorch + Transformers (MedGemma) + 8-bit quantization (bitsandbytes).
*   **Storage**: Local filesystem + Async SQLite (metadata).
*   **Export**: ReportLab (PDF) + Jinja2 (Templates).

## Workflow Steps
The application guides users through a linear, mandatory sequence:
1.  **Upload**: Select and process WSI files.
2.  **Viewer**: Interactive slide navigation to assess quality and overview.
3.  **ROI (Region of Interest)**: Auto-detection or manual selection of critical tissue areas.
4.  **Analysis**: AI model processes selected regions to generate findings.
5.  **Review**: Pathologist reviews, edits, and validates AI suggestions.
6.  **Export**: Final verification and generating PDF/JSON clinical reports.

## Directory Structure
```
/
├── src/                  # Frontend Source
│   ├── components/       # React Components
│   │   ├── screens/      # Workflow Step Screens (Viewer, Analysis, etc.)
│   │   ├── patient/      # Patient Management System
│   │   └── ui/           # Reusable UI Elements (shadcn)
│   ├── types/            # TypeScript Definitions (Patient, Workflow)
│   └── hooks/            # Custom React Hooks
│
├── backend/              # Python Backend
│   ├── app/              # API Source Code
│   │   ├── wsi/          # Slide Processing Modules
│   │   ├── roi/          # Region Selection Algorithms
│   │   ├── inference/    # AI Model & Prompt Engineering
│   │   └── report/       # Report Generation Logic
│   ├── data/             # Runtime Storage (Cases, Models, Exports)
│   └── requirements.txt  # Python Dependencies
│
├── CLAUDE.md             # Developer Guidelines
└── README.md             # Project Documentation
```

## Setup & Development
*   **Frontend**: `npm install && npm run dev` (Runs on port 8080)
*   **Backend**: 
    *   Requires Python 3.10+ and OpenSlide system library.
    *   `./setup.sh` to install dependencies.
    *   `./run.sh` to start the API server (Runs on port 8000).

## Current Status
*   **Backend**: Production Ready (v1.0.0). Feature complete with full offline support.
*   **Frontend**: Active Development. Core workflow implemented, integrated with backend APIs.

---
