import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/dashboard", { credentials: "include" })
      .then((res) => res.json())
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading || !data) {
    return <div className="admin-loading"><div className="admin-spinner"></div></div>;
  }

  const { stats, mostSold, recentOrders, dailySales, storeIsOpen } = data;

  return (
    <div>
      <div className="admin-page-header">
        <h1><i className="fa-solid fa-chart-line"></i> Dashboard</h1>
        <span className={`status-pill ${storeIsOpen ? "status-ready" : "status-cancelled"}`}>
          <i className={`fa-solid ${storeIsOpen ? "fa-store" : "fa-store-slash"}`}></i>
          Store is {storeIsOpen ? "Open" : "Closed"}
        </span>
      </div>

      {/* Stats */}
      <div className="admin-stats-grid">
        <div className="admin-stat-card">
          <div className="admin-stat-label">Total Revenue</div>
          <div className="admin-stat-value">${stats.totalRevenue.toFixed(2)}</div>
          <div className="admin-stat-sub">From {stats.totalOrders} orders</div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-label">Pending Orders</div>
          <div className="admin-stat-value" style={{ color: "#f59e0b" }}>{stats.pendingOrders}</div>
          <div className="admin-stat-sub">Needs attention</div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-label">Preparing</div>
          <div className="admin-stat-value" style={{ color: "#3b82f6" }}>{stats.preparingOrders}</div>
          <div className="admin-stat-sub">In the kitchen</div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-label">Ready for Pickup</div>
          <div className="admin-stat-value" style={{ color: "#22c55e" }}>{stats.readyOrders}</div>
          <div className="admin-stat-sub">Awaiting customer</div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-label">Total Customers</div>
          <div className="admin-stat-value">{stats.totalUsers}</div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-label">Menu Items</div>
          <div className="admin-stat-value">{stats.totalItems}</div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-label">Completed</div>
          <div className="admin-stat-value">{stats.pickedUpOrders}</div>
          <div className="admin-stat-sub">Picked up</div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-label">Cancelled</div>
          <div className="admin-stat-value" style={{ color: "#ef4444" }}>{stats.cancelledOrders}</div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
        {/* Most Sold Items */}
        <div className="admin-table-wrap">
          <div className="admin-table-header">
            <h2>Most Sold Items</h2>
          </div>
          {mostSold.length === 0 ? (
            <div style={{ padding: "24px", textAlign: "center", color: "var(--text-muted)" }}>
              No sales data yet
            </div>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Qty Sold</th>
                  <th>Revenue</th>
                </tr>
              </thead>
              <tbody>
                {mostSold.map((item, i) => (
                  <tr key={item._id || i}>
                    <td style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      {item.imageUrl && <img src={item.imageUrl} alt="" className="item-thumb-sm" />}
                      <span style={{ fontWeight: 600 }}>{item.name}</span>
                    </td>
                    <td>{item.totalQty}</td>
                    <td style={{ fontWeight: 600 }}>${item.totalRevenue.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Recent Orders */}
        <div className="admin-table-wrap">
          <div className="admin-table-header">
            <h2>Recent Orders</h2>
            <Link to="/admin/orders" className="admin-btn admin-btn-secondary admin-btn-sm">
              View All
            </Link>
          </div>
          {recentOrders.length === 0 ? (
            <div style={{ padding: "24px", textAlign: "center", color: "var(--text-muted)" }}>
              No orders yet
            </div>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Customer</th>
                  <th>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => (
                  <tr key={order._id}>
                    <td style={{ fontWeight: 600 }}>#{order._id.slice(-6).toUpperCase()}</td>
                    <td>{order.customerName}</td>
                    <td>${order.subtotal.toFixed(2)}</td>
                    <td>
                      <span className={`status-pill status-${order.status}`}>
                        {order.status.replace("_", " ")}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Daily Sales */}
      {dailySales.length > 0 && (
        <div className="admin-table-wrap" style={{ marginTop: "16px" }}>
          <div className="admin-table-header">
            <h2>Sales — Last 7 Days</h2>
          </div>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Orders</th>
                <th>Revenue</th>
              </tr>
            </thead>
            <tbody>
              {dailySales.map((day) => (
                <tr key={day._id}>
                  <td style={{ fontWeight: 600 }}>{day._id}</td>
                  <td>{day.count}</td>
                  <td style={{ fontWeight: 600 }}>${day.revenue.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
