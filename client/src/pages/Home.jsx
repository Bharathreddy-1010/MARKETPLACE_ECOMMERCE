import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../utils/api';
import { useCart } from '../context/CartContext';
import { ArrowRight, ShieldCheck, Box, MessageSquare } from 'lucide-react';

export default function Home({ onOpenAi }) {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

  useEffect(() => {
    api.getProducts({ featured: 'true' })
      .then(res => setFeaturedProducts(res.products || []))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const categories = [
    {
      name: 'Cotton',
      desc: 'Breathable natural cotton wovens and poplins',
      categoryQuery: 'Cotton'
    },
    {
      name: 'Silk',
      desc: 'Lustrous mulberry silks, charmeuse and georgette',
      categoryQuery: 'Silk'
    },
    {
      name: 'Wool & Suiting',
      desc: 'Merino, tweed and worsted suiting cloth',
      categoryQuery: 'Wool & Suiting'
    },
    {
      name: 'Denim',
      desc: 'Selvedge, stretch and raw indigo denim',
      categoryQuery: 'Denim'
    },
    {
      name: 'Linen',
      desc: 'European flax linen and linen blends',
      categoryQuery: 'Linen'
    },
    {
      name: 'Knits & Jersey',
      desc: 'Single jersey, rib and interlock knits',
      categoryQuery: 'Knits & Jersey'
    },
    {
      name: 'Sustainable',
      desc: 'Recycled, organic and low-impact fibres',
      categoryQuery: 'Sustainable'
    },
    {
      name: 'Technical',
      desc: 'Performance, coated and functional textiles',
      categoryQuery: 'Technical'
    }
  ];

  return (
    <div className="relative min-h-screen bg-[#0c0a09] text-[#f5f5f4]">
      
      {/* ── CONTINUOUS BRIGHT FIXED BACKGROUND VIDEO FOR HOME PAGE ── */}
      <div className="fixed inset-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover scale-[1.25] origin-top-left brightness-[1.2] contrast-[1.05]"
        >
          <source src="/videos/Create_a_cinematic_luxury_hero.mp4" type="video/mp4" />
        </video>
        {/* Reduced dark backdrop overlay (30% opacity) for high video visibility */}
        <div className="absolute inset-0 bg-[#0c0a09]/30" />
      </div>

      {/* ── PAGE CONTENT LAYER ── */}
      <div className="relative z-10">
        
        {/* ── HERO SECTION ── */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center border-b border-stone-800/80 pb-12">
            
            {/* Left Text Content */}
            <div className="lg:col-span-6 space-y-6">
              <span className="text-[11px] font-sans font-bold uppercase tracking-widest text-amber-400 block drop-shadow">
                WHOLESALE TEXTILES · SINCE THE LOOM
              </span>

              <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl text-[#f5f5f4] leading-[1.08] drop-shadow-md">
                Buy cloth the way <br />
                <span className="italic font-normal text-amber-200/90">mills actually sell it.</span>
              </h1>

              <p className="font-sans text-stone-200 text-sm sm:text-base leading-relaxed max-w-xl drop-shadow">
                MarketPlace puts verified mill stock, honest minimums and landed pricing in one place — so your production calendar stops depending on email threads.
              </p>

              <div className="flex items-center gap-3 pt-2">
                <Link to="/marketplace" className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-[#0c0a09] font-sans font-bold text-xs rounded-xl shadow-lg transition-colors flex items-center gap-2">
                  Browse the marketplace <ArrowRight className="w-3.5 h-3.5" />
                </Link>

                <button onClick={onOpenAi} className="px-5 py-3 bg-stone-900/90 hover:bg-stone-900 border border-stone-600 text-white font-sans font-medium text-xs rounded-xl backdrop-blur-md transition-colors shadow">
                  Sourcing Assistant
                </button>
              </div>

              {/* Stats Line */}
              <div className="pt-6 border-t border-stone-800/80 grid grid-cols-3 gap-4">
                <div>
                  <span className="text-[9px] font-sans font-bold uppercase tracking-wider text-stone-400 block">
                    Verified Mills
                  </span>
                  <span className="font-serif text-2xl font-bold text-[#f5f5f4]">40+</span>
                </div>
                <div>
                  <span className="text-[9px] font-sans font-bold uppercase tracking-wider text-stone-400 block">
                    Live Qualities
                  </span>
                  <span className="font-serif text-2xl font-bold text-[#f5f5f4]">1,200</span>
                </div>
                <div>
                  <span className="text-[9px] font-sans font-bold uppercase tracking-wider text-stone-400 block">
                    Avg. Lead Time
                  </span>
                  <span className="font-serif text-2xl font-bold text-[#f5f5f4]">12 days</span>
                </div>
              </div>

            </div>

            {/* Right — Hero Image */}
            <div className="lg:col-span-6 relative">
              <div className="relative rounded-2xl overflow-hidden border border-stone-800/90 shadow-2xl group bg-stone-950/90 backdrop-blur-md">
                <img
                  src="/images/hero-mill.jpg"
                  alt="Partner Textile Mill Showcase"
                  className="w-full h-[360px] sm:h-[390px] lg:h-[410px] object-cover object-center group-hover:scale-105 transition-transform duration-700 opacity-95"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-stone-950/60 via-transparent to-transparent opacity-80" />

                {/* Overlapping Floating Sample Lot Card */}
                <div className="absolute bottom-4 left-4 bg-stone-950/90 border border-stone-800 p-4 rounded-xl shadow-2xl backdrop-blur-md max-w-[240px] text-white space-y-1">
                  <span className="text-[9px] font-sans font-bold uppercase tracking-widest text-amber-400 block">
                    SAMPLE LOT
                  </span>
                  <h4 className="font-serif text-base font-bold text-[#f5f5f4] leading-tight">
                    14oz selvedge denim
                  </h4>
                  <p className="text-[11px] font-sans text-stone-300">
                    ₹1,480/m · 240m on hand
                  </p>
                </div>

              </div>
            </div>

          </div>
        </section>

        {/* ── VALUE PROPOSITION CARDS (3 COLUMNS) ── */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 border-b border-stone-800/80">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            <div className="bg-stone-950/90 border border-stone-800/90 rounded-2xl p-6 backdrop-blur-md shadow-2xl space-y-3 hover:border-stone-700 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="font-serif text-lg font-bold text-[#f5f5f4]">Vetted mills only</h3>
              <p className="text-xs font-sans text-stone-300 leading-relaxed">
                Every supplier is checked for capacity, compliance and consistency before listing.
              </p>
            </div>

            <div className="bg-stone-950/90 border border-stone-800/90 rounded-2xl p-6 backdrop-blur-md shadow-2xl space-y-3 hover:border-stone-700 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                <Box className="w-5 h-5" />
              </div>
              <h3 className="font-serif text-lg font-bold text-[#f5f5f4]">Stock you can trust</h3>
              <p className="text-xs font-sans text-stone-300 leading-relaxed">
                Metres on hand, weight, width and lead time on every quality — updated by the mill.
              </p>
            </div>

            <div
              onClick={onOpenAi}
              className="bg-stone-950/90 border border-stone-800/90 rounded-2xl p-6 backdrop-blur-md shadow-2xl space-y-3 hover:border-amber-400/60 transition-colors cursor-pointer group"
            >
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 group-hover:bg-amber-500/20 transition-colors">
                <MessageSquare className="w-5 h-5" />
              </div>
              <h3 className="font-serif text-lg font-bold text-[#f5f5f4] group-hover:text-amber-300 transition-colors flex items-center justify-between">
                Sourcing assistant <ArrowRight className="w-4 h-4 text-amber-400 group-hover:translate-x-1 transition-transform" />
              </h3>
              <p className="text-xs font-sans text-stone-300 leading-relaxed">
                Describe the garment; the assistant searches live stock and shortlists the cloth.
              </p>
            </div>

          </div>
        </section>

        {/* ── SHOP BY CONSTRUCTION: CATEGORIES SECTION ── */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 border-b border-stone-800/80 space-y-8">
          <div className="flex items-end justify-between">
            <div>
              <span className="text-[10px] font-sans font-bold uppercase tracking-widest text-amber-400 block">
                SHOP BY CONSTRUCTION
              </span>
              <h2 className="font-serif text-3xl font-bold text-[#f5f5f4] mt-1">Categories</h2>
            </div>
            <Link
              to="/marketplace"
              className="text-xs font-sans font-semibold text-amber-400 hover:text-amber-300 hover:underline flex items-center gap-1 transition-colors"
            >
              See everything →
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((cat) => (
              <Link
                key={cat.name}
                to={`/marketplace?category=${encodeURIComponent(cat.categoryQuery)}`}
                className="group bg-stone-950/90 border border-stone-800/90 p-6 rounded-2xl backdrop-blur-md shadow-xl hover:border-amber-400/80 hover:bg-stone-900/90 transition-all duration-300 flex flex-col justify-between space-y-4"
              >
                <div className="space-y-2">
                  <h3 className="font-serif text-xl font-bold text-[#f5f5f4] group-hover:text-amber-300 transition-colors">
                    {cat.name}
                  </h3>
                  <p className="text-xs font-sans text-stone-400 leading-relaxed">
                    {cat.desc}
                  </p>
                </div>

                <div className="pt-3 border-t border-stone-800/60 flex items-center gap-1 text-[11px] font-sans font-bold uppercase tracking-wider text-amber-400 group-hover:text-amber-300 transition-colors">
                  BROWSE <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* ── FEATURED SELECTION ── */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-amber-400 block">Curated Qualities</span>
              <h2 className="font-serif text-2xl font-bold text-[#f5f5f4]">House Picks</h2>
            </div>
            <Link to="/marketplace" className="text-xs font-sans font-medium text-amber-400 hover:text-amber-300 hover:underline flex items-center gap-1 transition-colors">
              View all 12 qualities →
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-80 shimmer rounded-xl" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredProducts.slice(0, 3).map((p) => (
                <Link
                  key={p.id}
                  to={`/product/${p.id}`}
                  className="editorial-card overflow-hidden flex flex-col group bg-stone-950/90 border-stone-800 backdrop-blur-md text-white shadow-2xl hover:border-amber-500/60 transition-all cursor-pointer block"
                >
                  <div className="relative h-56 bg-stone-900 overflow-hidden">
                    <img
                      src={(p.images && p.images[0]) || '/images/Compact Cotton Poplin.jpg'}
                      alt={p.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3">
                      <span className="badge-house-pick">House Pick</span>
                    </div>
                  </div>

                  <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                    <div>
                      <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-amber-400 block">
                        {p.category}
                      </span>
                      <h3 className="font-serif text-lg font-bold text-[#f5f5f4] group-hover:text-amber-300 block line-clamp-1 transition-colors mt-0.5">
                        {p.name}
                      </h3>
                      <p className="text-xs font-sans text-stone-400 mt-0.5 line-clamp-1">{p.fiberComposition}</p>
                    </div>

                    <div className="pt-3 border-t border-stone-800 flex items-center justify-between">
                      <div>
                        <span className="font-sans font-bold text-sm text-amber-400">₹{p.price.toLocaleString('en-IN')}</span>
                        <span className="text-[10px] font-sans text-stone-400"> /m</span>
                        <span className="text-[10px] font-sans text-stone-400 block">MOQ {p.moq}m · {p.supplierName}</span>
                      </div>
                      <span className="px-2 py-0.5 border border-stone-700 text-[10px] font-sans text-stone-300 rounded bg-stone-900">
                        {p.gsm} GSM
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

      </div>

    </div>
  );
}
