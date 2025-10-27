import React, { useEffect, useState } from "react";
import API from "../../../api";

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState(""); // quick client-side search
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data } = await API.get("/users");
      setUsers(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleChange = async (id, role) => {
    try {
      await API.put(`/users/${id}/role`, { role });
      fetchUsers();
    } catch (err) {
      console.error(err);
    }
  };

  const handleStatusToggle = async (id, currentStatus) => {
    const newStatus = currentStatus === "active" ? "disabled" : "active";
    if (newStatus === "disabled" && !window.confirm("Disable this user? They will be blocked from auth.")) return;
    try {
      await API.patch(`/users/${id}/status`, { status: newStatus });
      fetchUsers();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Hard delete user? This is permanent.")) return;
    try {
      await API.delete(`/users/${id}`);
      fetchUsers();
    } catch (err) {
      console.error(err);
    }
  };

  // basic client-side search/filter
  const filtered = users.filter(u => {
    if (!q) return true;
    return [u.name, u.email, u.role, u.status].join("|").toLowerCase().includes(q.toLowerCase());
  });

  return (
    <div className="p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <h1 className="text-2xl font-bold">Manage Users</h1>
        <input
          type="text"
          placeholder="Search users..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="border p-2 rounded w-full sm:w-64"
        />
      </div>

      {loading ? (
        <p>Loading users...</p>
      ) : (
        <>
          {/* Mobile cards */}
          <div className="md:hidden space-y-3">
            {filtered.map((user) => (
              <div key={user._id} className="border rounded p-3">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-semibold">{user.name}</div>
                    <div className="text-sm text-gray-600">{user.email}</div>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs ${user.status === "active" ? "bg-green-100" : "bg-red-100"}`}>
                    {user.status}
                  </span>
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <label className="text-sm text-gray-700">Role:</label>
                  <select
                    value={user.role}
                    onChange={(e) => handleRoleChange(user._id, e.target.value)}
                    className="border p-1 rounded text-sm"
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <button
                    onClick={() => handleStatusToggle(user._id, user.status)}
                    className="px-3 py-1 rounded border text-sm"
                  >
                    {user.status === "active" ? "Disable" : "Enable"}
                  </button>
                  <button
                    onClick={() => handleDelete(user._id)}
                    className="px-3 py-1 rounded bg-red-500 text-white hover:bg-red-600 text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
            {filtered.length === 0 && (
              <div className="p-4 text-center text-sm">No users found.</div>
            )}
          </div>

          {/* Desktop table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full min-w-[700px] border border-gray-300">
              <thead>
                <tr className="bg-gray-200">
                  <th className="border p-2 text-left">Name</th>
                  <th className="border p-2 text-left">Email</th>
                  <th className="border p-2 text-left">Role</th>
                  <th className="border p-2 text-left">Status</th>
                  <th className="border p-2 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((user) => (
                  <tr key={user._id} className="border">
                    <td className="border p-2">{user.name}</td>
                    <td className="border p-2">{user.email}</td>
                    <td className="border p-2">
                      <select
                        value={user.role}
                        onChange={(e) => handleRoleChange(user._id, e.target.value)}
                        className="border p-1 rounded"
                      >
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                    <td className="border p-2">
                      <span className={`px-2 py-1 rounded text-sm ${user.status === "active" ? "bg-green-100" : "bg-red-100"}`}>
                        {user.status}
                      </span>
                    </td>
                    <td className="border p-2 space-x-2">
                      <button
                        onClick={() => handleStatusToggle(user._id, user.status)}
                        className="px-2 py-1 rounded border"
                      >
                        {user.status === "active" ? "Disable" : "Enable"}
                      </button>
                      <button
                        onClick={() => handleDelete(user._id)}
                        className="px-2 py-1 rounded bg-red-500 text-white hover:bg-red-600"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan="5" className="p-4 text-center">No users found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};

export default ManageUsers;
