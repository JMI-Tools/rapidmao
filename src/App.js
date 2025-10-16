import React, { useState, useCallback } from 'react';
import { Calculator, Wrench, ArrowLeft, AlertTriangle } from 'lucide-react';
import './App.css';

const STATE_RATES = { AL: 28, AK: 45.85, AZ: 30.1, AR: 28, CA: 48.3, CO: 31.85, CT: 44.8, DE: 42, FL: 29.75, GA: 30.8, HI: 50.4, ID: 30.8, IL: 42.7, IN: 35.7, IA: 33.95, KS: 35.7, KY: 33.6, LA: 28.7, ME: 30.1, MD: 32.55, MA: 47.25, MI: 36.05, MN: 39.9, MS: 28, MO: 37.45, MT: 33.95, NE: 30.8, NV: 43.05, NH: 32.55, NJ: 46.9, NM: 30.8, NY: 42, NC: 28, ND: 32.2, OH: 35.7, OK: 29.05, OR: 37.8, PA: 40.25, RI: 43.75, SC: 28, SD: 28.7, TN: 28, TX: 27.3, UT: 28, VT: 29.75, VA: 29.75, WA: 38.5, WV: 39.2, WI: 39.55, WY: 31.5 };

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

  const reset = () => { setMode(null); setScreen('mode'); setForm({
    fire:false, foundation:false, state:'', sqft:'', beds:'', baths:'',
    arv:'', fee:'', quickRepair:'', rehabLevel:'', hasGarage:false, garageNeedsWork:false, garageRepairLevel:''
  }); setErrors({}); setMao(0); };

  const handleInput = (key, value) => setForm(prev => ({ ...prev, [key]: value }));

  const validate = useCallback(() => {
    const e = {};
    if (!form.state) e.state = 'Select a state';
    if (!form.arv) e.arv = 'Enter ARV';
    if (mode === 'quick' && !form.quickRepair) e.quickRepair = 'Enter quick repair cost';
    if (mode === 'estimate') {
      if (!form.sqft) e.sqft = 'Enter square feet';
      if (!form.rehabLevel) e.rehabLevel = 'Choose rehab level';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  }, [form, mode]);

  const compute = () => {
    if (!validate()) return;
    const baseRate = STATE_RATES[form.state] || 30;
    let repair = 0;
    if (mode === 'quick') {
      repair = Number(form.quickRepair || 0);
    } else {
      const sqft = Number(form.sqft || 0);
      const level = REHAB_LEVELS[form.rehabLevel]?.percent || 0;
      repair = sqft * baseRate * level;
    }
    if (form.hasGarage && form.garageNeedsWork) {
      const add = GARAGE_COSTS[form.garageRepairLevel]?.cost || 0;
      repair += add;
    }
    let arv = Number(form.arv || 0);
    let fee = Number(form.fee || 0);
    let penalty = 0;
    if (form.fire) penalty += 0.05 * arv;
    if (form.foundation) penalty += 0.05 * arv;
    const offer = arv * 0.7 - repair - fee - penalty;
    setMao(Math.max(0, Math.round(offer)));
    setScreen('result');
  };

  const Header = () => (
    <header className="app-header">
      <div className="container">
        <h1 className="title">RapidMAO</h1>
        <p className="subtitle">Fast property MAO calculator with Quick and Estimated modes</p>
      </div>
    </header>
  );

  const ModeCards = () => (
    <div className="container">
      <div className="mode-selection">
        <div className={`card hoverable mode-card ${mode==='quick'?'selected':''}`} onClick={()=>{setMode('quick'); setScreen('form');}}>
          <Calculator className="mode-icon" />
          <h2>Quick Mode</h2>
          <p className="muted">Directly enter repair costs and get an offer instantly.</p>
        </div>
        <div className={`card hoverable mode-card ${mode==='estimate'?'selected':''}`} onClick={()=>{setMode('estimate'); setScreen('form');}}>
          <Wrench className="mode-icon" />
          <h2>Estimated Mode</h2>
          <p className="muted">Estimate repairs from state rates, sqft, and rehab level.</p>
        </div>
      </div>
    </div>
  );

  const FormView = () => (
    <div className="container">
      <div className="card round">
        <div className="space-between mb-16">
          <div className="row"><button className="btn btn-secondary btn-icon" onClick={()=>setScreen('mode')}><ArrowLeft />Back</button><h2 className="card-title">{mode==='quick'?'Quick':'Estimated'} Inputs</h2></div>
          <div className="badge">Claude Styled</div>
        </div>

        <div className="form">
          <div className="form-row">
            <div className="form-group">
              <label>State</label>
              <select value={form.state} onChange={e=>handleInput('state', e.target.value)}>
                <option value="">Select state…</option>
                {Object.keys(STATE_RATES).map(k=> <option key={k} value={k}>{k}</option>)}
              </select>
              {errors.state && <small className="alert warning p-12 rounded mt-8">{errors.state}</small>}
            </div>
            <div className="form-group">
              <label>ARV ($)</label>
              <input type="number" value={form.arv} onChange={e=>handleInput('arv', e.target.value)} placeholder="After Repair Value" />
              {errors.arv && <small className="alert warning p-12 rounded mt-8">{errors.arv}</small>}
            </div>
          </div>

          {mode==='quick' ? (
            <div className="form-row">
              <div className="form-group">
                <label>Repair Cost ($)</label>
                <input type="number" value={form.quickRepair} onChange={e=>handleInput('quickRepair', e.target.value)} placeholder="e.g., 25000" />
                {errors.quickRepair && <small className="alert warning p-12 rounded mt-8">{errors.quickRepair}</small>}
              </div>
              <div className="form-group">
                <label>Fee ($)</label>
                <input type="number" value={form.fee} onChange={e=>handleInput('fee', e.target.value)} placeholder="Your fee or buffer" />
              </div>
            </div>
          ) : (
            <>
              <div className="form-row">
                <div className="form-group">
                  <label>Square Feet</label>
                  <input type="number" value={form.sqft} onChange={e=>handleInput('sqft', e.target.value)} placeholder="e.g., 1500" />
                  {errors.sqft && <small className="alert warning p-12 rounded mt-8">{errors.sqft}</small>}
                </div>
                <div className="form-group">
                  <label>Rehab Level</label>
                  <select value={form.rehabLevel} onChange={e=>handleInput('rehabLevel', e.target.value)}>
                    <option value="">Select level…</option>
                    {Object.entries(REHAB_LEVELS).map(([k,v])=> <option key={k} value={k}>{v.label}</option>)}
                  </select>
                  {errors.rehabLevel && <small className="alert warning p-12 rounded mt-8">{errors.rehabLevel}</small>}
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Beds</label>
                  <input type="number" value={form.beds} onChange={e=>handleInput('beds', e.target.value)} placeholder="e.g., 3" />
                </div>
                <div className="form-group">
                  <label>Baths</label>
                  <input type="number" value={form.baths} onChange={e=>handleInput('baths', e.target.value)} placeholder="e.g., 2" />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Fee ($)</label>
                  <input type="number" value={form.fee} onChange={e=>handleInput('fee', e.target.value)} placeholder="Your fee or buffer" />
                </div>
                <div className="form-group">
                  <label>Optional Notes</label>
                  <textarea value={form.notes||''} onChange={e=>handleInput('notes', e.target.value)} placeholder="Any extra context for this property" />
                </div>
              </div>
            </>
          )}

          <div className="card alt p-16 rounded mb-16">
            <div className="row wrap">
              <label className="row"><input type="checkbox" checked={form.fire} onChange={e=>handleInput('fire', e.target.checked)} /> Fire damage</label>
              <label className="row"><input type="checkbox" checked={form.foundation} onChange={e=>handleInput('foundation', e.target.checked)} /> Foundation issues</label>
              <label className="row"><input type="checkbox" checked={form.hasGarage} onChange={e=>handleInput('hasGarage', e.target.checked)} /> Has garage</label>
              {form.hasGarage && (
                <>
                  <label className="row"><input type="checkbox" checked={form.garageNeedsWork} onChange={e=>handleInput('garageNeedsWork', e.target.checked)} /> Garage needs work</label>
                  {form.garageNeedsWork && (
                    <select value={form.garageRepairLevel} onChange={e=>handleInput('garageRepairLevel', e.target.value)}>
                      <option value="">Select garage repair level…</option>
                      {Object.entries(GARAGE_COSTS).map(([k,v])=> <option key={k} value={k}>{v.label}</option>)}
                    </select>
                  )}
                </>
              )}
            </div>
          </div>

          <div className="space-between">
            <button className="btn btn-secondary" onClick={reset}><ArrowLeft /> Reset</button>
            <button className="btn btn-primary" onClick={compute}><Calculator /> Compute MAO</button>
          </div>
        </div>
      </div>
    </div>
  );

  const ResultView = () => (
    <div className="container">
      <div className="results-section">
        <div className="space-between mb-16">
          <h3>Maximum Allowable Offer</h3>
          <button className="btn btn-secondary btn-icon" onClick={()=>setScreen('form')}><ArrowLeft />Back</button>
        </div>
        <div className="card round center">
          <div className="mode-icon" style={{fontSize:'4rem'}}>
            <AlertTriangle />
          </div>
          <h2>${'{'}mao.toLocaleString(){'}'}</h2>
          <p className="muted">Computed using {mode==='quick'?'Quick':'Estimated'} mode with your inputs.</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="App">
      <Header />
      {screen==='mode' && <ModeCards />}
      {screen==='form' && <FormView />}
      {screen==='result' && <ResultView />}
    </div>
  );
}
