# Book Manager Application

A full-stack book management application with user authentication, built with React, Node.js, and Express. This application allows users to manage their book collection with a clean, modern interface.

## Features

- 🔐 **User Authentication**
  - Secure JWT-based login
  - Protected routes

- 📚 **Book Management**
  - Add new books with title, author, genre, and publication year
  - Edit existing book details
  - Delete books from your collection
  - View all books in a responsive card layout

- 🔍 **Search & Filter**
  - Search books by title, author, or genre
  - Filter books by genre
  - Pagination for better navigation

- 🎨 **Modern UI**
  - Clean, responsive design using Material-UI
  - Interactive modals for forms
  - Loading states and error handling
  - Smooth animations and transitions

## Tech Stack

### Frontend
- React 18
- Material-UI (MUI) for UI components
- React Router for navigation
- Axios for API calls
- Formik & Yup for form handling and validation
- Context API for state management

### Backend
- Node.js with Express
- JWT for authentication
- In-memory data storage (for demo purposes)
- RESTful API design
- CORS enabled

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Git

## Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/yourusername/book-manager.git
cd book-manager
```

### 2. Set up the Backend
```bash
cd backend
npm install
npm run dev
```

### 3. Set up the Frontend
```bash
cd ../frontend
npm install
npm start
```

The application will be available at `http://localhost:3000`

## Environment Variables

### Backend (`.env`)
```
PORT=5001
```

## Test Users

Two default users are available for testing:

**Admin User**
- Username: `admin`
- Password: `admin123`

**Regular User**
- Username: `user1`
- Password: `user123`

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login

### Books (All require authentication)
- `GET /api/books` - Get all books (admin) or user's books (regular user)
- `POST /api/books` - Add a new book
- `PUT /api/books/:id` - Update a book
- `DELETE /api/books/:id` - Delete a book

## Project Structure

```
book-manager/
├── backend/               # Backend server
│   ├── authMiddleware.js  # Authentication middleware
│   ├── routes/            # API routes
│   ├── data/              # Initial Data storage
│   ├── .env               # Environment variables
│   └── index.js           # Main server file
│
└── frontend/              # Frontend React app
    ├── public/            # Static files
    └── src/
        ├── components/    # Reusable components
        ├── contexts/      # React contexts
        ├── pages/         # Page components
        ├── services/      # API services
        ├── App.js         # Main app component
        └── index.js       # Entry point
```
