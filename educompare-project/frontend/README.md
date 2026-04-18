# UniMatch Frontend

This frontend is the React + Vite interface for UniMatch (EduCompare), a data-driven platform that helps students compare universities and programs in Thailand and Taiwan using real backend data.

The frontend is intentionally simple and low-fidelity. Its job is to present trustworthy information from the backend clearly without changing backend logic or inventing data.

## Prerequisites

- Node.js 20 LTS or newer
- npm 10 or newer
- A running UniMatch backend API

Recommended:

- Use the current LTS version of Node.js on both Windows and macOS.
- Check your versions with `node -v` and `npm -v`.

## Quick Start

1. Open a terminal and move into the frontend folder:

```bash
cd frontend
```

2. Install dependencies:

```bash
npm install
```

3. Create your local environment file:

```bash
cp .env.example .env
```

If `cp` is not available in your terminal, create a `.env` file manually and copy the values from `.env.example`.

4. Start the development server:

```bash
npm run dev
```

5. Open the local URL shown by Vite in your browser.

## Available Scripts

- `npm run dev` starts the frontend development server.
- `npm run build` creates a production build in `dist/`.
- `npm run lint` runs ESLint on the frontend codebase.
- `npm run preview` previews the production build locally.
- `npm run check` runs lint and then build for a quick collaboration sanity check.

## Environment Variables

The frontend uses Vite environment variables. Create a local `.env` file in `frontend/`.

Current variable:

- `VITE_API_BASE_URL`: Base URL for the backend API. Default fallback is `http://127.0.0.1:8000`.

Example:

```env
VITE_API_BASE_URL=http://127.0.0.1:8000
```

## Backend Connection

The frontend expects the backend API to be running separately.

Default local setup:

- Frontend dev server: `http://localhost:5173`
- Backend API: `http://127.0.0.1:8000`

The API client is defined in `src/api/api.js`.

If you need a different backend URL:

1. Update `VITE_API_BASE_URL` in `.env`
2. Restart `npm run dev`

The frontend uses the backend as the source of truth. Do not move backend filtering, scoring, or schema logic into the frontend.

## Build and Verification

To verify the frontend before pushing changes:

```bash
npm run check
```

You can also run commands individually:

```bash
npm run lint
npm run build
```

## Folder Structure

Key folders:

- `src/api/` API client and backend request helpers
- `src/components/` reusable UI components
- `src/pages/` route-level page components
- `src/context/` app shell state
- `src/assets/` SVG icons and other frontend assets
- `public/` static public files

Important files:

- `src/api/api.js` backend connection setup
- `src/App.jsx` main route structure
- `src/main.jsx` app entry point
- `vite.config.js` Vite configuration
- `eslint.config.js` lint rules

## Collaboration Notes

Suggested branch flow:

1. Pull the latest default branch.
2. Create a feature branch such as `feature/frontend-readme` or `fix/compare-page-layout`.
3. Make focused frontend-only changes.
4. Run `npm run check` before opening a pull request.

Frontend areas currently in use:

- Layout and navigation in `src/components/` and `src/context/`
- Decision pages in `src/pages/`
- Backend integration in `src/api/`
- Shared styling in `src/App.css` and `src/index.css`

To avoid breaking backend integration:

- Keep using existing backend endpoints.
- Do not rename response fields expected by the UI.
- Do not duplicate backend recommendation logic in the frontend.
- Keep `src/api/api.js` as the single place for API base URL setup.

## Troubleshooting

### Frontend starts but data does not load

Check:

- the backend server is running
- `VITE_API_BASE_URL` matches the backend URL
- the backend is reachable in the browser or API client
- the browser console and terminal output for request errors

### CORS or network errors

Check:

- the backend is configured to accept requests from the frontend origin
- the backend is running on the URL you configured in `.env`
- you restarted the frontend after changing `.env`

### `npm install` fails

Check:

- your Node.js version is current LTS
- `node_modules/` was not copied from another OS
- `package-lock.json` is committed and up to date

If needed, delete `node_modules/`, then run `npm install` again.

### Vite dev server port changes

If port `5173` is busy, Vite may choose another local port. Use the URL shown in the terminal.
