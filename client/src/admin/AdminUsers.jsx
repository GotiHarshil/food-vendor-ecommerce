import React, { useState, useEffect } from "react";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = () => {
    setLoading(true);
    fetch("/api/admin/users", { credentials: "include" })
      .then((res) => res.json())
      .then(setUsers)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchUsers(); }, []);

  const toggleRole = async (userId, currentRole) => {
    const newRole = currentRole === "admin" ? "customer" : "admin";
    if (!confirm(`Change this user to ${newRole}?`)) return;

    await fetch(`/api/admin/users/${userId}/role`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: newRole }),
      credentials: "include",
    });
    fetchUsers();
  };

  return (
    <div>
      <div className="admin-page-header">
        <h1><i className="fa-solid fa-users"></i> Users</h1>
        <span style={{ fontSize: "0.9rem", color: "var(--text-muted)" }}>
          {users.length} total users
        </span>
      </div>

      {loading ? (
        <div className="admin-loading"><div className="admin-spinner"></div></div>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user._id}>
                  <td style={{ fontWeight: 600 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <i className="fa-solid fa-circle-user" style={{ color: "var(--primary)", fontSize: "1.2rem" }}></i>
                      {user.name || "—"}
                    </div>
                  </td>
                  <td>{user.email}</td>
                  <td>
                    <span className={`status-pill ${user.role === "admin" ? "status-preparing" : "status-picked_up"}`}>
                      {user.role || "customer"}
                    </span>
                  </td>
                  <td style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>
                    {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "—"}
                  </td>
                  <td>
                    <button
                      className={`admin-btn admin-btn-sm ${user.role === "admin" ? "admin-btn-danger" : "admin-btn-secondary"}`}
                      onClick={() => toggleRole(user._id, user.role || "customer")}
                    >
                      {user.role === "admin" ? "Remove Admin" : "Make Admin"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
