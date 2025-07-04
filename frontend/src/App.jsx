import { Routes, Route, Navigate } from 'react-router-dom'
// import Login from './auth/Login'
// import Register from './auth/Register'
// import Dashboard from './pages/Dashboard'
// import Books from './pages/Books'
// import AdminPanel from './pages/AdminPanel'

function App() {
  return (
      <div>
      <h1>Book Rental Application</h1>
      <p>Welcome to the Book Rental Application!</p>
  
    {/* <Routes>
       <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/books" element={<Books />} />
      <Route path="/admin" element={<AdminPanel />} />
      <Route path="*" element={<Navigate to="/login" replace />} /> 
    </Routes> */}
    </div>
  )
}

export default App
