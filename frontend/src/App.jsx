import { Routes, Route, Navigate } from 'react-router-dom'
import Landing from './pages/Landing'
import Login from './Auth/Login'
import Register from './Auth/Register'
// import Dashboard from './pages/Dashboard'
// import Books from './pages/Books'
// import AdminPanel from './pages/AdminPanel'

function App() {
  return (
    <div>
    <Routes>
   <Route path="/" element={<Landing />} />
   <Route path="/login" element={<Login />} />
    <Route path="/register" element={<Register />} />
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
