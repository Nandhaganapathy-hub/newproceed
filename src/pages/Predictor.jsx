import { useState, useEffect } from 'react'

function SuggestionBanner() {
  const [dismissed, setDismissed] = useState(false)
  if (dismissed) return null

  return (
    <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent rounded-xl p-5 ghost-border relative overflow-hidden mb-8">
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2" />
      <div className="flex flex-col sm:flex-row items-start gap-4 relative z-10">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 relative sm:static">
          <span className="material-symbols-outlined text-primary">auto_awesome</span>
        </div>
        <div className="flex-1">
          <h4 className="text-sm font-bold text-on-surface">AI Suggestion: Inventory Optimization</h4>
          <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">
            Predicted waste surge in perishable proteins. We suggest <strong className="text-on-surface">reducing Meat-Base orders by 15%</strong> for the next 48h cycle.
          </p>
        </div>
        <button onClick={() => setDismissed(true)} className="absolute sm:static top-0 right-0 text-on-surface-variant hover:text-on-surface transition-colors">
          <span className="material-symbols-outlined text-lg">close</span>
        </button>
      </div>
    </div>
  )
}

function WasteVarianceForecast() {
  const data = [
    { day: 'Mon', predicted: 0.08, actual: 0.07 },
    { day: 'Tue', predicted: 0.06, actual: 0.05 },
    { day: 'Wed', predicted: 0.12, actual: 0.10 },
    { day: 'Thu', predicted: 0.09, actual: 0.11 },
    { day: 'Fri', predicted: 0.07, actual: 0.06 },
    { day: 'Sat', predicted: 0.04, actual: 0.03 },
    { day: 'Sun', predicted: 0.10, actual: 0.09 },
  ]
  const max = 0.14

  return (
    <div className="bg-surface-container-lowest rounded-xl p-6 ghost-border">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h3 className="text-base font-bold text-on-surface">Waste Variance Forecast</h3>
          <p className="text-xs text-on-surface-variant mt-0.5">AI prediction vs real-time waste data (7-day window)</p>
        </div>
        <div className="flex gap-4">
          <div className="text-center">
            <p className="text-[0.625rem] uppercase tracking-wider text-on-surface-variant">Peak Variance</p>
            <p className="text-lg font-bold text-on-surface">0.12 TN</p>
          </div>
          <div className="text-center">
            <p className="text-[0.625rem] uppercase tracking-wider text-on-surface-variant">Impact Rating</p>
            <p className="text-lg font-bold text-primary">Minimal</p>
          </div>
        </div>
      </div>
      <div className="relative h-48">
        <svg className="w-full h-full" viewBox="0 0 700 200" preserveAspectRatio="none">
          {/* Grid */}
          {[0, 50, 100, 150, 200].map(y => (
            <line key={y} x1="0" y1={y} x2="700" y2={y} stroke="currentColor" strokeWidth="0.5" className="text-outline-variant/15" />
          ))}
          {/* Predicted area */}
          <path
            d={`M${data.map((d, i) => `${i * 100 + 50},${200 - (d.predicted / max) * 200}`).join(' L')} L650,200 L50,200 Z`}
            className="fill-primary/8"
          />
          {/* Predicted line */}
          <path
            d={`M${data.map((d, i) => `${i * 100 + 50},${200 - (d.predicted / max) * 200}`).join(' L')}`}
            fill="none" stroke="currentColor" strokeWidth="2.5" className="text-primary" strokeLinejoin="round"
          />
          {/* Actual line */}
          <path
            d={`M${data.map((d, i) => `${i * 100 + 50},${200 - (d.actual / max) * 200}`).join(' L')}`}
            fill="none" stroke="currentColor" strokeWidth="2.5" strokeDasharray="8 4" className="text-secondary" strokeLinejoin="round"
          />
          {/* Dots */}
          {data.map((d, i) => (
            <g key={i}>
              <circle cx={i * 100 + 50} cy={200 - (d.predicted / max) * 200} r="4" className="fill-primary" />
              <circle cx={i * 100 + 50} cy={200 - (d.actual / max) * 200} r="4" className="fill-secondary" />
            </g>
          ))}
        </svg>
        <div className="absolute bottom-0 inset-x-0 flex justify-around">
          {data.map(d => (
            <span key={d.day} className="text-[0.625rem] text-on-surface-variant font-medium">{d.day}</span>
          ))}
        </div>
      </div>
    </div>
  )
}

