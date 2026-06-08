import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { RefreshCw, Truck, CheckCircle2, RotateCcw } from "lucide-react";
import { getAllRentals, updateRentalStatus } from "../utils/api";
import "../styles/Dashboard.css";

const STATUSES = [
  "pending",
  "confirmed",
  "delivered",
  "active",
  "return_requested",
  "returned",
  "cancelled",
];

const STATUS_LABELS = {
  pending: "Pending",
  confirmed: "Confirmed",
  delivered: "Delivered",
  active: "Active",
  return_requested: "Return Requested",
  returned: "Returned",
  cancelled: "Cancelled",
};

const STATUS_BADGE = {
  pending: "badge-amber",
  confirmed: "badge-blue",
  delivered: "badge-blue",
  active: "badge-green",
  return_requested: "badge-amber",
  returned: "badge-green",
  cancelled: "badge-red",
};

const currency = (value) => `₹${Number(value || 0).toLocaleString("en-IN")}`;

export default function AdminRentals() {
  const [rentals, setRentals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("all");
  const [updatingId, setUpdatingId] = useState("");

  const loadRentals = async (status = activeFilter) => {
    setLoading(true);
    try {
      const params = { limit: 100 };
      if (status !== "all") params.status = status;
      const response = await getAllRentals(params);
      const data = response.data?.data ?? response.data ?? [];
      setRentals(Array.isArray(data) ? data : []);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load rentals");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRentals("all");
  }, []);

  const stats = useMemo(() => {
    return rentals.reduce(
      (acc, rental) => {
        const status = rental.status || "pending";
        acc.total += 1;
        acc.revenue += Number(rental.totalMonthlyRent || 0);
        if (status === "active") acc.active += 1;
        if (status === "return_requested") acc.returns += 1;
        if (status === "pending") acc.pending += 1;
        return acc;
      },
      { total: 0, active: 0, pending: 0, returns: 0, revenue: 0 },
    );
  }, [rentals]);

  const handleFilterChange = async (status) => {
    setActiveFilter(status);
    await loadRentals(status);
  };

  const handleStatusChange = async (rentalId, status) => {
    setUpdatingId(rentalId);
    try {
      await updateRentalStatus(rentalId, status);
      setRentals((current) =>
        current.map((rental) =>
          rental._id === rentalId ? { ...rental, status } : rental,
        ),
      );
      toast.success(`Rental marked as ${STATUS_LABELS[status]}`);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update status");
    } finally {
      setUpdatingId("");
    }
  };

  return (
    <div className="page-wrapper">
      <div className="container">
        <div className="page-header admin-header">
          <div>
            <h1>Manage Rentals</h1>
            <p>
              Track renter orders, process delivery lifecycle, and update
              statuses.
            </p>
          </div>
          <div className="admin-header-actions">
            <button
              className="btn btn-outline btn-sm"
              onClick={() => loadRentals(activeFilter)}
            >
              <RefreshCw size={14} /> Refresh
            </button>
          </div>
        </div>

        <div className="dash-stats">
          <div className="stat-card card admin-stat-blue">
            <div className="card-body">
              <div className="admin-stat-icon-wrap">
                <Truck size={18} />
              </div>
              <strong>{stats.total}</strong>
              <span>Total Orders</span>
            </div>
          </div>
          <div className="stat-card card admin-stat-green">
            <div className="card-body">
              <div className="admin-stat-icon-wrap">
                <CheckCircle2 size={18} />
              </div>
              <strong>{stats.active}</strong>
              <span>Active Rentals</span>
            </div>
          </div>
          <div className="stat-card card admin-stat-red">
            <div className="card-body">
              <div className="admin-stat-icon-wrap">
                <RotateCcw size={18} />
              </div>
              <strong>{stats.returns}</strong>
              <span>Return Requests</span>
            </div>
          </div>
          <div className="stat-card card admin-stat-amber">
            <div className="card-body">
              <div className="admin-stat-icon-wrap">
                <Truck size={18} />
              </div>
              <strong>{currency(stats.revenue)}</strong>
              <span>Monthly Revenue</span>
            </div>
          </div>
        </div>

        <div className="dash-tabs admin-filter-tabs">
          <button
            className={`tab-btn ${activeFilter === "all" ? "active" : ""}`}
            onClick={() => handleFilterChange("all")}
          >
            All
          </button>
          {STATUSES.map((status) => (
            <button
              key={status}
              className={`tab-btn ${activeFilter === status ? "active" : ""}`}
              onClick={() => handleFilterChange(status)}
            >
              {STATUS_LABELS[status]}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="loading-center">
            <div className="spinner" />
          </div>
        ) : rentals.length === 0 ? (
          <div className="empty-state">
            <h3>No rental orders found</h3>
            <p>
              Try another status filter or refresh after new checkout orders.
            </p>
          </div>
        ) : (
          <div className="tab-content">
            {rentals.map((rental) => (
              <article key={rental._id} className="rental-card card">
                <div className="card-body">
                  <div className="rental-header">
                    <div>
                      <p className="rental-id">
                        Order #{rental._id.slice(-8).toUpperCase()}
                      </p>
                      <p className="rental-date">
                        {new Date(rental.createdAt).toLocaleDateString(
                          "en-IN",
                          {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          },
                        )}
                      </p>
                      <p className="admin-muted">
                        {rental.user?.name || "User"} ·{" "}
                        {rental.user?.email || "-"}
                      </p>
                    </div>

                    <span
                      className={`badge ${STATUS_BADGE[rental.status] || "badge-amber"}`}
                    >
                      {STATUS_LABELS[rental.status] || STATUS_LABELS.pending}
                    </span>
                  </div>

                  <div className="rental-items">
                    {(rental.items || []).map((item, index) => (
                      <div
                        key={`${item.product?._id || index}-${index}`}
                        className="rental-item-row"
                      >
                        <span>
                          {item.product?.name || "Product"} × {item.quantity}
                        </span>
                        <span>{currency(item.monthlyRent)}/mo</span>
                      </div>
                    ))}
                  </div>

                  <div className="admin-rental-meta">
                    <span>
                      <strong>Tenure:</strong> {rental.tenureMonths} months
                    </span>
                    <span>
                      <strong>Monthly:</strong>{" "}
                      {currency(rental.totalMonthlyRent)}
                    </span>
                    <span>
                      <strong>Deposit:</strong>{" "}
                      {currency(rental.totalSecurityDeposit)}
                    </span>
                    <span>
                      <strong>Delivery:</strong>{" "}
                      {rental.deliveryDate
                        ? new Date(rental.deliveryDate).toLocaleDateString(
                            "en-IN",
                          )
                        : "-"}
                    </span>
                  </div>

                  <div className="rental-footer admin-rental-footer">
                    <div className="admin-muted">
                      {rental.deliveryAddress?.street},{" "}
                      {rental.deliveryAddress?.city},{" "}
                      {rental.deliveryAddress?.state} -{" "}
                      {rental.deliveryAddress?.pincode}
                    </div>

                    <div className="admin-status-actions">
                      <select
                        className="form-control"
                        value={rental.status || "pending"}
                        onChange={(event) =>
                          handleStatusChange(rental._id, event.target.value)
                        }
                        disabled={updatingId === rental._id}
                      >
                        {STATUSES.map((status) => (
                          <option key={status} value={status}>
                            {STATUS_LABELS[status]}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
