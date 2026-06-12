import React, { useState, useEffect } from "react";

const CATEGORIES = [
  "Signature Dabeli", "Spicy Specials", "Loaded Varieties",
  "Snacks and sides", "Beverages",
];

const EMPTY_FORM = {
  name: "", price: "", description: "", imageUrl: "", category: CATEGORIES[0],
};

export default function AdminItems() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [filter, setFilter] = useState("active");
  const [specialIds, setSpecialIds] = useState([]);

  const fetchItems = () => {
    setLoading(true);
    fetch("/api/admin/items", { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        setItems(data);
        setSpecialIds(data.reduce((acc, i) => {
          if (i.isTodaysSpecial) acc.push(i._id);
          return acc;
        }, []));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchItems(); }, []);

  const filteredItems = items.filter((item) => {
    if (filter === "active") return !item.isDeleted && !item.isTemporarilyHidden;
    if (filter === "hidden") return item.isTemporarilyHidden && !item.isDeleted;
    if (filter === "deleted") return item.isDeleted;
    if (filter === "unavailable") return !item.available && !item.isDeleted;
    if (filter === "special") return item.isTodaysSpecial;
    return true;
  });

  const openAdd = () => {
    setEditingItem(null);
    setForm(EMPTY_FORM);
    setShowModal(true);
  };

  const openEdit = (item) => {
    setEditingItem(item);
    setForm({
      name: item.name, price: item.price, description: item.description || "",
      imageUrl: item.imageUrl || "", category: item.category,
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.price || !form.category) return alert("Name, price, and category are required");
    setSaving(true);
    try {
      const url = editingItem ? `/api/admin/items/${editingItem._id}` : "/api/admin/items";
      const method = editingItem ? "PUT" : "POST";
      const res = await fetch(url, {
        method, headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, price: Number(form.price) }),
        credentials: "include",
      });
      if (res.ok) { setShowModal(false); fetchItems(); }
      else { const d = await res.json(); alert(d.error); }
    } catch { alert("Error saving item"); }
    finally { setSaving(false); }
  };

  const toggleAvailability = async (item) => {
    await fetch(`/api/admin/items/${item._id}`, {
      method: "PUT", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ available: !item.available }),
      credentials: "include",
    });
    fetchItems();
  };

  const toggleHidden = async (item) => {
    await fetch(`/api/admin/items/${item._id}`, {
      method: "PUT", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isTemporarilyHidden: !item.isTemporarilyHidden }),
      credentials: "include",
    });
    fetchItems();
  };

  const handleDelete = async (item, permanent = false) => {
    const msg = permanent
      ? `Permanently delete "${item.name}"? This cannot be undone.`
      : `Soft-delete "${item.name}"? You can restore it later.`;
    if (!confirm(msg)) return;
    await fetch(`/api/admin/items/${item._id}?permanent=${permanent}`, {
      method: "DELETE", credentials: "include",
    });
    fetchItems();
  };

  const handleRestore = async (item) => {
    await fetch(`/api/admin/items/${item._id}/restore`, {
      method: "POST", credentials: "include",
    });
    fetchItems();
  };

  const toggleSpecial = (id) => {
    setSpecialIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const saveSpecials = async () => {
    await fetch("/api/admin/todays-special", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ itemIds: specialIds }),
      credentials: "include",
    });
    fetchItems();
    alert("Today's specials updated!");
  };

  return (
    <div>
      <div className="admin-page-header">
        <h1><i className="fa-solid fa-burger"></i> Menu Items</h1>
        <div style={{ display: "flex", gap: "8px" }}>
          <button className="admin-btn admin-btn-secondary" onClick={saveSpecials}>
            <i className="fa-solid fa-fire"></i> Save Specials
          </button>
          <button className="admin-btn admin-btn-primary" onClick={openAdd}>
            <i className="fa-solid fa-plus"></i> Add Item
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="admin-filters" style={{ marginBottom: "20px" }}>
        {["active", "hidden", "unavailable", "special", "deleted"].map((f) => (
          <button key={f} className={`admin-filter-btn${filter === f ? " active" : ""}`}
            onClick={() => setFilter(f)}>
            {f.charAt(0).toUpperCase() + f.slice(1)} ({items.filter((item) => {
              if (f === "active") return !item.isDeleted && !item.isTemporarilyHidden;
              if (f === "hidden") return item.isTemporarilyHidden && !item.isDeleted;
              if (f === "deleted") return item.isDeleted;
              if (f === "unavailable") return !item.available && !item.isDeleted;
              if (f === "special") return item.isTodaysSpecial;
              return true;
            }).length})
          </button>
        ))}
      </div>

      {loading ? (
        <div className="admin-loading"><div className="admin-spinner"></div></div>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Image</th>
                <th>Name</th>
                <th>Category</th>
                <th>Price</th>
                <th>Available</th>
                <th>Special</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.length === 0 ? (
                <tr><td colSpan="7" style={{ textAlign: "center", color: "var(--text-muted)", padding: "32px" }}>No items found</td></tr>
              ) : filteredItems.map((item) => (
                <tr key={item._id} style={{ opacity: item.isDeleted ? 0.5 : 1 }}>
                  <td>
                    {item.imageUrl ? (
                      <img src={item.imageUrl} alt="" className="item-thumb-sm" />
                    ) : (
                      <div className="item-thumb-sm" style={{ background: "var(--surface)", display: "grid", placeItems: "center" }}>
                        <i className="fa-solid fa-image" style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}></i>
                      </div>
                    )}
                  </td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{item.name}</div>
                    {item.isTemporarilyHidden && <span style={{ fontSize: "0.75rem", color: "var(--warning)" }}>Hidden</span>}
                    {item.isDeleted && <span style={{ fontSize: "0.75rem", color: "var(--error)" }}>Deleted</span>}
                  </td>
                  <td style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>{item.category}</td>
                  <td style={{ fontWeight: 600 }}>${item.price}</td>
                  <td>
                    <label className="toggle-switch">
                      <input type="checkbox" checked={item.available} onChange={() => toggleAvailability(item)} />
                      <span className="toggle-slider"></span>
                    </label>
                  </td>
                  <td>
                    <label className="toggle-switch">
                      <input
                        type="checkbox"
                        checked={specialIds.includes(item._id)}
                        onChange={() => toggleSpecial(item._id)}
                      />
                      <span className="toggle-slider"></span>
                    </label>
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                      {!item.isDeleted && (
                        <>
                          <button className="admin-btn admin-btn-secondary admin-btn-sm" onClick={() => openEdit(item)}>
                            <i className="fa-solid fa-pen"></i>
                          </button>
                          <button className="admin-btn admin-btn-secondary admin-btn-sm" onClick={() => toggleHidden(item)}
                            title={item.isTemporarilyHidden ? "Show" : "Hide temporarily"}>
                            <i className={`fa-solid ${item.isTemporarilyHidden ? "fa-eye" : "fa-eye-slash"}`}></i>
                          </button>
                          <button className="admin-btn admin-btn-danger admin-btn-sm" onClick={() => handleDelete(item, false)}
                            title="Soft delete">
                            <i className="fa-solid fa-trash"></i>
                          </button>
                        </>
                      )}
                      {item.isDeleted && (
                        <>
                          <button className="admin-btn admin-btn-success admin-btn-sm" onClick={() => handleRestore(item)}>
                            <i className="fa-solid fa-rotate-left"></i> Restore
                          </button>
                          <button className="admin-btn admin-btn-danger admin-btn-sm" onClick={() => handleDelete(item, true)}>
                            <i className="fa-solid fa-trash"></i> Permanent
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="admin-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3>{editingItem ? "Edit Item" : "Add New Item"}</h3>
              <button className="admin-modal-close" onClick={() => setShowModal(false)}>
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>
            <div className="admin-modal-body">
              <div className="admin-form-group">
                <label>Name *</label>
                <input className="admin-input" value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div className="admin-form-group">
                <label>Price *</label>
                <input className="admin-input" type="number" step="0.01" min="0" value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })} />
              </div>
              <div className="admin-form-group">
                <label>Category *</label>
                <select className="admin-select" value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}>
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="admin-form-group">
                <label>Description</label>
                <textarea className="admin-textarea" value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </div>
              <div className="admin-form-group">
                <label>Image URL</label>
                <input className="admin-input" value={form.imageUrl}
                  onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                  placeholder="https://..." />
                {form.imageUrl && (
                  <img src={form.imageUrl} alt="Preview" style={{
                    marginTop: "8px", maxHeight: "120px", borderRadius: "8px", objectFit: "cover",
                  }} />
                )}
              </div>
            </div>
            <div className="admin-modal-footer">
              <button className="admin-btn admin-btn-secondary" onClick={() => setShowModal(false)}>
                Cancel
              </button>
              <button className="admin-btn admin-btn-primary" onClick={handleSave} disabled={saving}>
                {saving ? "Saving..." : editingItem ? "Update Item" : "Add Item"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
