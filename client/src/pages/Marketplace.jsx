import React, { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { api } from '../utils/api';
import { useCart } from '../context/CartContext';
import { Search } from 'lucide-react';

export default function Marketplace({ onOpenAi }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [category, setCategory] = useState(searchParams.get('category') || 'All qualities');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [onShelfOnly, setOnShelfOnly] = useState(false);
  const [sortBy, setSortBy] = useState('newest');

  const { addToCart } = useCart();

  const categories = [
    'All qualities',
    'Cotton',
    'Silk',
    'Wool & Suiting',
    'Denim',
    'Linen',
    'Knits & Jersey',
    'Sustainable',
    'Technical'
  ];

  useEffect(() => {
    fetchFilteredProducts();
  }, [search, category, minPrice, maxPrice, onShelfOnly, sortBy]);

  const fetchFilteredProducts = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (category && category !== 'All qualities') params.category = category;
      if (minPrice) params.minPrice = minPrice;
      if (maxPrice) params.maxPrice = maxPrice;
      if (sortBy) params.sortBy = sortBy;

      const res = await api.getProducts(params);
      let list = res.products || [];
      if (onShelfOnly) {
        list = list.filter(p => p.inStock);
      }
      setProducts(list);
    } catch (err) {
      console.error('Failed to fetch marketplace products:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchFilteredProducts();
  };

  return (
    <div className="relative min-h-screen bg-[#0c0a09] text-[#f5f5f4]">
      
      {/* ── CONTINUOUS BRIGHT FIXED BACKGROUND VIDEO FOR MARKETPLACE PAGE ── */}
      <div className="fixed inset-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover scale-[1.25] origin-top-left brightness-[1.2] contrast-[1.05]"
        >
          <source src="/videos/Marketplace2.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-[#0c0a09]/30" />
      </div>

      {/* ── PAGE CONTENT LAYER ── */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        
        {/* ── HEADER ── */}
        <div className="space-y-4 border-b border-stone-800/80 pb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
            <div>
              <span className="text-[11px] font-sans font-bold uppercase tracking-widest text-amber-400 block">
                The Counter
              </span>
              <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#f5f5f4] drop-shadow">
                Marketplace
              </h1>
            </div>

            {/* Sort Pills */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {[
                { id: 'newest', label: 'NEWEST' },
                { id: 'price_asc', label: 'PRICE ↑' },
                { id: 'price_desc', label: 'PRICE ↓' },
                { id: 'name_asc', label: 'A–Z' }
              ].map(pill => (
                <button
                  key={pill.id}
                  onClick={() => setSortBy(pill.id)}
                  className={`px-3 py-1 text-[10px] font-sans font-bold tracking-wider rounded transition-colors ${
                    sortBy === pill.id
                      ? 'bg-amber-500 text-[#0c0a09]'
                      : 'bg-stone-900/90 text-stone-200 border border-stone-700/80 hover:bg-stone-800 hover:text-white'
                  }`}
                >
                  {pill.label}
                </button>
              ))}
            </div>
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-stone-300 absolute left-3.5 top-3.5" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search cloth, composition or finish — 'washed linen', 'raw denim'"
                className="w-full bg-stone-950/90 border border-stone-700/80 rounded px-4 py-3 pl-10 text-xs font-sans text-white placeholder-stone-400 focus:outline-none focus:border-amber-400 transition-colors shadow-lg"
              />
            </div>
            <button type="submit" className="bg-amber-500 hover:bg-amber-400 text-[#0c0a09] font-sans font-bold text-xs py-3 px-6 rounded shadow-lg transition-colors">
              Search
            </button>
          </form>
        </div>

        {/* ── MAIN CONTENT (SIDEBAR + GRID) ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Sidebar Filters */}
          <div className="lg:col-span-3 space-y-6 bg-stone-950/90 p-5 rounded-xl border border-stone-800/90 backdrop-blur-md shadow-2xl">
            <span className="text-xs font-sans font-semibold text-stone-200 block">
              {products.length} qualities
            </span>

            {/* Categories */}
            <div className="space-y-2">
              <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-amber-400 block">
                Category
              </span>
              <div className="space-y-0.5">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setCategory(cat)}
                    className={`w-full text-left px-2.5 py-1.5 rounded text-xs font-sans transition-colors block ${
                      category === cat
                        ? 'bg-amber-500/25 text-amber-300 font-semibold border-l-2 border-amber-400'
                        : 'text-stone-300 hover:text-white hover:bg-stone-900'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Range */}
            <div className="space-y-2 pt-3 border-t border-stone-800">
              <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-amber-400 block">
                Price Per Metre (₹)
              </span>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-[10px] font-sans text-stone-400 block mb-0.5">Min</span>
                  <input
                    type="number"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    placeholder="₹"
                    className="w-full bg-stone-900 border border-stone-700/80 rounded py-1 px-2 text-xs text-white placeholder-stone-500 focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <span className="text-[10px] font-sans text-stone-400 block mb-0.5">Max</span>
                  <input
                    type="number"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    placeholder="₹"
                    className="w-full bg-stone-900 border border-stone-700/80 rounded py-1 px-2 text-xs text-white placeholder-stone-500 focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>
            </div>

            {/* Checkbox */}
            <div className="pt-3 border-t border-stone-800">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={onShelfOnly}
                  onChange={(e) => setOnShelfOnly(e.target.checked)}
                  className="w-3.5 h-3.5 accent-amber-500 rounded"
                />
                <span className="text-xs font-sans text-stone-300">On the shelf only</span>
              </label>
            </div>
          </div>

          {/* Right Product Grid (3 Columns) */}
          <div className="lg:col-span-9">
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <div key={i} className="h-80 shimmer rounded" />
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="bg-stone-950/90 border border-stone-800 p-12 text-center space-y-3 rounded-xl backdrop-blur-md">
                <h3 className="font-serif text-xl font-bold text-white">No qualities found</h3>
                <p className="text-xs font-sans text-stone-400">Try adjusting your search criteria or category filter.</p>
                <button
                  onClick={() => { setSearch(''); setCategory('All qualities'); setMinPrice(''); setMaxPrice(''); setOnShelfOnly(false); }}
                  className="bg-amber-500 text-[#0c0a09] font-bold text-xs py-2 px-4 rounded"
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((p) => (
                  <div
                    key={p.id}
                    className="editorial-card overflow-hidden flex flex-col group bg-stone-950/90 border-stone-800 backdrop-blur-md text-white shadow-2xl hover:border-amber-500/60 transition-all cursor-pointer"
                    onClick={() => navigate(`/product/${p.id}`)}
                  >
                    
                    {/* Photo Container */}
                    <div className="relative h-56 bg-stone-900 overflow-hidden">
                      <img
                        src={(p.images && p.images[0]) || '/images/Compact Cotton Poplin.jpg'}
                        alt={p.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      
                      {/* Badge */}
                      <div className="absolute top-3 left-3">
                        <span className="badge-house-pick">House Pick</span>
                      </div>
                    </div>

                    {/* Product Metadata */}
                    <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                      <div>
                        <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-amber-400 block truncate">
                          {p.category}
                        </span>
                        <h3 className="font-serif text-lg font-bold text-[#f5f5f4] group-hover:text-amber-300 block line-clamp-1 transition-colors mt-0.5">
                          {p.name}
                        </h3>
                        <p className="text-xs font-sans text-stone-400 mt-0.5 line-clamp-1">
                          {p.fiberComposition}
                        </p>
                      </div>

                      {/* Bottom Specs & Price */}
                      <div className="pt-3 border-t border-stone-800">
                        <div className="flex items-baseline justify-between">
                          <div>
                            <span className="font-sans font-bold text-sm text-amber-400">₹{p.price.toLocaleString('en-IN')}</span>
                            <span className="text-[10px] font-sans text-stone-400"> /m</span>
                          </div>
                          <span className="px-2 py-0.5 border border-stone-700 text-[10px] font-sans text-stone-300 rounded bg-stone-900">
                            {p.gsm} GSM
                          </span>
                        </div>
                        
                        <div className="flex items-center justify-between mt-2 text-[10px] font-sans text-stone-400">
                          <span>MOQ {p.moq}m · {p.supplierName}</span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation(); // prevent opening details when clicking + Add
                              addToCart(p, p.moq);
                            }}
                            className="font-bold text-amber-400 hover:text-amber-300 hover:underline px-2 py-1 bg-amber-500/10 border border-amber-500/30 rounded"
                          >
                            + Add
                          </button>
                        </div>
                      </div>

                    </div>

                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
}
