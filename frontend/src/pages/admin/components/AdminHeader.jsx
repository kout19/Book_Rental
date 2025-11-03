// AdminHeader.jsx
import { BellIcon, UserCircleIcon } from '@heroicons/react/24/outline';
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import API from '../../../api';

const AdminHeader = () => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [pendingCount, setPendingCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [pendingItems, setPendingItems] = useState([]);
  const panelRef = useRef(null);

  const displayName = (user && (user.name || user.displayName || user.email)) || 'Admin';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Fetch approval requests count for admin notifications
  const fetchPending = async () => {
    try {
      const { data } = await API.get('/api/admin/approval-requests');
      const u = Array.isArray(data.users) ? data.users.length : 0;
      const b = Array.isArray(data.books) ? data.books.length : 0;
      setPendingCount(u + b);
    } catch (err) {
      // silently ignore failures (may be unauthenticated during some dev flows)
      console.debug('fetchPending failed', err);
    }
  };

  const fetchPendingDetails = async () => {
    try {
      const { data } = await API.get('/api/admin/approval-requests');
      const users = Array.isArray(data.users) ? data.users.map(u => ({ type: 'user', id: u._id, title: u.name || u.email, subtitle: u.email })) : [];
      const books = Array.isArray(data.books) ? data.books.map(b => ({ type: 'book', id: b._id, title: b.title, subtitle: b.owner?.name || '' })) : [];
      const combined = [...users, ...books];
      setPendingItems(combined.slice(0, 6));
      const total = (users.length + books.length) || 0;
      setPendingCount(total);
    } catch (err) {
      console.debug('fetchPendingDetails failed', err);
      setPendingItems([]);
    }
  };

  useEffect(() => {
    if (!user || user.role !== 'admin') return;
    fetchPending();
    const t = setInterval(fetchPending, 30000); // poll every 30s
    return () => clearInterval(t);
  }, [user]);

  // close dropdown when clicking outside
  useEffect(() => {
    const onDoc = (e) => {
      if (!showNotifications) return;
      // if click outside panel, close
      if (panelRef && panelRef.current && !panelRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('click', onDoc);
    return () => document.removeEventListener('click', onDoc);
  }, [showNotifications, panelRef]);

  return (
    <header className="bg-white shadow px-4 py-3 flex justify-between items-center">
      <h1 className="text-xl font-semibold">Admin</h1>

      <div className="flex items-center space-x-4 relative">
        {/* Notification Icon */}
        <div className="relative" ref={panelRef}>
          <button className="relative" onClick={async () => { setShowNotifications(!showNotifications); if (!showNotifications) await fetchPendingDetails(); }} aria-label="Approval requests">
            <BellIcon className="w-6 h-6 text-gray-700" />
            {pendingCount > 0 ? (
              <span className="absolute -top-1 -right-1 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-white bg-red-600 rounded-full">
                {pendingCount}
              </span>
            ) : (
              <span className="absolute top-0 right-0 inline-block w-2 h-2 bg-red-500 rounded-full opacity-30" />
            )}
          </button>

          {/* Dropdown panel */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded shadow border z-30">
              <div className="px-3 py-2 font-medium">Notifications</div>
              <div className="max-h-60 overflow-auto">
                {pendingItems.length === 0 ? (
                  <div className="px-3 py-2 text-sm text-gray-600">No recent requests</div>
                ) : (
                  pendingItems.map((it) => (
                    <button key={it.type + it.id} onClick={() => { setShowNotifications(false); navigate('/admin/approval-requests'); }} className="w-full text-left px-3 py-2 hover:bg-gray-50 border-t first:border-t-0">
                      <div className="text-sm font-semibold">{it.type === 'user' ? 'Owner request' : 'Book request'} — {it.title}</div>
                      <div className="text-xs text-gray-500">{it.subtitle}</div>
                    </button>
                  ))
                )}
              </div>
              <div className="px-3 py-2 border-t flex justify-between items-center">
                <div className="text-xs text-gray-600">{pendingCount} pending</div>
                <button onClick={() => { setShowNotifications(false); navigate('/admin/approval-requests'); }} className="text-sm text-blue-600">View all</button>
              </div>
            </div>
          )}
        </div>

        {/* Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center space-x-2"
          >
            <UserCircleIcon className="w-8 h-8 text-gray-700" />
            <span className="hidden sm:inline text-sm text-gray-700">{displayName}</span>
          </button>

          {isProfileOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded shadow border z-20">
              <div className="px-4 py-2 text-gray-700 font-medium">{displayName}</div>
              <hr />
              <ul>
                <li>
                  <button
                    onClick={() => { setIsProfileOpen(false); navigate('/admin/profile'); }}
                    className="w-full text-left px-4 py-2 hover:bg-gray-100"
                  >
                    Profile
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => { setIsProfileOpen(false); navigate('/admin/settings'); }}
                    className="w-full text-left px-4 py-2 hover:bg-gray-100"
                  >
                    Settings
                  </button>
                </li>
                <li>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100"
                  >
                    Logout
                  </button>
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
