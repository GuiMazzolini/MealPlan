# MealPlan

A community recipe platform where users can **share recipes**, **browse what others have posted**, and **build personal meal plans** with auto-generated shopping lists.

## Features

- **Community recipes** — browse and search recipes shared by all users
- **Share your own** — add recipes with photos, ingredients, and step-by-step instructions
- **Meal planning** — pick community recipes and build a weekly plan
- **Shopping list** — ingredients are aggregated from your latest meal plan
- **User accounts** — sign up, log in, and manage your recipes and saved plans on your profile

## Tech Stack

| Layer | Technologies |
|-------|--------------|
| Frontend | React 18, Vite, React Router, Bootstrap, Axios |
| Backend | Node.js, Express, Mongoose |
| Auth | JWT (Bearer token) |
| Images | Cloudinary |
| Database | MongoDB |

## Project Structure

```
MealPlan/
├── finalproject-client/   # React frontend (Vite)
└── finalproject-server/   # Express API
```

This is a **monorepo** — client and server live in one repository. The project was previously split across two GitHub repos (`finalproject-client` and `finalproject-server`); those are now superseded by this single repo.

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB running locally (or a MongoDB Atlas connection string)
- A [Cloudinary](https://cloudinary.com/) account (free tier works) for recipe image uploads

### 1. Clone and install

```bash
git clone <your-mealplan-repo-url>
cd MealPlan

cd finalproject-server
cp .env.example .env
npm install

cd ../finalproject-client
cp .env.example .env
npm install
```

### 2. Configure environment variables

**Server** (`finalproject-server/.env`):

```env
PORT=5005
MONGODB_URI=mongodb://127.0.0.1:27017/MealPlan
TOKEN_SECRET=your-long-random-secret-here
CLIENT_URL=http://localhost:3000
CLOUDINARY_NAME=your-cloud-name
CLOUDINARY_KEY=your-api-key
CLOUDINARY_SECRET=your-api-secret
```

**Client** (`finalproject-client/.env`):

```env
VITE_SERVER_URL=http://localhost:5005
```

### 3. Run the app

In one terminal:

```bash
cd finalproject-server
npm run dev
```

In another terminal:

```bash
cd finalproject-client
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### 4. Seed demo data (optional)

Populate the database with a demo account, sample recipes, and a meal plan:

```bash
cd finalproject-server
npm run seed
```

**Demo login**

| | |
|---|---|
| Email | `demo@mealplan.com` |
| Password | `Demo1234` |

Re-running the seed script replaces previous demo data (same email).

## API Overview

### Public routes

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/recipes` | List all community recipes |
| GET | `/recipes/:id` | Get a single recipe |
| POST | `/auth/signup` | Create an account |
| POST | `/auth/login` | Log in and receive a JWT |

### Protected routes (require `Authorization: Bearer <token>`)

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/auth/verify` | Validate token and return current user |
| POST | `/upload` | Upload a recipe image to Cloudinary |
| POST | `/recipes` | Share a new recipe (owned by logged-in user) |
| PUT | `/recipes/:id` | Update your own recipe |
| DELETE | `/recipes/:id` | Delete your own recipe |
| GET | `/planner` | List your meal plans |
| POST | `/planner` | Create a meal plan |
| DELETE | `/planner/:id` | Delete your own meal plan |

## Security

- JWT tokens are required for creating recipes, uploading images, and all meal plan operations
- Users can only edit or delete **their own** recipes and meal plans
- Recipe and planner ownership is enforced on the server — not just the frontend
- CORS is restricted to `CLIENT_URL` (defaults to `http://localhost:3000`)

## Scripts

**Server**

```bash
npm start      # production
npm run dev    # development with nodemon
npm run seed   # demo user, recipes, and meal plan
```

**Client**

```bash
npm run dev      # development server (port 3000)
npm run build    # production build → dist/
npm run preview  # preview production build locally
npm test         # run tests (Vitest)
```

## Deployment Notes

- Set `CLIENT_URL` on the server to your deployed frontend URL
- Set `VITE_SERVER_URL` on the client to your deployed API URL
- Use MongoDB Atlas for a hosted database
- The `public/_redirects` file is copied to `dist/` for client-side routing on Netlify

## License

MIT
