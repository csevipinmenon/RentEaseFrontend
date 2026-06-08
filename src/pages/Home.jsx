import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getProducts } from "../utils/api";
import ProductCard from "../components/ProductCard.jsx";
import { ArrowRight, Star, Shield, Truck, Wrench } from "lucide-react";
import "../styles/Home.css";

const CATEGORIES = [
  { name: "Furniture", icon: "🛋️", sub: ["Bed", "Sofa", "Table", "Wardrobe"] },
  {
    name: "Appliances",
    icon: "🏠",
    sub: ["Refrigerator", "Washing Machine", "TV", "AC"],
  },
];

const WHY_US = [
  {
    icon: <Shield size={28} />,
    title: "Zero Maintenance Hassle",
    desc: "We handle all repairs and maintenance for free.",
  },
  {
    icon: <Truck size={28} />,
    title: "Free Delivery & Pickup",
    desc: "Doorstep delivery and return pickup at no extra cost.",
  },
  {
    icon: <Star size={28} />,
    title: "Flexible Plans",
    desc: "Choose 3, 6, or 12-month rental tenures.",
  },
  {
    icon: <Wrench size={28} />,
    title: "24/7 Support",
    desc: "Round-the-clock customer support for all your needs.",
  },
];

export default function Home() {
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getProducts({})
      .then((r) => {
        const products = r.data?.data ?? r.data ?? [];
        setFeatured(Array.isArray(products) ? products.slice(0, 6) : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="page-wrapper">
      {/* Hero */}
      <section className="hero">
        <div className="hero-bg" />
        <div className="container hero-content">
          <div className="hero-text fade-in">
            <span className="hero-eyebrow">
              🎓 Perfect for students & professionals
            </span>
            <h1>
              Rent, Don't Buy.
              <br />
              <em>Live Smarter.</em>
            </h1>
            <p>
              Quality furniture and appliances delivered to your door. Flexible
              monthly plans with zero maintenance worries.
            </p>
            <div className="hero-actions">
              <Link to="/products" className="btn btn-primary btn-lg">
                Browse Products <ArrowRight size={18} />
              </Link>
              <Link
                to="/products?category=Furniture"
                className="btn btn-outline btn-lg"
              >
                Explore Furniture
              </Link>
            </div>
            <div className="hero-stats">
              <div>
                <strong>500+</strong>
                <span>Products</span>
              </div>
              <div>
                <strong>10k+</strong>
                <span>Happy Renters</span>
              </div>
              <div>
                <strong>15+</strong>
                <span>Cities</span>
              </div>
            </div>
          </div>
          <div className="hero-image fade-in">
            <div className="hero-card-float">
              <img
                src="https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&h=500&fit=crop"
                alt="Living Room"
              />
              <div className="hero-badge">
                <span>Starting at</span>
                <strong>₹499/month</strong>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="section categories-section">
        <div className="container">
          <h2 className="section-title">Shop by Category</h2>
          <div className="categories-grid">
            {CATEGORIES.map((cat) => (
              <Link
                key={cat.name}
                to={`/products?category=${cat.name}`}
                className="category-card"
              >
                <div className="cat-icon">{cat.icon}</div>
                <h3>{cat.name}</h3>
                <div className="cat-subs">
                  {cat.sub.map((s) => (
                    <span key={s}>{s}</span>
                  ))}
                </div>
                <span className="cat-cta">
                  Explore <ArrowRight size={14} />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="section featured-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Featured Products</h2>
            <Link to="/products" className="btn btn-outline btn-sm">
              View All <ArrowRight size={14} />
            </Link>
          </div>
          {loading ? (
            <div className="spinner" />
          ) : (
            <div className="products-grid">
              {featured.map((p) => (
                <ProductCard key={p._id} product={p} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Why Us */}
      <section className="section why-section">
        <div className="container">
          <h2 className="section-title center">Why Choose RentEase?</h2>
          <div className="why-grid">
            {WHY_US.map((item, i) => (
              <div key={i} className="why-card">
                <div className="why-icon">{item.icon}</div>
                <h3>{item.title}</h3>
                <p>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="section cta-section">
        <div className="container">
          <div className="cta-banner">
            <div>
              <h2>Ready to furnish your new home?</h2>
              <p>
                Start renting today — no credit checks, no long-term
                commitments.
              </p>
            </div>
            <Link to="/register" className="btn btn-accent btn-lg">
              Get Started Free <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
