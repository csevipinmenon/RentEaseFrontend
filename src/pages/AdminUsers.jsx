import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { RefreshCw, Search, Users } from "lucide-react";
import { getAllUsers, toggleUserStatus } from "../utils/api";
import "../styles/Dashboard.css";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 1 });
  const [updatingId, setUpdatingId] = useState("");

  const loadUsers = async (nextPage = page, nextSearch = search) => {
    setLoading(true);
    try {
      const params = { page: nextPage, limit: 12 };
      if (nextSearch.trim()) params.search = nextSearch.trim();
      const response = await getAllUsers(params);
      const data = response.data?.data ?? [];
      setUsers(Array.isArray(data) ? data : []);
      setPagination(
        response.data?.pagination || { total: data.length, page: 1, pages: 1 },
      );
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers(1, "");
  }, []);

  const handleSearchSubmit = async (event) => {
    event.preventDefault();
    const trimmed = query.trim();
    setSearch(trimmed);
    setPage(1);
    await loadUsers(1, trimmed);
  };

  const handleToggleStatus = async (userId) => {
    setUpdatingId(userId);
    try {
      const response = await toggleUserStatus(userId);
      const updatedUser = response.data?.data;
      setUsers((currentUsers) =>
        currentUsers.map((user) =>
          user._id === userId
            ? { ...user, isActive: updatedUser?.isActive ?? !user.isActive }
            : user,
        ),
      );
      toast.success(response.data?.message || "User status updated");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update user");
    } finally {
      setUpdatingId("");
    }
  };

  const stats = useMemo(() => {
    const active = users.filter((user) => user.isActive).length;
    const inactive = users.length - active;
    return {
      total: Number(pagination.total || users.length),
      active,
      inactive,
    };
  }, [users, pagination.total]);

  const canPrev = page > 1;
  const canNext = page < Number(pagination.pages || 1);

  const goToPage = async (nextPage) => {
    setPage(nextPage);
    await loadUsers(nextPage, search);
  };

  return (
    <div className="page-wrapper">
      <div className="container">
        <div className="page-header admin-header">
          <div>
            <h1>Manage Users</h1>
            <p>
              Search customers, monitor account state, and activate/deactivate
              access.
            </p>
          </div>
          <div className="admin-header-actions">
            <button
              className="btn btn-outline btn-sm"
              onClick={() => loadUsers(page, search)}
            >
              <RefreshCw size={14} /> Refresh
            </button>
          </div>
        </div>

        <div className="dash-stats">
          <div className="stat-card card admin-stat-blue">
            <div className="card-body">
              <div className="admin-stat-icon-wrap">
                <Users size={18} />
              </div>
              <strong>{stats.total}</strong>
              <span>Total Users</span>
            </div>
          </div>
          <div className="stat-card card admin-stat-green">
            <div className="card-body">
              <div className="admin-stat-icon-wrap">
                <Users size={18} />
              </div>
              <strong>{stats.active}</strong>
              <span>Active Users</span>
            </div>
          </div>
          <div className="stat-card card admin-stat-red">
            <div className="card-body">
              <div className="admin-stat-icon-wrap">
                <Users size={18} />
              </div>
              <strong>{stats.inactive}</strong>
              <span>Inactive Users</span>
            </div>
          </div>
        </div>

        <section className="card admin-users-panel">
          <div className="card-body">
            <div className="admin-section-head">
              <h3>User Directory</h3>
              <form className="admin-user-search" onSubmit={handleSearchSubmit}>
                <Search size={16} />
                <input
                  className="form-control"
                  placeholder="Search by name or email"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                />
                <button type="submit" className="btn btn-primary btn-sm">
                  Search
                </button>
              </form>
            </div>

            {loading ? (
              <div className="loading-center">
                <div className="spinner" />
              </div>
            ) : users.length === 0 ? (
              <div className="empty-state">
                <h3>No users found</h3>
                <p>Try a different search or clear the filter.</p>
              </div>
            ) : (
              <>
                <div className="admin-users-list">
                  {users.map((user) => (
                    <article key={user._id} className="admin-user-item">
                      <div className="admin-user-main">
                        <p className="admin-list-title">{user.name}</p>
                        <p className="admin-muted">{user.email}</p>
                        <p className="admin-muted">
                          Phone: {user.phone || "-"}
                        </p>
                        <p className="admin-muted">
                          Joined{" "}
                          {new Date(user.createdAt).toLocaleDateString("en-IN")}
                        </p>
                      </div>

                      <div className="admin-user-actions">
                        <span
                          className={`badge ${user.isActive ? "badge-green" : "badge-red"}`}
                        >
                          {user.isActive ? "Active" : "Inactive"}
                        </span>
                        <button
                          className={`btn btn-sm ${user.isActive ? "btn-outline" : "btn-primary"}`}
                          onClick={() => handleToggleStatus(user._id)}
                          disabled={updatingId === user._id}
                        >
                          {updatingId === user._id
                            ? "Updating..."
                            : user.isActive
                              ? "Deactivate"
                              : "Activate"}
                        </button>
                      </div>
                    </article>
                  ))}
                </div>

                <div className="admin-pagination">
                  <button
                    className="btn btn-outline btn-sm"
                    onClick={() => goToPage(page - 1)}
                    disabled={!canPrev}
                  >
                    Previous
                  </button>
                  <span>
                    Page {pagination.page || page} of {pagination.pages || 1}
                  </span>
                  <button
                    className="btn btn-outline btn-sm"
                    onClick={() => goToPage(page + 1)}
                    disabled={!canNext}
                  >
                    Next
                  </button>
                </div>
              </>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
