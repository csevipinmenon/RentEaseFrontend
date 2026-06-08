import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { getProducts } from "../utils/api";
import ProductCard from "../components/ProductCard.jsx";
import { Search, SlidersHorizontal } from "lucide-react";
import "../styles/Products.css";

const CATEGORIES = ["All", "Furniture", "Appliances"];
const FURNITURE_SUBS = ["Bed", "Sofa", "Table", "Chair", "Wardrobe"];
const APPLIANCE_SUBS = [
  "Refrigerator",
  "Washing Machine",
  "TV",
  "AC",
  "Microwave",
];

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState(
    searchParams.get("category") || "All",
  );
  const [subCategory, setSubCategory] = useState("");
  const [maxRent, setMaxRent] = useState("");
  const [sortBy, setSortBy] = useState("newest");

  useEffect(() => {
    const cat = searchParams.get("category");
    if (cat) setCategory(cat);
  }, [searchParams]);

  useEffect(() => {
    setLoading(true);
    const params = {};
    if (category !== "All") params.category = category;
    if (subCategory) params.subCategory = subCategory;
    if (maxRent) params.maxRent = maxRent;
    if (search) params.search = search;

    getProducts(params)
      .then((r) => {
        let sorted = r.data?.data ?? r.data ?? [];
        if (!Array.isArray(sorted)) sorted = [];
        if (sortBy === "price_asc")
          sorted = [...sorted].sort((a, b) => a.monthlyRent - b.monthlyRent);
        if (sortBy === "price_desc")
          sorted = [...sorted].sort((a, b) => b.monthlyRent - a.monthlyRent);
        if (sortBy === "rating")
          sorted = [...sorted].sort((a, b) => b.rating - a.rating);
        setProducts(sorted);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [category, subCategory, maxRent, search, sortBy]);

  const subCats =
    category === "Furniture"
      ? FURNITURE_SUBS
      : category === "Appliances"
        ? APPLIANCE_SUBS
        : [];

  return (
    <div className="page-wrapper">
      <div className="container">
        <div className="page-header">
          <h1>Browse Products</h1>
          <p>{products.length} products available for rent</p>
        </div>

        {/* Search & Sort Bar */}
        <div className="products-toolbar">
          <div className="search-box">
            <Search size={18} />
            <input
              className="search-input"
              placeholder="Search furniture, appliances..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="toolbar-right">
            <select
              className="form-control sort-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="newest">Newest First</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="rating">Top Rated</option>
            </select>
          </div>
        </div>

        <div className="products-layout">
          {/* Sidebar Filters */}
          <aside className="filters-sidebar">
            <h3>
              <SlidersHorizontal size={16} /> Filters
            </h3>

            <div className="filter-group">
              <label className="filter-label">Category</label>
              {CATEGORIES.map((c) => (
                <label key={c} className="filter-radio">
                  <input
                    type="radio"
                    name="category"
                    checked={category === c}
                    onChange={() => {
                      setCategory(c);
                      setSubCategory("");
                    }}
                  />
                  {c}
                </label>
              ))}
            </div>

            {subCats.length > 0 && (
              <div className="filter-group">
                <label className="filter-label">Type</label>
                {subCats.map((s) => (
                  <label key={s} className="filter-radio">
                    <input
                      type="radio"
                      name="sub"
                      checked={subCategory === s}
                      onChange={() =>
                        setSubCategory(subCategory === s ? "" : s)
                      }
                    />
                    {s}
                  </label>
                ))}
              </div>
            )}

            <div className="filter-group">
              <label className="filter-label">Max Monthly Rent</label>
              <input
                type="number"
                className="form-control"
                placeholder="e.g. 2000"
                value={maxRent}
                onChange={(e) => setMaxRent(e.target.value)}
              />
            </div>

            <button
              className="btn btn-outline btn-full btn-sm"
              onClick={() => {
                setCategory("All");
                setSubCategory("");
                setMaxRent("");
                setSearch("");
              }}
            >
              Clear Filters
            </button>
          </aside>

          {/* Products Grid */}
          <div className="products-main">
            {loading ? (
              <div className="loading-center">
                <div className="spinner" />
              </div>
            ) : products.length === 0 ? (
              <div className="empty-state">
                <h3>No products found</h3>
                <p>Try adjusting your filters or search terms.</p>
              </div>
            ) : (
              <div className="products-grid fade-in">
                {products.map((p) => (
                  <ProductCard key={p._id} product={p} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
