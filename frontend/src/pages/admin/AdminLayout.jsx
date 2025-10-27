// AdminLayout.jsx
import Sidebar from './components/Sidebar';
import AdminHeader from './components/AdminHeader';
import { Outlet } from 'react-router-dom';

const AdminLayout = () => (
  <div className="flex">
    <Sidebar />
    <div className="flex-1">
      <AdminHeader />
      <main className="p-6"><Outlet /></main>
    </div>
  </div>
);

export default AdminLayout;

