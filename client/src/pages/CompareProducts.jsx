import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { api } from '../utils/api';
import { useCart } from '../context/CartContext';
import { SlidersHorizontal, ShoppingBag, X } from 'lucide-react';

export default function CompareProducts() {
  const [searchParams] = useSearchParams();
  const [comparedProducts, setComparedProducts] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAddId, setSelectedAddId] = useState('');

  const { addToCart } = useCart();

  useEffect(() => {
    api.getProducts()
      .then(res => {
        const list = res.products || [];
        setAllProducts(list);
        const p1 = searchParams.get('p1');
        const initialList = [];
        if (p1) {
          const match1 = list.find(p => p.id === p1);
          if (match1) initialList.push(match1);
        }
        if (initialList.length < 2 && list.length >= 2) {
          list.slice(0, 2).forEach(p => {
            if (!initialList.some(item => item.id === p.id)) initialList.push(p);
          });
        }
        setComparedProducts(initialList);
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [searchParams]);

  const addProductToCompare = (idToAdd) => {
    if (!idToAdd) return;
    const found = allProducts.find(p => p.id === idToAdd);
    if (found && !comparedProducts.some(p => p.id === found.id)) {
      if (comparedProducts.length >= 4) { alert('Max 4 qualities allowed.'); return; }
      setComparedProducts([...comparedProducts, found]);
    }
  };

  const removeProduct = (idToRemove) => {
    setComparedProducts(comparedProducts.filter(p => p.id !== idToRemove));
  };

  if (loading) {
    return (
      <div className="relative min-h-screen bg-[#0c0a09] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const specsList = [
    { label: 'Category', getValue: p => p.category },
    { label: 'Price per metre', getValue: p => `₹${p.price.toLocaleString('en-IN')}/m`, highlight: true },
    { label: 'Minimum Order (MOQ)', getValue: p => `${p.moq} meters` },
    { label: 'GSM Weight', getValue: p => `${p.gsm} GSM` },
    { label: 'Fiber Composition', getValue: p => p.fiberComposition },
    { label: 'Weave Type', getValue: p => p.weave },
    { label: 'Usable Width', getValue: p => p.width },
    { label: 'Eco & Mill Certifications', getValue: p => (p.certifications?.length > 0) ? p.certifications.join(', ') : 'Standard Quality' },
    { label: 'Dispatch Lead Time', getValue: p => `${p.leadTimeDays || 7} days` },
    { label: 'Country of Origin', getValue: p => p.countryOfOrigin || 'India' },
  ];

  return (
    <div className="relative min-h-screen bg-[#0c0a09] text-[#f5f5f4]">
      
      {/* ── CONTINUOUS BRIGHT FIXED BACKGROUND VIDEO FOR COMPARATOR PAGE ── */}
      <div className="fixed inset-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover scale-[1.25] origin-top-left brightness-[1.4] contrast-[1.1]"
        >
          <source src="/videos/cinematic_bran.mp4" type="video/mp4" />
        </video>
        {/* Backdrop overlay for high visibility & contrast */}
        <div className="absolute inset-0 bg-[#0c0a09]/20" />
      </div>

      {/* ── PAGE CONTENT LAYER ── */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-stone-800/80 pb-6">
          <div>
            <span className="text-[11px] font-sans font-bold uppercase tracking-widest text-amber-400 block">Differentiated Side-by-Side</span>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#f5f5f4] tracking-tight flex items-center gap-2 drop-shadow">
              <SlidersHorizontal className="w-5 h-5 text-amber-400" /> Specification Comparator
            </h1>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <select
              value={selectedAddId}
              onChange={(e) => { setSelectedAddId(e.target.value); addProductToCompare(e.target.value); }}
              className="w-full sm:w-auto bg-stone-900/90 border border-stone-700/80 rounded-xl px-4 py-2.5 text-xs font-sans text-white focus:outline-none focus:border-amber-400 shadow-lg"
            >
              <option value="">+ Add Quality to Compare...</option>
              {allProducts.filter(p => !comparedProducts.some(cp => cp.id === p.id)).map(p => (
                <option key={p.id} value={p.id}>{p.name} ({p.gsm} GSM)</option>
              ))}
            </select>
          </div>
        </div>

        {comparedProducts.length === 0 ? (
          <div className="bg-stone-950/90 border border-stone-800 p-12 text-center rounded-2xl space-y-4 backdrop-blur-md shadow-2xl">
            <p className="text-xs font-sans text-stone-300">No qualities selected for comparison.</p>
            <Link to="/marketplace" className="bg-amber-500 hover:bg-amber-400 text-[#0c0a09] font-bold text-xs py-2.5 px-5 rounded-xl inline-block shadow transition-colors">
              Browse Marketplace
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            
            {/* Distinct Side-by-Side Cards Grid */}
            <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-${Math.min(comparedProducts.length, 3)} gap-6 lg:gap-8 items-start`}>
              
              {comparedProducts.map((p) => (
                <div
                  key={p.id}
                  className="relative bg-stone-950/95 border border-stone-800/90 rounded-2xl p-6 shadow-2xl backdrop-blur-md flex flex-col justify-between hover:border-amber-500/50 transition-all duration-300"
                >
                  
                  {/* Card Header & Photo */}
                  <div className="space-y-4">
                    <div className="relative h-48 rounded-xl overflow-hidden bg-stone-900 border border-stone-800">
                      <img
                        src={(p.images && p.images[0]) || '/images/Compact Cotton Poplin.jpg'}
                        alt={p.name}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                      />
                      
                      {/* Delete Button */}
                      <button
                        onClick={() => removeProduct(p.id)}
                        className="absolute top-2.5 right-2.5 bg-stone-950/80 hover:bg-rose-600 text-stone-300 hover:text-white p-1.5 rounded-full backdrop-blur-md border border-stone-700 transition-colors shadow"
                        title="Remove from comparison"
                      >
                        <X className="w-4 h-4" />
                      </button>

                      {/* Category Badge */}
                      <div className="absolute bottom-2.5 left-2.5">
                        <span className="px-2.5 py-1 text-[9px] font-sans font-bold bg-stone-950/90 text-amber-300 border border-stone-700/80 rounded-md backdrop-blur-md uppercase tracking-wider">
                          {p.category}
                        </span>
                      </div>
                    </div>

                    <div>
                      <span className="text-[10px] font-sans font-bold text-stone-400 block uppercase tracking-wider">
                        {p.supplierName}
                      </span>
                      <Link to={`/product/${p.id}`} className="font-serif text-xl font-bold text-[#f5f5f4] hover:text-amber-300 block transition-colors">
                        {p.name}
                      </Link>
                      <div className="flex items-baseline justify-between mt-2 pt-2 border-t border-stone-800/80">
                        <span className="font-serif text-2xl font-bold text-amber-400">₹{p.price.toLocaleString('en-IN')}<span className="text-xs text-stone-400 font-sans font-normal"> /m</span></span>
                        <span className="text-xs font-sans text-stone-300">MOQ {p.moq}m</span>
                      </div>
                    </div>

                    {/* Order Button */}
                    <button
                      onClick={() => addToCart(p, p.moq)}
                      className="w-full bg-amber-500 hover:bg-amber-400 text-[#0c0a09] font-sans font-bold py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg transition-colors"
                    >
                      <ShoppingBag className="w-4 h-4" /> Order Sample ({p.moq}m)
                    </button>
                  </div>

                  {/* Independent Differentiated Specifications List */}
                  <div className="mt-6 pt-4 border-t border-stone-800 space-y-3 text-xs font-sans">
                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-amber-400 block">
                      Technical Specifications
                    </h4>

                    {specsList.map(spec => (
                      <div key={spec.label} className="py-2 border-b border-stone-800/60 flex items-start justify-between gap-4">
                        <span className="text-stone-400 font-medium shrink-0 text-[11px]">{spec.label}:</span>
                        <span className={`text-right font-semibold ${
                          spec.highlight ? 'text-amber-400 text-sm font-bold' : 'text-stone-100'
                        }`}>
                          {spec.getValue(p)}
                        </span>
                      </div>
                    ))}
                  </div>

                </div>
              ))}

            </div>

          </div>
        )}

      </div>
    </div>
  );
}
