# RideFlex - Ride Booking System - Backend API

A ride booking **backend** API built with **Express.js**, **TypeScript**, **Mongoose**, and **Zod** for validation. Supports riders and drivers, role-based access control, ride requests, status updates, history tracking, and admin-level management.

---

## Features

- **Authentication** with sessions using Passport.js
- **User Roles**: Rider, Driver, Admin
- **Zod validation** for request safety
- **Ride lifecycle**: request, accept, complete, cancel
- **Ride history and admin reporting**
- **Role-based authorization middleware**
- **CORS-configured** for frontend communication

---

## Setup Instructions

### 1. Clone the repo

```bash
git clone https://github.com/mshipan/L2B5_Assignment_5_Ride_Booking_API_Rideflex.git
cd server
```

### 2. Install dependencies

```bash
npm install
```

### 3. Create .env file

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/rideflex
EXPRESS_SESSION_SECRET=your_secret_key_here

# Follow .env.example file
```

### 4. Run the development server

```bash
npm run dev
```

## Base URL

```bash
https://rideflex-eight.vercel.app/api/v1
```

## API Endpoint Summary

### Auth Endpoints (/auth)

| Method | Full URL                                                      | Role   | Description             |
| ------ | ------------------------------------------------------------- | ------ | ----------------------- |
| POST   | `https://rideflex-eight.vercel.app/api/v1/auth/login`         | Public | Log in user             |
| POST   | `https://rideflex-eight.vercel.app/api/v1/auth/refresh-token` | Public | Refresh access token    |
| POST   | `https://rideflex-eight.vercel.app/api/v1/auth/logout`        | Auth   | Log out current session |

### User Endpoints (/user)

| Method | Full URL                                                            | Role   | Description                 |
| ------ | ------------------------------------------------------------------- | ------ | --------------------------- |
| POST   | `https://rideflex-eight.vercel.app/api/v1/user/register`            | Public | Register as Rider or Driver |
| PATCH  | `https://rideflex-eight.vercel.app/api/v1/user/driver/availability` | DRIVER | Toggle driver availability  |
| PATCH  | `https://rideflex-eight.vercel.app/api/v1/user/:id/approval-status` | ADMIN  | Approve/Reject user account |

### Ride Endpoints (/rides)

| Method | Full URL                                                        | Role                       | Description                           |
| ------ | --------------------------------------------------------------- | -------------------------- | ------------------------------------- |
| POST   | `https://rideflex-eight.vercel.app/api/v1/rides`                | RIDER                      | Request a new ride                    |
| GET    | `https://rideflex-eight.vercel.app/api/v1/rides/my-rides`       | RIDER                      | Get all active and past rides         |
| GET    | `https://rideflex-eight.vercel.app/api/v1/rides/rider-history`  | RIDER                      | Get rider's completed rides history   |
| GET    | `https://rideflex-eight.vercel.app/api/v1/rides/driver-history` | DRIVER                     | Get all rides the driver was assigned |
| GET    | `https://rideflex-eight.vercel.app/api/v1/rides/:id`            | ALL (RIDER, DRIVER, ADMIN) | Get single ride by ID                 |
| PATCH  | `https://rideflex-eight.vercel.app/api/v1/rides/:id/accept`     | DRIVER                     | Accept a pending ride                 |
| PATCH  | `https://rideflex-eight.vercel.app/api/v1/rides/:id/complete`   | DRIVER                     | Mark ride as completed                |
| PATCH  | `https://rideflex-eight.vercel.app/api/v1/rides/:id/cancel`     | RIDER / DRIVER             | Cancel a ride                         |
| GET    | `https://rideflex-eight.vercel.app/api/v1/rides/available`      | DRIVER                     | See rides available for pickup        |
| GET    | `https://rideflex-eight.vercel.app/api/v1/rides/all-rides`      | ADMIN                      | View all rides with filters           |

## Sample Requests

### Login

POST https://rideflex-eight.vercel.app/api/v1/auth/login

```json
{
  "email": "user@example.com",
  "password": "securepassword"
}
```

### Register as Rider / Driver / Admin

POST https://rideflex-eight.vercel.app/api/v1/user/register

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "John123@",
  "role": "RIDER"
}

# For driver or admin registration role: "DRIVER", "ADMIN"
```

### Create a Ride

POST https://rideflex-eight.vercel.app/api/v1/rides

```json
{
  "pickupLocation": "Mirpur 10, Dhaka",
  "destinationLocation": "Agargaon, Dhaka"
}
```

### Approve or Reject User (Admin Only)

PATCH https://rideflex-eight.vercel.app/api/v1/user/:id/approval-status
req.body

```json
{
  "approvalStatus": "APPROVED"
}
```

### Update Driver Availability Online/Offline

PATCH https://rideflex-eight.vercel.app/api/v1/user/driver/availability

req.body

```json
{
  "isOnline": true
}
```

## Roles Summary

| Role   | Capabilities                                                    |
| ------ | --------------------------------------------------------------- |
| RIDER  | Register, request/cancel rides, view ride history               |
| DRIVER | Accept/complete/cancel rides, toggle availability, view history |
| ADMIN  | Approve users, view all rides, apply filters                    |

## Project Structure

```bash
src/
├── app/
│ ├── config/ # Configuration files (env, passport, etc.)
│ ├── errorHelpers/ # Custom error handling utilities
│ ├── interfaces/ # Shared TypeScript interfaces and types
│ ├── middlewares/ # Express middlewares (e.g., auth, validation)
│ ├── modules/ # Feature-based modular structure
│ │ ├── auth/ # Authentication controllers & routes
│ │ ├── ride/ # Ride booking, fare calculation, ride history
│ │ └── user/ # User-related logic (registration, approval, etc.)
│ ├── routes/ # Main route handler that loads module routes
│ └── utils/ # Shared utility functions
├── app.ts # App configuration and middleware setup
├── server.ts # Entry point to run the server
├── .env # Environment variables (keep secret!)
├── .env.example # Example env file for development setup
├── .gitignore # Git ignored files
├── eslint.config.mjs # ESLint config
├── package.json # Project metadata and dependencies
├── package-lock.json # Lockfile for npm dependencies
├── tsconfig.json # TypeScript compiler options
└── README.md # Project overview and documentation
```

## License

This project is open source and free to use for learning or extension.
