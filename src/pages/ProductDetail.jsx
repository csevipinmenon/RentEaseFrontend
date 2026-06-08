import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getProductById } from "../utils/api";
import { useCart } from "../context/CartContext";
import {
  ShoppingCart,
  Star,
  Check,
  IndianRupee,
  ArrowLeft,
} from "lucide-react";
import "../styles/productDetail.css";

const PLACEHOLDER =
  "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&h=400&fit=crop";

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addItem, tenure, setTenure } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);

  useEffect(() => {
    getProductById(id)
      .then((r) => {
        setProduct(r.data?.data ?? r.data ?? null);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
        navigate("/products");
      });
  }, [id]);

  if (loading)
    return (
      <div className="page-wrapper loading-center">
        <div className="spinner" />
      </div>
    );
  if (!product) return null;

  const monthlyRent = Number(product.monthlyRent || 0);
  const securityDeposit = Number(product.securityDeposit || 0);
  const availableQty = Number(
    product.availableQty ?? product.availableQuantity ?? 0,
  );
  const rating = Number(product.rating ?? 0);
  const reviewCount = Number(product.reviewCount ?? 0);
  const selectedTenure =
    product.tenureOptions?.find((t) => Number(t.months) === Number(tenure)) ||
    product.tenureOptions?.[0];
  const discountedRent = selectedTenure
    ? monthlyRent * (1 - (Number(selectedTenure.discount) || 0) / 100)
    : monthlyRent;
  const totalRent = discountedRent * Number(tenure || 0) * qty;

  return (
    <div className="page-wrapper">
      <div className="container">
        <button
          className="back-btn btn btn-outline btn-sm"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft size={16} /> Back
        </button>

        <div className="product-detail-layout">
          {/* Image */}
          <div className="detail-image">
            <img
              src={product.images?.[0] || PLACEHOLDER}
              alt={product.name}
              onError={(e) => {
                e.target.src = PLACEHOLDER;
              }}
            />
            <div className="detail-badges">
              <span
                className={`badge ${availableQty > 0 ? "badge-green" : "badge-red"}`}
              >
                {availableQty > 0 ? "✓ In Stock" : "✗ Out of Stock"}
              </span>
              <span className="badge badge-amber">{product.condition}</span>
            </div>
          </div>

          {/* Info */}
          <div className="detail-info">
            <div className="detail-meta">
              <span className="detail-brand">{product.brand}</span>
              <span className="detail-category">
                {product.category} › {product.subCategory}
              </span>
            </div>
            <h1 className="detail-name">{product.name}</h1>

            <div className="detail-rating">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={16}
                  fill={i < Math.round(rating) ? "currentColor" : "none"}
                />
              ))}
              <span>{rating.toFixed(1)}</span>
              <span className="rating-count">({reviewCount} reviews)</span>
            </div>

            <p className="detail-desc">{product.description}</p>

            {/* Features */}
            {product.features?.length > 0 && (
              <div className="detail-features">
                {product.features.map((f, i) => (
                  <div key={i} className="feature-item">
                    <Check size={15} /> {f}
                  </div>
                ))}
              </div>
            )}

            {/* Tenure Selection */}
            <div className="tenure-section">
              <label className="section-label">Select Rental Tenure</label>
              <div className="tenure-options">
                {product.tenureOptions?.map((t) => (
                  <button
                    key={t.months}
                    className={`tenure-btn ${tenure === t.months ? "selected" : ""}`}
                    onClick={() => setTenure(Number(t.months))}
                  >
                    <span className="tenure-months">{t.months} Months</span>
                    {t.discount > 0 && (
                      <span className="tenure-discount">{t.discount}% off</span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity */}
            <div className="qty-section">
              <label className="section-label">Quantity</label>
              <div className="qty-control">
                <button onClick={() => setQty(Math.max(1, qty - 1))}>-</button>
                <span>{qty}</span>
                <button onClick={() => setQty(Math.min(availableQty, qty + 1))}>
                  +
                </button>
              </div>
              <span className="qty-available">
                {availableQty} units available
              </span>
            </div>

            {/* Pricing Summary */}
            <div className="pricing-summary">
              <div className="price-row">
                <span>Monthly Rent</span>
                <strong>
                  ₹
                  {discountedRent.toLocaleString(undefined, {
                    maximumFractionDigits: 0,
                  })}{" "}
                  × {qty}
                </strong>
              </div>
              <div className="price-row">
                <span>Tenure</span>
                <strong>{tenure} months</strong>
              </div>
              <div className="price-row total-row">
                <span>Total Rent</span>
                <strong className="total-price">
                  ₹
                  {totalRent.toLocaleString(undefined, {
                    maximumFractionDigits: 0,
                  })}
                </strong>
              </div>
              <div className="price-row deposit-row">
                <span>Refundable Deposit</span>
                <strong>₹{(securityDeposit * qty).toLocaleString()}</strong>
              </div>
            </div>

            <button
              className="btn btn-primary btn-lg btn-full add-to-cart-main"
              onClick={() => addItem(product, qty)}
              disabled={availableQty <= 0}
            >
              <ShoppingCart size={20} />
              {availableQty > 0 ? "Add to Cart" : "Out of Stock"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
