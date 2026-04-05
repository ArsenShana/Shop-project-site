import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ShoppingBag, Star, Package, ArrowLeft, Check } from 'lucide-react'
import { api } from '../api'
import { useCart } from '../hooks/useCart'
import { useAuth } from '../hooks/useAuth'

export default function ProductDetail() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const { addToCart } = useCart()
  const { user } = useAuth()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [adding, setAdding] = useState(false)
  const [added, setAdded] = useState(false)
  const [qty, setQty] = useState(1)

  useEffect(() => {
    api.getProduct(slug).then(setProduct).catch(console.error).finally(() => setLoading(false))
  }, [slug])

  const handleAdd = async () => {
    if (!user) { navigate('/login'); return }
    setAdding(true)
    try {
      await addToCart(product.id, qty)
      setAdded(true)
      setTimeout(() => setAdded(false), 2000)
    } catch (e) { alert(e.message) }
    finally { setAdding(false) }
  }

  if (loading) return <div className="loading-page"><div className="spinner" /></div>
  if (!product) return <div className="container page"><p>Product not found</p></div>

  const discount = product.compare_price ? Math.round((1 - product.price / product.compare_price) * 100) : 0

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="page">
      <div className="container">
        <button className="btn btn-ghost" onClick={() => navigate(-1)} style={{ marginBottom: 24 }}>
          <ArrowLeft size={16} /> Back
        </button>

        <div className="product-detail">
          <motion.div
            className="product-detail-image"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            {product.image_url ? (
              <img src={product.image_url} alt={product.name} />
            ) : (
              <div className="gradient-placeholder gradient-placeholder-lg">
                <ShoppingBag size={64} />
                <span>{product.name?.charAt(0) || 'P'}</span>
              </div>
            )}
          </motion.div>

          <motion.div
            className="product-detail-info"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            {product.category_name && (
              <div style={{ fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, color: 'var(--accent)', marginBottom: 8 }}>
                {product.category_name}
              </div>
            )}

            <h1>{product.name}</h1>

            <div className="product-detail-price">
              <span className="current">${product.price.toFixed(2)}</span>
              {product.compare_price && (
                <>
                  <span className="compare">${product.compare_price.toFixed(2)}</span>
                  <span className="tag tag-paid">-{discount}%</span>
                </>
              )}
            </div>

            <div className="product-detail-meta">
              {product.rating > 0 && (
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Star size={16} fill="var(--warning)" stroke="var(--warning)" />
                  {product.rating.toFixed(1)} ({product.reviews_count} reviews)
                </span>
              )}
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <Package size={16} />
                {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
              </span>
            </div>

            <p className="product-detail-desc">{product.description}</p>

            <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
              <div className="cart-quantity">
                <button onClick={() => setQty(q => Math.max(1, q - 1))}>-</button>
                <span>{qty}</span>
                <button onClick={() => setQty(q => Math.min(product.stock, q + 1))}>+</button>
              </div>

              <motion.button
                className="btn btn-primary btn-lg"
                onClick={handleAdd}
                disabled={adding || product.stock === 0}
                whileTap={{ scale: 0.95 }}
                style={{ flex: 1 }}
              >
                {added ? <><Check size={18} /> Added!</> : adding ? <><div className="spinner" /> Adding...</> : <><ShoppingBag size={18} /> Add to Cart</>}
              </motion.button>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  )
}
