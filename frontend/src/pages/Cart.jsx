import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Trash2, ShoppingBag, ArrowRight, Package } from 'lucide-react'
import { useCart } from '../hooks/useCart'
import { useAuth } from '../hooks/useAuth'

export default function Cart() {
  const { cart, updateItem, removeItem } = useCart()
  const { user } = useAuth()
  const navigate = useNavigate()

  if (!user) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="page">
        <div className="container empty-state">
          <ShoppingBag size={48} style={{ margin: '0 auto 16px', color: 'var(--text-muted)' }} />
          <h3>Sign in to view your cart</h3>
          <Link to="/login" className="btn btn-primary" style={{ marginTop: 16 }}>Sign In</Link>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="page">
      <div className="container">
        <div className="page-header">
          <h1>Shopping Cart</h1>
          <p>{cart.items_count} {cart.items_count === 1 ? 'item' : 'items'}</p>
        </div>

        {cart.items.length === 0 ? (
          <div className="empty-state">
            <ShoppingBag size={48} style={{ margin: '0 auto 16px', color: 'var(--text-muted)' }} />
            <h3>Your cart is empty</h3>
            <p>Discover our amazing products and add them to your cart.</p>
            <Link to="/products" className="btn btn-primary" style={{ marginTop: 20 }}>
              Start Shopping <ArrowRight size={16} />
            </Link>
          </div>
        ) : (
          <div className="cart-layout">
            <div>
              <AnimatePresence>
                {cart.items.map(item => (
                  <motion.div
                    key={item.id}
                    className="cart-item"
                    layout
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20, height: 0, marginBottom: 0, padding: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="cart-item-image">
                      {item.product_image ? (
                        <img src={item.product_image} alt={item.product_name} />
                      ) : (
                        <div className="gradient-placeholder gradient-placeholder-sm">
                          <Package size={24} />
                        </div>
                      )}
                    </div>
                    <div className="cart-item-info">
                      <div className="cart-item-name">{item.product_name}</div>
                      <div className="cart-item-price">${item.product_price.toFixed(2)}</div>
                      <div className="cart-quantity">
                        <button onClick={() => updateItem(item.id, item.quantity - 1)}>-</button>
                        <span>{item.quantity}</span>
                        <button onClick={() => updateItem(item.id, item.quantity + 1)}>+</button>
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'space-between' }}>
                      <button className="btn-icon" onClick={() => removeItem(item.id)} style={{ border: 'none', color: 'var(--text-muted)' }}>
                        <Trash2 size={16} />
                      </button>
                      <div style={{ fontWeight: 700, fontSize: 18 }}>${item.subtotal.toFixed(2)}</div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            <motion.div
              className="cart-summary"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h3>Order Summary</h3>
              <div className="cart-summary-row">
                <span style={{ color: 'var(--text-secondary)' }}>Subtotal</span>
                <span>${cart.total.toFixed(2)}</span>
              </div>
              <div className="cart-summary-row">
                <span style={{ color: 'var(--text-secondary)' }}>Shipping</span>
                <span style={{ color: 'var(--success)' }}>{cart.total >= 100 ? 'Free' : '$9.99'}</span>
              </div>
              <div className="cart-summary-total">
                <span>Total</span>
                <span>${(cart.total + (cart.total >= 100 ? 0 : 9.99)).toFixed(2)}</span>
              </div>
              <motion.button
                className="btn btn-primary btn-lg"
                style={{ width: '100%', marginTop: 16 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => navigate('/checkout')}
              >
                Proceed to Checkout <ArrowRight size={18} />
              </motion.button>
            </motion.div>
          </div>
        )}
      </div>
    </motion.div>
  )
}
