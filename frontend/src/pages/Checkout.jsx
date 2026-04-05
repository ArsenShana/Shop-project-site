import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { CreditCard, Check, ArrowLeft } from 'lucide-react'
import { api } from '../api'
import { useCart } from '../hooks/useCart'

export default function Checkout() {
  const navigate = useNavigate()
  const { cart, reload } = useCart()
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(null)
  const [form, setForm] = useState({
    shipping_name: '', shipping_address: '', shipping_city: '', shipping_zip: '', payment_method: 'card',
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const order = await api.checkout(form)
      setSuccess(order)
      await reload()
    } catch (e) { alert(e.message) }
    finally { setLoading(false) }
  }

  if (success) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="page">
        <div className="container" style={{ textAlign: 'center', paddingTop: 60 }}>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
            style={{ width: 80, height: 80, borderRadius: '50%', background: 'rgba(34,197,94,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}
          >
            <Check size={40} color="var(--success)" />
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} style={{ fontSize: 32, marginBottom: 12 }}>
            Order Confirmed!
          </motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} style={{ color: 'var(--text-secondary)', marginBottom: 8 }}>
            Order #{success.id} has been placed successfully.
          </motion.p>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }} style={{ fontSize: 24, fontWeight: 700, marginBottom: 32 }}>
            ${success.total.toFixed(2)}
          </motion.p>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }} style={{ display: 'flex', gap: 16, justifyContent: 'center' }}>
            <Link to="/orders" className="btn btn-primary">View Orders</Link>
            <Link to="/products" className="btn btn-outline">Continue Shopping</Link>
          </motion.div>
        </div>
      </motion.div>
    )
  }

  if (cart.items.length === 0) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="page">
        <div className="container empty-state">
          <h3>Your cart is empty</h3>
          <Link to="/products" className="btn btn-primary" style={{ marginTop: 16 }}>Go Shopping</Link>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="page">
      <div className="container">
        <button className="btn btn-ghost" onClick={() => navigate(-1)} style={{ marginBottom: 24 }}>
          <ArrowLeft size={16} /> Back
        </button>

        <div className="cart-layout">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <h2 style={{ marginBottom: 24 }}>Shipping Details</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Full Name</label>
                <input required value={form.shipping_name} onChange={e => setForm({ ...form, shipping_name: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Address</label>
                <input required value={form.shipping_address} onChange={e => setForm({ ...form, shipping_address: e.target.value })} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div className="form-group">
                  <label>City</label>
                  <input required value={form.shipping_city} onChange={e => setForm({ ...form, shipping_city: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>ZIP Code</label>
                  <input required value={form.shipping_zip} onChange={e => setForm({ ...form, shipping_zip: e.target.value })} />
                </div>
              </div>

              <h3 style={{ marginTop: 32, marginBottom: 16 }}>Payment</h3>
              <div style={{ padding: 20, background: 'var(--bg-elevated)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
                <CreditCard size={24} color="var(--accent)" />
                <div>
                  <div style={{ fontWeight: 600 }}>Credit Card</div>
                  <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Secure payment via Stripe</div>
                </div>
              </div>

              <motion.button
                type="submit"
                className="btn btn-primary btn-lg"
                style={{ width: '100%' }}
                disabled={loading}
                whileTap={{ scale: 0.97 }}
              >
                {loading ? <><div className="spinner" /> Processing...</> : <>Place Order — ${(cart.total + (cart.total >= 100 ? 0 : 9.99)).toFixed(2)}</>}
              </motion.button>
            </form>
          </motion.div>

          <motion.div className="cart-summary" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <h3>Order Summary</h3>
            {cart.items.map(item => (
              <div key={item.id} className="cart-summary-row">
                <span style={{ color: 'var(--text-secondary)' }}>{item.product_name} x{item.quantity}</span>
                <span>${item.subtotal.toFixed(2)}</span>
              </div>
            ))}
            <div className="cart-summary-row">
              <span style={{ color: 'var(--text-secondary)' }}>Shipping</span>
              <span style={{ color: 'var(--success)' }}>{cart.total >= 100 ? 'Free' : '$9.99'}</span>
            </div>
            <div className="cart-summary-total">
              <span>Total</span>
              <span>${(cart.total + (cart.total >= 100 ? 0 : 9.99)).toFixed(2)}</span>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  )
}
