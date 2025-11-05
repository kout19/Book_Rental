import { Routes, Route, Navigate } from 'react-router-dom'
import Landing from './pages/Landing'
import Login from './Auth/Login'
import Register from './Auth/Register'
import EmailVerify from './pages/EmailVerify'
import AdminLayout from './pages/admin/AdminLayout'
import AdminDashboard from './pages/admin/AdminDashboard'
import ManageUsers from './pages/admin/pages/Manageusers'
import ManageBooks from './pages/admin/pages/ManageBooks'
import AdminProfile from './pages/admin/pages/AdminProfile'
import AdminSettings from './pages/admin/pages/AdminSettings'
import ApprovalRequests from './pages/admin/pages/ApprovalRequests'
import RequireAuth from './routes/ProtectedRoute'
import ManageOwnerUploads from './pages/admin/pages/ManageOwnerUploads'
import UserNavbar from './pages/user/layout/UserNavbar'
import UserDashboard from './pages/user/UserDashboard'
import BrowseBooks from './pages/user/pages/BrowseBooks'
import MyRentals from './pages/user/components/MyRentals'
import ReadBook from './pages/user/ReadBook'
import Profile from './pages/user/components/Profile'
import BookDetails from './pages/user/components/BookDetails'  
import CheckoutSuccess from './pages/user/components/CheckoutSuccess'
import OwnerDashboard from './pages/owner/OwnerDashboard'
import OwnerBooks from './pages/owner/OwnerBooks'
import Terms from './pages/Terms'
import Privacy from './pages/Privacy'
function App() {
  return (
<div>
 <Routes>
   <Route path="/" element={<Landing />} />
   <Route path="/login" element={<Login />} />
   <Route path="/register" element={<Register />} />
   <Route path="/verify-email" element={<EmailVerify />} />
   <Route path="/terms" element={<Terms />} />
   <Route path="/privacy" element={<Privacy />} />
   //user router
   <Route path="user/*" element={<UserNavbar />} >
       {/* <Route path="dashboard" element={<UserDashboard/>}/> */}
       <Route path="browse-books" element={<BrowseBooks/>}/>
       <Route path="book/:id" element={<BookDetails/>}/>
  <Route path="checkout-success" element={<CheckoutSuccess/>} />
  <Route path="read/:id" element={<RequireAuth><ReadBook/></RequireAuth>} />
  <Route path="my-rentals" element={<RequireAuth><MyRentals/></RequireAuth>} />
       <Route path="profile" element={<Profile/>}/>
   </Route>
   {/* Owner routes */}
   <Route path="/owner/*" element={<UserNavbar />}>
     <Route path="dashboard" element={<RequireAuth><OwnerDashboard/></RequireAuth>} />
     <Route path="books" element={<RequireAuth><OwnerBooks/></RequireAuth>} />
   </Route>
     {/* Admin routes */}
     <Route path="/admin/*" element={<RequireAuth><AdminLayout /></RequireAuth>}>
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="users" element={<ManageUsers />} />
        <Route path="books" element={<ManageBooks />} />
  <Route path="owner-uploads" element={<ManageOwnerUploads/>} />
  <Route path="approval-requests" element={<ApprovalRequests/>} />
    <Route path="profile" element={<RequireAuth><AdminProfile/></RequireAuth>} />
    <Route path="settings" element={<RequireAuth><AdminSettings/></RequireAuth>} />
    </Route>
 
  </Routes> 
</div>
  )
}

export default App
