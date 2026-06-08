import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Plus, RefreshCw, Trash2 } from "lucide-react";
import {
  createServiceArea,
  deleteServiceArea,
  getServiceAreas,
  updateServiceArea,
} from "../utils/api";
import "../styles/Dashboard.css";

const EMPTY_FORM = {
  city: "",
  state: "",
  pincode: "",
  notes: "",
  isActive: true,
};

export default function AdminServiceAreas() {
  const [serviceAreas, setServiceAreas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState("");
  const [saving, setSaving] = useState(false);

  const loadServiceAreas = async () => {
    setLoading(true);
    try {
      const response = await getServiceAreas();
      const data = response.data?.data ?? [];
      setServiceAreas(Array.isArray(data) ? data : []);
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to load service areas",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadServiceAreas();
  }, []);

  const resetForm = () => {
    setForm(EMPTY_FORM);
    setEditingId("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        city: form.city.trim(),
        state: form.state.trim(),
        pincode: form.pincode.trim(),
        notes: form.notes.trim(),
      };
      if (editingId) {
        await updateServiceArea(editingId, payload);
        toast.success("Service area updated");
      } else {
        await createServiceArea(payload);
        toast.success("Service area added");
      }
      resetForm();
      await loadServiceAreas();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to save service area",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (serviceArea) => {
    setEditingId(serviceArea._id);
    setForm({
      city: serviceArea.city || "",
      state: serviceArea.state || "",
      pincode: serviceArea.pincode || "",
      notes: serviceArea.notes || "",
      isActive: serviceArea.isActive,
    });
  };

  const handleRemove = async (serviceAreaId) => {
    if (!window.confirm("Delete this service area?")) return;
    try {
      await deleteServiceArea(serviceAreaId);
      toast.success("Service area deleted");
      await loadServiceAreas();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to delete service area",
      );
    }
  };

  const activeCount = serviceAreas.filter((item) => item.isActive).length;

  return (
    <div className="page-wrapper">
      <div className="container">
        <div className="page-header admin-header">
          <div>
            <h1>Manage Service Areas</h1>
            <p>
              Define the cities and regions where your rental service is
              available.
            </p>
          </div>
          <div className="admin-header-actions">
            <button
              className="btn btn-outline btn-sm"
              onClick={loadServiceAreas}
            >
              <RefreshCw size={14} /> Refresh
            </button>
          </div>
        </div>

        <div className="dash-stats">
          <div className="stat-card card admin-stat-blue">
            <div className="card-body">
              <div className="admin-stat-icon-wrap">
                <Plus size={18} />
              </div>
              <strong>{serviceAreas.length}</strong>
              <span>Total Areas</span>
            </div>
          </div>
          <div className="stat-card card admin-stat-green">
            <div className="card-body">
              <div className="admin-stat-icon-wrap">
                <Plus size={18} />
              </div>
              <strong>{activeCount}</strong>
              <span>Active Areas</span>
            </div>
          </div>
        </div>

        <div className="admin-summary-grid">
          <section className="card">
            <div className="card-body">
              <h3>{editingId ? "Edit Service Area" : "Add Service Area"}</h3>
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label className="form-label">City</label>
                  <input
                    className="form-control"
                    value={form.city}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, city: e.target.value }))
                    }
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">State</label>
                  <input
                    className="form-control"
                    value={form.state}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, state: e.target.value }))
                    }
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Pincode</label>
                  <input
                    className="form-control"
                    value={form.pincode}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, pincode: e.target.value }))
                    }
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Notes</label>
                  <textarea
                    className="form-control"
                    rows="3"
                    value={form.notes}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, notes: e.target.value }))
                    }
                    placeholder="Coverage notes, delivery caveats, or special instructions"
                  />
                </div>
                <label className="filter-radio" style={{ marginBottom: 16 }}>
                  <input
                    type="checkbox"
                    checked={form.isActive}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, isActive: e.target.checked }))
                    }
                  />
                  Active service area
                </label>
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  <button
                    className="btn btn-primary"
                    type="submit"
                    disabled={saving}
                  >
                    {saving
                      ? "Saving..."
                      : editingId
                        ? "Update Area"
                        : "Save Area"}
                  </button>
                  {editingId && (
                    <button
                      className="btn btn-outline"
                      type="button"
                      onClick={resetForm}
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </div>
          </section>

          <section className="card">
            <div className="card-body">
              <div className="admin-section-head">
                <h3>Current Service Areas</h3>
              </div>
              {loading ? (
                <div className="loading-center">
                  <div className="spinner" />
                </div>
              ) : serviceAreas.length === 0 ? (
                <div className="empty-state">
                  <h3>No service areas yet</h3>
                  <p>
                    Add your first supported city using the form on the left.
                  </p>
                </div>
              ) : (
                <div className="admin-list-grid">
                  {serviceAreas.map((serviceArea) => (
                    <article key={serviceArea._id} className="admin-list-item">
                      <div>
                        <p className="admin-list-title">
                          {serviceArea.city}, {serviceArea.state}
                        </p>
                        <p className="admin-muted">
                          Pincode: {serviceArea.pincode || "-"}
                        </p>
                        <p className="admin-muted">
                          {serviceArea.notes || "No notes"}
                        </p>
                      </div>
                      <div className="admin-user-actions">
                        <span
                          className={`badge ${serviceArea.isActive ? "badge-green" : "badge-red"}`}
                        >
                          {serviceArea.isActive ? "Active" : "Inactive"}
                        </span>
                        <div
                          style={{
                            display: "flex",
                            gap: 8,
                            flexWrap: "wrap",
                            justifyContent: "flex-end",
                          }}
                        >
                          <button
                            className="btn btn-outline btn-sm"
                            type="button"
                            onClick={() => handleEdit(serviceArea)}
                          >
                            Edit
                          </button>
                          <button
                            className="btn btn-outline btn-sm"
                            type="button"
                            onClick={() => handleRemove(serviceArea._id)}
                          >
                            <Trash2 size={14} /> Delete
                          </button>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
