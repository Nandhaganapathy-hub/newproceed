import { useState, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Polyline, createIcon, createHubIcon, createVehicleIcon } from '../components/LeafletMap'
import { updateDashboardStats, addActivityLog } from '../firebaseService'

function StatCard({ icon, label, value, subtext, accent = false, onClick }) {
  return (
    <div 
      onClick={onClick}
      className={`rounded-xl p-5 transition-all duration-200 hover:shadow-lg hover:shadow-on-surface/4 group cursor-pointer active:scale-95 ${accent ? 'bg-gradient-to-br from-primary to-primary-container text-on-primary' : 'bg-surface-container-lowest ghost-border'}`}>
      <div className="flex items-start justify-between mb-3">
        <span className={`material-symbols-outlined text-2xl ${accent ? 'text-on-primary/70' : 'text-primary'}`}>{icon}</span>
        {accent && <span className="text-[0.625rem] bg-white/20 backdrop-blur-sm px-2 py-0.5 rounded-full font-medium">LIVE</span>}
      </div>
      <p className={`text-[0.6875rem] uppercase tracking-widest font-medium mb-1 ${accent ? 'text-on-primary/70' : 'text-on-surface-variant'}`}>{label}</p>
      <p className={`text-2xl font-bold tracking-tight ${accent ? 'text-on-primary' : 'text-on-surface'}`}>{value}</p>
      <p className={`text-xs mt-1 ${accent ? 'text-on-primary/60' : 'text-on-surface-variant'}`}>{subtext}</p>
    </div>
  )
}

