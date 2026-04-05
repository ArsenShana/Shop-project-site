import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Search, SlidersHorizontal, ChevronLeft, ChevronRight } from 'lucide-react'
import { api } from '../api'
import ProductCard from '../components/ProductCard'

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [data, setData] = useState({ items: [], total: 0, page: 1, per_page: 12 })
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState(searchParams.get('search') || '')

  const page = parseInt(searchParams.get('page') || '1')
  const category = searchParams.get('category') || ''
  const sort = searchParams.get('sort') || 'newest'
  const featured = searchParams.get('featured') || ''

  const load = async () => {
    setLoading(true)
    try {
      const params = { page, per_page: 12, sort }
      if (category) params.category = category
      if (search) params.search = search
      if (featured) params.featured = featured
      setData(await api.getProducts(params))
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [page, category, sort, featured])
  useEffect(() => { api.getCategories().then(setCategories).catch(console.error) }, [])

  const setParam = (key, val) => {
    const p = new URLSearchParams(searchParams)
    if (val) p.set(key, val); else p.delete(key)
    if (key !== 'page') p.delete('page')
    setSearchParams(p)
  }

  const handleSearch = (e) => {
    e.preventDefault()
    setParam('search', search)
    load()
  }

  const totalPages = Math.ceil(data.total / data.per_page)

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="page">
      <div className="container">
        <div className="page-header">
          <h1>Shop</h1>
          <p>{data.total} products available</p>
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: 16, marginBottom: 32, flexWrap: 'wrap', alignItems: 'center' }}>
          <form onSubmit={handleSearch} style={{ display: 'flex', gap: 8, flex: 1, minWidth: 200 }}>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search products..." style={{ maxWidth: 300 }} />
            <button type="submit" className="btn btn-outline btn-sm"><Search size={16} /></button>
          </form>

          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <select value={category} onChange={e => setParam('category', e.target.value)} style={{ width: 160 }}>
              <option value="">All Categories</option>
              {categories.map(c => <option key={c.id} value={c.slug}>{c.name}</option>)}
            </select>

            <select value={sort} onChange={e => setParam('sort', e.target.value)} style={{ width: 160 }}>
              <option value="newest">Newest</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="rating">Top Rated</option>
            </select>
          </div>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="loading-page"><div className="spinner" /></div>
        ) : data.items.length === 0 ? (
          <div className="empty-state">
            <h3>No products found</h3>
            <p>Try adjusting your filters or search terms.</p>
          </div>
        ) : (
          <>
            <div className="product-grid">
              {data.items.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
            </div>

            {totalPages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginTop: 40, alignItems: 'center' }}>
                <button className="btn btn-outline btn-sm" disabled={page <= 1} onClick={() => setParam('page', page - 1)}>
                  <ChevronLeft size={16} />
                </button>
                <span style={{ fontSize: 14, color: 'var(--text-secondary)' }}>{page} / {totalPages}</span>
                <button className="btn btn-outline btn-sm" disabled={page >= totalPages} onClick={() => setParam('page', page + 1)}>
                  <ChevronRight size={16} />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </motion.div>
  )
}
