import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import {
  getMyRentals,
  getMyMaintenanceRequests,
  createMaintenanceRequest,
} from "../utils/api";
import toast from "react-hot-toast";
import { Package, Wrench, Clock, CheckCircle, Truck } from "lucide-react";
import "../styles/Dashboard.css";

const STATUS_COLORS = {
  pending: "badge-amber",
  confirmed: "badge-blue",
  delivered: "badge-blue",
  active: "badge-green",
  return_requested: "badge-amber",
  returned: "badge-green",
  cancelled: "badge-red",
};

const STATUS_ICONS = {
  pending: <Clock size={14} />,
  confirmed: <CheckCircle size={14} />,
  delivered: <Truck size={14} />,
  active: <CheckCircle size={14} />,
};

export default function Dashboard() {
  const { user } = useAuth();
  const [rentals, setRentals] = useState([]);
  const [maintenance, setMaintenance] = useState([]);
  const [activeTab, setActiveTab] = useState("rentals");
  const [loading, setLoading] = useState(true);
  const [showMaintForm, setShowMaintForm] = useState(false);
  const [maintForm, setMaintForm] = useState({
    rentalId: "",
    productId: "",
    issueType: "repair",
    description: "",
    priority: "medium",
  });

  const selectedRental = rentals.find((r) => r._id === maintForm.rentalId);
  const selectedRentalItems = selectedRental?.items || [];

  useEffect(() => {
    Promise.all([getMyRentals(), getMyMaintenanceRequests()])
      .then(([r, m]) => {
        setRentals(r.data?.data ?? r.data ?? []);
        setMaintenance(m.data?.data ?? m.data ?? []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleMaintSubmit = async (e) => {
    e.preventDefault();
    try {
      await createMaintenanceRequest(maintForm);
      toast.success("Maintenance request submitted!");
      setShowMaintForm(false);
      setMaintForm({
        rentalId: "",
        productId: "",
        issueType: "repair",
        description: "",
        priority: "medium",
      });
      const r = await getMyMaintenanceRequests();
      setMaintenance(r.data?.data ?? r.data ?? []);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to submit request");
    }
  };

  if (loading)
    return (
      <div className="page-wrapper loading-center">
        <div className="spinner" />
      </div>
    );

  const activeRentals = rentals.filter((r) =>
    ["active", "delivered", "confirmed"].includes(r.status),
  );

  const canSubmitMaintenance =
    maintForm.rentalId &&
    maintForm.productId &&
    maintForm.issueType &&
    maintForm.description.trim();

  return (
    <div className="page-wrapper">
      <div className="container">
        <div className="page-header">
          <div>
            <h1>My Dashboard</h1>
            <p>Welcome back, {user?.name}!</p>
          </div>
        </div>

        {/* Stats */}
        <div className="dash-stats">
          <div className="stat-card card">
            <div className="card-body">
              <Package size={24} />
              <strong>{rentals.length}</strong>
              <span>Total Rentals</span>
            </div>
          </div>
          <div className="stat-card card">
            <div className="card-body">
              <CheckCircle size={24} color="var(--green)" />
              <strong>{activeRentals.length}</strong>
              <span>Active</span>
            </div>
          </div>
          <div className="stat-card card">
            <div className="card-body">
              <Wrench size={24} color="var(--accent)" />
              <strong>{maintenance.length}</strong>
              <span>Maintenance Requests</span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="dash-tabs">
          <button
            className={`tab-btn ${activeTab === "rentals" ? "active" : ""}`}
            onClick={() => setActiveTab("rentals")}
          >
            My Rentals
          </button>
          <button
            className={`tab-btn ${activeTab === "maintenance" ? "active" : ""}`}
            onClick={() => setActiveTab("maintenance")}
          >
            Maintenance
          </button>
        </div>

        {/* Rentals Tab */}
        {activeTab === "rentals" && (
          <div className="tab-content">
            {rentals.length === 0 ? (
              <div className="empty-state">
                <Package size={48} strokeWidth={1} />
                <h3>No rentals yet</h3>
                <p>Start by browsing and renting products.</p>
              </div>
            ) : (
              rentals.map((rental) => (
                <div key={rental._id} className="rental-card card">
                  <div className="card-body">
                    <div className="rental-header">
                      <div>
                        <p className="rental-id">
                          Order #{rental._id.slice(-8).toUpperCase()}
                        </p>
                        <p className="rental-date">
                          {new Date(rental.createdAt).toLocaleDateString(
                            "en-IN",
                            { day: "numeric", month: "long", year: "numeric" },
                          )}
                        </p>
                      </div>
                      <span
                        className={`badge ${STATUS_COLORS[rental.status] || "badge-amber"}`}
                      >
                        {rental.status.replace("_", " ").toUpperCase()}
                      </span>
                    </div>
                    <div className="rental-items">
                      {rental.items.map((item, i) => (
                        <div key={i} className="rental-item-row">
                          <span>
                            {item.product?.name || "Product"} × {item.quantity}
                          </span>
                          <span>₹{item.monthlyRent?.toLocaleString()}/mo</span>
                        </div>
                      ))}
                    </div>
                    <div className="rental-footer">
                      <div>
                        <span>
                          Monthly:{" "}
                          <strong>
                            ₹{rental.totalMonthlyRent?.toLocaleString()}
                          </strong>
                        </span>
                        <span>
                          Tenure: <strong>{rental.tenureMonths} months</strong>
                        </span>
                        <span>
                          Deposit:{" "}
                          <strong>
                            ₹{rental.totalSecurityDeposit?.toLocaleString()}
                          </strong>
                        </span>
                      </div>
                      {rental.status === "active" && (
                        <button
                          className="btn btn-outline btn-sm"
                          onClick={() => {
                            setMaintForm((f) => ({
                              ...f,
                              rentalId: rental._id,
                              productId: rental.items[0]?.product?._id || "",
                            }));
                            setShowMaintForm(true);
                            setActiveTab("maintenance");
                          }}
                        >
                          Request Maintenance
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Maintenance Tab */}
        {activeTab === "maintenance" && (
          <div className="tab-content">
            <div className="tab-actions">
              <button
                className="btn btn-primary btn-sm"
                onClick={() => setShowMaintForm(!showMaintForm)}
              >
                {showMaintForm ? "Cancel" : "+ New Request"}
              </button>
            </div>

            {showMaintForm && (
              <form className="maint-form card" onSubmit={handleMaintSubmit}>
                <div className="card-body">
                  <h3>Submit Maintenance Request</h3>
                  <div className="form-group">
                    <label className="form-label">Select Rental</label>
                    <select
                      className="form-control"
                      value={maintForm.rentalId}
                      onChange={(e) => {
                        const rental = rentals.find(
                          (r) => r._id === e.target.value,
                        );
                        setMaintForm((f) => ({
                          ...f,
                          rentalId: e.target.value,
                          productId: rental?.items[0]?.product?._id || "",
                        }));
                      }}
                      required
                    >
                      <option value="">-- Select an active rental --</option>
                      {rentals
                        .filter((r) =>
                          ["active", "delivered"].includes(r.status),
                        )
                        .map((r) => (
                          <option key={r._id} value={r._id}>
                            Order #{r._id.slice(-8).toUpperCase()}
                          </option>
                        ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Select Product</label>
                    <select
                      className="form-control"
                      value={maintForm.productId}
                      onChange={(e) =>
                        setMaintForm((f) => ({
                          ...f,
                          productId: e.target.value,
                        }))
                      }
                      required
                    >
                      <option value="">-- Select a product --</option>
                      {selectedRentalItems.map((item) => (
                        <option
                          key={item.product?._id}
                          value={item.product?._id || ""}
                        >
                          {item.product?.name || "Product"}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Issue Type</label>
                    <select
                      className="form-control"
                      value={maintForm.issueType}
                      onChange={(e) =>
                        setMaintForm((f) => ({
                          ...f,
                          issueType: e.target.value,
                        }))
                      }
                      required
                    >
                      <option value="repair">Repair</option>
                      <option value="replacement">Replacement</option>
                      <option value="general_service">General Service</option>
                      <option value="damage">Damage</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Details</label>
                    <textarea
                      className="form-control"
                      rows={3}
                      placeholder="Describe the problem in detail..."
                      value={maintForm.description}
                      onChange={(e) =>
                        setMaintForm((f) => ({
                          ...f,
                          description: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Priority</label>
                    <select
                      className="form-control"
                      value={maintForm.priority}
                      onChange={(e) =>
                        setMaintForm((f) => ({
                          ...f,
                          priority: e.target.value,
                        }))
                      }
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={!canSubmitMaintenance}
                  >
                    Submit Request
                  </button>
                </div>
              </form>
            )}

            {maintenance.length === 0 && !showMaintForm ? (
              <div className="empty-state">
                <Wrench size={48} strokeWidth={1} />
                <h3>No maintenance requests</h3>
                <p>Submit a request if any product needs repair.</p>
              </div>
            ) : (
              maintenance.map((req) => (
                <div key={req._id} className="maint-card card">
                  <div className="card-body">
                    <div className="rental-header">
                      <div>
                        <strong>{req.issue}</strong>
                        <p className="rental-date">
                          {req.product?.name} ·{" "}
                          {new Date(req.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <span
                        className={`badge ${req.status === "resolved" ? "badge-green" : req.status === "in_progress" ? "badge-blue" : "badge-amber"}`}
                      >
                        {req.status.replace("_", " ")}
                      </span>
                    </div>
                    {req.description && (
                      <p className="maint-desc">{req.description}</p>
                    )}
                    {req.adminNotes && (
                      <p className="admin-notes">
                        <strong>Team Note:</strong> {req.adminNotes}
                      </p>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
