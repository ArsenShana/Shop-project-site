import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Package } from 'lucide-react'
import { api } from '../api'

export default function Orders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.getOrders().then(setOrders).catch(console.error).finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="loading-page"><div className="spinner" /></div>

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="page">
      <div className="container" style={{ maxWidth: 800, margin: '0 auto' }}>
        <div className="page-header">
          <h1>My Orders</h1>
        </div>

        {orders.length === 0 ? (
          <div className="empty-state">
            <Package size={48} style={{ margin: '0 auto 16px', color: 'var(--text-muted)' }} />
            <h3>No orders yet</h3>
            <p>Your orders will appear here after checkout.</p>
            <Link to="/products" className="btn btn-primary" style={{ marginTop: 16 }}>Start Shopping</Link>
          </div>
        ) : (
          orders.map((order, i) => (
            <motion.div
              key={order.id}
              className="order-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <div className="order-header">
                <div>
                  <div style={{ fontWeight: 700, fontSize: 16 }}>Order #{order.id}</div>
                  <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                    {new Date(order.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span className={`tag tag-${order.status}`}>{order.status}</span>
                  <span style={{ fontWeight: 700, fontSize: 18 }}>${order.total.toFixed(2)}</span>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                {order.items.map(item => (
                  <div key={item.id} style={{ display: 'flex', gap: 10, alignItems: 'center', padding: '8px 12px', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-sm)', fontSize: 13 }}>
                    <img src={item.product_image || 'https://via.placeholder.com/40'} alt="" style={{ width: 40, height: 40, borderRadius: 6, objectFit: 'cover' }} />
                    <div>
                      <div style={{ fontWeight: 500 }}>{item.product_name}</div>
                      <div style={{ color: 'var(--text-secondary)' }}>x{item.quantity} — ${item.subtotal.toFixed(2)}</div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          ))
        )}
      </div>
    </motion.div>
  )
}
