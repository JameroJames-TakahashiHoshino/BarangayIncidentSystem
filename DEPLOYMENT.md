# Deployment Guide

This project is split into two deployments:
- Frontend on Vercel
- Backend on Render

## 1. Deploy the backend on Render

1. Create a new Render Web Service from the `backend` folder, or use the root-level `render.yaml`.
2. Set these environment variables in Render:
   - `MONGODB_URI`
   - `JWT_SECRET`
   - `JWT_EXPIRES_IN` = `1d`
   - `CORS_ORIGIN` = your Vercel URL, for example `https://your-app.vercel.app`
3. Build and start commands:
   - Build: `npm install`
   - Start: `npm start`
4. After deploy, copy the public Render URL. Example: `https://your-backend.onrender.com`

## 2. Deploy the frontend on Vercel

1. Create a new Vercel project from the `frontend` folder.
2. Set this environment variable in Vercel:
   - `VITE_API_BASE_URL` = your Render backend URL, for example `https://your-backend.onrender.com`
3. Deploy the project.
4. The included `frontend/vercel.json` keeps SPA refreshes working.

## 3. Local development

1. Backend:
   - Copy `backend/.env.example` to `backend/.env`
   - Fill in your MongoDB URI and JWT secret
   - Run `npm run dev` inside `backend`
2. Frontend:
   - Copy `frontend/.env.example` to `frontend/.env`
   - Keep `VITE_API_BASE_URL=http://localhost:5000`
   - Run `npm run dev` inside `frontend`

## 4. Important production notes

- Rotate any secrets that were previously committed.
- Make sure the Render backend URL is the exact value used in `VITE_API_BASE_URL`.
- Make sure the Vercel frontend URL is included in `CORS_ORIGIN` on Render.