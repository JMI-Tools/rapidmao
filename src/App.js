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
    fire:false, foundation:false, state:'', sqft:'', beds:'', baths:'',    arv:'', fee:'', quickRepair:'', rehabLevel:'', hasGarage:false, garageNeedsWork:false, garageRepairLevel:''
  }); setErrors({}); setMao(0); };

  const handleInput = useCallback((key, value) => {
    setForm(prev => ({ ...prev, [key]: value }));
  }, []);

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
    const arv = parseFloat(form.arv) || 0;
    let rehabCost = 0;
    if (mode === 'quick') rehabCost = parseFloat(form.quickRepair) || 0;
    else {
      const sqft = parseFloat(form.sqft) || 0;
      const rehabPercent = REHAB_LEVELS[form.rehabLevel]?.percent || 0;
      rehabCost = sqft * baseRate * rehabPercent;
      if (form.garageNeedsWork && form.garageRepairLevel) rehabCost += (GARAGE_COSTS[form.garageRepairLevel]?.cost || 0);
    }
    setMao(arv * 0.70 - rehabCost);
    setScreen('result');
  };

  const Header = () => (
    <header className="header">
      <div className="logo">
        <Calculator size={24} />
        <h1>RapidMAO</h1>
      </div>
    </header>
  );

  const ModeCards = () => (
    <div className="cards">
      <button className={`card hover`} onClick={() => { setMode('quick'); setScreen('input'); }}>
        <div className="icon"><Calculator /></div>
        <h2>Quick Mode</h2>
        <h3>Already have repair estimate?</h3>
        <p>Use your existing repair cost estimate to quickly calculate MAO. Ideal for rapid decision-making on deals.</p>
      </button>
      <button className={`card hover`} onClick={() => { setMode('estimate'); setScreen('input'); }}>
        <div className="icon"><Wrench /></div>
        <h2>Estimate Mode</h2>
        <h3>Need a repair estimate?</h3>
        <p>Enter property details and get an estimated repair cost based on square footage, condition level, and location.</p>
      </button>
    </div>
  );

  const InputForm = () => (
    <>
      <div className="warning-block">
        {(form.fire || form.foundation) && (
          <div className="alert danger">
            <AlertTriangle size={20} />
            <div>
              <strong>Critical Issues Detected</strong>
              <p>Fire or foundation damage requires professional inspection and specialized repairs.</p>
            </div>
          </div>
        )}
      </div>

      <div className="input-grid two-column">
        <label>
          State
          <select value={form.state} onChange={e => handleInput('state', e.target.value)}>
            <option value="">Select State</option>
            {Object.keys(STATE_RATES).map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          {errors.state && <span className="error">{errors.state}</span>}
        </label>
        <label>
          ARV (After Repair Value)
          <input type="number" value={form.arv} onChange={e => handleInput('arv', e.target.value)} placeholder="$250000" />
          {errors.arv && <span className="error">{errors.arv}</span>}
        </label>
      </div>

      {mode === 'quick' ? (
        <label>
          Total Repair Cost
          <input type="number" value={form.quickRepair} onChange={e => handleInput('quickRepair', e.target.value)} placeholder="$30000" />
          {errors.quickRepair && <span className="error">{errors.quickRepair}</span>}
        </label>
      ) : (
        <>
          <div className="input-grid two-column">
            <label>
              Square Feet
              <input type="number" value={form.sqft} onChange={e => handleInput('sqft', e.target.value)} placeholder="1500" />
              {errors.sqft && <span className="error">{errors.sqft}</span>}
            </label>
            <label>
              Bedrooms
              <input type="number" value={form.beds} onChange={e => handleInput('beds', e.target.value)} placeholder="3" />
            </label>
          </div>

          <div className="input-grid two-column">
            <label>
              Bathrooms
              <input type="number" step="0.5" value={form.baths} onChange={e => handleInput('baths', e.target.value)} placeholder="2" />
            </label>
            <label>
              Assignment Fee
              <input type="number" value={form.fee} onChange={e => handleInput('fee', e.target.value)} placeholder="10000" />
            </label>
          </div>

          <div className="rehab-options">
            <label>Rehab Level</label>
            <div className="radio-grid">
              {Object.entries(REHAB_LEVELS).map(([k, v]) => (
                <label key={k} className="radio-option">
                  <input type="radio" name="rehabLevel" checked={form.rehabLevel === k} onChange={() => handleInput('rehabLevel', k)} />
                  <div className="radio-label">
                    <span className="level-name">{v.label}</span>
                    <span className="level-desc">{v.desc}</span>
                  </div>
                </label>
              ))}
            </div>
            {errors.rehabLevel && <span className="error">{errors.rehabLevel}</span>}
          </div>

          <div className="checkbox-group">
            <label className="checkbox">
              <input type="checkbox" checked={form.fire} onChange={e => handleInput('fire', e.target.checked)} />
              <span>Fire Damage</span>
            </label>
            <label className="checkbox">
              <input type="checkbox" checked={form.foundation} onChange={e => handleInput('foundation', e.target.checked)} />
              <span>Foundation Issues</span>
            </label>
            <label className="checkbox">
              <input type="checkbox" checked={form.hasGarage} onChange={e => { handleInput('hasGarage', e.target.checked); if (!e.target.checked) { handleInput('garageNeedsWork', false); handleInput('garageRepairLevel', ''); } }} />
              <span>Has Garage</span>
            </label>
            {form.hasGarage && (
              <label className="checkbox sub-option">
                <input type="checkbox" checked={form.garageNeedsWork} onChange={e => { handleInput('garageNeedsWork', e.target.checked); if (!e.target.checked) handleInput('garageRepairLevel', ''); }} />
                <span>Garage Needs Work</span>
              </label>
            )}
          </div>

          {form.garageNeedsWork && (
            <div className="garage-options">
              <label>Garage Repair Level</label>
              <div className="radio-grid">
                {Object.entries(GARAGE_COSTS).map(([k, v]) => (
                  <label key={k} className="radio-option">
                    <input type="radio" name="garageRepairLevel" checked={form.garageRepairLevel === k} onChange={() => handleInput('garageRepairLevel', k)} />
                    <div className="radio-label">
                      <span className="level-name">{v.label} (${v.cost.toLocaleString()})</span>
                      <span className="level-desc">{v.desc}</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      <button className="btn primary" onClick={compute}>Calculate MAO</button>
      <button className="btn secondary" onClick={reset}><ArrowLeft size={16} /> Start Over</button>
    </>
  );

  const ResultScreen = () => (
    <div className="result-container">
      <div className="mao-display">
        <h2>Maximum Allowable Offer</h2>
        <div className="mao-value">${mao.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</div>
        <p className="tip">This is the maximum you should offer to maintain a 30% profit margin</p>
      </div>
      <div className="action-buttons">
        <button className="btn primary" onClick={() => setScreen('input')}>Adjust Values</button>
        <button className="btn secondary" onClick={reset}><ArrowLeft size={16} /> New Calculation</button>
      </div>
    </div>
  );

  return (
    <div className="container">
      <Header />
      {screen === 'mode' && <ModeCards />}
      {screen === 'input' && <div className="form-container"><InputForm /></div>}
      {screen === 'result' && <ResultScreen />}
    </div>
  );
}
