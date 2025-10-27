import { Routes, Route, Navigate } from 'react-router-dom'
import Landing from './pages/Landing'
import Login from './Auth/Login'
import Register from './Auth/Register'
import EmailVerify from './pages/EmailVerify'
import AdminLayout from './pages/admin/AdminLayout'
import AdminDashboard from './pages/admin/AdminDashboard'
import ManageUsers from './pages/admin/pages/Manageusers'
import ManageBooks from './pages/admin/pages/ManageBooks'
import UserNavbar from './pages/user/layout/UserNavbar'
import UserDashboard from './pages/user/UserDashboard'
import BrowseBooks from './pages/user/pages/BrowseBooks'
import MyRentals from './pages/user/components/MyRentals'
import Profile from './pages/user/components/Profile'
import BookDetails from './pages/user/components/BookDetails'  
function App() {
  return (
<div>
 <Routes>
   <Route path="/" element={<Landing />} />
   <Route path="/login" element={<Login />} />
   <Route path="/register" element={<Register />} />
   <Route path="/verify-email" element={<EmailVerify />} />
   //user router
   <Route path="user/*" element={<UserNavbar />} >
       {/* <Route path="dashboard" element={<UserDashboard/>}/> */}
       <Route path="browse-books" element={<BrowseBooks/>}/>
       <Route path="book/:id" element={<BookDetails/>}/>
       <Route path="my-rentals" element={<MyRentals/>}/>
       <Route path="profile" element={<Profile/>}/>
   </Route>
    {/* Admin routes */}
   <Route path="/admin/*" element={<AdminLayout />}>
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="users" element={<ManageUsers />} />
        <Route path="books" element={<ManageBooks />} />
    </Route>
 
  </Routes> 
</div>
  )
}

export default App
