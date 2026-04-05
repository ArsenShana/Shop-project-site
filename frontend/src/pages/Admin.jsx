import { useState, useEffect } from 'react'
import { Routes, Route, NavLink, Navigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { LayoutDashboard, Package, ShoppingCart, Users, Plus, Trash2, Edit } from 'lucide-react'
import { api } from '../api'
import { useAuth } from '../hooks/useAuth'

function AdminDashboard() {
  const [stats, setStats] = useState(null)
  useEffect(() => { api.adminStats().then(setStats).catch(console.error) }, [])
  if (!stats) return <div className="loading-page"><div className="spinner" /></div>

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <h2 style={{ marginBottom: 24 }}>Dashboard</h2>
      <div className="stats-grid">
        {[
          { label: 'Total Revenue', value: `$${stats.total_revenue.toFixed(2)}`, color: 'var(--success)' },
          { label: "Today's Revenue", value: `$${stats.revenue_today.toFixed(2)}` },
          { label: 'Total Orders', value: stats.total_orders },
          { label: "Today's Orders", value: stats.orders_today },
          { label: 'Pending Orders', value: stats.pending_orders, color: 'var(--warning)' },
          { label: 'Total Products', value: stats.total_products },
          { label: 'Total Users', value: stats.total_users },
          { label: 'Low Stock', value: stats.low_stock_products, color: stats.low_stock_products > 0 ? 'var(--danger)' : undefined },
        ].map((s, i) => (
          <motion.div key={i} className="stat-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <div className="label">{s.label}</div>
            <div className="value" style={{ color: s.color }}>{s.value}</div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}

function AdminProducts() {
  const [products, setProducts] = useState({ items: [], total: 0 })
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', slug: '', price: '', stock: '', description: '', image_url: '', category_id: '', is_featured: false })

  const load = () => api.getProducts({ per_page: 50 }).then(setProducts).catch(console.error)
  useEffect(() => { load() }, [])

  const handleCreate = async (e) => {
    e.preventDefault()
    try {
      await api.adminCreateProduct({ ...form, price: parseFloat(form.price), stock: parseInt(form.stock), category_id: form.category_id ? parseInt(form.category_id) : null })
      setShowForm(false)
      setForm({ name: '', slug: '', price: '', stock: '', description: '', image_url: '', category_id: '', is_featured: false })
      load()
    } catch (e) { alert(e.message) }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this product?')) return
    await api.adminDeleteProduct(id)
    load()
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h2>Products ({products.total})</h2>
        <button className="btn btn-primary btn-sm" onClick={() => setShowForm(!showForm)}><Plus size={16} /> Add Product</button>
      </div>

      {showForm && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 24, marginBottom: 24 }}>
          <form onSubmit={handleCreate}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div className="form-group"><label>Name</label><input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
              <div className="form-group"><label>Slug</label><input required value={form.slug} onChange={e => setForm({ ...form, slug: e.target.value })} /></div>
              <div className="form-group"><label>Price</label><input type="number" step="0.01" required value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} /></div>
              <div className="form-group"><label>Stock</label><input type="number" required value={form.stock} onChange={e => setForm({ ...form, stock: e.target.value })} /></div>
              <div className="form-group" style={{ gridColumn: 'span 2' }}><label>Image URL</label><input value={form.image_url} onChange={e => setForm({ ...form, image_url: e.target.value })} /></div>
              <div className="form-group" style={{ gridColumn: 'span 2' }}><label>Description</label><textarea rows={3} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></div>
            </div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button type="button" className="btn btn-ghost" onClick={() => setShowForm(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary">Create Product</button>
            </div>
          </form>
        </motion.div>
      )}

      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', overflow: 'hidden' }}>
        <table>
          <thead><tr><th>Product</th><th>Price</th><th>Stock</th><th>Rating</th><th>Featured</th><th></th></tr></thead>
          <tbody>
            {products.items.map(p => (
              <tr key={p.id}>
                <td style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <img src={p.image_url || 'https://via.placeholder.com/40'} alt="" style={{ width: 40, height: 40, borderRadius: 8, objectFit: 'cover' }} />
                  <div>
                    <div style={{ fontWeight: 500 }}>{p.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{p.category_name}</div>
                  </div>
                </td>
                <td style={{ fontWeight: 600 }}>${p.price.toFixed(2)}</td>
                <td><span style={{ color: p.stock <= 5 ? 'var(--danger)' : 'var(--text)' }}>{p.stock}</span></td>
                <td>{p.rating.toFixed(1)}</td>
                <td>{p.is_featured ? <span className="tag tag-paid">Yes</span> : '—'}</td>
                <td><button className="btn-icon" onClick={() => handleDelete(p.id)} style={{ border: 'none', color: 'var(--danger)' }}><Trash2 size={16} /></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  )
}

function AdminOrders() {
  const [orders, setOrders] = useState([])
  const [filter, setFilter] = useState('')

  const load = () => api.adminOrders(filter).then(setOrders).catch(console.error)
  useEffect(() => { load() }, [filter])

  const updateStatus = async (id, status) => {
    await api.adminUpdateOrderStatus(id, { status })
    load()
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h2>Orders</h2>
        <select value={filter} onChange={e => setFilter(e.target.value)} style={{ width: 160 }}>
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="paid">Paid</option>
          <option value="shipped">Shipped</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {orders.map(order => (
        <div key={order.id} className="order-card">
          <div className="order-header">
            <div>
              <span style={{ fontWeight: 700 }}>#{order.id}</span>
              <span style={{ marginLeft: 12, fontSize: 13, color: 'var(--text-secondary)' }}>
                {new Date(order.created_at).toLocaleString()}
              </span>
              <span style={{ marginLeft: 12, fontSize: 13, color: 'var(--text-secondary)' }}>
                {order.shipping_name}
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <select value={order.status} onChange={e => updateStatus(order.id, e.target.value)} style={{ width: 130 }}>
                <option value="pending">Pending</option>
                <option value="paid">Paid</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
              <span style={{ fontWeight: 700, fontSize: 18 }}>${order.total.toFixed(2)}</span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {order.items.map(item => (
              <span key={item.id} style={{ fontSize: 13, padding: '4px 10px', background: 'var(--bg-elevated)', borderRadius: 6 }}>
                {item.product_name} x{item.quantity}
              </span>
            ))}
          </div>
        </div>
      ))}

      {orders.length === 0 && <div className="empty-state"><h3>No orders found</h3></div>}
    </motion.div>
  )
}

function AdminUsers() {
  const [users, setUsers] = useState([])
  useEffect(() => { api.adminUsers().then(setUsers).catch(console.error) }, [])

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <h2 style={{ marginBottom: 24 }}>Users ({users.length})</h2>
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', overflow: 'hidden' }}>
        <table>
          <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Joined</th></tr></thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id}>
                <td style={{ fontWeight: 500 }}>{u.name}</td>
                <td style={{ color: 'var(--text-secondary)' }}>{u.email}</td>
                <td><span className={`tag ${u.role === 'admin' ? 'tag-shipped' : ''}`}>{u.role}</span></td>
                <td style={{ color: 'var(--text-secondary)', fontSize: 13 }}>{new Date(u.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  )
}

export default function Admin() {
  const { isAdmin, loading } = useAuth()
  if (loading) return <div className="loading-page"><div className="spinner" /></div>
  if (!isAdmin) return <Navigate to="/login" />

  return (
    <div className="admin-layout">
      <div className="admin-sidebar">
        <div style={{ padding: '0 24px 20px', fontWeight: 700, fontSize: 16, borderBottom: '1px solid var(--border)', marginBottom: 12 }}>Admin Panel</div>
        <NavLink to="/admin" end><LayoutDashboard size={18} /> Dashboard</NavLink>
        <NavLink to="/admin/products"><Package size={18} /> Products</NavLink>
        <NavLink to="/admin/orders"><ShoppingCart size={18} /> Orders</NavLink>
        <NavLink to="/admin/users"><Users size={18} /> Users</NavLink>
      </div>
      <div className="admin-content">
        <Routes>
          <Route path="/" element={<AdminDashboard />} />
          <Route path="/products" element={<AdminProducts />} />
          <Route path="/orders" element={<AdminOrders />} />
          <Route path="/users" element={<AdminUsers />} />
        </Routes>
      </div>
    </div>
  )
}
