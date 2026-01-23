import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute'; // Import the guard

// Pages
import Login from './pages/Login';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminTasks from './pages/admin/AdminTasks';
import UserManagement from './pages/admin/UserManagement';
import TaskMonitoring from './pages/admin/TaskMonitoring';
import SendNotification from './pages/admin/SendNotification';

// User Pages (Importing the real files we made)
import UserDashboard from './pages/user/UserDashboard';
import MyTasks from './pages/user/MyTasks';
import UserNotifications from './pages/user/UserNotifications';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public Route */}
          <Route path="/" element={<Login />} />

          {/* 🛡️ ADMIN ROUTES (Only 'admin' can access) */}
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            } 
          />
          <Route path="/admin/send-notification" element={<ProtectedRoute allowedRoles={['admin']}><SendNotification /></ProtectedRoute>}/>
          <Route 
            path="/admin/tasks" 
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminTasks />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/monitoring" 
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <TaskMonitoring />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/users" 
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <UserManagement />
              </ProtectedRoute>
            } 
          />

          {/* 🛡️ USER ROUTES (Only 'faculty' and 'clerk' can access) */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute allowedRoles={['faculty', 'clerk']}>
                <UserDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/dashboard/tasks" 
            element={
              <ProtectedRoute allowedRoles={['faculty', 'clerk']}>
                <MyTasks />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/dashboard/notifications" 
            element={
              <ProtectedRoute allowedRoles={['faculty', 'clerk']}>
                <UserNotifications />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;