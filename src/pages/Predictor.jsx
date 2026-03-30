import { useState, useEffect } from 'react'
import { useToast } from '../ToastContext'

const API = 'http://127.0.0.1:8000/api'

function SuggestionBanner({ suggestions }) {
  const [dismissed, setDismissed] = useState(new Set())

  const visible = suggestions.filter((_, i) => !dismissed.has(i))
  if (visible.length === 0) return null

  return (
    <div className="space-y-3 mb-8">
      {suggestions.map((s, i) => {
        if (dismissed.has(i)) return null
        return (
          <div key={i} className={`bg-gradient-to-r ${s.severity === 'high' ? 'from-tertiary/10 via-tertiary/5' : 'from-primary/10 via-primary/5'} to-transparent rounded-xl p-5 ghost-border relative overflow-hidden`}>
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="flex flex-col sm:flex-row items-start gap-4 relative z-10">
              <div className={`w-10 h-10 rounded-xl ${s.severity === 'high' ? 'bg-tertiary/10' : 'bg-primary/10'} flex items-center justify-center flex-shrink-0`}>
                <span className={`material-symbols-outlined ${s.severity === 'high' ? 'text-tertiary' : 'text-primary'}`}>{s.icon}</span>
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-bold text-on-surface">{s.title}</h4>
                <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">{s.message}</p>
              </div>
              <button onClick={() => setDismissed(prev => new Set(prev).add(i))} className="absolute sm:static top-0 right-0 text-on-surface-variant hover:text-on-surface transition-colors">
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>
          </div>
        )
      })}
    </div>
  )
}

