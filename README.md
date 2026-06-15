# Barangay Incident Reporting System

A full-stack incident reporting app with:
- Backend: Node.js, Express, MongoDB, JWT auth, and role-based access
- Frontend: React + Vite

## What The App Does

- Residents can register, log in, and submit incident reports.
- Residents can view and update their own reports.
- Admins can view all incidents and assign or update them.
- Personnel can view assigned incidents and update progress.

## Project Structure

- `backend` - API server
- `frontend` - web client
- `DEPLOYMENT.md` - Render and Vercel deployment steps

## Requirements

- Node.js 18 or newer
- npm
- MongoDB database, usually MongoDB Atlas for online deployment

## Clone And Set Up

1. Clone the repository.
2. Open the project folder in your editor.
3. Install backend dependencies in `backend`.
4. Install frontend dependencies in `frontend`.
5. Create environment files from the examples.

## Configure Environment

### Backend `backend/.env`

Use `backend/.env.example` as your guide and set:
- `MONGODB_URI` to your MongoDB connection string
- `JWT_SECRET` to a long random secret
- `JWT_EXPIRES_IN` to `1d` or your preferred token lifetime
- `CORS_ORIGIN` to your frontend URL, or local dev URLs while testing

### Frontend `frontend/.env`

Set:
- `VITE_API_BASE_URL` to your backend URL
- For local development, this is usually `http://localhost:5000`

## Run Locally

### Backend

1. Open a terminal in `backend`.
2. Run `npm install`.
3. Run `npm run dev`.
4. The API should be available at `http://localhost:5000`.

### Frontend

1. Open a terminal in `frontend`.
2. Run `npm install`.
3. Run `npm run dev`.
4. Open the Vite URL shown in the terminal, usually `http://localhost:5173`.

## How To Use The App

1. Register or log in with a user account.
2. Choose the dashboard that matches the user role.
3. Residents can submit incidents and review their own reports.
4. Admins can manage all reports and assign incidents.
5. Personnel can update assigned incidents.

## Deploy Online

- Deploy the backend on Render.
- Deploy the frontend on Vercel.
- Set the frontend environment variable `VITE_API_BASE_URL` to the Render backend URL.
- Set `CORS_ORIGIN` on Render to the Vercel domain.
- See `DEPLOYMENT.md` for the full deployment checklist.

## Notes

- API documentation is in `backend/docs/api-documentation.md`.
- The frontend uses Vite, so the build command is `npm run build` in `frontend`.
- The backend uses Express and connects to MongoDB before starting the server.