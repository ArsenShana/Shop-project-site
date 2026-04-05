import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, Sparkles, Truck, Shield, RefreshCw, Zap } from 'lucide-react'
import { api } from '../api'
import ProductCard from '../components/ProductCard'

const fadeUp = {
  initial: { opacity: 0, y: 40 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] },
}

const CATEGORY_GRADIENTS = [
  'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
  'linear-gradient(135deg, #ec4899 0%, #f97316 100%)',
  'linear-gradient(135deg, #14b8a6 0%, #3b82f6 100%)',
  'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)',
  'linear-gradient(135deg, #8b5cf6 0%, #06b6d4 100%)',
  'linear-gradient(135deg, #22c55e 0%, #6366f1 100%)',
]

export default function Home() {
  const [featured, setFeatured] = useState([])
  const [categories, setCategories] = useState([])

  useEffect(() => {
    api.getFeatured().then(setFeatured).catch(console.error)
    api.getCategories().then(setCategories).catch(console.error)
  }, [])

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      {/* Hero */}
      <section className="hero">
        <div className="hero-bg-orb hero-bg-orb-1" />
        <div className="hero-bg-orb hero-bg-orb-2" />
        <div className="hero-bg-orb hero-bg-orb-3" />
        <motion.div className="hero-content" {...fadeUp}>
          <div className="hero-badge">
            <Zap size={14} /> New Collection 2026
          </div>
          <h1>
            Discover <span>Premium</span><br />Products
          </h1>
          <p>
            Curated collection of exceptional products designed for those who
            appreciate quality, craftsmanship, and modern aesthetics.
          </p>
          <div className="hero-actions">
            <Link to="/products" className="btn btn-primary btn-lg">
              Shop Now <ArrowRight size={18} />
            </Link>
            <Link to="/products?featured=true" className="btn btn-outline btn-lg">
              <Sparkles size={18} /> Featured
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Features */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <motion.div
            className="features-grid"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            {[
              { icon: <Truck size={24} />, title: 'Free Shipping', desc: 'On orders over $100' },
              { icon: <Shield size={24} />, title: 'Secure Payments', desc: 'SSL encrypted checkout' },
              { icon: <RefreshCw size={24} />, title: '30-Day Returns', desc: 'Easy return policy' },
              { icon: <Sparkles size={24} />, title: 'Premium Quality', desc: 'Handpicked products' },
            ].map((f, i) => (
              <motion.div
                key={i}
                className="feature-card"
                whileHover={{ borderColor: 'var(--accent)', y: -2 }}
                transition={{ duration: 0.2 }}
              >
                <div style={{ color: 'var(--accent)', flexShrink: 0 }}>{f.icon}</div>
                <div>
                  <div style={{ fontWeight: 600, marginBottom: 2 }}>{f.title}</div>
                  <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{f.desc}</div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Categories */}
      {categories.length > 0 && (
        <section className="section">
          <div className="container">
            <motion.div className="section-header" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
              <h2>Shop by Category</h2>
              <Link to="/products" className="btn btn-ghost">View All <ArrowRight size={16} /></Link>
            </motion.div>
            <div className="categories-grid">
              {categories.map((c, i) => (
                <motion.div
                  key={c.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Link to={`/products?category=${c.slug}`} className="category-card">
                    {c.image_url ? (
                      <img src={c.image_url} alt={c.name} />
                    ) : (
                      <div className="category-card-gradient" style={{ background: CATEGORY_GRADIENTS[i % CATEGORY_GRADIENTS.length] }} />
                    )}
                    <div className="category-card-overlay">
                      <h3>{c.name}</h3>
                      <span>{c.products_count} products</span>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Featured Products */}
      {featured.length > 0 && (
        <section className="section">
          <div className="container">
            <motion.div className="section-header" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
              <h2>Featured Products</h2>
              <Link to="/products?featured=true" className="btn btn-ghost">View All <ArrowRight size={16} /></Link>
            </motion.div>
            <div className="product-grid">
              {featured.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="section">
        <div className="container">
          <motion.div
            className="cta-section"
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <div className="cta-glow" />
            <h2 style={{ fontSize: 36, fontWeight: 700, marginBottom: 16, position: 'relative' }}>Ready to Explore?</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 32, fontSize: 16, position: 'relative' }}>
              Join thousands of happy customers who trust LUXE for premium products.
            </p>
            <Link to="/register" className="btn btn-primary btn-lg" style={{ position: 'relative' }}>
              Create Account <ArrowRight size={18} />
            </Link>
          </motion.div>
        </div>
      </section>
    </motion.div>
  )
}
