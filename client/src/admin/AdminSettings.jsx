import React, { useState, useEffect } from "react";

export default function AdminSettings() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const fetchSettings = () => {
    setLoading(true);
    fetch("/api/admin/settings", { credentials: "include" })
      .then((res) => res.json())
      .then(setSettings)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchSettings(); }, []);

  const handleSave = async () => {
    setSaving(true);
    setMessage("");
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
        credentials: "include",
      });
      if (res.ok) {
        setMessage("Settings saved successfully!");
        setTimeout(() => setMessage(""), 3000);
      }
    } catch (err) {
      setMessage("Error saving settings");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStore = async () => {
    const newSettings = { ...settings, isOpen: !settings.isOpen };
    setSettings(newSettings);
    await fetch("/api/admin/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isOpen: newSettings.isOpen }),
      credentials: "include",
    });
  };

  if (loading || !settings) {
    return <div className="admin-loading"><div className="admin-spinner"></div></div>;
  }

  return (
    <div>
      <div className="admin-page-header">
        <h1><i className="fa-solid fa-gear"></i> Store Settings</h1>
      </div>

      {message && (
        <div style={{
          padding: "12px 16px", borderRadius: "var(--radius-md)",
          background: message.includes("Error") ? "var(--error-bg)" : "var(--success-bg)",
          color: message.includes("Error") ? "var(--error)" : "#166534",
          marginBottom: "20px", fontWeight: 600, fontSize: "0.9rem",
        }}>
          {message}
        </div>
      )}

      {/* Store Open/Closed Toggle — prominently displayed */}
      <div className="admin-table-wrap" style={{ marginBottom: "20px" }}>
        <div style={{
          padding: "24px", display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <div>
            <h2 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "4px" }}>
              Store Status
            </h2>
            <p style={{ fontSize: "0.88rem", color: "var(--text-muted)" }}>
              When closed, customers cannot place new orders.
            </p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            <span className={`status-pill ${settings.isOpen ? "status-ready" : "status-cancelled"}`}
              style={{ fontSize: "0.9rem", padding: "8px 16px" }}>
              <i className={`fa-solid ${settings.isOpen ? "fa-store" : "fa-store-slash"}`}></i>
              {settings.isOpen ? "OPEN" : "CLOSED"}
            </span>
            <label className="toggle-switch" style={{ transform: "scale(1.2)" }}>
              <input type="checkbox" checked={settings.isOpen} onChange={handleToggleStore} />
              <span className="toggle-slider"></span>
            </label>
          </div>
        </div>
      </div>

      {/* Other settings */}
      <div className="admin-table-wrap">
        <div className="admin-table-header">
          <h2>Store Information</h2>
        </div>
        <div style={{ padding: "24px" }}>
          <div className="admin-form-group">
            <label>Store Name</label>
            <input className="admin-input" value={settings.storeName || ""}
              onChange={(e) => setSettings({ ...settings, storeName: e.target.value })} />
          </div>

          <div className="admin-form-group">
            <label>Store Address</label>
            <input className="admin-input" value={settings.storeAddress || ""}
              onChange={(e) => setSettings({ ...settings, storeAddress: e.target.value })} />
          </div>

          <div className="admin-form-group">
            <label>Store Phone</label>
            <input className="admin-input" value={settings.storePhone || ""}
              onChange={(e) => setSettings({ ...settings, storePhone: e.target.value })}
              placeholder="+1 (555) 123-4567" />
          </div>

          <div className="admin-form-group">
            <label>Store Email</label>
            <input className="admin-input" type="email" value={settings.storeEmail || ""}
              onChange={(e) => setSettings({ ...settings, storeEmail: e.target.value })} />
          </div>

          <div className="admin-form-group">
            <label>Announcement Banner (shown on homepage when store is open)</label>
            <textarea className="admin-textarea" value={settings.announcement || ""}
              onChange={(e) => setSettings({ ...settings, announcement: e.target.value })}
              placeholder="e.g. 20% off all Dabeli today!" rows={2} />
          </div>

          <button className="admin-btn admin-btn-primary" onClick={handleSave} disabled={saving}
            style={{ marginTop: "8px" }}>
            {saving ? "Saving..." : "Save Settings"}
          </button>
        </div>
      </div>
    </div>
  );
}
