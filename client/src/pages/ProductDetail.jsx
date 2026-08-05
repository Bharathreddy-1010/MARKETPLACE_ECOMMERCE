import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api } from '../utils/api';
import { useCart } from '../context/CartContext';
import { ArrowLeft, CheckCircle2, ShoppingBag, Zap, Plus, Minus } from 'lucide-react';

export default function ProductDetail({ onOpenAiWithContext }) {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantityInput, setQuantityInput] = useState('100');
  const [addedSuccess, setAddedSuccess] = useState(false);

  const { addToCart } = useCart();

  useEffect(() => {
    window.scrollTo(0, 0);
    setLoading(true);
    api.getProductById(id)
      .then(res => {
        setProduct(res);
        setSelectedImage(res.images?.[0] || '');
        setSelectedColor(res.colors?.[0] || 'Standard');
        setQuantityInput(String(res.moq || 100));
      })
      .catch(err => console.error('Failed to load product detail:', err))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="relative min-h-screen bg-[#0c0a09] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="relative min-h-screen bg-[#0c0a09] text-white flex items-center justify-center">
        <div className="text-center space-y-4">
          <h2 className="font-serif text-2xl font-bold">Quality Not Found</h2>
          <Link to="/marketplace" className="bg-amber-500 text-[#0c0a09] font-bold text-xs py-2.5 px-5 rounded inline-block">Return to Marketplace</Link>
        </div>
      </div>
    );
  }

  const parsedQty = parseInt(quantityInput, 10);
  const currentQuantity = isNaN(parsedQty) || parsedQty <= 0 ? 0 : parsedQty;

  let currentUnitPrice = product.price;
  let activeTierIndex = 0;

  if (product.priceTiers && product.priceTiers.length > 0) {
    const sortedTiers = [...product.priceTiers].sort((a, b) => a.minQty - b.minQty);
    sortedTiers.forEach((tier, idx) => {
      if (currentQuantity >= tier.minQty) {
        currentUnitPrice = tier.price;
        activeTierIndex = idx;
      }
    });
  }

  const orderTotal = (currentUnitPrice * currentQuantity).toLocaleString('en-IN');

  const handleQuantityChange = (e) => {
    const val = e.target.value;
    setQuantityInput(val);
  };

  const handleQuantityBlur = () => {
    const val = parseInt(quantityInput, 10);
    const moq = product.moq || 10;
    if (isNaN(val) || val < moq) {
      setQuantityInput(String(moq));
    }
  };

  const adjustQuantity = (amount) => {
    const moq = product.moq || 10;
    const next = Math.max(moq, currentQuantity + amount);
    setQuantityInput(String(next));
  };

  const handleAddToCart = () => {
    const finalQty = Math.max(product.moq || 10, currentQuantity);
    addToCart(product, finalQty, selectedColor);
    setAddedSuccess(true);
    setTimeout(() => setAddedSuccess(false), 3000);
  };

  const handleBuyNow = () => {
    const finalQty = Math.max(product.moq || 10, currentQuantity);
    addToCart(product, finalQty, selectedColor);
    navigate('/checkout');
  };

  const currentBgImage = selectedImage || (product.images && product.images[0]) || '/images/Compact Cotton Poplin.jpg';

  return (
    <div className="relative min-h-screen bg-[#0c0a09] text-[#f5f5f4]">
      
      {/* ── IMMERSIVE FULL-PAGE PRODUCT FABRIC IMAGE BACKGROUND ── */}
      <div className="fixed inset-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <img
          src={currentBgImage}
          alt={product.name}
          className="w-full h-full object-cover scale-105 brightness-[1.1] contrast-[1.05]"
        />
        {/* Light backdrop overlay for high image visibility and clear text legibility */}
        <div className="absolute inset-0 bg-[#0c0a09]/30" />
      </div>

      {/* ── PAGE CONTENT LAYER ── */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Breadcrumb / Top Bar */}
        <div className="flex items-center justify-between text-xs font-sans border-b border-stone-800/80 pb-4">
          <Link to="/marketplace" className="flex items-center gap-1 text-stone-300 hover:text-white transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Marketplace
          </Link>
          <div className="flex items-center gap-3">
            <button
              onClick={() => onOpenAiWithContext(product)}
              className="px-3 py-1.5 bg-stone-900/90 border border-stone-700 text-amber-400 font-medium rounded-xl text-xs hover:bg-stone-800 shadow"
            >
              Ask Assistant
            </button>
            <Link to={`/compare?p1=${product.id}`} className="px-3 py-1.5 bg-stone-900/90 border border-stone-700 text-stone-200 font-medium rounded-xl text-xs hover:bg-stone-800 shadow">
              Compare Specs
            </Link>
          </div>
        </div>

        {/* Main Details Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Left: Product Main Showcase Image */}
          <div className="lg:col-span-6 space-y-6">
            <div className="overflow-hidden h-[420px] bg-stone-950 border border-stone-800/90 rounded-2xl relative shadow-2xl group">
              <img
                src={currentBgImage}
                alt={product.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute top-3 left-3">
                <span className="badge-house-pick">House Pick</span>
              </div>
              <div className="absolute top-3 right-3 px-3 py-1 bg-stone-950/90 border border-stone-700 text-[10px] font-sans font-bold text-amber-300 rounded-lg backdrop-blur-md">
                {product.gsm} GSM
              </div>
            </div>

            {/* Thumbnail Selector */}
            {product.images && product.images.length > 1 && (
              <div className="flex items-center gap-3">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(img)}
                    className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition-all shadow-md ${
                      selectedImage === img ? 'border-amber-400 scale-105' : 'border-stone-800 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="Thumbnail" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: Technical Specs & Ordering */}
          <div className="lg:col-span-6 space-y-6">
            
            <div>
              <span className="text-[11px] font-sans font-bold uppercase tracking-widest text-amber-400 block">
                {product.category} · {product.supplierName}
              </span>
              <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#f5f5f4] mt-1">{product.name}</h1>
              <p className="font-sans text-xs sm:text-sm text-stone-300 mt-2 leading-relaxed">{product.description}</p>
            </div>

            {/* INTERACTIVE Volume Pricing Tiers */}
            <div className="p-5 bg-stone-950/90 border border-stone-800/90 rounded-2xl space-y-3 backdrop-blur-md shadow-2xl">
              <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-amber-400 block">
                Volume Pricing Tiers (Click to Select)
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-center text-xs">
                {product.priceTiers && product.priceTiers.length > 0 ? (
                  product.priceTiers.map((tier, idx) => {
                    const isActive = activeTierIndex === idx;
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setQuantityInput(String(tier.minQty))}
                        className={`p-3 rounded-xl border transition-all cursor-pointer text-center block ${
                          isActive
                            ? 'bg-amber-500/20 border-amber-400 font-bold text-white shadow-lg ring-2 ring-amber-400/50 scale-[1.02]'
                            : 'bg-stone-900/60 border-stone-800 text-stone-300 hover:border-amber-400/60 hover:bg-stone-900'
                        }`}
                      >
                        <span className="block text-[10px] font-sans font-semibold text-stone-300">{tier.minQty}+ meters</span>
                        <span className="font-sans font-bold text-sm text-amber-400">₹{tier.price.toLocaleString('en-IN')}/m</span>
                        {isActive && (
                          <span className="inline-block mt-1 text-[9px] font-bold text-amber-300 bg-amber-400/20 px-1.5 py-0.5 rounded">
                            Active Tier
                          </span>
                        )}
                      </button>
                    );
                  })
                ) : (
                  <div className="col-span-3 p-3 bg-stone-900 rounded-xl font-sans font-bold text-sm text-amber-400">
                    ₹{product.price.toLocaleString('en-IN')} / meter
                  </div>
                )}
              </div>
            </div>

            {/* Quantity & Order Subtotal */}
            <div className="p-5 bg-stone-950/90 border border-stone-800/90 rounded-2xl space-y-4 backdrop-blur-md shadow-2xl">
              <div className="flex items-center justify-between text-xs">
                <label className="font-sans font-bold text-white">Quantity (Meters)</label>
                <span className="font-sans text-amber-400">MOQ: {product.moq}m</span>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                
                {/* Custom Typing Input Box with Step Increments */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => adjustQuantity(-50)}
                    className="p-2.5 bg-stone-900 border border-stone-700 text-stone-300 hover:text-white hover:bg-stone-800 rounded-xl transition-colors"
                    title="Subtract 50 meters"
                  >
                    <Minus className="w-4 h-4" />
                  </button>

                  <input
                    type="number"
                    value={quantityInput}
                    onChange={handleQuantityChange}
                    onBlur={handleQuantityBlur}
                    placeholder="Enter meters"
                    className="w-36 bg-stone-900 border border-stone-700 rounded-xl py-2.5 px-3 text-base font-bold text-amber-400 text-center focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
                  />

                  <button
                    type="button"
                    onClick={() => adjustQuantity(50)}
                    className="p-2.5 bg-stone-900 border border-stone-700 text-stone-300 hover:text-white hover:bg-stone-800 rounded-xl transition-colors"
                    title="Add 50 meters"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                <div>
                  <span className="text-[10px] font-sans text-stone-400 block">Estimated Subtotal</span>
                  <span className="font-serif text-2xl font-bold text-amber-400">₹{orderTotal}</span>
                </div>

              </div>

              {/* Action Buttons: Add to Cart & Buy Now */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  onClick={handleAddToCart}
                  className="w-full bg-stone-900 hover:bg-stone-800 border border-stone-700 text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 text-xs shadow transition-colors"
                >
                  <ShoppingBag className="w-4 h-4 text-amber-400" /> Add to Cart
                </button>
                
                <button
                  onClick={handleBuyNow}
                  className="w-full bg-amber-500 hover:bg-amber-400 text-[#0c0a09] font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 text-xs shadow-lg transition-colors"
                >
                  Buy Now <Zap className="w-4 h-4" />
                </button>
              </div>
            </div>

            {addedSuccess && (
              <div className="p-3.5 bg-amber-500/20 border border-amber-400 text-amber-300 text-xs font-sans font-semibold rounded-xl flex items-center gap-2 shadow-lg">
                <CheckCircle2 className="w-4 h-4 text-amber-400" />
                Added {currentQuantity}m of {product.name} to cart.
              </div>
            )}

            {/* Technical Spec List */}
            <div className="space-y-2 pt-4 border-t border-stone-800">
              <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-amber-400 block">
                Specifications
              </span>
              <div className="grid grid-cols-2 gap-3 text-xs bg-stone-950/90 p-4 border border-stone-800/90 rounded-2xl backdrop-blur-md">
                {[
                  { label: 'Fiber Composition', value: product.fiberComposition },
                  { label: 'Weight', value: `${product.gsm} GSM` },
                  { label: 'Width', value: product.width },
                  { label: 'Weave Construction', value: product.weave },
                  { label: 'Lead Time', value: `${product.leadTimeDays || 7} Days` },
                  { label: 'Origin', value: product.countryOfOrigin || 'India' },
                ].map(spec => (
                  <div key={spec.label}>
                    <span className="text-[10px] font-sans text-stone-400 block">{spec.label}</span>
                    <span className="font-sans font-medium text-stone-100">{spec.value}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