function NeuralTuning() {
  const [sensitivity, setSensitivity] = useState(72);

  // Real-time interpolated projections based on sliding sensitivity
  const conf = Math.round(98 - (sensitivity / 100) * 18);
  const recovery = (1.0 + (sensitivity / 100) * 0.8).toFixed(1);
  const footfall = Math.round(2000 + (sensitivity / 100) * 500);

  return (
    <div className="bg-surface-container-lowest rounded-xl p-6 ghost-border">
      <h3 className="text-base font-bold text-on-surface mb-2">Neural Tuning</h3>
      <p className="text-xs text-on-surface-variant mb-6 leading-relaxed">
        Adjust model sensitivity based on current institutional volatility. Higher sensitivity increases precautionary redistribution.
      </p>

      {/* Sensitivity Slider */}
      <div className="mb-6">
        <div className="flex justify-between text-[0.625rem] text-on-surface-variant uppercase tracking-wider mb-2">
          <span>Conservative</span>
          <span>Aggressive</span>
        </div>
        <div className="relative h-2 bg-surface-container-high rounded-full">
          <div className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary to-primary-container rounded-full transition-all" style={{ width: `${sensitivity}%` }} />
          <input
            type="range" min="0" max="100" value={sensitivity}
            onChange={e => setSensitivity(e.target.value)}
            className="absolute inset-0 w-full opacity-0 cursor-pointer"
          />
          <div className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-surface-container-lowest rounded-full shadow-md border-2 border-primary transition-all" style={{ left: `calc(${sensitivity}% - 8px)` }} />
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 gap-4">
        {[
          { label: 'Confidence Score', value: `${conf}%`, icon: 'verified' },
          { label: 'Expected Recovery', value: `${recovery}TN`, icon: 'recycling' },
          { label: 'Predicted Footfall', value: footfall.toLocaleString(), icon: 'groups' },
          { label: 'CO2 Impact Avoided', value: '4.8T', icon: 'eco' },
        ].map(m => (
          <div key={m.label} className="bg-surface-container-low rounded-xl p-4 text-center">
            <span className="material-symbols-outlined text-primary text-xl mb-1">{m.icon}</span>
            <p className="text-xl font-bold text-on-surface">{m.value}</p>
            <p className="text-[0.625rem] text-on-surface-variant uppercase tracking-wider mt-0.5">{m.label}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

function RiskVariables() {
  const risks = [
    { name: 'Extreme Weather', desc: 'Supply route delay predicted', impact: 12, icon: 'thunderstorm', color: 'text-secondary' },
    { name: 'Campus Event', desc: 'Surplus buffet volumes', impact: 45, icon: 'event', color: 'text-tertiary' },
    { name: 'Supply Chain Lag', desc: 'Regional depot bottleneck', impact: 8, icon: 'inventory_2', color: 'text-primary' },
  ]

  return (
    <div className="bg-surface-container-lowest rounded-xl p-6 ghost-border">
      <h3 className="text-base font-bold text-on-surface mb-5">Risk Variables</h3>
      <div className="space-y-4">
        {risks.map(r => (
          <div key={r.name} className="group">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <span className={`material-symbols-outlined text-xl ${r.color}`}>{r.icon}</span>
                <div>
                  <p className="text-sm font-medium text-on-surface">{r.name}</p>
                  <p className="text-xs text-on-surface-variant">{r.desc}</p>
                </div>
              </div>
              <span className={`text-sm font-bold ${r.impact > 30 ? 'text-tertiary' : 'text-on-surface'}`}>{r.impact}%</span>
            </div>
            <div className="h-1.5 bg-surface-container-high rounded-full overflow-hidden">
              <div className={`h-full rounded-full transition-all duration-700 ${r.impact > 30 ? 'bg-gradient-to-r from-tertiary to-tertiary-fixed-dim' : 'bg-gradient-to-r from-primary to-primary-fixed'}`} style={{ width: `${r.impact}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function LogisticsSync() {
  return (
    <div className="bg-surface-container-lowest rounded-xl p-6 ghost-border">
      <h3 className="text-base font-bold text-on-surface mb-2">Logistics Synchronization</h3>
      <p className="text-xs text-on-surface-variant leading-relaxed mb-5">Fleet routing has been dynamically adjusted to prioritize redistribution from high-risk surplus zones.</p>
      <div className="space-y-3">
        {[
          { icon: 'route', label: '14 Optimizations Active', sublabel: 'Saving approx 42km fuel/day', accent: true },
          { icon: 'swap_calls', label: '3 Re-routed Couriers', sublabel: 'Redirecting to high-demand NGOs', accent: false },
        ].map((item, i) => (
          <div key={i} className={`flex items-center gap-3 p-3 rounded-xl ${item.accent ? 'bg-primary/5' : 'bg-surface-container-low'}`}>
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${item.accent ? 'bg-primary/10' : 'bg-surface-container-high'}`}>
              <span className={`material-symbols-outlined text-lg ${item.accent ? 'text-primary' : 'text-on-surface-variant'}`}>{item.icon}</span>
            </div>
            <div>
              <p className="text-sm font-medium text-on-surface">{item.label}</p>
              <p className="text-xs text-on-surface-variant">{item.sublabel}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 p-3 rounded-xl bg-tertiary-container/10 flex items-center gap-3">
        <span className="material-symbols-outlined text-tertiary">location_on</span>
        <div>
          <p className="text-sm font-medium text-on-surface">Zone A-42</p>
          <p className="text-xs text-tertiary font-semibold">Surplus: High</p>
        </div>
      </div>
    </div>
  )
}

export default function Predictor() {
  const [loaded, setLoaded] = useState(false)
  useEffect(() => { setLoaded(true) }, [])

  return (
    <div className={`p-8 max-w-[1400px] mx-auto transition-all duration-500 ${loaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <div>
          <p className="text-[0.625rem] uppercase tracking-widest text-on-surface-variant font-medium">AI PREDICTOR V4.2</p>
          <h1 className="text-[2rem] font-extrabold text-on-surface tracking-tight mt-1">Predictive Analytics</h1>
        </div>
        <button className="btn-primary-gradient text-on-primary px-5 py-2.5 rounded-xl text-sm font-semibold transition-all hover:shadow-lg hover:shadow-primary/20 w-fit">
          <span className="flex items-center gap-2">
            <span className="material-symbols-outlined text-lg">download</span>
            Export Report
          </span>
        </button>
      </div>

      <SuggestionBanner />

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-8">
        <div className="lg:col-span-2">
          <WasteVarianceForecast />
        </div>
        <NeuralTuning />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <RiskVariables />
        <LogisticsSync />
      </div>
    </div>
  )
}
