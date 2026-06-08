import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { RefreshCw, ShieldAlert, Wrench } from "lucide-react";
import {
  getAllMaintenanceRequests,
  updateMaintenanceRequest,
} from "../utils/api";
import "../styles/Dashboard.css";

const STATUS_OPTIONS = ["open", "in_progress", "resolved", "closed"];
const PRIORITY_OPTIONS = ["all", "low", "medium", "high"];
const ISSUE_OPTIONS = [
  "all",
  "repair",
  "replacement",
  "general_service",
  "damage",
];

const STATUS_LABELS = {
  open: "Open",
  in_progress: "In Progress",
  resolved: "Resolved",
  closed: "Closed",
};

const STATUS_BADGE = {
  open: "badge-amber",
  in_progress: "badge-blue",
  resolved: "badge-green",
  closed: "badge-green",
};

const ISSUE_LABELS = {
  repair: "Repair",
  replacement: "Replacement",
  general_service: "General Service",
  damage: "Damage Claim",
};

const DISPUTE_LABELS = {
  other: "Other",
  damage_claim: "Damage Claim",
  billing_dispute: "Billing Dispute",
  delivery_dispute: "Delivery Dispute",
};

export default function AdminMaintenance() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [issueFilter, setIssueFilter] = useState("all");
  const [updatingId, setUpdatingId] = useState("");
  const [formById, setFormById] = useState({});

  const loadRequests = async (
    status = statusFilter,
    priority = priorityFilter,
    issueType = issueFilter,
  ) => {
    setLoading(true);
    try {
      const params = { limit: 100 };
      if (status !== "all") params.status = status;
      if (priority !== "all") params.priority = priority;
      if (issueType !== "all") params.issueType = issueType;
      const response = await getAllMaintenanceRequests(params);
      const data = response.data?.data ?? response.data ?? [];
      setRequests(Array.isArray(data) ? data : []);
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to load maintenance requests",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const stats = useMemo(
    () =>
      requests.reduce(
        (acc, request) => {
          acc.total += 1;
          acc[request.status] = (acc[request.status] || 0) + 1;
          if (request.issueType === "damage") acc.damage += 1;
          return acc;
        },
        {
          total: 0,
          open: 0,
          in_progress: 0,
          resolved: 0,
          closed: 0,
          damage: 0,
        },
      ),
    [requests],
  );

  const handleFilter = async (nextStatus, nextPriority, nextIssueType) => {
    setStatusFilter(nextStatus);
    setPriorityFilter(nextPriority);
    setIssueFilter(nextIssueType);
    await loadRequests(nextStatus, nextPriority, nextIssueType);
  };

  const updateField = (id, field, value) => {
    setFormById((current) => ({
      ...current,
      [id]: { ...(current[id] || {}), [field]: value },
    }));
  };

  const handleSave = async (requestId) => {
    setUpdatingId(requestId);
    try {
      const values = formById[requestId] || {};
      await updateMaintenanceRequest(requestId, values);
      toast.success("Maintenance request updated");
      await loadRequests(statusFilter, priorityFilter, issueFilter);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update request");
    } finally {
      setUpdatingId("");
    }
  };

  return (
    <div className="page-wrapper">
      <div className="container">
        <div className="page-header admin-header">
          <div>
            <h1>Manage Maintenance & Claims</h1>
            <p>
              Handle repair requests, damage claims, scheduling, and closure
              notes.
            </p>
          </div>
          <div className="admin-header-actions">
            <button
              className="btn btn-outline btn-sm"
              onClick={() =>
                loadRequests(statusFilter, priorityFilter, issueFilter)
              }
            >
              <RefreshCw size={14} /> Refresh
            </button>
          </div>
        </div>

        <div className="dash-stats">
          <div className="stat-card card admin-stat-amber">
            <div className="card-body">
              <div className="admin-stat-icon-wrap">
                <Wrench size={18} />
              </div>
              <strong>{stats.total}</strong>
              <span>Total Requests</span>
            </div>
          </div>
          <div className="stat-card card admin-stat-red">
            <div className="card-body">
              <div className="admin-stat-icon-wrap">
                <Wrench size={18} />
              </div>
              <strong>{stats.open}</strong>
              <span>Open</span>
            </div>
          </div>
          <div className="stat-card card admin-stat-blue">
            <div className="card-body">
              <div className="admin-stat-icon-wrap">
                <Wrench size={18} />
              </div>
              <strong>{stats.in_progress}</strong>
              <span>In Progress</span>
            </div>
          </div>
          <div className="stat-card card admin-stat-green">
            <div className="card-body">
              <div className="admin-stat-icon-wrap">
                <ShieldAlert size={18} />
              </div>
              <strong>{stats.damage}</strong>
              <span>Damage Claims</span>
            </div>
          </div>
        </div>

        <div className="dash-tabs admin-filter-tabs">
          <button
            className={`tab-btn ${statusFilter === "all" ? "active" : ""}`}
            onClick={() => handleFilter("all", priorityFilter, issueFilter)}
          >
            All Statuses
          </button>
          {STATUS_OPTIONS.map((status) => (
            <button
              key={status}
              className={`tab-btn ${statusFilter === status ? "active" : ""}`}
              onClick={() => handleFilter(status, priorityFilter, issueFilter)}
            >
              {STATUS_LABELS[status]}
            </button>
          ))}
          <select
            className="form-control"
            value={issueFilter}
            onChange={(e) =>
              handleFilter(statusFilter, priorityFilter, e.target.value)
            }
            style={{ maxWidth: 180 }}
          >
            {ISSUE_OPTIONS.map((issueType) => (
              <option key={issueType} value={issueType}>
                {issueType === "all"
                  ? "All Request Types"
                  : ISSUE_LABELS[issueType]}
              </option>
            ))}
          </select>
          <select
            className="form-control"
            value={priorityFilter}
            onChange={(e) =>
              handleFilter(statusFilter, e.target.value, issueFilter)
            }
            style={{ maxWidth: 180 }}
          >
            {PRIORITY_OPTIONS.map((priority) => (
              <option key={priority} value={priority}>
                {priority === "all" ? "All Priorities" : priority}
              </option>
            ))}
          </select>
        </div>

        {loading ? (
          <div className="loading-center">
            <div className="spinner" />
          </div>
        ) : requests.length === 0 ? (
          <div className="empty-state">
            <h3>No maintenance requests found</h3>
            <p>
              Try another filter or wait for customers to submit maintenance and
              claim requests.
            </p>
          </div>
        ) : (
          <div className="tab-content">
            {requests.map((request) => {
              const values = formById[request._id] || {
                status: request.status,
                adminNotes: request.adminNotes || "",
                scheduledDate: request.scheduledDate
                  ? String(request.scheduledDate).slice(0, 10)
                  : "",
                disputeType: request.disputeType || "other",
              };

              return (
                <article key={request._id} className="card maint-card">
                  <div className="card-body">
                    <div className="rental-header">
                      <div>
                        <p className="rental-id">
                          {ISSUE_LABELS[request.issueType] || "Maintenance"}
                        </p>
                        <p className="rental-date">
                          {request.user?.name || "User"} ·{" "}
                          {request.product?.name || "Product"} ·{" "}
                          {new Date(request.createdAt).toLocaleDateString(
                            "en-IN",
                          )}
                        </p>
                      </div>
                      <span
                        className={`badge ${STATUS_BADGE[request.status] || "badge-amber"}`}
                      >
                        {STATUS_LABELS[request.status] || request.status}
                      </span>
                    </div>

                    <p className="maint-desc">{request.description}</p>

                    <div className="admin-rental-meta">
                      <span>
                        <strong>Rental:</strong>{" "}
                        {request.rental?._id
                          ? request.rental._id.slice(-8).toUpperCase()
                          : "-"}
                      </span>
                      <span>
                        <strong>Priority:</strong> {request.priority}
                      </span>
                      <span>
                        <strong>Issue Type:</strong>{" "}
                        {ISSUE_LABELS[request.issueType] || request.issueType}
                      </span>
                      <span>
                        <strong>Scheduled:</strong>{" "}
                        {request.scheduledDate
                          ? new Date(request.scheduledDate).toLocaleDateString(
                              "en-IN",
                            )
                          : "Not set"}
                      </span>
                    </div>

                    <div className="admin-maintenance-actions">
                      <div className="form-group">
                        <label className="form-label">Status</label>
                        <select
                          className="form-control"
                          value={values.status}
                          onChange={(e) =>
                            updateField(request._id, "status", e.target.value)
                          }
                        >
                          {STATUS_OPTIONS.map((status) => (
                            <option key={status} value={status}>
                              {STATUS_LABELS[status]}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="form-group">
                        <label className="form-label">Scheduled Date</label>
                        <input
                          className="form-control"
                          type="date"
                          value={values.scheduledDate}
                          onChange={(e) =>
                            updateField(
                              request._id,
                              "scheduledDate",
                              e.target.value,
                            )
                          }
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Admin Notes</label>
                        <textarea
                          className="form-control"
                          rows="3"
                          value={values.adminNotes}
                          onChange={(e) =>
                            updateField(
                              request._id,
                              "adminNotes",
                              e.target.value,
                            )
                          }
                          placeholder="Add technician notes, replacement decisions, or customer instructions"
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Dispute Type</label>
                        <select
                          className="form-control"
                          value={values.disputeType}
                          onChange={(e) =>
                            updateField(
                              request._id,
                              "disputeType",
                              e.target.value,
                            )
                          }
                        >
                          {Object.entries(DISPUTE_LABELS).map(
                            ([value, label]) => (
                              <option key={value} value={value}>
                                {label}
                              </option>
                            ),
                          )}
                        </select>
                      </div>
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => handleSave(request._id)}
                        disabled={updatingId === request._id}
                      >
                        {updatingId === request._id
                          ? "Saving..."
                          : "Save Update"}
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
