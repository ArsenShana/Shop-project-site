import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ShoppingBag, Star } from 'lucide-react'
import { useCart } from '../hooks/useCart'
import { useAuth } from '../hooks/useAuth'

export default function ProductCard({ product, index = 0 }) {
  const navigate = useNavigate()
  const { addToCart } = useCart()
  const { user } = useAuth()

  const discount = product.compare_price
    ? Math.round((1 - product.price / product.compare_price) * 100)
    : 0

  const handleAdd = async (e) => {
    e.stopPropagation()
    if (!user) { navigate('/login'); return }
    try { await addToCart(product.id) } catch (e) { alert(e.message) }
  }

  return (
    <motion.div
      className="product-card"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.08, ease: [0.25, 0.46, 0.45, 0.94] }}
      onClick={() => navigate(`/products/${product.slug}`)}
    >
      {discount > 0 && <div className="product-card-badge">-{discount}%</div>}

      <div className="product-card-actions">
        <button className="btn-icon" onClick={handleAdd} title="Add to cart">
          <ShoppingBag size={18} />
        </button>
      </div>

      <div className="product-card-image">
        {product.image_url ? (
          <img src={product.image_url} alt={product.name} loading="lazy" />
        ) : (
          <div className="gradient-placeholder">
            <ShoppingBag size={40} />
            <span>{product.name?.charAt(0) || 'P'}</span>
          </div>
        )}
      </div>

      <div className="product-card-body">
        {product.category_name && (
          <div className="product-card-category">{product.category_name}</div>
        )}
        <div className="product-card-name">{product.name}</div>
        <div className="product-card-price">
          <span className="current">${product.price.toFixed(2)}</span>
          {product.compare_price && (
            <span className="compare">${product.compare_price.toFixed(2)}</span>
          )}
        </div>
        {product.rating > 0 && (
          <div className="product-card-rating">
            <Star size={14} fill="var(--warning)" stroke="var(--warning)" />
            {product.rating.toFixed(1)}
            <span style={{ color: 'var(--text-muted)' }}>({product.reviews_count})</span>
          </div>
        )}
      </div>
    </motion.div>
  )
}
