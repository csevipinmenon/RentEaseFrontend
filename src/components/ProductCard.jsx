import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { ShoppingCart, Star, IndianRupee } from "lucide-react";
import "../styles/ProductCard.css";

const PLACEHOLDER =
  "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&h=300&fit=crop";

export default function ProductCard({ product }) {
  const { addItem } = useCart();
  const availableQty = Number(product.availableQty ?? 0);
  const isAvailable = availableQty > 0;

  return (
    <div className="product-card card">
      <Link to={`/products/${product._id}`} className="product-img-link">
        <img
          src={product.images?.[0] || PLACEHOLDER}
          alt={product.name}
          className="product-img"
          onError={(e) => {
            e.target.src = PLACEHOLDER;
          }}
        />
        <span
          className={`product-status ${isAvailable ? "available" : "unavailable"}`}
        >
          {isAvailable ? "Available" : "Out of Stock"}
        </span>
        <span className="product-category">{product.subCategory}</span>
      </Link>

      <div className="card-body">
        <div className="product-meta">
          <span className="product-brand">{product.brand}</span>
          <div className="product-rating">
            <Star size={13} fill="currentColor" />
            <span>{product.rating?.toFixed(1)}</span>
            <span className="rating-count">({product.reviewCount})</span>
          </div>
        </div>

        <Link to={`/products/${product._id}`}>
          <h3 className="product-name">{product.name}</h3>
        </Link>

        <div className="product-pricing">
          <div className="rent-price">
            <IndianRupee size={16} />
            <span className="price-amount">
              {product.monthlyRent.toLocaleString()}
            </span>
            <span className="price-period">/month</span>
          </div>
          <div className="deposit-info">
            Deposit: ₹{product.securityDeposit.toLocaleString()}
          </div>
        </div>

        <div className="tenure-tags">
          {product.tenureOptions?.map((t) => (
            <span key={t.months} className="tenure-tag">
              {t.months}M
            </span>
          ))}
        </div>

        <button
          className="btn btn-primary btn-full add-to-cart-btn"
          onClick={() => addItem(product)}
          disabled={!isAvailable}
        >
          <ShoppingCart size={16} />
          {isAvailable ? "Add to Cart" : "Unavailable"}
        </button>
      </div>
    </div>
  );
}
