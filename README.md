# Journal Platform

Modern, full‑stack tutoring and course marketplace inspired by Udemy. Designed for clean UX, fast discovery, and data‑driven course pages with real calculations for sections, lectures, and total hours.

## Table of Contents

- [Overview](#overview)
- [What Users Can Do](#what-users-can-do)
- [Core Features](#core-features)
- [Tech Stack](#tech-stack)
- [Monorepo Layout](#monorepo-layout)
- [Quick Start](#quick-start)
- [Environment Variables](#environment-variables)
- [Run & Build](#run--build)
- [API Highlights](#api-highlights)
- [Data Model](#data-model)
- [Architecture Notes](#architecture-notes)
- [Roadmap](#roadmap)
- [Contact](#contact)

## Overview

Journal enables students to browse, preview, and enroll in courses, while tutors create, publish, and manage content. Course pages pull real data from the database and compute totals directly from modules and lectures—no hardcoded numbers.

## What Users Can Do

### Students

- Discover courses with search and filters
- Preview course content before enrolling
- See real totals (sections, lectures, hours)
- Enroll in free courses instantly or pay for premium courses
- Access enrolled content from the student dashboard

### Tutors

- Create courses with modules and lectures
- Upload thumbnails and media assets
- Publish, unpublish, and archive courses
- Track learners and performance
- Show a public tutor profile with avatar, bio, and course list

## Core Features

- Course catalog with search, category, and level filters
- Udemy‑style preview pages (stats, highlights, content outline)
- Enrollment (free + paid)
- Tutor profiles with published courses
- Role‑based authentication and protected routes
- Module/lecture hierarchy with duration calculations
- Cloudinary media uploads

## Tech Stack

- Frontend: Next.js, React, Tailwind CSS, React Icons, Axios
- Backend: Node.js, Express, MongoDB (Mongoose), JWT, Cloudinary

## Monorepo Layout

- client/
  - admin-app/ (Next.js admin)
  - main-app/ (Next.js main app)
- server/ (Express + MongoDB API)

## Quick Start

```bash
git clone <repo-url>

# server
cd server
npm install

# client
cd ../client/main-app
npm install
```

## Environment Variables

Create server/.env:

```
PORT=5000
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_secret
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
RAZORPAY_KEY_ID=...      # if payments enabled
RAZORPAY_KEY_SECRET=...  # if payments enabled
```

## Run & Build

Backend:

```bash
cd server
node server.js
```

Frontend (main app):

```bash
cd client/main-app
npm run dev   # http://localhost:3000
npm run build && npm run start
```

## API Highlights

- Base URL: http://localhost:5000/api
- Courses: GET /courses (list), GET /courses/:id (detail with modules, lectures, tutor)
- Enrollment: GET /enrollments/check/:id, POST /enrollments
- Tutor profile: GET /auth/users/:id (tutor + their courses)

## Data Model

- User: name, email, role, avatar, bio
- Course: title, description, price, level, thumbnail, tutor, modules, ratings, enrolledStudents
- Module: title, description, order, lectures
- Lecture: title, description, duration (seconds), videoUrl, isPreview

## Architecture Notes

- REST API with Express and Mongoose
- Role‑based access control with JWT
- Media storage via Cloudinary
- UI data is fully server‑driven (no hardcoded totals)

## Roadmap

- Payments UI/flow hardening
- Reviews and ratings UI
- Better analytics on tutor dashboard

## Contact

- Project: https://github.com/TheForgeDevs/Journal (replace with actual repo)
- Author: add your name/email/social here
