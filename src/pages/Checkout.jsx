import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { createRental } from "../utils/api";
import toast from "react-hot-toast";
import { CheckCircle } from "lucide-react";
import "../styles/Checkout.css";

export default function Checkout() {
  const navigate = useNavigate();
  const { items, tenure, totalRent, totalDeposit, clearCart } = useCart();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [form, setForm] = useState({
    street: user?.address?.street || "",
    city: user?.address?.city || "",
    state: user?.address?.state || "",
    pincode: user?.address?.pincode || "",
    deliveryDate: "",
  });

  const handleChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (
      !form.street ||
      !form.city ||
      !form.state ||
      !form.pincode ||
      !form.deliveryDate
    ) {
      return toast.error("Please fill all delivery details");
    }
    if (items.length === 0) return toast.error("Cart is empty");

    setLoading(true);
    try {
      await createRental({
        items: items.map((i) => ({ productId: i._id, quantity: i.quantity })),
        deliveryAddress: {
          street: form.street,
          city: form.city,
          state: form.state,
          pincode: form.pincode,
        },
        deliveryDate: form.deliveryDate,
        tenureMonths: tenure,
      });
      clearCart();
      setSuccess(true);
    } catch (err) {
      toast.error(err.response?.data?.message || "Checkout failed");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="page-wrapper">
        <div className="container">
          <div className="success-card card">
            <div className="card-body text-center">
              <CheckCircle size={64} color="var(--green)" />
              <h2>Order Placed Successfully!</h2>
              <p>
                Your rental request has been received. We'll confirm it within
                24 hours and schedule delivery.
              </p>
              <div className="success-actions">
                <button
                  className="btn btn-primary"
                  onClick={() => navigate("/dashboard")}
                >
                  View My Rentals
                </button>
                <button
                  className="btn btn-outline"
                  onClick={() => navigate("/products")}
                >
                  Continue Shopping
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Min delivery date: tomorrow
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split("T")[0];

  return (
    <div className="page-wrapper">
      <div className="container">
        <div className="page-header">
          <h1>Checkout</h1>
          <p>Complete your rental order</p>
        </div>

        <div className="checkout-layout">
          <form className="checkout-form" onSubmit={handleSubmit}>
            <div className="form-section card">
              <div className="card-body">
                <h3>Delivery Address</h3>
                <div className="form-group">
                  <label className="form-label">Street Address</label>
                  <input
                    name="street"
                    className="form-control"
                    placeholder="House no, Street, Area"
                    value={form.street}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">City</label>
                    <input
                      name="city"
                      className="form-control"
                      placeholder="City"
                      value={form.city}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">State</label>
                    <input
                      name="state"
                      className="form-control"
                      placeholder="State"
                      value={form.state}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Pincode</label>
                  <input
                    name="pincode"
                    className="form-control"
                    placeholder="PIN Code"
                    value={form.pincode}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="form-section card">
              <div className="card-body">
                <h3>Delivery Schedule</h3>
                <div className="form-group">
                  <label className="form-label">Preferred Delivery Date</label>
                  <input
                    type="date"
                    name="deliveryDate"
                    className="form-control"
                    min={minDate}
                    value={form.deliveryDate}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-lg btn-full"
              disabled={loading}
            >
              {loading ? "Placing Order..." : "Place Rental Order"}
            </button>
          </form>

          {/* Order Summary */}
          <div className="checkout-summary card">
            <div className="card-body">
              <h3>Order Summary</h3>
              {items.map((item) => (
                <div key={item._id} className="co-item">
                  <span>
                    {item.name} × {item.quantity}
                  </span>
                  <span>
                    ₹{(item.monthlyRent * item.quantity).toLocaleString()}/mo
                  </span>
                </div>
              ))}
              <div className="co-divider" />
              <div className="co-row">
                <span>Tenure</span>
                <span>{tenure} months</span>
              </div>
              <div className="co-row">
                <span>Monthly Rent</span>
                <span>₹{totalRent.toLocaleString()}</span>
              </div>
              <div className="co-row">
                <span>Total Rent</span>
                <span>₹{(totalRent * tenure).toLocaleString()}</span>
              </div>
              <div className="co-row green">
                <span>Refundable Deposit</span>
                <span>₹{totalDeposit.toLocaleString()}</span>
              </div>
              <div className="co-total">
                <span>Due Now</span>
                <strong>₹{(totalRent + totalDeposit).toLocaleString()}</strong>
              </div>
              <div className="co-note">
                <strong>Note:</strong> Payment will be collected at delivery. We
                accept cash and UPI.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
