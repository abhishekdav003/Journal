# Journal Platform

Journal is a full‑stack tutoring and course marketplace that lets students discover courses, preview content, enroll, and learn, while tutors publish courses, manage content, and track learners. The platform is built for an Udemy‑style experience with clean UX, fast browsing, and data‑driven course pages.

## Monorepo Structure

- client/
  - admin-app/ (Next.js admin app)
  - main-app/ (Next.js main app)
- server/ (Express + MongoDB API)

## Tech Stack

- Frontend: Next.js, React, Tailwind CSS, React Icons, Axios
- Backend: Node.js, Express, MongoDB (Mongoose), Cloudinary, JWT

## Key Features

- Course catalog with category, level, and search filters
- Udemy‑style course preview page with highlights and stats
- Enrollment flow for free and paid courses
- Tutor profile page with bio, avatar, and published courses
- Role‑based authentication and protected routes
- Course modules and lectures with duration calculations
- Cloudinary media uploads for thumbnails and assets
- Dashboard endpoints for stats and enrolled courses

## Product Overview

### Student Experience

- Browse and search courses
- Preview course content and structure before enrolling
- See real totals for sections, lectures, and total hours
- Enroll in free courses instantly or proceed to payment
- Access enrolled courses from the dashboard

### Tutor Experience

- Create and manage courses and modules
- Add lectures with durations for accurate totals
- Publish and archive courses
- View learners and course performance
- Showcase profile with avatar, bio, and course list

## Getting Started

### 1) Install dependencies

Client (main app):

- cd client/main-app
- npm install

Server:

- cd server
- npm install

### 2) Environment variables

Create a .env in server/ with at least:

- PORT=5000
- MONGO_URI=your_mongodb_uri
- JWT_SECRET=your_secret
- CLOUDINARY_CLOUD_NAME=...
- CLOUDINARY_API_KEY=...
- CLOUDINARY_API_SECRET=...

Optional (for payments, if configured):

- RAZORPAY_KEY_ID=...
- RAZORPAY_KEY_SECRET=...

### 3) Run the apps

Server:

- cd server
- node server.js

Client:

- cd client/main-app
- npm run dev

Open http://localhost:3000

## API Notes

- Base URL: http://localhost:5000/api
- Course detail: GET /courses/:id returns { success, data: { course, isEnrolled } }
- Tutor profile: GET /auth/users/:id returns tutor info + courses
- Enrollment check: GET /enrollments/check/:id
- Enrollment create: POST /enrollments

## Scripts

Client:

- npm run dev
- npm run build
- npm run start

Server:

- node server.js

## Data Model Highlights

- User: name, email, role, avatar, bio
- Course: title, description, price, level, thumbnail, tutor, modules, ratings
- Module: title, description, order, lectures
- Lecture: title, description, duration, videoUrl, isPreview

## License

All rights reserved.
