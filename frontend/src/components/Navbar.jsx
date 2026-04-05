import { Link, NavLink, useNavigate } from 'react-router-dom'
import { ShoppingBag, User, LogOut, Shield } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../hooks/useAuth'
import { useCart } from '../hooks/useCart'

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth()
  const { cart } = useCart()
  const navigate = useNavigate()

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-logo">LUXE</Link>

      <div className="navbar-links">
        <NavLink to="/" end>Home</NavLink>
        <NavLink to="/products">Shop</NavLink>
        {user && <NavLink to="/orders">Orders</NavLink>}
        {isAdmin && <NavLink to="/admin">Admin</NavLink>}
      </div>

      <div className="navbar-actions">
        {user ? (
          <>
            <div className="cart-badge" onClick={() => navigate('/cart')}>
              <ShoppingBag size={20} color="var(--text-secondary)" />
              <AnimatePresence>
                {cart.items_count > 0 && (
                  <motion.div
                    className="count"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    key={cart.items_count}
                  >
                    {cart.items_count}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <button className="btn btn-ghost btn-sm" onClick={() => { logout(); navigate('/') }}>
              <LogOut size={16} /> Sign Out
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="btn btn-ghost btn-sm">Sign In</Link>
            <Link to="/register" className="btn btn-primary btn-sm">Get Started</Link>
          </>
        )}
      </div>
    </nav>
  )
}
