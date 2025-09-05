import { Routes, Route, Navigate } from 'react-router-dom'
import Landing from './pages/Landing'
import Login from './Auth/Login'
import Register from './Auth/Register'
import EmailVerify from './pages/EmailVerify'
import AdminLayout from './pages/admin/AdminLayout'
import AdminDashboard from './pages/admin/AdminDashboard'

function App() {
  return (
    <div>
    <Routes>
   <Route path="/" element={<Landing />} />
   <Route path="/login" element={<Login />} />
   <Route path="/register" element={<Register />} />
   <Route path="/verify-email" element={<EmailVerify />} />
    {/* Admin routes */}
   <Route path="/admin/*" element={<AdminLayout />}>
        {/* Nested routes for admin */}
        <Route path="dashboard" element={<AdminDashboard />} />
        {/* Add more admin routes here as needed */}
      </Route>
  {/*
    
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/books" element={<Books />} />
      <Route path="/admin" element={<AdminPanel />} />
      <Route path="*" element={<Navigate to="/login" replace />} /> 
      */}
    </Routes> 
    </div>
  )
}

export default App
