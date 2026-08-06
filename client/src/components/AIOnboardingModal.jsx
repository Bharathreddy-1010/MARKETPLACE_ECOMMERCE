import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../utils/api';
import { Sparkles, CheckCircle2, X, ArrowRight } from 'lucide-react';

export default function AIOnboardingModal({ isOpen, onClose }) {
  const { user, updateOnboarding } = useAuth();
  const role = user?.role || 'buyer';

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [aiAnalyzing, setAiAnalyzing] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    businessType: role === 'buyer' ? 'Luxury Fashion Brand' : 'Textile Manufacturer & Mill',
    industry: 'Apparel & High Fashion',
    categoriesOfInterest: ['Organic Cotton', 'Silk', 'Linen'],
    preferredFabricTypes: ['Woven', 'Satin', 'Jacquard'],
    typicalOrderQty: '500 - 2,000 meters',
    budgetRange: '₹1,00,000 - ₹5,00,000 / order',
    minOrderQty: 100,
    contactPhone: '+91 98765 43210',
    operatingHours: 'Mon-Fri 09:00 - 18:00 IST',
    notes: ''
  });

  const [naturalLanguageInput, setNaturalLanguageInput] = useState('');

  if (!isOpen || !user) return null;

  const handleAiProcess = async () => {
    if (!naturalLanguageInput.trim()) return;
    setAiAnalyzing(true);
    try {
      const res = await api.aiOnboarding(role, naturalLanguageInput);
      if (res.extractedData) {
        setFormData(prev => ({ ...prev, ...res.extractedData }));
      }
      setStep(2);
    } catch (err) {
      console.error('AI Onboarding analysis failed:', err);
    } finally {
      setAiAnalyzing(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateOnboarding(formData);
      onClose();
    } catch (err) {
      console.error('Onboarding submission failed:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0c0a09]/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-xl bg-stone-950 border border-stone-800 rounded-2xl shadow-2xl overflow-hidden">
        
        {/* Modal Header */}
        <div className="p-5 border-b border-stone-800 bg-stone-900/90 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold shadow-lg">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="text-base font-serif font-bold text-[#f5f5f4] flex items-center gap-2">
                AI Onboarding Assistant
                <span className="text-[9px] font-sans uppercase bg-amber-500/20 text-amber-300 border border-amber-400/40 px-2 py-0.5 rounded font-bold">
                  {role} profile
                </span>
              </h3>
              <p className="text-xs font-sans text-stone-400">Personalize your MarketPlace sourcing preferences</p>
            </div>
          </div>
          <button onClick={onClose} className="text-stone-400 hover:text-white p-1 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6">
          
          {step === 1 ? (
            /* Step 1: AI Conversational Prompt input */
            <div className="space-y-4 font-sans">
              <div className="p-4 rounded-xl bg-stone-900 border border-stone-800 text-xs text-stone-300 leading-relaxed">
                <p className="font-bold text-amber-400 mb-1 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  Tell Texti AI about your textile business in plain language:
                </p>
                <p className="text-stone-400">
                  {role === 'buyer'
                    ? 'For example: "We are a Mumbai luxury womenswear brand sourcing organic cotton, mulberry silk, and linen for summer dresses. Our order size is 1,000 meters."'
                    : 'For example: "We are an Ahmedabad cotton mill manufacturing GOTS certified poplin, twill, and slub denim with a monthly capacity of 100,000m and MOQ of 100m."'}
                </p>
              </div>

              <textarea
                value={naturalLanguageInput}
                onChange={(e) => setNaturalLanguageInput(e.target.value)}
                placeholder="Type or paste your business summary here..."
                rows={4}
                className="w-full bg-stone-900 border border-stone-800 rounded-xl p-3.5 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-400 transition-colors placeholder-stone-500"
              />

              <div className="flex items-center justify-between pt-2">
                <button
                  onClick={() => setStep(2)}
                  className="text-xs text-stone-400 hover:text-amber-300 underline"
                >
                  Skip to form preferences
                </button>
                <button
                  onClick={handleAiProcess}
                  disabled={!naturalLanguageInput.trim() || aiAnalyzing}
                  className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-[#0c0a09] text-xs font-bold rounded-xl shadow-lg flex items-center gap-2 transition-all"
                >
                  {aiAnalyzing ? (
                    <>
                      <Sparkles className="w-4 h-4 animate-spin" /> Processing with Texti AI...
                    </>
                  ) : (
                    <>
                      Analyze & Autofill Profile <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : (
            /* Step 2: Confirm / Refine Extracted Parameters */
            <form onSubmit={handleSubmit} className="space-y-4 font-sans text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                <div>
                  <label className="block font-bold text-stone-300 mb-1">Business Type</label>
                  <input
                    type="text"
                    value={formData.businessType}
                    onChange={(e) => setFormData({ ...formData, businessType: e.target.value })}
                    className="w-full bg-stone-900 border border-stone-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-300 mb-1">Industry Sector</label>
                  <input
                    type="text"
                    value={formData.industry}
                    onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                    className="w-full bg-stone-900 border border-stone-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                {role === 'buyer' ? (
                  <>
                    <div>
                      <label className="block font-bold text-stone-300 mb-1">Typical Order Quantity</label>
                      <input
                        type="text"
                        value={formData.typicalOrderQty}
                        onChange={(e) => setFormData({ ...formData, typicalOrderQty: e.target.value })}
                        className="w-full bg-stone-900 border border-stone-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-amber-400"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-stone-300 mb-1">Budget Range (₹)</label>
                      <input
                        type="text"
                        value={formData.budgetRange}
                        onChange={(e) => setFormData({ ...formData, budgetRange: e.target.value })}
                        className="w-full bg-stone-900 border border-stone-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-amber-400"
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <label className="block font-bold text-stone-300 mb-1">Minimum Order Qty (MOQ)</label>
                      <input
                        type="number"
                        value={formData.minOrderQty}
                        onChange={(e) => setFormData({ ...formData, minOrderQty: Number(e.target.value) })}
                        className="w-full bg-stone-900 border border-stone-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-amber-400"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-stone-300 mb-1">Contact Phone</label>
                      <input
                        type="text"
                        value={formData.contactPhone}
                        onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                        className="w-full bg-stone-900 border border-stone-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-amber-400"
                      />
                    </div>
                  </>
                )}
              </div>

              <div>
                <label className="block font-bold text-stone-300 mb-1.5">
                  {role === 'buyer' ? 'Preferred Fabric Categories' : 'Fabric Categories Offered'}
                </label>
                <div className="flex flex-wrap gap-2">
                  {['Cotton', 'Silk', 'Linen', 'Wool', 'Eco-Friendly', 'Technical', 'Velvet'].map((cat) => {
                    const isSelected = formData.categoriesOfInterest.includes(cat);
                    return (
                      <button
                        type="button"
                        key={cat}
                        onClick={() => {
                          const updated = isSelected
                            ? formData.categoriesOfInterest.filter(c => c !== cat)
                            : [...formData.categoriesOfInterest, cat];
                          setFormData({ ...formData, categoriesOfInterest: updated });
                        }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                          isSelected
                            ? 'bg-amber-500 text-[#0c0a09]'
                            : 'bg-stone-900 text-stone-400 hover:text-white border border-stone-800'
                        }`}
                      >
                        {cat}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block font-bold text-stone-300 mb-1">Additional Requirements / Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="GOTS organic certifications, eco-packaging, custom color dyeing..."
                  rows={2}
                  className="w-full bg-stone-900 border border-stone-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-stone-800">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-xs text-stone-400 hover:text-white"
                >
                  Back to AI Prompt
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-[#0c0a09] font-bold text-xs rounded-xl shadow-lg flex items-center gap-2 transition-all"
                >
                  <CheckCircle2 className="w-4 h-4" /> Save Onboarding Profile
                </button>
              </div>
            </form>
          )}

        </div>

      </div>
    </div>
  );
}
