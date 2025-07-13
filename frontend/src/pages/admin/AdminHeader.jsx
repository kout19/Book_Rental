// AdminHeader.jsx
import { BellIcon, UserCircleIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';

const AdminHeader = () => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  return (
    <header className="bg-white shadow px-4 py-3 flex justify-between items-center">
      <h1 className="text-xl font-semibold">Admin </h1>

      <div className="flex items-center space-x-4 relative">
        {/* Notification Icon */}
        <button className="relative">
          <BellIcon className="w-6 h-6 text-gray-700" />
          <span className="absolute top-0 right-0 inline-block w-2 h-2 bg-red-500 rounded-full"></span>
        </button>

        {/* Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center space-x-1"
          >
            <UserCircleIcon className="w-8 h-8 text-gray-700" />
          </button>

          {isProfileOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded shadow border z-20">
              <div className="px-4 py-2 text-gray-700 font-medium">Admin Name</div>
              <hr />
              <ul>
                <li>
                  <button className="w-full text-left px-4 py-2 hover:bg-gray-100">Profile</button>
                </li>
                <li>
                  <button className="w-full text-left px-4 py-2 hover:bg-gray-100">Settings</button>
                </li>
                <li>
                  <button className="w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100">
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
