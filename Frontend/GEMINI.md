# GEMINI.md

## Project Overview

This project, "AI Power Suite," is a web-based application designed to assist users with their job application process. It is a Progressive Web App (PWA) built with React, TypeScript, and Vite. The application provides a suite of tools, including:

*   **CVGenie:** A tool for generating and editing resumes.
*   **Cover Letter Generator:** A tool for creating cover letters.
*   **ApplyAssist:** A tool to help with the application process.
*   **ReachyAI:** A tool for generating outreach messages.
*   **Settings:** A page for configuring the application, including API keys and personal information.

The application uses Tailwind CSS for styling and includes libraries like `react-pdf` and `tesseract.js`, suggesting capabilities for processing PDF documents and performing Optical Character Recognition (OCR).

## Building and Running

### Prerequisites

*   Node.js and npm (or a compatible package manager)

### Installation

1.  Install dependencies:
    ```bash
    npm install
    ```

### Development

To run the application in development mode:

```bash
npm run dev
```

This will start a local development server, and the application will be accessible at `http://localhost:5173` (or the next available port).

### Building for Production

To build the application for production:

```bash
npm run build
```

This will create a `dist` directory with the optimized and minified files.

### Previewing the Production Build

To preview the production build locally:

```bash
npm run preview
```

## Development Conventions

### Linting

The project uses ESLint for code linting. To run the linter:

```bash
npm run lint
```

### Code Style

The project uses Tailwind CSS for styling, and the configuration can be found in `tailwind.config.js`. The codebase is written in TypeScript, and type definitions are used throughout the application.

### Components

The application is structured with a clear separation of components. Reusable UI components are located in `src/components/ui`, and layout components are in `src/components/layout`. Pages are organized in the `src/pages` directory.
