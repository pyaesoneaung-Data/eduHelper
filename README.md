# UniMatch (EduCompare)

UniMatch (EduCompare) is a data-driven web application that helps students compare universities and programs in Thailand and Taiwan using structured, verifiable information instead of agent marketing claims.

The project combines a FastAPI backend, a React frontend, and a PostgreSQL database so users can review real costs, compare programs, understand legal work rules, and explore recommendations based on backend logic.

## Repository Layout

The application code lives inside `educompare-project/`.

- `educompare-project/backend/` FastAPI backend, database connection, models, and API routes
- `educompare-project/frontend/` React + Vite frontend
- `educompare-project/docs/` project planning and product documentation
- `educompare-project/data/` raw and processed project datasets

## Tech Stack

- Backend: FastAPI, SQLAlchemy, Python, python-dotenv
- Frontend: React, Vite, Axios, React Router
- Database: PostgreSQL
- Package managers: `pip` for Python dependencies, `npm` for frontend dependencies

## Requirements

- Python 3.11 or newer recommended
- Node.js 20 LTS recommended
- npm 10 or newer recommended
- PostgreSQL running locally for backend development
- A virtual environment is strongly recommended for backend work

## Backend Setup

1. Move into the backend folder:

```bash
cd educompare-project/backend
```

2. Create a virtual environment:

```bash
python -m venv .venv
```

3. Activate the virtual environment:

Windows PowerShell:

```powershell
.venv\Scripts\Activate.ps1
```

Windows Command Prompt:

```bat
.venv\Scripts\activate.bat
```

macOS or Linux:

```bash
source .venv/bin/activate
```

4. Install backend dependencies:

```bash
pip install -r requirements.txt
```

5. Create a local environment file from the example:

```bash
cp .env.example .env
```

If `cp` is not available in your terminal, create `.env` manually and copy the values from `.env.example`.

6. Update `DATABASE_URL` in `.env` so it points to your local PostgreSQL database.

7. Run the FastAPI app:

```bash
uvicorn main:app --reload
```

Backend default URL:

- API: `http://127.0.0.1:8000`
- Swagger docs: `http://127.0.0.1:8000/docs`

## Frontend Setup

1. Move into the frontend folder:

```bash
cd educompare-project/frontend
```

2. Use the recommended Node version:

```bash
nvm use
```

If `nvm` is not installed, use Node.js 20 LTS manually.

3. Install frontend dependencies:

```bash
npm install
```

4. Create a local environment file:

```bash
cp .env.example .env
```

If `cp` is not available in your terminal, create `.env` manually and copy the values from `.env.example`.

5. Start the Vite development server:

```bash
npm run dev
```

Frontend default URL:

- App: `http://localhost:5173`

## Running the Full App

Start the backend first:

```bash
cd educompare-project/backend
uvicorn main:app --reload
```

Then start the frontend in a second terminal:

```bash
cd educompare-project/frontend
npm run dev
```

Local development URLs:

- Backend API: `http://127.0.0.1:8000`
- Backend docs: `http://127.0.0.1:8000/docs`
- Frontend app: `http://localhost:5173`

## Environment Files

Backend:

- `educompare-project/backend/.env.example`
- Required variable:
  `DATABASE_URL` - PostgreSQL connection string used by SQLAlchemy

Frontend:

- `educompare-project/frontend/.env.example`
- Required variable:
  `VITE_API_BASE_URL` - backend API base URL used by the Vite app

## Troubleshooting

### Backend is not reachable

Check:

- PostgreSQL is running
- `DATABASE_URL` in `backend/.env` points to a valid local database
- the backend server started without import or database connection errors
- the API is reachable at `http://127.0.0.1:8000/docs`

### Frontend cannot load API data

Check:

- the backend is running before the frontend tries to fetch data
- `VITE_API_BASE_URL` in `frontend/.env` matches the backend URL
- you restarted `npm run dev` after changing `.env`
- the backend CORS setting still allows `http://localhost:5173`

### Missing Python packages

Check:

- the backend virtual environment is activated
- `pip install -r requirements.txt` completed successfully
- you are using a supported Python version

### Missing Node modules

Check:

- `npm install` completed successfully in `educompare-project/frontend`
- `node_modules` was not copied from another machine or operating system
- you are using Node.js 20 LTS or newer

### Port conflicts

Check:

- port `8000` is free for the backend
- port `5173` is free for the frontend

If one port is already in use, stop the conflicting process or rerun the relevant dev server with a different port and update the frontend env value if needed.

## Collaboration Notes

- Create a branch before making changes.
- Avoid changing backend logic, recommendation scoring, database schema, or API contracts casually.
- Keep frontend API integration aligned with existing backend endpoints.
- Run the relevant checks before committing:
  backend startup for API changes, `npm run check` for frontend changes.
- Keep local `.env` files uncommitted and use the example env files as the shared reference.
