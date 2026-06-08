import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import {
  Download,
  RefreshCw,
  TrendingUp,
  ClipboardList,
  Wrench,
} from "lucide-react";
import {
  getAdminDashboard,
  getAllRentals,
  getAllMaintenanceRequests,
} from "../utils/api";
import "../styles/Dashboard.css";

const currency = (value) => `₹${Number(value || 0).toLocaleString("en-IN")}`;

const downloadJson = (filename, data) => {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
};

export default function AdminReports() {
  const [loading, setLoading] = useState(true);
  const [report, setReport] = useState(null);

  const loadReport = async () => {
    setLoading(true);
    try {
      const [dashboard, rentalsResponse, maintenanceResponse] =
        await Promise.all([
          getAdminDashboard(),
          getAllRentals({ limit: 100 }),
          getAllMaintenanceRequests({ limit: 100 }),
        ]);

      const dashboardData = dashboard.data?.data ?? {};
      const rentals = rentalsResponse.data?.data ?? [];
      const maintenance = maintenanceResponse.data?.data ?? [];

      const maintenanceByType = maintenance.reduce((acc, item) => {
        const type = item.issueType || "unknown";
        acc[type] = (acc[type] || 0) + 1;
        return acc;
      }, {});

      const rentalsByStatus = rentals.reduce((acc, item) => {
        const status = item.status || "pending";
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      }, {});

      const revenueByRental = rentals
        .map((item) => ({
          id: item._id,
          amount: Number(item.totalMonthlyRent || 0),
        }))
        .sort((a, b) => b.amount - a.amount)
        .slice(0, 5);

      setReport({
        dashboard: dashboardData,
        rentals,
        maintenance,
        maintenanceByType,
        rentalsByStatus,
        revenueByRental,
      });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load reports");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReport();
  }, []);

  const analytics = useMemo(() => {
    if (!report) return null;
    return {
      totalRentals: report.rentals.length,
      totalMaintenance: report.maintenance.length,
      damageClaims: report.maintenanceByType.damage || 0,
      openMaintenance: report.maintenance.filter(
        (item) => item.status === "open",
      ).length,
    };
  }, [report]);

  const handleExport = () => {
    if (!report) return;
    downloadJson(
      `rentease-report-${new Date().toISOString().slice(0, 10)}.json`,
      report,
    );
  };

  return (
    <div className="page-wrapper">
      <div className="container">
        <div className="page-header admin-header">
          <div>
            <h1>Reports & Analytics</h1>
            <p>
              Generate business insights across rentals, maintenance, and
              revenue.
            </p>
          </div>
          <div className="admin-header-actions">
            <button className="btn btn-outline btn-sm" onClick={loadReport}>
              <RefreshCw size={14} /> Refresh
            </button>
            <button
              className="btn btn-primary btn-sm"
              onClick={handleExport}
              disabled={!report}
            >
              <Download size={14} /> Export JSON
            </button>
          </div>
        </div>

        {loading ? (
          <div className="loading-center">
            <div className="spinner" />
          </div>
        ) : !report ? (
          <div className="empty-state">
            <h3>Unable to load reports</h3>
            <p>Try refreshing or check backend connectivity.</p>
          </div>
        ) : (
          <div className="admin-stack">
            <div className="dash-stats">
              <div className="stat-card card admin-stat-blue">
                <div className="card-body">
                  <div className="admin-stat-icon-wrap">
                    <TrendingUp size={18} />
                  </div>
                  <strong>{currency(report.dashboard.monthlyRevenue)}</strong>
                  <span>Monthly Revenue</span>
                </div>
              </div>
              <div className="stat-card card admin-stat-amber">
                <div className="card-body">
                  <div className="admin-stat-icon-wrap">
                    <ClipboardList size={18} />
                  </div>
                  <strong>{analytics.totalRentals}</strong>
                  <span>Total Rentals</span>
                </div>
              </div>
              <div className="stat-card card admin-stat-red">
                <div className="card-body">
                  <div className="admin-stat-icon-wrap">
                    <Wrench size={18} />
                  </div>
                  <strong>{analytics.totalMaintenance}</strong>
                  <span>Maintenance Requests</span>
                </div>
              </div>
              <div className="stat-card card admin-stat-green">
                <div className="card-body">
                  <div className="admin-stat-icon-wrap">
                    <Wrench size={18} />
                  </div>
                  <strong>{analytics.damageClaims}</strong>
                  <span>Damage Claims</span>
                </div>
              </div>
            </div>

            <div className="admin-summary-grid">
              <section className="card">
                <div className="card-body">
                  <h3>Rental Status Breakdown</h3>
                  <div className="admin-status-list">
                    {Object.entries(report.rentalsByStatus).map(
                      ([status, count]) => (
                        <div key={status} className="admin-status-item">
                          <span className="admin-status-name">
                            {status.replaceAll("_", " ")}
                          </span>
                          <span className="badge badge-blue">{count}</span>
                        </div>
                      ),
                    )}
                  </div>
                </div>
              </section>

              <section className="card">
                <div className="card-body">
                  <h3>Maintenance Breakdown</h3>
                  <div className="admin-status-list">
                    {Object.entries(report.maintenanceByType).map(
                      ([type, count]) => (
                        <div key={type} className="admin-status-item">
                          <span className="admin-status-name">
                            {type.replaceAll("_", " ")}
                          </span>
                          <span className="badge badge-amber">{count}</span>
                        </div>
                      ),
                    )}
                  </div>
                </div>
              </section>
            </div>

            <section className="card">
              <div className="card-body">
                <div className="admin-section-head">
                  <h3>Top Revenue Rentals</h3>
                </div>
                <div className="admin-list-grid">
                  {report.revenueByRental.map((item) => (
                    <article key={item.id} className="admin-list-item">
                      <div>
                        <p className="admin-list-title">
                          Order #{item.id.slice(-8).toUpperCase()}
                        </p>
                        <p className="admin-muted">
                          Highest monthly value orders
                        </p>
                      </div>
                      <strong>{currency(item.amount)}</strong>
                    </article>
                  ))}
                </div>
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  );
}