function WasteVarianceForecast({ forecast, loading }) {
  if (loading) {
    return (
      <div className="bg-surface-container-lowest rounded-xl p-6 ghost-border flex items-center justify-center h-72">
        <div className="text-center">
          <span className="material-symbols-outlined text-primary text-3xl animate-spin">progress_activity</span>
          <p className="text-sm text-on-surface-variant mt-2">Loading ML forecast...</p>
        </div>
      </div>
    )
  }

  const data = forecast || []
  const maxVal = Math.max(...data.map(d => Math.max(d.predicted_surplus, d.actual_surplus)), 0.001)
  const peakVariance = Math.max(...data.map(d => Math.abs(d.predicted_surplus - d.actual_surplus)), 0).toFixed(4)
  const avgAccuracy = data.length > 0
    ? (100 - (data.reduce((s, d) => s + Math.abs(d.predicted_surplus - d.actual_surplus) / Math.max(d.predicted_surplus, 0.001) * 100, 0) / data.length)).toFixed(1)
    : '—'

  return (
    <div className="bg-surface-container-lowest rounded-xl p-6 ghost-border">
      <div className="flex flex-col sm:flex-row items-start justify-between mb-6 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-on-surface">Waste Variance Forecast</h3>
            <span className="text-[0.5rem] bg-primary/10 text-primary font-bold px-1.5 py-0.5 rounded-full uppercase">ML Powered</span>
          </div>
          <p className="text-xs text-on-surface-variant mt-0.5">scikit-learn RandomForest prediction vs simulated actuals (7-day window)</p>
        </div>
        <div className="flex gap-4">
          <div className="text-center">
            <p className="text-[0.625rem] uppercase tracking-wider text-on-surface-variant">Peak Variance</p>
            <p className="text-lg font-bold text-on-surface">{peakVariance} TN</p>
          </div>
          <div className="text-center">
            <p className="text-[0.625rem] uppercase tracking-wider text-on-surface-variant">Accuracy</p>
            <p className="text-lg font-bold text-primary">{avgAccuracy}%</p>
          </div>
        </div>
      </div>

      {/* Chart legend */}
      <div className="flex gap-4 text-[0.6875rem] mb-4">
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-primary" />Predicted (ML)</span>
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-secondary" />Simulated Actual</span>
      </div>

      <div className="relative h-48">
        <svg className="w-full h-full" viewBox="0 0 700 200" preserveAspectRatio="none">
          {[0, 50, 100, 150, 200].map(y => (
            <line key={y} x1="0" y1={y} x2="700" y2={y} stroke="currentColor" strokeWidth="0.5" className="text-outline-variant/15" />
          ))}
          {data.length > 0 && (
            <>
              {/* Predicted area fill */}
              <path
                d={`M${data.map((d, i) => `${i * 100 + 50},${200 - (d.predicted_surplus / maxVal) * 180}`).join(' L')} L${(data.length - 1) * 100 + 50},200 L50,200 Z`}
                className="fill-primary/8"
              />
              {/* Predicted line */}
              <path
                d={`M${data.map((d, i) => `${i * 100 + 50},${200 - (d.predicted_surplus / maxVal) * 180}`).join(' L')}`}
                fill="none" stroke="currentColor" strokeWidth="2.5" className="text-primary" strokeLinejoin="round"
              />
              {/* Actual line */}
              <path
                d={`M${data.map((d, i) => `${i * 100 + 50},${200 - (d.actual_surplus / maxVal) * 180}`).join(' L')}`}
                fill="none" stroke="currentColor" strokeWidth="2.5" strokeDasharray="8 4" className="text-secondary" strokeLinejoin="round"
              />
              {/* Dots */}
              {data.map((d, i) => (
                <g key={i}>
                  <circle cx={i * 100 + 50} cy={200 - (d.predicted_surplus / maxVal) * 180} r="4" className="fill-primary" />
                  <circle cx={i * 100 + 50} cy={200 - (d.actual_surplus / maxVal) * 180} r="4" className="fill-secondary" />
                </g>
              ))}
            </>
          )}
        </svg>
        <div className="absolute bottom-0 inset-x-0 flex justify-around">
          {data.map(d => (
            <span key={d.date} className="text-[0.625rem] text-on-surface-variant font-medium">{d.day}</span>
          ))}
        </div>
      </div>

      {/* Footfall row */}
      {data.length > 0 && (
        <div className="mt-4 flex justify-around">
          {data.map(d => (
            <div key={d.date} className="text-center">
              <p className="text-[0.5rem] text-on-surface-variant uppercase">Footfall</p>
              <p className="text-[0.625rem] font-bold text-on-surface">{d.predicted_footfall}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function NeuralTuning({ prediction, onSensitivityChange, sensitivity, loading }) {
  const conf = prediction?.confidence ?? 0
  const recovery = prediction ? (prediction.predicted_surplus_kg / 1000).toFixed(2) : '—'
  const footfall = prediction?.predicted_footfall ?? 0
  const co2 = prediction ? (prediction.co2_impact_avoided_kg / 1000).toFixed(1) : '—'

  return (
    <div className="bg-surface-container-lowest rounded-xl p-6 ghost-border">
      <div className="flex items-center gap-2 mb-2">
        <h3 className="text-base font-bold text-on-surface">Neural Tuning</h3>
        {loading && <span className="material-symbols-outlined text-primary text-sm animate-spin">progress_activity</span>}
      </div>
      <p className="text-xs text-on-surface-variant mb-6 leading-relaxed">
        Adjust model sensitivity via the slider. Higher sensitivity increases precautionary redistribution thresholds. Predictions powered by <strong className="text-on-surface">scikit-learn RandomForest</strong>.
      </p>

      {/* Sensitivity Slider */}
      <div className="mb-6">
        <div className="flex justify-between text-[0.625rem] text-on-surface-variant uppercase tracking-wider mb-2">
          <span>Conservative</span>
          <span className="text-primary font-bold">{sensitivity}%</span>
          <span>Aggressive</span>
        </div>
        <div className="relative h-2 bg-surface-container-high rounded-full">
          <div className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary to-primary-container rounded-full transition-all" style={{ width: `${sensitivity}%` }} />
          <input
            type="range" min="0" max="100" value={sensitivity}
            onChange={e => onSensitivityChange(parseInt(e.target.value))}
            className="absolute inset-0 w-full opacity-0 cursor-pointer"
          />
          <div className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-surface-container-lowest rounded-full shadow-md border-2 border-primary transition-all" style={{ left: `calc(${sensitivity}% - 8px)` }} />
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 gap-4">
        {[
          { label: 'Confidence Score', value: `${conf.toFixed(1)}%`, icon: 'verified' },
          { label: 'Expected Recovery', value: `${recovery}TN`, icon: 'recycling' },
          { label: 'Predicted Footfall', value: footfall.toLocaleString(), icon: 'groups' },
          { label: 'CO₂ Impact Avoided', value: `${co2}T`, icon: 'eco' },
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

function RiskVariables({ risks, loading }) {
  if (loading) {
    return (
      <div className="bg-surface-container-lowest rounded-xl p-6 ghost-border">
        <h3 className="text-base font-bold text-on-surface mb-5">Risk Variables</h3>
        <div className="flex items-center justify-center py-8">
          <span className="material-symbols-outlined text-primary text-2xl animate-spin">progress_activity</span>
          <p className="text-sm text-on-surface-variant ml-2">Analyzing ML feature weights...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-surface-container-lowest rounded-xl p-6 ghost-border">
      <div className="flex items-center gap-2 mb-5">
        <h3 className="text-base font-bold text-on-surface">Risk Variables</h3>
        <span className="text-[0.5rem] bg-secondary/10 text-secondary font-bold px-1.5 py-0.5 rounded-full uppercase">Feature Importance</span>
      </div>
      <div className="space-y-4">
        {(risks || []).map(r => (
          <div key={r.name} className="group">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <span className={`material-symbols-outlined text-xl ${r.color}`}>{r.icon}</span>
                <div>
                  <p className="text-sm font-medium text-on-surface">{r.name}</p>
                  <p className="text-xs text-on-surface-variant">{r.description}</p>
                </div>
              </div>
              <div className="text-right">
                <span className={`text-sm font-bold ${r.impact > 30 ? 'text-tertiary' : 'text-on-surface'}`}>{r.impact}%</span>
                <p className="text-[0.5rem] text-on-surface-variant">wt: {r.ml_weight}%</p>
              </div>
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

function ModelInfoPanel({ modelInfo, onRetrain, retraining }) {
  return (
    <div className="bg-surface-container-lowest rounded-xl p-6 ghost-border">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h3 className="text-base font-bold text-on-surface">ML Model Status</h3>
          <span className={`text-[0.5rem] font-bold px-1.5 py-0.5 rounded-full uppercase ${modelInfo?.status === 'loaded' ? 'bg-primary/10 text-primary' : 'bg-tertiary/10 text-tertiary'}`}>
            {modelInfo?.status || 'unknown'}
          </span>
        </div>
        <button
          onClick={onRetrain}
          disabled={retraining}
          className="btn-primary-gradient text-on-primary px-4 py-2 rounded-xl text-xs font-semibold hover:shadow-lg hover:shadow-primary/20 transition-all flex items-center gap-1.5 disabled:opacity-50"
        >
          {retraining ? (
            <><span className="material-symbols-outlined text-sm animate-spin">progress_activity</span> Training...</>
          ) : (
            <><span className="material-symbols-outlined text-sm">model_training</span> Retrain Model</>
          )}
        </button>
      </div>

      {modelInfo?.footfall_model && (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-surface-container-low rounded-xl p-3">
              <p className="text-[0.625rem] uppercase text-on-surface-variant tracking-wider">Algorithm</p>
              <p className="text-sm font-semibold text-on-surface">{modelInfo.footfall_model.type}</p>
            </div>
            <div className="bg-surface-container-low rounded-xl p-3">
              <p className="text-[0.625rem] uppercase text-on-surface-variant tracking-wider">Trees</p>
              <p className="text-sm font-semibold text-on-surface">{modelInfo.footfall_model.n_estimators} estimators</p>
            </div>
          </div>

          {/* Feature Importance Bars */}
          <div>
            <p className="text-[0.625rem] uppercase text-on-surface-variant tracking-wider mb-2">Feature Importance (Footfall Model)</p>
            <div className="space-y-1.5">
              {Object.entries(modelInfo.footfall_model.feature_importance || {})
                .sort(([, a], [, b]) => b - a)
                .map(([feature, importance]) => (
                  <div key={feature} className="flex items-center gap-2">
                    <span className="text-[0.625rem] text-on-surface-variant w-32 truncate">{feature.replace(/_/g, ' ')}</span>
                    <div className="flex-1 h-1.5 bg-surface-container-high rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-primary to-primary-fixed rounded-full" style={{ width: `${importance * 100}%` }} />
                    </div>
                    <span className="text-[0.625rem] font-bold text-on-surface w-10 text-right">{(importance * 100).toFixed(1)}%</span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* Logistics sync integrated */}
      <div className="mt-5 space-y-3">
        <h4 className="text-sm font-bold text-on-surface">Logistics Synchronization</h4>
        <p className="text-xs text-on-surface-variant leading-relaxed">Fleet routing dynamically adjusted based on ML surplus predictions.</p>
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
    </div>
  )
}

export default function Predictor() {
  const [loaded, setLoaded] = useState(false)
  const { addToast } = useToast() || { addToast: () => {} }

  // ML state
  const [forecast, setForecast] = useState([])
  const [prediction, setPrediction] = useState(null)
  const [risks, setRisks] = useState([])
  const [suggestions, setSuggestions] = useState([])
  const [modelInfo, setModelInfo] = useState(null)
  const [sensitivity, setSensitivity] = useState(72)

  // Loading states
  const [forecastLoading, setForecastLoading] = useState(true)
  const [predictionLoading, setPredictionLoading] = useState(true)
  const [risksLoading, setRisksLoading] = useState(true)
  const [retraining, setRetraining] = useState(false)

  // Fetch all ML data on mount
  useEffect(() => {
    fetchForecast()
    fetchPrediction(72)
    fetchRisks()
    fetchSuggestions()
    fetchModelInfo()
  }, [])

  const fetchForecast = async () => {
    setForecastLoading(true)
    try {
      const res = await fetch(`${API}/ml/forecast/`)
      if (!res.ok) throw new Error()
      const data = await res.json()
      setForecast(data)
    } catch (e) {
      console.warn('Forecast API unavailable:', e)
    } finally {
      setForecastLoading(false)
      setLoaded(true)
    }
  }

  const fetchPrediction = async (sens) => {
    setPredictionLoading(true)
    try {
      const res = await fetch(`${API}/ml/predict/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sensitivity: sens,
          menu_variety_score: sens / 100,
          temperature: 28 + (sens - 50) * 0.1,
        })
      })
      if (!res.ok) throw new Error()
      const data = await res.json()
      setPrediction(data)
    } catch (e) {
      console.warn('Predict API unavailable:', e)
    } finally {
      setPredictionLoading(false)
    }
  }

  const fetchRisks = async () => {
    setRisksLoading(true)
    try {
      const res = await fetch(`${API}/ml/risks/`)
      if (!res.ok) throw new Error()
      const data = await res.json()
      setRisks(data)
    } catch (e) {
      console.warn('Risks API unavailable:', e)
    } finally {
      setRisksLoading(false)
    }
  }

  const fetchSuggestions = async () => {
    try {
      const res = await fetch(`${API}/ml/suggestions/`)
      if (!res.ok) throw new Error()
      const data = await res.json()
      setSuggestions(data)
    } catch (e) {
      console.warn('Suggestions API unavailable:', e)
    }
  }

  const fetchModelInfo = async () => {
    try {
      const res = await fetch(`${API}/ml/model-info/`)
      if (!res.ok) throw new Error()
      const data = await res.json()
      setModelInfo(data)
    } catch (e) {
      console.warn('Model info API unavailable:', e)
    }
  }

  // Sensitivity change triggers re-prediction
  const handleSensitivityChange = (val) => {
    setSensitivity(val)
  }

  // Debounced prediction on sensitivity change
  useEffect(() => {
    const timeout = setTimeout(() => {
      fetchPrediction(sensitivity)
    }, 300)
    return () => clearTimeout(timeout)
  }, [sensitivity])

  // Retrain model
  const handleRetrain = async () => {
    setRetraining(true)
    addToast('Retraining ML models with fresh data...', 'info')
    try {
      const res = await fetch(`${API}/ml/train/`, { method: 'POST' })
      if (!res.ok) throw new Error()
      const metrics = await res.json()
      addToast(
        `Model retrained! Footfall R²: ${metrics.footfall_r2}, Surplus MAE: ${metrics.surplus_mae}kg`,
        'success'
      )
      // Refresh everything
      fetchForecast()
      fetchPrediction(sensitivity)
      fetchRisks()
      fetchSuggestions()
      fetchModelInfo()
    } catch (e) {
      addToast('Failed to retrain models.', 'error')
    } finally {
      setRetraining(false)
    }
  }

  return (
    <div className={`p-8 max-w-[1400px] mx-auto transition-all duration-500 ${loaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <p className="text-[0.625rem] uppercase tracking-widest text-on-surface-variant font-medium">AI PREDICTOR</p>
            <span className="text-[0.5rem] bg-primary/10 text-primary font-bold px-1.5 py-0.5 rounded-full">scikit-learn + RandomForest</span>
          </div>
          <h1 className="text-[2rem] font-extrabold text-on-surface tracking-tight mt-1">Predictive Analytics</h1>
          <p className="text-xs text-on-surface-variant mt-0.5">Powered by Python, NumPy, Pandas & scikit-learn • Real-time ML inference</p>
        </div>
        <button
          onClick={() => {
            addToast('Generating ML report...', 'info')
            // Trigger forecast export
            const data = JSON.stringify({ forecast, prediction, risks, modelInfo }, null, 2)
            const blob = new Blob([data], { type: 'application/json' })
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url; a.download = `ml_report_${Date.now()}.json`
            document.body.appendChild(a); a.click(); document.body.removeChild(a)
            URL.revokeObjectURL(url)
            addToast('ML report exported!', 'success')
          }}
          className="btn-primary-gradient text-on-primary px-5 py-2.5 rounded-xl text-sm font-semibold transition-all hover:shadow-lg hover:shadow-primary/20 w-fit"
        >
          <span className="flex items-center gap-2">
            <span className="material-symbols-outlined text-lg">download</span>
            Export Report
          </span>
        </button>
      </div>

      <SuggestionBanner suggestions={suggestions} />

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-8">
        <div className="lg:col-span-2">
          <WasteVarianceForecast forecast={forecast} loading={forecastLoading} />
        </div>
        <NeuralTuning
          prediction={prediction}
          sensitivity={sensitivity}
          onSensitivityChange={handleSensitivityChange}
          loading={predictionLoading}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <RiskVariables risks={risks} loading={risksLoading} />
        <ModelInfoPanel modelInfo={modelInfo} onRetrain={handleRetrain} retraining={retraining} />
      </div>
    </div>
  )
}
