# Learnify

Full-stack E-learning platform with:
- `backend` (Node.js + Express + MongoDB)
- `frontend` (React + Vite)

## Local Setup (Windows)

### 1. Prerequisites
- Node.js `20.x` or `22.x` LTS recommended
- MongoDB running locally on `127.0.0.1:27017`
- Database name used by this project: `learnify`

### 2. Backend setup
```powershell
cd backend
npm install
npm run dev
```

Backend is hardcoded to:
- API: `http://localhost:8000`
- MongoDB: `mongodb://127.0.0.1:27017/learnify`

### 3. Frontend setup
```powershell
cd frontend
npm install
npm run dev
```

Frontend is hardcoded to call backend at:
- `http://localhost:8000/api/v1`

## Optional third-party configs
- Cloudinary and Stripe are not required for server startup.
- If you need upload/payment features, put your keys directly in:
  - `backend/utils/cloudinary.js`
  - `backend/controllers/coursePurchase.controller.js`
