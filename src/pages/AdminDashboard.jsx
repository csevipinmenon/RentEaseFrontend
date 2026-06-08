import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Boxes,
  IndianRupee,
  RefreshCw,
  ShieldAlert,
  ShoppingBag,
  Users,
  Wrench,
  ArrowRight,
} from "lucide-react";
import toast from "react-hot-toast";
import { getAdminDashboard } from "../utils/api";
import "../styles/Dashboard.css";

const STAT_DEFS = [
  {
    key: "totalUsers",
    label: "Total Users",
    icon: Users,
    toneClass: "admin-stat-blue",
  },
  {
    key: "totalProducts",
    label: "Active Products",
    icon: Boxes,
    toneClass: "admin-stat-amber",
  },
  {
    key: "activeRentals",
    label: "Active Rentals",
    icon: ShoppingBag,
    toneClass: "admin-stat-green",
  },
  {
    key: "pendingMaintenance",
    label: "Maintenance Open",
    icon: Wrench,
    toneClass: "admin-stat-red",
  },
];

const currency = (value) => `₹${Number(value || 0).toLocaleString("en-IN")}`;

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);

  const loadDashboard = async () => {
    setLoading(true);
    try {
      const response = await getAdminDashboard();
      setStats(response.data?.data ?? null);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const statusMap = useMemo(() => {
    const pairs = (stats?.rentalsByStatus || []).map((item) => [
      item._id,
      item.count,
    ]);
    return Object.fromEntries(pairs);
  }, [stats]);

  const quickActions = [
    {
      title: "Manage Products",
      desc: "Add inventory, update listing details, and keep stock clean.",
      to: "/admin/products",
    },
    {
      title: "Review Rentals",
      desc: "Track rental lifecycle and process pending return requests.",
      to: "/admin/rentals",
    },
    {
      title: "Manage Maintenance",
      desc: "Handle customer repair requests, scheduling, and closures.",
      to: "/admin/maintenance",
    },
    {
      title: "Reports & Analytics",
      desc: "Generate performance reports and export dashboard insights.",
      to: "/admin/reports",
    },
    {
      title: "Service Areas",
      desc: "Define the cities and regions where delivery is available.",
      to: "/admin/service-areas",
    },
    {
      title: "Manage Users",
      desc: "Monitor customer accounts and activate/deactivate users.",
      to: "/admin/users",
    },
  ];

  return (
    <div className="page-wrapper">
      <div className="container">
        <div className="page-header admin-header">
          <div>
            <h1>Admin Command Center</h1>
            <p>
              Manage products, rentals, users, maintenance, and revenue at one
              place.
            </p>
          </div>
          <div className="admin-header-actions">
            <button className="btn btn-outline btn-sm" onClick={loadDashboard}>
              <RefreshCw size={14} /> Refresh
            </button>
            <Link className="btn btn-primary btn-sm" to="/products">
              Storefront <ArrowRight size={14} />
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="loading-center">
            <div className="spinner" />
          </div>
        ) : !stats ? (
          <div className="empty-state">
            <h3>Unable to load admin insights</h3>
            <p>Try refreshing. If this persists, check backend connectivity.</p>
          </div>
        ) : (
          <div className="admin-stack">
            <div className="dash-stats">
              {STAT_DEFS.map((stat) => {
                const Icon = stat.icon;
                return (
                  <div
                    key={stat.key}
                    className={`stat-card card ${stat.toneClass}`}
                  >
                    <div className="card-body">
                      <div className="admin-stat-icon-wrap">
                        <Icon size={20} />
                      </div>
                      <strong>
                        {Number(stats[stat.key] || 0).toLocaleString("en-IN")}
                      </strong>
                      <span>{stat.label}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="admin-summary-grid">
              <section className="card">
                <div className="card-body">
                  <h3>Revenue Snapshot</h3>
                  <div className="admin-revenue-strip">
                    <div>
                      <span>Monthly Revenue</span>
                      <strong>{currency(stats.monthlyRevenue)}</strong>
                    </div>
                    <div>
                      <span>Total Rentals</span>
                      <strong>
                        {Number(stats.totalRentals || 0).toLocaleString(
                          "en-IN",
                        )}
                      </strong>
                    </div>
                    <div>
                      <span>Return Requests</span>
                      <strong>
                        {Number(stats.returnRequests || 0).toLocaleString(
                          "en-IN",
                        )}
                      </strong>
                    </div>
                  </div>
                </div>
              </section>

              <section className="card">
                <div className="card-body">
                  <h3>Rental Status Mix</h3>
                  <div className="admin-status-list">
                    {Object.keys(statusMap).length === 0 ? (
                      <p className="admin-muted">No rentals yet.</p>
                    ) : (
                      Object.entries(statusMap).map(([status, count]) => (
                        <div key={status} className="admin-status-item">
                          <span className="admin-status-name">
                            {status.replaceAll("_", " ")}
                          </span>
                          <span className="badge badge-blue">{count}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </section>
            </div>

            <section className="card">
              <div className="card-body">
                <div className="admin-section-head">
                  <h3>Quick Actions</h3>
                </div>
                <div className="admin-action-grid">
                  {quickActions.map((action) => (
                    <Link
                      key={action.title}
                      to={action.to}
                      className="admin-action-card"
                    >
                      <h4>{action.title}</h4>
                      <p>{action.desc}</p>
                      <span>
                        Open <ArrowRight size={14} />
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            </section>

            <div className="admin-summary-grid">
              <section className="card">
                <div className="card-body">
                  <div className="admin-section-head">
                    <h3>Recent Rentals</h3>
                    <Link
                      to="/admin/rentals"
                      className="btn btn-outline btn-sm"
                    >
                      View All
                    </Link>
                  </div>

                  {stats.recentRentals?.length ? (
                    <div className="admin-list-grid">
                      {stats.recentRentals.map((rental) => (
                        <article key={rental._id} className="admin-list-item">
                          <div>
                            <p className="admin-list-title">
                              Order #{rental._id.slice(-8).toUpperCase()}
                            </p>
                            <p className="admin-muted">
                              {rental.user?.name || "User"} ·{" "}
                              {new Date(rental.createdAt).toLocaleDateString(
                                "en-IN",
                              )}
                            </p>
                          </div>
                          <div className="admin-list-meta">
                            <span className="badge badge-amber">
                              {String(rental.status || "pending").replaceAll(
                                "_",
                                " ",
                              )}
                            </span>
                            <strong>{currency(rental.totalMonthlyRent)}</strong>
                          </div>
                        </article>
                      ))}
                    </div>
                  ) : (
                    <p className="admin-muted">No recent rentals available.</p>
                  )}
                </div>
              </section>

              <section className="card">
                <div className="card-body">
                  <div className="admin-section-head">
                    <h3>Top Products</h3>
                    <Link
                      to="/admin/products"
                      className="btn btn-outline btn-sm"
                    >
                      Inventory
                    </Link>
                  </div>

                  {stats.topProducts?.length ? (
                    <div className="admin-list-grid">
                      {stats.topProducts.map((product) => (
                        <article key={product._id} className="admin-list-item">
                          <div>
                            <p className="admin-list-title">
                              {product.name || "Product"}
                            </p>
                            <p className="admin-muted">
                              {product.subCategory || "Category"}
                            </p>
                          </div>
                          <div className="admin-list-meta">
                            <span className="badge badge-blue">
                              {product.count} rentals
                            </span>
                            <strong>{currency(product.revenue)}</strong>
                          </div>
                        </article>
                      ))}
                    </div>
                  ) : (
                    <p className="admin-muted">
                      Top products will appear after rentals start.
                    </p>
                  )}
                </div>
              </section>
            </div>

            <section className="card">
              <div className="card-body admin-alert-strip">
                <ShieldAlert size={18} />
                <p>
                  Action required: {Number(stats.returnRequests || 0)} return
                  requests and {Number(stats.pendingMaintenance || 0)} open
                  maintenance cases.
                </p>
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  );
}
