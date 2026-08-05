import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { Plus, Edit3, Trash2, Layers, Search, X } from 'lucide-react';

export default function SupplierInventory() {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState('');

  const [form, setForm] = useState({
    name: '', category: 'Cotton', description: '', price: 850, moq: 100, stock: 2500,
    gsm: 160, width: '150 cm (59")', weave: 'Plain Weave', fiberComposition: '100% Cotton',
    colors: 'White, Navy, Black', certifications: 'GOTS, OEKO-TEX Standard 100',
    images: '/images/hero-mill.jpg'
  });

  useEffect(() => { loadProducts(); }, []);

  const loadProducts = () => {
    setLoading(true);
    api.getProducts()
      .then(res => setProducts(res.products || []))
      .catch(err => console.error('Error fetching supplier inventory:', err))
      .finally(() => setLoading(false));
  };

  const handleOpenAdd = () => {
    setEditingId(null);
    setForm({
      name: '', category: 'Cotton', description: '', price: 850, moq: 100, stock: 2500,
      gsm: 160, width: '150 cm (59")', weave: 'Plain Weave', fiberComposition: '100% Cotton',
      colors: 'White, Navy, Black', certifications: 'GOTS, OEKO-TEX Standard 100',
      images: '/images/hero-mill.jpg'
    });
    setShowModal(true);
  };

  const handleOpenEdit = (p) => {
    setEditingId(p.id);
    setForm({
      name: p.name, category: p.category, description: p.description || '', price: p.price,
      moq: p.moq, stock: p.stock, gsm: p.gsm, width: p.width, weave: p.weave,
      fiberComposition: p.fiberComposition, colors: (p.colors || []).join(', '),
      certifications: (p.certifications || []).join(', '), images: (p.images && p.images[0]) || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this fabric listing?')) return;
    try { await api.deleteProduct(id); loadProducts(); } catch (err) { alert(err.message); }
  };

  const handleToggleStock = async (p) => {
    try { await api.updateProduct(p.id, { inStock: !p.inStock, stock: p.inStock ? 0 : 2000 }); loadProducts(); } catch (err) { alert(err.message); }
  };

  const handleSubmitForm = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...form,
        colors: form.colors.split(',').map(c => c.trim()).filter(Boolean),
        certifications: form.certifications.split(',').map(c => c.trim()).filter(Boolean),
        images: [form.images]
      };
      if (editingId) { await api.updateProduct(editingId, payload); }
      else { await api.createProduct(payload); }
      setShowModal(false);
      loadProducts();
    } catch (err) { alert(err.message); }
  };

  const filteredProducts = products.filter(p =>
    (p.name || '').toLowerCase().includes(search.toLowerCase()) ||
    (p.category || '').toLowerCase().includes(search.toLowerCase())
  );

  const formFields = [
    { key: 'name', label: 'Fabric Name', type: 'text', span: 2 },
    { key: 'category', label: 'Category', type: 'select', options: ['Cotton','Silk','Linen','Wool & Suiting','Knits & Jersey','Sustainable','Technical'] },
    { key: 'price', label: 'Base Price (₹/m)', type: 'number', step: '1' },
    { key: 'moq', label: 'MOQ (meters)', type: 'number' },
    { key: 'stock', label: 'Stock (meters)', type: 'number' },
    { key: 'gsm', label: 'GSM', type: 'number' },
    { key: 'weave', label: 'Weave Construction', type: 'text' },
    { key: 'fiberComposition', label: 'Fiber Composition', type: 'text', span: 2 },
    { key: 'colors', label: 'Colors (comma sep.)', type: 'text', span: 2 },
    { key: 'certifications', label: 'Certifications (comma sep.)', type: 'text', span: 2 },
    { key: 'images', label: 'Photo Path or URL', type: 'text', span: 2 },
  ];

  return (
    <div className="relative min-h-screen bg-[#0c0a09] text-[#f5f5f4]">
      
      {/* ── CONTINUOUS BRIGHT BACKGROUND VIDEO FOR SUPPLIER INVENTORY ── */}
      <div className="fixed inset-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover scale-[1.25] brightness-[1.35] contrast-[1.1]"
        >
          <source src="/videos/Inventry.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-[#0c0a09]/25" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 min-h-screen">
        
        {/* Header */}
        <div className="bg-stone-950/90 border border-stone-800 p-6 sm:p-8 rounded-2xl backdrop-blur-md shadow-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-sans font-bold uppercase tracking-widest text-amber-400 block">
              MILL CATALOG MANAGEMENT
            </span>
            <h1 className="font-serif text-3xl font-bold text-[#f5f5f4] flex items-center gap-2 mt-1">
              <Layers className="w-6 h-6 text-amber-400" /> Fabric Qualities Inventory
            </h1>
          </div>
          <button
            onClick={handleOpenAdd}
            className="bg-amber-500 hover:bg-amber-400 text-[#0c0a09] font-sans font-bold text-xs py-3 px-5 rounded-xl shadow transition-colors flex items-center gap-2 shrink-0"
          >
            <Plus className="w-4 h-4" /> Add New Quality Listing
          </button>
        </div>

        {/* Catalog Table Card */}
        <div className="bg-stone-950/90 border border-stone-800 p-6 sm:p-8 rounded-2xl backdrop-blur-md shadow-2xl space-y-5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-stone-800 pb-4">
            <div className="relative max-w-xs w-full">
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search catalog by name or category..."
                className="w-full bg-stone-900 border border-stone-800 rounded-xl pl-9 pr-4 py-2 text-xs font-sans text-white focus:outline-none focus:border-amber-400"
              />
            </div>
            <span className="text-xs font-sans text-stone-400">
              Total Listed Qualities: <strong className="text-amber-400">{filteredProducts.length}</strong>
            </span>
          </div>

          {loading ? (
            <div className="h-64 shimmer rounded-xl" />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-stone-800 font-sans text-[10px] text-amber-400 uppercase tracking-widest">
                    <th className="p-3.5">Quality</th>
                    <th className="p-3.5">Category</th>
                    <th className="p-3.5">Base Price</th>
                    <th className="p-3.5">MOQ</th>
                    <th className="p-3.5">Stock</th>
                    <th className="p-3.5">GSM / Composition</th>
                    <th className="p-3.5">Stock Status</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-800/80">
                  {filteredProducts.map((p) => (
                    <tr key={p.id} className="hover:bg-stone-900/60 transition-colors font-sans">
                      <td className="p-3.5">
                        <div className="flex items-center gap-3">
                          <img
                            src={(p.images && p.images[0]) || '/images/hero-mill.jpg'}
                            alt={p.name}
                            className="w-10 h-10 rounded-lg object-cover border border-stone-800 shrink-0"
                          />
                          <div>
                            <span className="font-serif font-bold text-sm text-[#f5f5f4] block">{p.name}</span>
                            <span className="text-[10px] text-stone-400">{p.weave}</span>
                          </div>
                        </div>
                      </td>
                      <td className="p-3.5 text-stone-300 font-medium">{p.category}</td>
                      <td className="p-3.5 font-bold text-amber-400">₹{(p.price || 0).toLocaleString('en-IN')}/m</td>
                      <td className="p-3.5 text-stone-300">{p.moq}m</td>
                      <td className="p-3.5 font-semibold text-white">{p.stock}m</td>
                      <td className="p-3.5 text-stone-400 text-[11px]">{p.gsm} GSM • {p.fiberComposition}</td>
                      <td className="p-3.5">
                        <button
                          onClick={() => handleToggleStock(p)}
                          className={`px-2.5 py-1 border text-[10px] font-bold uppercase rounded-lg cursor-pointer transition-colors ${
                            p.inStock ? 'bg-amber-500/20 text-amber-300 border-amber-400/40' : 'bg-rose-950/60 text-rose-300 border-rose-800'
                          }`}
                        >
                          {p.inStock ? 'In Stock' : 'Out of Stock'}
                        </button>
                      </td>
                      <td className="p-3.5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => handleOpenEdit(p)} className="p-1.5 text-stone-400 hover:text-amber-400 transition-colors" title="Edit">
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDelete(p.id)} className="p-1.5 text-stone-500 hover:text-rose-400 transition-colors" title="Delete">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/80 backdrop-blur-sm">
            <div className="w-full max-w-2xl bg-stone-950 border border-stone-800 rounded-2xl overflow-hidden max-h-[90vh] flex flex-col shadow-2xl">
              
              <div className="p-5 border-b border-stone-800 flex items-center justify-between">
                <h3 className="font-serif font-bold text-lg text-[#f5f5f4]">
                  {editingId ? 'Edit Fabric Specification' : 'Add New Fabric Quality'}
                </h3>
                <button onClick={() => setShowModal(false)} className="text-stone-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmitForm} className="p-6 space-y-4 overflow-y-auto">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {formFields.map(field => (
                    <div key={field.key} className={field.span === 2 ? 'sm:col-span-2' : ''}>
                      <label className="block text-xs font-sans font-bold text-stone-300 mb-1.5">{field.label}</label>
                      {field.type === 'select' ? (
                        <select
                          value={form[field.key]}
                          onChange={(e) => setForm({ ...form, [field.key]: e.target.value })}
                          className="w-full bg-stone-900 border border-stone-800 rounded-xl px-4 py-2.5 text-xs font-sans text-white focus:outline-none focus:border-amber-400"
                        >
                          {field.options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                      ) : (
                        <input
                          type={field.type}
                          step={field.step}
                          required={['name','price','moq','stock','gsm'].includes(field.key)}
                          value={form[field.key]}
                          onChange={(e) => setForm({ ...form, [field.key]: field.type === 'number' ? Number(e.target.value) : e.target.value })}
                          className="w-full bg-stone-900 border border-stone-800 rounded-xl px-4 py-2.5 text-xs font-sans text-white focus:outline-none focus:border-amber-400"
                        />
                      )}
                    </div>
                  ))}
                </div>

                <div className="pt-4 border-t border-stone-800 flex justify-end gap-3">
                  <button type="button" onClick={() => setShowModal(false)} className="bg-stone-900 hover:bg-stone-800 border border-stone-700 text-stone-200 font-sans font-semibold text-xs py-2.5 px-4 rounded-xl">
                    Cancel
                  </button>
                  <button type="submit" className="bg-amber-500 hover:bg-amber-400 text-[#0c0a09] font-sans font-bold text-xs py-2.5 px-4 rounded-xl shadow">
                    {editingId ? 'Save Changes' : 'Create Quality Listing'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
