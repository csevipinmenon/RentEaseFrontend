import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { Trash2, IndianRupee, ShoppingBag, ArrowRight } from "lucide-react";
import "../styles/CartPage.css";

const PLACEHOLDER =
  "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=100&h=100&fit=crop";

export default function CartPage() {
  const {
    items,
    removeItem,
    updateQuantity,
    tenure,
    setTenure,
    totalRent,
    totalDeposit,
    itemCount,
  } = useCart();

  if (items.length === 0) {
    return (
      <div className="page-wrapper">
        <div className="container">
          <div className="empty-state">
            <ShoppingBag size={64} strokeWidth={1} />
            <h3>Your cart is empty</h3>
            <p>Browse our products and add items to get started.</p>
            <Link
              to="/products"
              className="btn btn-primary"
              style={{ marginTop: 16 }}
            >
              Browse Products
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-wrapper">
      <div className="container">
        <div className="page-header">
          <h1>Your Cart</h1>
          <p>
            {itemCount} item{itemCount !== 1 ? "s" : ""} selected
          </p>
        </div>

        <div className="cart-layout">
          {/* Items */}
          <div className="cart-items">
            {items.map((item) => (
              <div key={item._id} className="cart-item card">
                <img
                  src={item.images?.[0] || PLACEHOLDER}
                  alt={item.name}
                  className="cart-item-img"
                  onError={(e) => {
                    e.target.src = PLACEHOLDER;
                  }}
                />
                <div className="cart-item-info">
                  <span className="cart-item-cat">{item.category}</span>
                  <h3>{item.name}</h3>
                  <div className="cart-item-price">
                    ₹{item.monthlyRent.toLocaleString()}/month
                  </div>
                  <div className="cart-item-deposit">
                    Deposit: ₹{item.securityDeposit.toLocaleString()}
                  </div>
                </div>
                <div className="cart-item-actions">
                  <div className="qty-control">
                    <button
                      onClick={() =>
                        updateQuantity(item._id, item.quantity - 1)
                      }
                    >
                      -
                    </button>
                    <span>{item.quantity}</span>
                    <button
                      onClick={() =>
                        updateQuantity(item._id, item.quantity + 1)
                      }
                    >
                      +
                    </button>
                  </div>
                  <button
                    className="remove-btn"
                    onClick={() => removeItem(item._id)}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="cart-summary card">
            <div className="card-body">
              <h3>Order Summary</h3>

              <div className="tenure-select-group">
                <label className="form-label">Rental Tenure</label>
                <select
                  className="form-control"
                  value={tenure}
                  onChange={(e) => setTenure(Number(e.target.value))}
                >
                  <option value={3}>3 Months</option>
                  <option value={6}>6 Months (5% off)</option>
                  <option value={12}>12 Months (10% off)</option>
                </select>
              </div>

              <div className="summary-rows">
                <div className="summary-row">
                  <span>Monthly Rent</span>
                  <span>₹{totalRent.toLocaleString()}/mo</span>
                </div>
                <div className="summary-row">
                  <span>Tenure</span>
                  <span>{tenure} months</span>
                </div>
                <div className="summary-row">
                  <span>Total Rent</span>
                  <span>₹{(totalRent * tenure).toLocaleString()}</span>
                </div>
                <div className="summary-row deposit">
                  <span>Refundable Deposit</span>
                  <span>₹{totalDeposit.toLocaleString()}</span>
                </div>
                <div className="summary-total">
                  <span>Amount Due Now</span>
                  <strong>
                    ₹{(totalRent + totalDeposit).toLocaleString()}
                  </strong>
                </div>
              </div>

              <Link to="/checkout" className="btn btn-primary btn-full btn-lg">
                Proceed to Checkout <ArrowRight size={18} />
              </Link>
              <Link
                to="/products"
                className="btn btn-outline btn-full"
                style={{ marginTop: 10 }}
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
