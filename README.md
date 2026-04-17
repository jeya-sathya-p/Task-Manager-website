# TaskFlow - Task Management Application

A full-stack task management application built with React, TypeScript, Express.js, and MongoDB. Features user authentication, task CRUD operations, filtering, and pagination.

## Features

- **User Authentication**: Secure login and registration with session management
- **Task Management**: Create, read, update, and delete tasks
- **Task Filtering**: Filter tasks by status (pending/completed) and priority (low/medium/high)
- **Pagination**: Efficient task listing with pagination support
- **Responsive Design**: Modern UI built with Tailwind CSS and Lucide icons
- **Real-time Status**: Server health monitoring
- **Type Safety**: Full TypeScript implementation

## Tech Stack

### Frontend
- **React 19** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and development server
- **Tailwind CSS** - Styling
- **Lucide React** - Icons
- **Motion** - Animations

### Backend
- **Express.js** - Web framework
- **TypeScript** - Type safety
- **MongoDB** - Database
- **Mongoose** - ODM
- **Express Session** - Session management
- **Connect Mongo** - Session store
- **bcrypt** - Password hashing
- **CORS** - Cross-origin resource sharing

## Prerequisites

- **Node.js** (v16 or higher)
- **MongoDB** (local installation or cloud service like MongoDB Atlas)
- **npm** or **yarn** package manager

## Installation

1. **Clone the repository** (if applicable) or navigate to the project directory

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Environment Setup**:
   - Copy `.env.example` to `.env`
   - Configure the following environment variables:
     ```env
     MONGODB_URI="mongodb://localhost:27017/taskflow"
     SESSION_SECRET="your-secure-session-secret-here"
     ```

   For MongoDB:
   - **Local MongoDB**: Install MongoDB and start the service
   - **MongoDB Atlas**: Create a cluster and get the connection string

4. **Database Connection**:
   The app will automatically connect to MongoDB on startup. If `MONGODB_URI` is not set, it will attempt to connect to `mongodb://localhost:27017/taskflow`.

## Running the Application

### Development Mode
```bash
npm run dev
```
This starts the development server with Vite middleware for hot reloading.

### Production Build
```bash
npm run build
npm run preview
```

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run clean` - Clean build directory
- `npm run lint` - Type check with TypeScript

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user info

### Tasks
- `GET /api/tasks` - Get tasks (with optional filters: status, priority, page)
- `POST /api/tasks` - Create new task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task

### Health Check
- `GET /api/health` - Server health status

## Project Structure

```
task-manager/
├── src/
│   ├── App.tsx                 # Main React component
│   ├── main.tsx               # React entry point
│   ├── index.css              # Global styles
│   ├── config/
│   │   └── db.ts              # Database connection
│   ├── controllers/
│   │   ├── authController.ts  # Authentication logic
│   │   ├── taskController.ts  # Task management logic
│   │   └── server.ts          # Main server file
│   ├── middleware/
│   │   ├── auth.ts            # Authentication middleware
│   │   ├── dbCheck.ts         # Database check middleware
│   │   └── error.ts           # Error handling middleware
│   ├── models/
│   │   ├── Task.ts            # Task data model
│   │   └── User.ts            # User data model
│   ├── routes/
│   │   ├── authRoutes.ts      # Authentication routes
│   │   └── taskRoutes.ts      # Task routes
│   └── types/
│       └── session.d.ts       # Session type definitions
├── index.html                 # HTML template
├── package.json               # Dependencies and scripts
├── tsconfig.json              # TypeScript configuration
├── vite.config.ts             # Vite configuration
└── README.md                  # This file
```

## Usage

1. **Start the server**: `npm run dev`
2. **Open browser**: Navigate to `http://localhost:3000`
3. **Register**: Create a new account or login with existing credentials
4. **Manage Tasks**:
   - Click the "+" button to add new tasks
   - Use filters to view tasks by status and priority
   - Click on tasks to edit or mark as complete
   - Use pagination to navigate through task lists

## Development Notes

- The server runs on port 3000 by default
- Session data is stored in MongoDB (production) or memory (development)
- CORS is enabled for cross-origin requests
- Error handling middleware provides consistent error responses
- Database connection is checked on API routes

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.
