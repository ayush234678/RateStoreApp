# RateStore — Store Rating Platform

A full-stack web application built with **NestJS**, **MySQL**, and **ReactJS** that allows users to submit ratings for registered stores.

---

## Tech Stack

| Layer      | Technology             |
|------------|------------------------|
| Backend    | NestJS (Node.js)       |
| Database   | MySQL 8.0+             |
| Frontend   | React 18 + TypeScript  |
| Auth       | JWT (passport-jwt)     |
| ORM        | TypeORM                |

---

## Project Structure

```
store-rating-app/
├── database/
│   └── schema.sql              # MySQL schema + views
├── backend/                    # NestJS application
│   ├── src/
│   │   ├── auth/               # Auth module (login, register, JWT)
│   │   ├── users/              # User entity
│   │   ├── stores/             # Stores module
│   │   ├── ratings/            # Ratings module
│   │   ├── admin/              # Admin module
│   │   ├── app.module.ts
│   │   └── main.ts
│   ├── .env.example
│   └── package.json
└── frontend/                   # React application
    ├── src/
    │   ├── context/            # Auth context
    │   ├── services/           # Axios API service
    │   ├── pages/
    │   │   ├── admin/          # Admin pages
    │   │   ├── user/           # Normal user pages
    │   │   └── owner/          # Store owner pages
    │   ├── components/         # Shared components
    │   └── utils/              # Validators
    └── package.json
```

---

## Setup Instructions

### 1. Database Setup

```bash
# Login to MySQL
mysql -u root -p

# Run the schema
SOURCE /path/to/store-rating-app/database/schema.sql;
```

Then create the first admin user manually (or via `npm run seed` if you add a seed script):

```sql
USE store_rating_db;

-- Generate bcrypt hash first (e.g., using Node: require('bcrypt').hashSync('Admin@1234', 10))
INSERT INTO users (name, email, password, address, role) VALUES
('System Administrator Name', 'admin@example.com', '<bcrypt_hash>', '123 Admin St', 'admin');
```

Or use this Node.js snippet to generate the hash:
```js
const bcrypt = require('bcrypt');
console.log(bcrypt.hashSync('Admin@1234', 10));
```

---

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your MySQL credentials and JWT secret

# Start development server
npm run start:dev
```

Backend runs on: `http://localhost:4000`

**API Base URL:** `http://localhost:4000/api`

---

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm start
```

Frontend runs on: `http://localhost:3000`

> The frontend proxies `/api` requests to `http://localhost:4000` automatically.

---

## User Roles & Access

| Role         | Default Route      | Capabilities |
|-------------|-------------------|--------------|
| `admin`      | `/admin/dashboard` | Full platform management |
| `user`       | `/user/stores`     | Browse stores, submit ratings |
| `store_owner`| `/owner/dashboard` | View ratings for their store |

---

## API Endpoints

### Auth
| Method | Endpoint          | Description              | Auth Required |
|--------|-------------------|--------------------------|---------------|
| POST   | /auth/register    | Register new user        | No            |
| POST   | /auth/login       | Login                    | No            |
| PATCH  | /auth/password    | Update password          | Yes           |

### Admin (role: admin only)
| Method | Endpoint          | Description              |
|--------|-------------------|--------------------------|
| GET    | /admin/dashboard  | Stats: users/stores/ratings |
| GET    | /admin/users      | List users (filterable)  |
| GET    | /admin/users/:id  | User detail              |
| POST   | /admin/users      | Create user              |
| GET    | /admin/stores     | List stores (filterable) |
| POST   | /admin/stores     | Create store             |

### Stores
| Method | Endpoint              | Description                    |
|--------|-----------------------|--------------------------------|
| GET    | /stores               | List stores with user rating   |
| GET    | /stores/my-dashboard  | Owner's store dashboard        |

### Ratings
| Method | Endpoint          | Description              |
|--------|-------------------|--------------------------|
| POST   | /ratings/:storeId | Submit/update rating     |

---

## Form Validations

| Field    | Rules |
|----------|-------|
| Name     | 20–60 characters |
| Email    | Valid email format |
| Password | 8–16 chars, ≥1 uppercase, ≥1 special character |
| Address  | Max 400 characters |
| Rating   | Integer between 1–5 |

---
For Demo UserID and Password:-
ADMIN: admin@storerating.com / Admin@1234
USER 1: john.thompson@example.com / User@12345
USER 2: sarah.johnson@example.com / User@12345
OWNER 1: owner1@storerating.com / Owner@1234
OWNER 2: owner2@storerating.com / Owner@1234

## Features

- ✅ Single login system with role-based routing
- ✅ JWT authentication with 24h expiry
- ✅ Admin dashboard with total counts
- ✅ Admin: Add users (admin/user/store_owner) and stores
- ✅ Admin: View/filter all users and stores with sorting
- ✅ Admin: View user detail (store owners show avg rating)
- ✅ User: Browse all stores with search/filter
- ✅ User: Submit or modify store ratings (1–5 stars)
- ✅ User: See own rating alongside overall rating per store
- ✅ Store Owner: View all users who rated their store
- ✅ Store Owner: See average rating
- ✅ All roles: Change password
- ✅ Sortable tables (asc/desc) on all columns
- ✅ Input validation on all forms (frontend + backend)
- ✅ Secure bcrypt password hashing
- ✅ Protected routes per role
