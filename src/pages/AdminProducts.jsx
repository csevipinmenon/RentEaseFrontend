import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { createProduct, getProducts } from "../utils/api";
import { Package, Plus, PencilLine, Trash2 } from "lucide-react";
import "../styles/Products.css";

const EMPTY_FORM = {
  name: "",
  description: "",
  category: "Furniture",
  subCategory: "Bed",
  brand: "",
  images: "",
  monthlyRent: "",
  securityDeposit: "",
  availableQty: "",
  totalQty: "",
  cities: "",
  isActive: true,
};

const SUBCATEGORIES = {
  Furniture: ["Bed", "Sofa", "Table", "Chair", "Wardrobe"],
  Appliances: ["Refrigerator", "Washing Machine", "TV", "AC", "Microwave"],
};

const normalizeList = (value) =>
  value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

export default function AdminProducts() {
  const [form, setForm] = useState(EMPTY_FORM);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const response = await getProducts({ limit: 100 });
      const items = response.data?.data ?? response.data ?? [];
      setProducts(Array.isArray(items) ? items : []);
    } catch {
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    const subCategories = SUBCATEGORIES[form.category] || [];
    if (!subCategories.includes(form.subCategory)) {
      setForm((current) => ({
        ...current,
        subCategory: subCategories[0] || "",
      }));
    }
  }, [form.category, form.subCategory]);

  const handleChange = (field) => (event) => {
    const value =
      event.target.type === "checkbox"
        ? event.target.checked
        : event.target.value;
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);

    const payload = {
      name: form.name.trim(),
      description: form.description.trim(),
      category: form.category,
      subCategory: form.subCategory,
      brand: form.brand.trim(),
      images: normalizeList(form.images),
      monthlyRent: Number(form.monthlyRent),
      securityDeposit: Number(form.securityDeposit),
      availableQty: Number(form.availableQty),
      totalQty: Number(form.totalQty),
      cities: normalizeList(form.cities),
      isActive: form.isActive,
    };

    try {
      await createProduct(payload);
      toast.success("Product created successfully");
      setForm(EMPTY_FORM);
      await loadProducts();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create product");
    } finally {
      setSubmitting(false);
    }
  };

  const availableCount = products.filter(
    (product) => Number(product.availableQty ?? 0) > 0,
  ).length;

  return (
    <div className="page-wrapper">
      <div className="container">
        <div className="page-header">
          <div>
            <h1>Manage Products</h1>
            <p>Add inventory and keep the catalog in sync with the database.</p>
          </div>
          <div className="dash-stats" style={{ gap: "1rem" }}>
            <div className="stat-card card">
              <div className="card-body">
                <Package size={22} />
                <strong>{products.length}</strong>
                <span>Total Products</span>
              </div>
            </div>
            <div className="stat-card card">
              <div className="card-body">
                <Plus size={22} />
                <strong>{availableCount}</strong>
                <span>Available Now</span>
              </div>
            </div>
          </div>
        </div>

        <div
          className="admin-grid"
          style={{
            display: "grid",
            gap: "1.5rem",
            gridTemplateColumns: "minmax(320px, 420px) 1fr",
          }}
        >
          <form className="card" onSubmit={handleSubmit}>
            <div className="card-body">
              <h3 style={{ marginTop: 0 }}>Add New Product</h3>

              <div className="form-group">
                <label className="form-label">Product Name</label>
                <input
                  className="form-control"
                  value={form.name}
                  onChange={handleChange("name")}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  className="form-control"
                  rows="4"
                  value={form.description}
                  onChange={handleChange("description")}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Category</label>
                <select
                  className="form-control"
                  value={form.category}
                  onChange={handleChange("category")}
                >
                  <option value="Furniture">Furniture</option>
                  <option value="Appliances">Appliances</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Sub Category</label>
                <select
                  className="form-control"
                  value={form.subCategory}
                  onChange={handleChange("subCategory")}
                >
                  {(SUBCATEGORIES[form.category] || []).map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Brand</label>
                <input
                  className="form-control"
                  value={form.brand}
                  onChange={handleChange("brand")}
                  placeholder="Optional"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Image URLs</label>
                <textarea
                  className="form-control"
                  rows="3"
                  value={form.images}
                  onChange={handleChange("images")}
                  placeholder="Comma-separated URLs"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Cities</label>
                <input
                  className="form-control"
                  value={form.cities}
                  onChange={handleChange("cities")}
                  placeholder="Comma-separated city names"
                />
              </div>

              <div
                className="form-row"
                style={{
                  display: "grid",
                  gap: "1rem",
                  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                }}
              >
                <div className="form-group">
                  <label className="form-label">Monthly Rent</label>
                  <input
                    type="number"
                    className="form-control"
                    value={form.monthlyRent}
                    onChange={handleChange("monthlyRent")}
                    required
                    min="0"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Security Deposit</label>
                  <input
                    type="number"
                    className="form-control"
                    value={form.securityDeposit}
                    onChange={handleChange("securityDeposit")}
                    required
                    min="0"
                  />
                </div>
              </div>

              <div
                className="form-row"
                style={{
                  display: "grid",
                  gap: "1rem",
                  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                }}
              >
                <div className="form-group">
                  <label className="form-label">Available Qty</label>
                  <input
                    type="number"
                    className="form-control"
                    value={form.availableQty}
                    onChange={handleChange("availableQty")}
                    required
                    min="0"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Total Qty</label>
                  <input
                    type="number"
                    className="form-control"
                    value={form.totalQty}
                    onChange={handleChange("totalQty")}
                    required
                    min="0"
                  />
                </div>
              </div>

              <label className="filter-radio" style={{ marginBottom: "1rem" }}>
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={handleChange("isActive")}
                />
                Active listing
              </label>

              <button
                className="btn btn-primary btn-full"
                type="submit"
                disabled={submitting}
              >
                {submitting ? "Saving..." : "Create Product"}
              </button>
            </div>
          </form>

          <div className="card">
            <div className="card-body">
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "1rem",
                }}
              >
                <h3 style={{ margin: 0 }}>Current Inventory</h3>
                <button
                  className="btn btn-outline btn-sm"
                  type="button"
                  onClick={loadProducts}
                >
                  Refresh
                </button>
              </div>

              {loading ? (
                <div className="loading-center">
                  <div className="spinner" />
                </div>
              ) : products.length === 0 ? (
                <div className="empty-state">
                  <PencilLine size={40} />
                  <h3>No products yet</h3>
                  <p>Add the first item using the form on the left.</p>
                </div>
              ) : (
                <div
                  className="products-grid"
                  style={{
                    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                  }}
                >
                  {products.map((product) => {
                    const availableQty = Number(product.availableQty ?? 0);

                    return (
                      <div
                        key={product._id}
                        className="card"
                        style={{ overflow: "hidden" }}
                      >
                        <div className="card-body">
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              gap: "1rem",
                            }}
                          >
                            <div>
                              <h4 style={{ margin: "0 0 0.35rem" }}>
                                {product.name}
                              </h4>
                              <p
                                style={{
                                  margin: 0,
                                  color: "var(--text-muted)",
                                }}
                              >
                                {product.category} · {product.subCategory}
                              </p>
                            </div>
                            <span
                              className={`badge ${availableQty > 0 ? "badge-green" : "badge-red"}`}
                            >
                              {availableQty > 0 ? "In Stock" : "Out"}
                            </span>
                          </div>

                          <p style={{ marginTop: "0.85rem" }}>
                            {product.description}
                          </p>

                          <div
                            style={{
                              display: "grid",
                              gap: "0.5rem",
                              fontSize: "0.95rem",
                            }}
                          >
                            <span>
                              Rent: ₹
                              {Number(
                                product.monthlyRent ?? 0,
                              ).toLocaleString()}
                              /mo
                            </span>
                            <span>
                              Deposit: ₹
                              {Number(
                                product.securityDeposit ?? 0,
                              ).toLocaleString()}
                            </span>
                            <span>Available: {availableQty}</span>
                          </div>

                          <button
                            className="btn btn-outline btn-full btn-sm"
                            type="button"
                            disabled
                          >
                            <Trash2 size={14} /> Delete coming soon
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