function PredictionChart() {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  const predicted = [82, 78, 90, 85, 92, 70, 88]
  const actual = [80, 75, 88, 87, 90, 68, 85]
  const max = 100

  return (
    <div className="bg-surface-container-lowest rounded-xl p-6 ghost-border">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-base font-bold text-on-surface">Prediction Accuracy</h3>
          <p className="text-xs text-on-surface-variant mt-0.5">Last 7 Days Footfall Analysis</p>
        </div>
        <div className="flex gap-4 text-[0.6875rem]">
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-primary" />Predicted</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-secondary" />Actual</span>
        </div>
      </div>
      <div className="flex items-end gap-3 h-40">
        {days.map((day, i) => (
          <div key={day} className="flex-1 flex flex-col items-center gap-1">
            <div className="w-full flex gap-1 items-end h-32">
              <div className="flex-1 rounded-t-md bg-primary/20 relative transition-all duration-700 ease-out" style={{ height: `${(predicted[i] / max) * 100}%` }}>
                <div className="absolute inset-x-0 bottom-0 rounded-t-md bg-primary" style={{ height: `${(actual[i] / predicted[i]) * 100}%` }} />
              </div>
              <div className="flex-1 rounded-t-md bg-secondary transition-all duration-700 ease-out" style={{ height: `${(actual[i] / max) * 100}%`, opacity: 0.3 }} />
            </div>
            <span className="text-[0.625rem] text-on-surface-variant font-medium">{day}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function DishSurplus({ searchQuery = '' }) {
  const allDishes = [
    { name: 'Paneer Curry', surplus: 12, unit: 'kg', risk: 'low' },
    { name: 'Rice Biryani', surplus: 8, unit: 'kg', risk: 'medium' },
    { name: 'Dal Makhani', surplus: 5, unit: 'kg', risk: 'low' },
    { name: 'Fresh Salad', surplus: 18, unit: 'kg', risk: 'high' },
    { name: 'Butter Naan', surplus: 2, unit: 'kg', risk: 'low' },
  ]
  const dishes = allDishes.filter(d => d.name.toLowerCase().includes(searchQuery.toLowerCase()))
  const riskColors = { low: 'bg-primary/10 text-primary', medium: 'bg-secondary/10 text-secondary', high: 'bg-tertiary-container text-on-tertiary-container' }

  return (
    <div className="bg-surface-container-lowest rounded-xl p-6 ghost-border">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-base font-bold text-on-surface">Dish-Level Surplus</h3>
          <p className="text-xs text-on-surface-variant mt-0.5">Real-time dish estimates</p>
        </div>
        <span className="material-symbols-outlined text-on-surface-variant text-xl">restaurant</span>
      </div>
      <div className="space-y-3">
        {dishes.length === 0 ? (
          <p className="text-sm text-on-surface-variant">No dishes match "{searchQuery}"</p>
        ) : (
          dishes.map(d => (
            <div key={d.name} className="flex items-center justify-between py-2">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-surface-container-high flex items-center justify-center">
                  <span className="material-symbols-outlined text-sm text-on-surface-variant">lunch_dining</span>
                </div>
                <span className="text-sm font-medium text-on-surface">{d.name}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-bold text-on-surface">{d.surplus}{d.unit}</span>
                <span className={`text-[0.625rem] uppercase font-bold px-2 py-0.5 rounded-full ${riskColors[d.risk]}`}>{d.risk}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

function ProximityMap() {

  const hub = [40.72, -74.01]
  const nodes = [
    { pos: [40.735, -73.99], label: 'Hope Foundation', color: '#625B71' },
    { pos: [40.75, -73.98], label: 'Green Kitchen', color: '#6750A4' },
    { pos: [40.71, -73.96], label: 'Social Bread', color: '#7D5260' },
  ]

  return (
    <div className="bg-surface-container-lowest rounded-xl p-6 ghost-border">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-bold text-on-surface">NGO Proximity Map</h3>
          <p className="text-xs text-on-surface-variant mt-0.5">Live logistics & distribution network</p>
        </div>
        <span className="text-[0.625rem] bg-primary/10 text-primary font-bold px-2 py-1 rounded-full uppercase">Live</span>
      </div>
      <div className="rounded-xl overflow-hidden h-52">
        <MapContainer center={hub} zoom={13} style={{ height: '100%', width: '100%' }} scrollWheelZoom={false} zoomControl={false}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/">OSM</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker position={hub} icon={createHubIcon()}>
            <Popup><strong>Canteen HQ</strong><br/>Main distribution hub</Popup>
          </Marker>
          {nodes.map((n, i) => (
            <Marker key={i} position={n.pos} icon={createIcon(n.color)}>
              <Popup><strong>{n.label}</strong><br/>Partner NGO</Popup>
            </Marker>
          ))}
          <Marker position={[40.73, -73.995]} icon={createVehicleIcon()}>
            <Popup><strong>EV-Transit #402</strong><br/>In Transit</Popup>
          </Marker>
          {nodes.map((n, i) => (
            <Polyline key={`route-${i}`} positions={[hub, n.pos]} color="#6750A4" weight={2} opacity={0.4} dashArray="6 4" />
          ))}
        </MapContainer>
      </div>
    </div>
  )
}

function VerificationSteps() {
  const steps = [
    { label: 'Staff Confirmation', sublabel: 'Kitchen Surplus Logged', done: true },
    { label: 'Stage 3/4 Verification', sublabel: 'Quality Checked', done: true },
    { label: 'Pickup Ready State', sublabel: 'Stage 6 Readiness', done: false },
  ]

  return (
    <div className="bg-surface-container-lowest rounded-xl p-6 ghost-border">
      <h4 className="text-sm font-bold text-on-surface mb-4">Verification Pipeline</h4>
      <div className="space-y-4">
        {steps.map((s, i) => (
          <div key={i} className="flex items-start gap-3">
            <div className="flex flex-col items-center">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center ${s.done ? 'bg-primary' : 'bg-surface-container-high'}`}>
                <span className={`material-symbols-outlined text-sm ${s.done ? 'text-on-primary' : 'text-on-surface-variant'}`}>
                  {s.done ? 'check' : 'hourglass_top'}
                </span>
              </div>
              {i < steps.length - 1 && <div className={`w-0.5 h-6 mt-1 ${s.done ? 'bg-primary/30' : 'bg-surface-container-high'}`} />}
            </div>
            <div>
              <p className="text-sm font-medium text-on-surface">{s.label}</p>
              <p className="text-xs text-on-surface-variant">{s.sublabel}</p>
            </div>
          </div>
        ))}
      </div>
      <p className="text-xs text-on-surface-variant mt-4 leading-relaxed">Completion of these steps triggers automated notifications to NGO partners for pickup dispatch.</p>
    </div>
  )
}

function NGOAlerts({ searchQuery = '' }) {
  const allAlerts = [
    { name: 'Hope Foundation', status: 'Confirmed', time: '12m ago', color: 'bg-primary' },
    { name: 'Green Kitchen', status: 'No Response', time: 'Sent 45m ago', color: 'bg-tertiary' },
    { name: 'Social Bread', status: 'Confirmed', time: '2h ago', color: 'bg-primary' },
  ]
  const alerts = allAlerts.filter(a => a.name.toLowerCase().includes(searchQuery.toLowerCase()))

  return (
    <div className="bg-surface-container-lowest rounded-xl p-6 ghost-border">
      <h3 className="text-base font-bold text-on-surface mb-4">NGO Alerts</h3>
      <div className="space-y-3">
        {alerts.length === 0 ? (
          <p className="text-sm text-on-surface-variant">No alerts match "{searchQuery}"</p>
        ) : (
          alerts.map((a, i) => (
            <div key={i} className="flex items-center justify-between py-2">
              <div className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full ${a.color}`} />
                <div>
                  <p className="text-sm font-medium text-on-surface">{a.name}</p>
                  <p className="text-xs text-on-surface-variant">{a.status} • {a.time}</p>
                </div>
              </div>
              <span className="material-symbols-outlined text-on-surface-variant text-lg">chevron_right</span>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

import { useNavigate } from 'react-router-dom'

export default function Dashboard() {
  const [loaded, setLoaded] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [showNotifications, setShowNotifications] = useState(false)
  const [notifications, setNotifications] = useState([
    { id: 1, text: 'New NGO "Hope Foundation" joined the network.', time: '12m ago', icon: 'handshake' },
    { id: 2, text: 'ML Predictor: 45kg surplus estimated for dinner.', time: '1h ago', icon: 'auto_awesome' },
    { id: 3, text: 'Alert: 3 logistics routes optimized for efficiency.', time: '2h ago', icon: 'route' },
  ])
  const navigate = useNavigate()
  
  useEffect(() => {
    setLoaded(true)
    // 🔥 Push live dashboard stats to Firebase
    updateDashboardStats({
      predicted_footfall: 1450,
      estimated_surplus_kg: 45,
      ngo_matched: 3,
      meals_saved: 90,
      status: 'operational',
    }).catch(() => {})
  }, [])

  return (
    <div className={`p-8 max-w-[1400px] mx-auto transition-all duration-500 ${loaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'}`}>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-[2rem] font-extrabold text-on-surface tracking-tight">Operations Dashboard</h1>
          <p className="text-sm text-on-surface-variant mt-1">Live System Status</p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="flex items-center gap-2 bg-surface-container-lowest rounded-xl px-4 py-2.5 ghost-border shrink-0">
            <span className="material-symbols-outlined text-on-surface-variant text-lg">search</span>
            <input 
              type="text" 
              placeholder="Search dishes, NGOs..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent text-sm text-on-surface outline-none w-full sm:w-48 placeholder:text-on-surface-variant/50" 
            />
          </div>
          <div className="relative">
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className={`p-2.5 rounded-xl bg-surface-container-lowest ghost-border transition-colors z-10 ${showNotifications ? 'bg-surface-container-high' : 'hover:bg-surface-container-high'}`}
            >
              <span className="material-symbols-outlined text-on-surface-variant text-xl">notifications</span>
              {notifications.length > 0 && <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-tertiary border-2 border-surface-container-lowest rounded-full" />}
            </button>

            {/* Notification Dropdown */}
            {showNotifications && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)} />
                <div className="absolute right-0 mt-3 w-80 bg-surface-container-lowest rounded-2xl shadow-2xl z-50 ghost-border overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="p-4 border-b border-surface-container flex items-center justify-between bg-surface-container-low">
                    <h3 className="font-bold text-sm text-on-surface">Notifications</h3>
                    <button 
                      onClick={() => setNotifications([])}
                      className="text-[0.625rem] text-primary font-bold uppercase tracking-wider hover:opacity-70 transition-opacity"
                    >
                      Clear All
                    </button>
                  </div>
                  <div className="max-h-[320px] overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-8 text-center">
                        <span className="material-symbols-outlined text-on-surface-variant/30 text-4xl mb-2">notifications_off</span>
                        <p className="text-xs text-on-surface-variant font-medium">No new notifications</p>
                      </div>
                    ) : (
                      notifications.map(n => (
                        <div key={n.id} className="p-4 border-b border-surface-container/50 hover:bg-surface-container transition-colors cursor-pointer group">
                          <div className="flex gap-3">
                            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                              <span className="material-symbols-outlined text-primary text-sm">{n.icon}</span>
                            </div>
                            <div className="flex-1">
                              <p className="text-xs text-on-surface leading-normal group-hover:text-primary transition-colors">{n.text}</p>
                              <p className="text-[0.625rem] text-on-surface-variant mt-1 font-medium">{n.time}</p>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                  {notifications.length > 0 && (
                    <button 
                      onClick={() => navigate('/alerts')}
                      className="w-full p-3 text-center text-xs font-bold text-on-surface-variant hover:bg-surface-container transition-colors border-t border-surface-container/50"
                    >
                      View All Alerts
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <StatCard onClick={() => navigate('/predictor')} icon="group" label="Predicted Footfall" value="1,450" subtext="Students Expected Today" accent />
        <StatCard onClick={() => navigate('/predictor')} icon="scale" label="Estimated Surplus" value="45kg" subtext="±2.4kg Deviation Range" />
        <StatCard onClick={() => navigate('/ngos')} icon="handshake" label="NGO Matched" value="3 Partners" subtext="Pickup in 2h 15m" />
        <StatCard onClick={() => navigate('/logistics')} icon="restaurant" label="Meals Saved" value="90" subtext="+12% from Weekly Avg" />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-8">
        <PredictionChart />
        <DishSurplus searchQuery={searchQuery} />
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        <ProximityMap />
        <VerificationSteps />
        <NGOAlerts searchQuery={searchQuery} />
      </div>
    </div>
  )
}
