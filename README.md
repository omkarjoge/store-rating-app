Store Ratings Platform
Full-stack web app where normal users rate stores (1-5), store owners track their ratings, and admins manage everything from a dashboard.

Backend: Express.js + PostgreSQL (raw SQL via pg), JWT auth, bcryptjs password hashing, express-validator
Frontend: React (Create React App), React Router, Axios, plain CSS (no UI framework)
Project structure
store-rating-app/
  backend/
    config/db.js          PostgreSQL connection pool
    db/schema.sql          Table definitions, constraints, triggers
    db/init.js              Runs schema.sql + seeds the first admin account
    middleware/             auth.js (JWT + role guard), validate.js
    controllers/            authController, adminController, storeController, ratingController
    routes/                 authRoutes, adminRoutes, storeRoutes, ratingRoutes
    utils/                  jwt.js, validators.js (shared express-validator chains)
    server.js               App entry point
  frontend/
    src/
      api/axios.js          Axios instance, attaches JWT, handles 401s
      context/AuthContext.js Login/signup/logout state, persisted to localStorage
      components/           Navbar, ProtectedRoute, SortableTable, StarRating, RoleBadge
      pages/                Login, Signup, Admin* , UserStores, StoreOwnerDashboard, UpdatePassword
      utils/validators.js   Client-side mirrors of the backend validation rules
Database schema (PostgreSQL)
users (id, name, email, password_hash, address, role ENUM('ADMIN','NORMAL','STORE_OWNER'), created_at, updated_at)
stores (id, name, email, address, owner_id -> users.id, created_at, updated_at)
ratings (id, user_id -> users.id, store_id -> stores.id, rating SMALLINT CHECK 1-5, created_at, updated_at, UNIQUE(user_id, store_id))
The unique constraint on (user_id, store_id) is what lets a normal user "modify" a rating — submitting again does an UPSERT instead of creating a duplicate row. owner_id links a STORE_OWNER account to the one store they manage, which is how the store-owner dashboard finds "their" store.

Setup
1. PostgreSQL
Create a database and update backend/.env (copy from .env.example):

createdb store_ratings
2. Backend
cd backend
cp .env.example .env       # edit PGUSER/PGPASSWORD/JWT_SECRET etc.
npm install
npm run db:init            # creates tables + a default admin account
npm run dev                # starts on http://localhost:5000
The default admin login (from .env) is printed to the console the first time db:init runs — by default admin@storeratings.com / Admin@1234.

3. Frontend
cd frontend
cp .env.example .env       # REACT_APP_API_URL=http://localhost:5000/api
npm install
npm start                  # starts on http://localhost:3000
How each role works
Sign up (/signup) always creates a NORMAL user. Admin and store owner accounts can only be created by an existing admin, from Admin → Users → Add user.
Admin adds stores from Admin → Stores → Add store, optionally linking an existing STORE_OWNER user as the owner (create the owner's user account first, then link them while creating the store).
Store owner dashboards look up "their" store via stores.owner_id, so a store owner without a linked store will see a friendly empty state.
Ratings are enforced 1-5 both client-side and via a CHECK constraint in Postgres; resubmitting updates the existing row (ON CONFLICT ... DO UPDATE).
Validation rules (enforced both client- and server-side)
Field	Rule
Name	20–60 characters
Address	up to 400 characters
Email	standard email format
Password	8–16 characters, at least 1 uppercase letter, 1 special char
Rating	integer 1–5
API overview
Method	Route	Access	Purpose
POST	/api/auth/signup	public	Register a normal user
POST	/api/auth/login	public	Log in (any role)
PUT	/api/auth/password	authenticated	Update own password
GET	/api/auth/me	authenticated	Current user profile
GET	/api/admin/dashboard	ADMIN	User/store/rating totals
POST	/api/admin/users	ADMIN	Create user (any role)
GET	/api/admin/users	ADMIN	List + filter + sort users
GET	/api/admin/users/:id	ADMIN	User detail (+ rating if store owner)
POST	/api/admin/stores	ADMIN	Create store (optionally link owner)
GET	/api/admin/stores	ADMIN	List + filter + sort stores
GET	/api/admin/store-owners	ADMIN	Store-owner dropdown source
GET	/api/stores	NORMAL (+others)	Browse/search stores + own rating
POST	/api/ratings/:storeId	NORMAL	Submit or update a rating (1-5)
GET	/api/ratings/my-store	STORE_OWNER	Own store's average rating + raters list
Notes on best practices followed
Passwords are hashed with bcrypt, never stored or returned in plain text.
JWTs carry only id, role, email, name — verified on every protected route via middleware, with a separate authorize(...roles) guard for role checks.
All list endpoints use parameterized queries (no string-concatenated SQL) to prevent injection, and sort columns are allow-listed rather than interpolated directly from user input.
Server-side validation (express-validator) mirrors client-side validation so the API is safe even if called directly.
Foreign keys and CHECK/UNIQUE constraints enforce data integrity at the database layer, not just in application code.
