# Admin Panel - Learning Management System

This is the admin panel for managing the LMS platform. It's completely separate from the client application and provides full control over users, courses, enrollments, payments, and reviews.

## Features

- 🔐 **Secure Authentication** - Admin-only login with JWT tokens
- 👥 **User Management** - View, edit, activate/deactivate, and delete users
- 📚 **Course Management** - Manage all courses, publish/unpublish, and delete
- ✅ **Enrollment Overview** - Track all student enrollments and progress
- 💰 **Payment Processing** - Review and manage all payment transactions
- ⭐ **Review Moderation** - Monitor and moderate course reviews
- 📊 **Dashboard Analytics** - Real-time statistics and insights

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- Backend server running on port 5000
- Admin user account in the database

### Installation

1. Navigate to the admin app directory:

```bash
cd client/admin-app
```

2. Install dependencies:

```bash
npm install
```

3. Create environment file (.env.local):

```
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

4. Run the development server:

```bash
npm run dev
```

The admin panel will be available at [http://localhost:3002](http://localhost:3002)

## Admin Login

The admin panel requires admin credentials to login. Only users with the `admin` role can access the panel.

## Pages

- **Dashboard** - Overview statistics and analytics
- **Users** - Manage all users (students, tutors, admins)
- **Courses** - Manage all courses
- **Enrollments** - Track student enrollments and progress
- **Payments** - View and manage payment transactions
- **Reviews** - Moderate course reviews

## Tech Stack

- Next.js 16 (App Router)
- Tailwind CSS 4
- Axios for API calls
- React Context for state management
- React Hot Toast for notifications
