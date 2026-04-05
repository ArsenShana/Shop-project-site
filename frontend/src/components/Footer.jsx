import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <h3>LUXE</h3>
            <p>Premium products curated for modern living. Quality meets design in every item we offer.</p>
          </div>
          <div className="footer-col">
            <h4>Shop</h4>
            <Link to="/products">All Products</Link>
            <Link to="/products?featured=true">Featured</Link>
            <Link to="/products?sort=newest">New Arrivals</Link>
          </div>
          <div className="footer-col">
            <h4>Account</h4>
            <Link to="/login">Sign In</Link>
            <Link to="/register">Create Account</Link>
            <Link to="/orders">My Orders</Link>
          </div>
          <div className="footer-col">
            <h4>Info</h4>
            <a href="#">About Us</a>
            <a href="#">Contact</a>
            <a href="#">Shipping & Returns</a>
          </div>
        </div>
        <div className="footer-bottom">
          &copy; {new Date().getFullYear()} LUXE Store. All rights reserved.
        </div>
      </div>
    </footer>
  )
}
