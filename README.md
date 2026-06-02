"# GPS Task Management System

A full-stack task management application with GPS location tracking, role-based access control, and real-time notifications. Built with React, Vite, Express.js, and Supabase.

## 🎯 Overview

GPS Task Management System is a comprehensive web application designed to manage, track, and monitor tasks with GPS capabilities. It features separate interfaces for administrators and users, email notifications, and detailed task monitoring dashboards.

## ✨ Features

### Admin Features
- **Dashboard**: Overview of all tasks and system metrics
- **Task Management**: Create, edit, delete, and monitor all tasks
- **User Management**: Manage user accounts and roles
- **Task Monitoring**: Real-time monitoring of task completion with GPS tracking
- **Notifications**: Send email notifications to users
- **Analytics**: View task completion rates and user performance metrics

### User Features
- **Dashboard**: Personal overview of assigned tasks
- **My Tasks**: View and manage assigned tasks
- **Notifications**: Receive and view task notifications
- **Location Tracking**: GPS-enabled task completion tracking

### Core Functionality
- 🔐 **Role-Based Access Control**: Separate dashboards for admin and user roles
- 📧 **Email Notifications**: Automated email notifications for task updates
- 📍 **GPS Tracking**: Location-based task management and monitoring
- 📊 **Analytics & Charts**: Visual data representation with Recharts
- 🔑 **JWT Authentication**: Secure token-based authentication
- 📱 **Responsive Design**: Tailwind CSS for modern, responsive UI
- 📥 **Excel Export**: Export task data to Excel format

## 🛠 Tech Stack

### Frontend
- **React 19.2** - UI library
- **Vite** - Build tool and dev server
- **React Router 7.12** - Client-side routing
- **Tailwind CSS 3.4** - Styling framework
- **Axios 1.13** - HTTP client
- **Recharts 3.8** - Data visualization
- **XLSX 0.18** - Excel file handling
- **Lucide React** - Icon library
- **JWT Decode 4.0** - JWT token decoding

### Backend
- **Express.js 5.2** - Web framework
- **Node.js** - Runtime environment
- **MySQL 2** - Database
- **Supabase 2.98** - Backend-as-a-Service
- **JWT** - Authentication tokens
- **Bcryptjs** - Password hashing
- **Nodemailer 8.0** - Email service
- **Multer 2.0** - File upload handling
- **CORS** - Cross-origin resource sharing

### Development Tools
- **ESLint** - Code linting
- **Nodemon** - Auto-restart server during development
- **PostCSS & Autoprefixer** - CSS processing

## 📁 Project Structure

```
GPS-Task/
├── client/                 # React frontend application
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   │   ├── Layout.jsx
│   │   │   ├── ProtectedRoute.jsx
│   │   │   └── Sidebar.jsx
│   │   ├── context/       # React context (AuthContext)
│   │   ├── pages/         # Page components
│   │   │   ├── Login.jsx
│   │   │   ├── admin/     # Admin pages
│   │   │   └── user/      # User pages
│   │   ├── utils/         # Utility functions (API calls)
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── eslint.config.js
│   └── vercel.json
│
├── server/                # Express backend application
│   ├── controllers/       # Business logic
│   │   ├── authController.js
│   │   ├── taskController.js
│   │   └── notificationController.js
│   ├── routes/            # API routes
│   │   ├── authRoutes.js
│   │   ├── taskRoutes.js
│   │   └── notificationRoutes.js
│   ├── middleware/        # Custom middleware
│   │   ├── authMiddleware.js
│   │   └── uploadMiddleware.js
│   ├── utils/             # Utility functions
│   │   └── emailSender.js
│   ├── db.js              # Database connection
│   ├── server.js          # Main server file
│   ├── package.json
│   └── uploads/           # File upload directory
│
└── README.md              # This file
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn package manager
- MySQL database
- Supabase account (for backend-as-a-service)

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd GPS-Task
```

2. **Backend Setup**
```bash
cd server
npm install
```

3. **Frontend Setup**
```bash
cd ../client
npm install
```

### Configuration

1. **Create `.env` file in the `server` directory**
```env
PORT=5000
DB_HOST=your_db_host
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=your_db_name
JWT_SECRET=your_jwt_secret_key
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_key
SMTP_HOST=your_smtp_host
SMTP_PORT=your_smtp_port
SMTP_USER=your_smtp_user
SMTP_PASS=your_smtp_password
```

2. **Database Setup**
   - Create a MySQL database
   - Run database migrations (if available)
   - Ensure all tables are created

### Running the Application

**Terminal 1 - Backend Server**
```bash
cd server
npm start
# Server will run on http://localhost:5000
```

**Terminal 2 - Frontend Development**
```bash
cd client
npm run dev
# Frontend will run on http://localhost:5173 (or displayed in terminal)
```

### Build for Production

**Frontend Build**
```bash
cd client
npm run build
# Creates optimized build in dist/ folder
```

**Backend Deployment**
Ensure all environment variables are set on your hosting platform before deploying.

## 📝 Available Scripts

### Frontend (client/)
- `npm run dev` - Start development server with hot reload
- `npm run build` - Create production build
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint to check code quality

### Backend (server/)
- `npm start` - Start the server
- `node reset_admin.js` - Reset admin user (if needed)

## 🔐 Authentication & Authorization

The application uses JWT (JSON Web Tokens) for authentication with two main roles:

- **Admin**: Full access to all features including user management, task creation, and monitoring
- **User**: Limited access to assigned tasks and notifications

Protected routes ensure users can only access resources based on their role.

## 📧 Email Notifications

The system sends automated emails for:
- Task assignments
- Task completion reminders
- Task status updates
- Admin notifications

Configure Nodemailer settings in `.env` file for your email service.

## 📱 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout

### Tasks
- `GET /api/tasks` - Get all tasks
- `POST /api/tasks` - Create new task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task
- `GET /api/tasks/:id` - Get task details

### Notifications
- `GET /api/notifications` - Get user notifications
- `POST /api/notifications` - Send notification
- `PUT /api/notifications/:id` - Update notification

### Users (Admin only)
- `GET /api/users` - Get all users
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

## 🎨 UI Components

- **Sidebar**: Navigation menu with role-based options
- **Layout**: Main application layout wrapper
- **ProtectedRoute**: Route guard for role-based access control
- **Dashboard**: Main overview page for both roles
- **Forms**: Task creation and user management forms
- **Charts**: Data visualization components

## 🧪 Testing

Currently, the project doesn't have automated tests configured. Consider adding:
- Jest for unit testing
- React Testing Library for component testing
- Supertest for API endpoint testing

## 🐛 Known Issues

None documented at this time. Please create an issue if you find any bugs.

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Authors

**Your Team/Organization**

## 📞 Support

For support, email support@yourdomain.com or open an issue on GitHub.

## 🔗 Related Links

- [React Documentation](https://react.dev)
- [Express.js Documentation](https://expressjs.com)
- [Vite Documentation](https://vitejs.dev)
- [Tailwind CSS Documentation](https://tailwindcss.com)
- [Supabase Documentation](https://supabase.com/docs)

## 🗺️ Roadmap

- [ ] Real-time GPS tracking with map integration
- [ ] Advanced analytics and reporting
- [ ] Mobile app (React Native)
- [ ] Task templates
- [ ] Team collaboration features
- [ ] API rate limiting
- [ ] Multi-language support (i18n)
- [ ] Dark mode
- [ ] WebSocket support for real-time updates

---

**Last Updated**: June 2, 2026" 
