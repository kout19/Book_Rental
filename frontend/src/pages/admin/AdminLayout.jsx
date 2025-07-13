// AdminLayout.jsx
import Sidebar from './Sidebar';
import AdminHeader from './AdminHeader';

const AdminLayout = ({ children }) => (
  <div className="flex">
    <Sidebar />
    <div className="flex-1">
      <AdminHeader />
      <main className="p-6">{children}</main>
    </div>
  </div>
);

export default AdminLayout;

