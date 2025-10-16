import React, { useState, useCallback } from 'react';
import './App.css';

// Inline icons matching provided CSS usage
const Calculator = ({ size = 24, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="4" y="2" width="16" height="20" rx="2"/>
    <line x1="8" y1="6" x2="16" y2="6"/>
    <line x1="16" y1="14" x2="16" y2="14.01"/>
    <line x1="12" y1="14" x2="12" y2="14.01"/>
    <line x1="8" y1="14" x2="8" y2="14.01"/>
    <line x1="16" y1="18" x2="16" y2="18.01"/>
    <line x1="12" y1="18" x2="12" y2="18.01"/>
    <line x1="8" y1="18" x2="8" y2="18.01"/>
  </svg>
);

const Wrench = ({ size = 24, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
  </svg>
);

const ArrowLeft = ({ size = 24, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <line x1="19" y1="12" x2="5" y2="12"/>
    <polyline points="12 19 5 12 12 5"/>
  </svg>
);

const AlertTriangle = ({ size = 24, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/>
    <line x1="12" y1="9" x2="12" y2="13"/>
    <line x1="12" y1="17" x2="12.01" y2="17"/>
  </svg>
);

const STATE_RATES = {
  AL: 28, AK: 45.85, AZ: 30.1, AR: 28, CA: 48.3, CO: 31.85, CT: 44.8, DE: 42, FL: 29.75, GA: 30.8,
  HI: 50.4, ID: 30.8, IL: 42.7, IN: 35.7, IA: 33.95, KS: 35.7, KY: 33.6, LA: 28.7, ME: 30.1, MD: 32.55,
  MA: 47.25, MI: 36.05, MN: 39.9, MS: 28, MO: 37.45, MT: 33.95, NE: 30.8, NV: 43.05, NH: 32.55, NJ: 46.9,
  NM: 30.8, NY: 42, NC: 28, ND: 32.2, OH: 35.7, OK: 29.05, OR: 37.8, PA: 40.25, RI: 43.75, SC: 28,
  SD: 28.7, TN: 28, TX: 27.3, UT: 28, VT: 29.75, VA: 29.75, WA: 38.5, WV: 39.2, WI: 39.55, WY: 31.5
};

const REHAB_LEVELS = {
  nearTurnkey: { label: 'Near Turnkey', percent: 0.10, desc: 'Minor touch-ups, very little work needed' },
  light: { label: 'Light Rehab', percent: 0.30, desc: 'Cosmetic updates, paint, flooring' },
  remodeling: { label: 'Remodeling', percent: 0.45, desc: 'Significant updates, partial renovation' },
  moderate: { label: 'Moderate Rehab', percent: 0.60, desc: 'Kitchen, bathroom, some mechanicals' },
  full: { label: 'Full Rehab', percent: 1.0, desc: 'Complete gut renovation, all systems' }
};

const GARAGE_COSTS = {
  minor: { label: 'Minor Repairs', cost: 3000, desc: 'Door, opener, small fixes' },
  major: { label: 'Major Repairs', cost: 7000, desc: 'Structural, electrical, significant work' },
  rebuild: { label: 'Full Rebuild', cost: 20000, desc: 'Complete reconstruction needed' }
};

export default function RapidMAO() {
  const [mode, setMode] = useState(null);
  const [screen, setScreen] = useState('mode');
  const [form, setForm] = useState({
    fire: false, foundation: false, state: '', sqft: '', beds: '', baths: '',
    arv: '', fee: '', quickRepair: '', rehabLevel: '',
    hasGarage: false, garageNeedsWork: false, garageRepairLevel: ''
  });
  const [errors, setErrors] = useState({});
  const [mao, setMao] = useState(0);

  const handleInput = useCallback((field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: false }));
  }, [errors]);

  const validate = useCallback(() => {
    const newErrors = {};
    if (!form.state) newErrors.state = 'Please select a state';
    if (mode === 'advanced' && !form.sqft) newErrors.sqft = 'Please enter square footage';
    if (!form.arv) newErrors.arv = 'Please enter ARV';
    if (mode === 'simple' && !form.quickRepair) newErrors.quickRepair = 'Please enter repair cost';
    if (mode === 'advanced' && !form.rehabLevel) newErrors.rehabLevel = 'Please select a rehab level';
    if (form.garageNeedsWork && !form.garageRepairLevel) newErrors.garageRepairLevel = 'Please select garage repair level';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [form, mode]);

  const calcRepairs = () => {
    let baseCost = 0;
    if (mode === 'simple') {
      baseCost = parseFloat(form.quickRepair) || 0;
    } else {
      const sqft = parseFloat(form.sqft) || 1500;
      const rate = STATE_RATES[form.state] || 35;
      const rehabPercent = REHAB_LEVELS[form.rehabLevel]?.percent || 0.60;
      baseCost = sqft * rate * rehabPercent;
    }
    if (form.garageNeedsWork && form.garageRepairLevel) {
      baseCost += GARAGE_COSTS[form.garageRepairLevel]?.cost || 0;
    }
    return baseCost;
  };

  const calculate = () => {
    if (!validate()) return;
    const arv = parseFloat(form.arv) || 0;
    const fee = parseFloat(form.fee) || 0;
    setMao((arv * 0.7) - calcRepairs() - fee);
    setScreen('result');
  };

  const reset = () => {
    setMode(null);
    setScreen('mode');
    setForm({
      fire: false, foundation: false, state: '', sqft: '', beds: '', baths: '',
      arv: '', fee: '', quickRepair: '', rehabLevel: '',
      hasGarage: false, garageNeedsWork: false, garageRepairLevel: ''
    });
    setErrors({});
  };

  if (screen === 'mode') {
    return (
      <div className="min-h-screen bg-amber-50 p-4 flex items-center justify-center">
        <div className="max-w-4xl w-full">
          <div className="text-center mb-8">
            <h1 className="text-6xl font-bold text-slate-800 mb-2">Rapid<span className="text-amber-600">MAO</span></h1>
            <p className="text-sm text-slate-500 italic">Powered by The Wholesalers Lounge</p>
            <p className="text-lg text-slate-600 mt-3">Calculate Your Maximum Allowable Offer in Seconds</p>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <button onClick={() => { setMode('simple'); setScreen('form'); }} className="p-8 bg-slate-800 border-4 border-slate-800 rounded-lg hover:border-amber-600 transition-all">
              <Calculator size={64} className="w-16 h-16 text-amber-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2 text-amber-50">Quick Mode</h2>
              <p className="text-amber-100">I know my repair costs</p>
            </button>
            <button onClick={() => { setMode('advanced'); setScreen('form'); }} className="p-8 bg-slate-800 border-4 border-slate-800 rounded-lg hover:border-amber-600 transition-all">
              <Wrench size={64} className="w-16 h-16 text-amber-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2 text-amber-50">Estimated Mode</h2>
              <p className="text-amber-100">Help me estimate repairs</p>
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (screen === 'form') {
    return (
      <div className="min-h-screen bg-amber-50 p-4">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <button onClick={reset} className="flex items-center gap-2 text-slate-800 hover:text-amber-600 font-semibold">
              <ArrowLeft size={20} /> Back
            </button>
            <div className="text-center">
              <h1 className="text-3xl font-bold text-slate-800">Rapid<span className="text-amber-600">MAO</span></h1>
              <p className="text-xs text-slate-500 italic">Powered by The Wholesalers Lounge</p>
            </div>
            <div className="w-20"></div>
          </div>

          <div className="space-y-6">
            <div className="p-4 bg-orange-100 border-2 border-orange-600 rounded-lg">
              <label className="flex items-center gap-2 mb-2">
                <input type="checkbox" checked={form.fire} onChange={(e) => handleInput('fire', e.target.checked)} />
                <span className="text-slate-800 font-medium">Fire damage?</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={form.foundation} onChange={(e) => handleInput('foundation', e.target.checked)} />
                <span className="text-slate-800 font-medium">Foundation issues?</span>
              </label>
            </div>

            {(form.fire || form.foundation) && (
              <div className="p-4 bg-red-100 border-4 border-red-600 rounded-lg flex gap-3">
                <AlertTriangle size={24} className="w-6 h-6 text-red-600 flex-shrink-0" />
                <div className="text-sm text-red-900">
                  <div className="font-bold mb-1">⚠️ CAUTION</div>
                  <p>Many fix-and-flip buyers avoid properties with fire damage or foundation issues. Communicate and disclose these to your buyer - they are your repeat business.</p>
                </div>
              </div>
            )}

            <div className="bg-slate-800 p-6 rounded-lg border-4 border-amber-600">
              <h2 className="text-2xl font-bold mb-4 text-amber-600">Property Details</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm mb-2 text-amber-50 font-semibold">State *</label>
                  <select value={form.state} onChange={(e) => handleInput('state', e.target.value)} className={`w-full px-4 py-3 bg-amber-50 border-2 ${errors.state ? 'border-red-500' : 'border-slate-800'} rounded-lg text-slate-800 font-medium outline-none`}>
                    <option value="">Select State</option>
                    {Object.keys(STATE_RATES).map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                  {errors.state && <p className="text-red-300 text-xs mt-1">{errors.state}</p>}
                </div>
                <div>
                  <label className="block text-sm mb-2 text-amber-50 font-semibold">Square Footage *</label>
                  <input type="number" value={form.sqft} onChange={(e) => handleInput('sqft', e.target.value)} placeholder="1500" className={`w-full px-4 py-3 bg-amber-50 border-2 ${errors.sqft ? 'border-red-500' : 'border-slate-800'} rounded-lg text-slate-800 font-medium outline-none`} />
                  {errors.sqft && <p className="text-red-300 text-xs mt-1">{errors.sqft}</p>}
                </div>
                <div>
                  <label className="block text-sm mb-2 text-amber-50 font-semibold">Bedrooms</label>
                  <input type="number" value={form.beds} onChange={(e) => handleInput('beds', e.target.value)} placeholder="3" className="w-full px-4 py-3 bg-amber-50 border-2 border-slate-800 rounded-lg text-slate-800 font-medium outline-none" />
                </div>
                <div>
                  <label className="block text-sm mb-2 text-amber-50 font-semibold">Bathrooms</label>
                  <input type="number" value={form.baths} onChange={(e) => handleInput('baths', e.target.value)} placeholder="2" className="w-full px-4 py-3 bg-amber-50 border-2 border-slate-800 rounded-lg text-slate-800 font-medium outline-none" />
                </div
