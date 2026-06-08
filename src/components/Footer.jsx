import { Link } from "react-router-dom";
import "../styles/Footer.css";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-inner">
        <div className="footer-brand">
          <div className="footer-logo">🛋️ RentEase</div>
          <p>
            Affordable furniture & appliance rentals for students and
            professionals.
          </p>
        </div>
        <div className="footer-links">
          <div>
            <h4>Products</h4>
            <Link to="/products?category=Furniture">Furniture</Link>
            <Link to="/products?category=Appliances">Appliances</Link>
            <Link to="/products">All Products</Link>
          </div>
          <div>
            <h4>Company</h4>
            <Link to="/">About Us</Link>
            <Link to="/">How it Works</Link>
            <Link to="/">Contact</Link>
          </div>
          <div>
            <h4>Support</h4>
            <Link to="/">FAQ</Link>
            <Link to="/">Terms</Link>
            <Link to="/">Privacy</Link>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <p>© 2024 RentEase. All rights reserved.</p>
      </div>
    </footer>
  );
}
