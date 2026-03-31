import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useToast } from '../ToastContext'
import { API_BASE_URL } from '../api/config'
import { MapContainer, TileLayer, Marker, Popup, Polyline, createIcon, createHubIcon, createVehicleIcon } from '../components/LeafletMap'

function FleetStat({ value, label, icon, accent, onClick }) {
  return (
    <div onClick={onClick} className={`rounded-xl p-5 cursor-pointer active:scale-95 transition-all duration-200 hover:shadow-lg hover:shadow-on-surface/4 ${accent ? 'bg-gradient-to-br from-primary to-primary-container' : 'bg-surface-container-lowest ghost-border'}`}>
      <span className={`material-symbols-outlined text-xl mb-2 ${accent ? 'text-on-primary/70' : 'text-primary'}`}>{icon}</span>
      <p className={`text-2xl font-bold ${accent ? 'text-on-primary' : 'text-on-surface'}`}>{value}</p>
      <p className={`text-[0.625rem] uppercase tracking-wider mt-0.5 ${accent ? 'text-on-primary/60' : 'text-on-surface-variant'}`}>{label}</p>
    </div>
  )
}

function DeliveryCard({ name, items, weight, status, eta, onStatusChange }) {
  const statusConfig = {
    'In Transit': { color: 'bg-secondary/10 text-secondary', icon: 'local_shipping' },
    'Loading': { color: 'bg-tertiary-fixed text-tertiary', icon: 'inventory' },
    'Queued': { color: 'bg-surface-container-high text-on-surface-variant', icon: 'schedule' },
    'Delivered': { color: 'bg-primary/10 text-primary', icon: 'check_circle' },
  }
  const cfg = statusConfig[status] || statusConfig['Queued']

  return (
    <div className="bg-surface-container-lowest rounded-xl p-4 ghost-border hover:shadow-md hover:shadow-on-surface/4 transition-all duration-200 group relative overflow-hidden">
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary opacity-0 group-hover:opacity-100 transition-opacity rounded-r-full" />
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-surface-container-high flex items-center justify-center">
            <span className="material-symbols-outlined text-on-surface-variant">{cfg.icon}</span>
          </div>
          <div>
            <h4 className="text-sm font-bold text-on-surface">{name}</h4>
            <p className="text-xs text-on-surface-variant">{items} • {weight}</p>
          </div>
        </div>
        <div className="text-right flex items-center gap-2">
          <button
            onClick={() => onStatusChange?.(name)}
            className={`text-[0.625rem] uppercase font-bold px-2 py-0.5 rounded-full ${cfg.color} hover:opacity-80 transition-opacity`}
            title="Click to advance status"
          >
            {status}
          </button>
          {eta && <p className="text-[0.625rem] text-on-surface-variant">ETA: {eta}</p>}
        </div>
      </div>
    </div>
  )
}

function DriverCard({ name, vehicle, status, avatar, onToggle }) {
  const statusColor = status === 'Active' ? 'bg-primary' : status === 'Idle' ? 'bg-secondary' : 'bg-outline-variant'

  return (
    <div
      onClick={onToggle}
      className="bg-surface-container-lowest rounded-xl p-4 ghost-border flex items-center gap-4 cursor-pointer hover:shadow-md hover:shadow-on-surface/4 transition-all active:scale-[0.98]"
    >
      <div className="w-11 h-11 rounded-full bg-gradient-to-br from-primary/10 to-primary-fixed/20 flex items-center justify-center text-sm font-bold text-primary flex-shrink-0">
        {avatar}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-on-surface truncate">{name}</p>
        <p className="text-xs text-on-surface-variant">{vehicle}</p>
      </div>
      <div className="flex items-center gap-2">
        <span className={`w-2 h-2 rounded-full ${statusColor}`} />
        <span className="text-xs text-on-surface-variant">{status}</span>
      </div>
    </div>
  )
}

// New Dispatch Modal
function NewDispatchModal({ onClose, onSubmit }) {
  const [form, setForm] = useState({ name: '', items: '', weight: '' })

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]">
      <div className="bg-surface-container-lowest rounded-2xl p-6 w-full max-w-md mx-4 shadow-2xl">
        <div className="flex items-center gap-3 mb-5">
          <span className="material-symbols-outlined text-primary text-xl">add_circle</span>
          <h3 className="text-base font-bold text-on-surface">New Dispatch</h3>
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-[0.6875rem] uppercase tracking-wider text-on-surface-variant font-medium">Destination</label>
            <input
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. Green Leaf Kitchen"
              className="mt-1 w-full bg-surface-container-low rounded-xl px-4 py-2.5 text-sm text-on-surface outline-none border-b-2 border-transparent focus:border-primary transition-all placeholder:text-on-surface-variant/40"
            />
          </div>
          <div>
            <label className="text-[0.6875rem] uppercase tracking-wider text-on-surface-variant font-medium">Items</label>
            <input
              value={form.items}
              onChange={e => setForm({ ...form, items: e.target.value })}
              placeholder="e.g. Fresh Produce"
              className="mt-1 w-full bg-surface-container-low rounded-xl px-4 py-2.5 text-sm text-on-surface outline-none border-b-2 border-transparent focus:border-primary transition-all placeholder:text-on-surface-variant/40"
            />
          </div>
          <div>
            <label className="text-[0.6875rem] uppercase tracking-wider text-on-surface-variant font-medium">Weight</label>
            <input
              value={form.weight}
              onChange={e => setForm({ ...form, weight: e.target.value })}
              placeholder="e.g. 30kg"
              className="mt-1 w-full bg-surface-container-low rounded-xl px-4 py-2.5 text-sm text-on-surface outline-none border-b-2 border-transparent focus:border-primary transition-all placeholder:text-on-surface-variant/40"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button onClick={onClose} className="px-4 py-2 rounded-xl text-sm font-medium text-on-surface-variant hover:bg-surface-container-high transition-colors">
            Cancel
          </button>
          <button
            onClick={() => { if (form.name && form.items && form.weight) onSubmit(form) }}
            className="btn-primary-gradient text-on-primary px-5 py-2 rounded-xl text-sm font-semibold hover:shadow-lg hover:shadow-primary/20 transition-all"
          >
            Create Dispatch
          </button>
        </div>
      </div>
    </div>
  )
}

// Full Map Modal
function FullMapModal({ onClose, routeStops }) {

  const depot = [40.72, -74.01]
  const stops = [
    { pos: [40.735, -73.99], label: 'Community Kitchen' },
    { pos: [40.75, -73.98], label: 'Hope Shelter' },
    { pos: [40.71, -73.96], label: 'St. Jude' },
    { pos: [40.74, -74.02], label: 'Green Leaf' },
  ]
  const routePath = [depot, ...stops.map(s => s.pos)]

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]">
      <div className="bg-surface-container-lowest rounded-2xl p-6 w-full max-w-3xl mx-4 shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-primary text-xl">map</span>
            <h3 className="text-base font-bold text-on-surface">Full Route Map</h3>
          </div>
          <button onClick={onClose} className="text-on-surface-variant hover:text-on-surface transition-colors">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        <div className="rounded-xl overflow-hidden h-80">
          <MapContainer center={depot} zoom={13} style={{ height: '100%', width: '100%' }} scrollWheelZoom={true}>
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/">OSM</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={depot} icon={createHubIcon()}>
              <Popup><strong>Depot</strong><br/>Fleet base station</Popup>
            </Marker>
            {stops.map((s, i) => (
              <Marker key={i} position={s.pos} icon={createIcon('#625B71')}>
                <Popup><strong>{s.label}</strong><br/>Drop-off point #{i + 1}</Popup>
              </Marker>
            ))}
            <Marker position={[40.73, -73.995]} icon={createVehicleIcon()}>
              <Popup><strong>EV-Transit #402</strong><br/>In Transit</Popup>
            </Marker>
            <Polyline positions={routePath} color="#6750A4" weight={3} opacity={0.7} />
          </MapContainer>
        </div>
        <div className="flex gap-4 mt-4 text-xs text-on-surface-variant">
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-primary" />Depot</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-secondary" />Drop-off</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 bg-primary/60" />Route</span>
        </div>
      </div>
    </div>
  )
}

function InlineRouteMap() {

  const depot = [40.72, -74.01]
  const stops = [
    { pos: [40.735, -73.99], label: 'Community Kitchen' },
    { pos: [40.75, -73.98], label: 'Hope Shelter' },
    { pos: [40.71, -73.96], label: 'St. Jude' },
  ]

  return (
    <MapContainer center={depot} zoom={13} style={{ height: '100%', width: '100%' }} scrollWheelZoom={false} zoomControl={false}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/">OSM</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={depot} icon={createHubIcon()}>
        <Popup><strong>Depot</strong></Popup>
      </Marker>
      {stops.map((s, i) => (
        <Marker key={i} position={s.pos} icon={createIcon('#625B71')}>
          <Popup><strong>{s.label}</strong></Popup>
        </Marker>
      ))}
      <Marker position={[40.73, -73.995]} icon={createVehicleIcon()}>
        <Popup><strong>EV-Transit #402</strong></Popup>
      </Marker>
      <Polyline positions={[depot, ...stops.map(s => s.pos)]} color="#6750A4" weight={2.5} opacity={0.6} />
    </MapContainer>
  )
}

export default function Logistics() {
  const [loaded, setLoaded] = useState(false)
  const { addToast } = useToast() || { addToast: () => {} }
  const navigate = useNavigate()
  const [savedKm, setSavedKm] = useState(0)
  const [showDispatchModal, setShowDispatchModal] = useState(false)
  const [showFullMap, setShowFullMap] = useState(false)
  const [fleetHeld, setFleetHeld] = useState(false)

  const [deliveries, setDeliveries] = useState([])
  const [routeStops, setRouteStops] = useState([])

  useEffect(() => {
    const fetchData = async () => {
      try {
        let [dRes, rRes] = await Promise.all([
          fetch('http://127.0.0.1:8000/api/deliveries/'),
          fetch('http://127.0.0.1:8000/api/routes/')
        ]);
        
        let dData = await dRes.json();
        let rData = await rRes.json();

        if (dData.length === 0) {
          const mockDel = [
            { name: 'Community Kitchen', items: 'Fresh Produce', weight: '45kg', status: 'In Transit', eta: '25min' },
            { name: 'Hope Shelter', items: 'Baked Goods', weight: '12kg', status: 'Loading', eta: '' },
            { name: 'St. Jude Outreach', items: 'Perishables', weight: '28kg', status: 'Queued', eta: '' }
          ];
          for (let m of mockDel) await fetch('http://127.0.0.1:8000/api/deliveries/', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(m) });
          dData = await (await fetch('http://127.0.0.1:8000/api/deliveries/')).json();
        }

        if (rData.length === 0) {
          const mockRoutes = [
            { stop_id: 'depot', label: 'Depot', is_main: true, lat: 0, lng: 0 },
            { stop_id: 'd1', label: 'Community Kitchen', is_main: false, lat: 2, lng: 5 },
            { stop_id: 'd2', label: 'Hope Shelter', is_main: false, lat: 8, lng: 1 },
            { stop_id: 'd3', label: 'St. Jude', is_main: false, lat: 5, lng: 8 }
          ];
          for (let m of mockRoutes) await fetch('http://127.0.0.1:8000/api/routes/', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(m) });
          rData = await (await fetch('http://127.0.0.1:8000/api/routes/')).json();
        }

        const mappedRoutes = rData.map(r => ({ ...r, id: r.stop_id, main: r.is_main }));
        
        setDeliveries(dData);
        setRouteStops(mappedRoutes);
      } catch (e) {
        console.warn('Backend unavailable.');
      } finally {
        setLoaded(true);
      }
    };
    fetchData();
  }, [])

  const optimizeRoute = () => {
    let unvisited = routeStops.filter(s => !s.main);
    let current = routeStops.find(s => s.main) || routeStops[0];
    let optimized = [current];
    let distance = 0;
    
    let origDistance = 0;
    for (let i = 0; i < routeStops.length - 1; i++) {
       origDistance += Math.sqrt(Math.pow(routeStops[i+1].lat - routeStops[i].lat, 2) + Math.pow(routeStops[i+1].lng - routeStops[i].lng, 2));
    }

    while (unvisited.length > 0) {
      let nearest = unvisited[0];
      let minDist = Infinity;
      unvisited.forEach(u => {
        let d = Math.sqrt(Math.pow(u.lat - current.lat, 2) + Math.pow(u.lng - current.lng, 2));
        if (d < minDist) { minDist = d; nearest = u; }
      });
      distance += minDist;
      optimized.push(nearest);
      current = nearest;
      unvisited = unvisited.filter(u => u.id !== nearest.id);
    }
    
    const saved = Math.max(0, (origDistance - distance) * 2.5).toFixed(1);
    setRouteStops(optimized);
    setSavedKm(saved);
    addToast?.(`Route optimized! Saved ${saved} km.`, 'success');
  };

  // Advance delivery status: Queued → Loading → In Transit → Delivered
  const advanceDeliveryStatus = (deliveryName) => {
    const flow = ['Queued', 'Loading', 'In Transit', 'Delivered']
    setDeliveries(prev => prev.map(d => {
      if (d.name !== deliveryName) return d
      const currentIdx = flow.indexOf(d.status)
      if (currentIdx < flow.length - 1) {
        const nextStatus = flow[currentIdx + 1]
        const eta = nextStatus === 'In Transit' ? `${Math.floor(Math.random() * 30 + 10)}min` : ''
        addToast(`${deliveryName}: ${d.status} → ${nextStatus}`, 'success')
        return { ...d, status: nextStatus, eta }
      }
      addToast(`${deliveryName} has already been delivered!`, 'info')
      return d
    }))
  }

  // Add new dispatch
  const handleNewDispatch = (form) => {
    const newDelivery = { ...form, status: 'Queued', eta: '' }
    
    // POST to backend
    fetch('http://127.0.0.1:8000/api/deliveries/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newDelivery)
    }).catch(() => {})

    setDeliveries(prev => [...prev, newDelivery])
    setShowDispatchModal(false)
    addToast(`New dispatch to ${form.name} created!`, 'success')
  }

  // Hold/Resume fleet
  const toggleFleetHold = () => {
    setFleetHeld(!fleetHeld)
    addToast(fleetHeld ? 'Fleet operations resumed.' : 'Fleet operations paused. All vehicles holding position.', fleetHeld ? 'success' : 'warning')
  }

  const [drivers, setDrivers] = useState([
    { name: 'Jordan D.', vehicle: 'EV-Transit #402', status: 'Active', avatar: 'JD' },
    { name: 'Sarah M.', vehicle: 'EV-Transit #118', status: 'Active', avatar: 'SM' },
    { name: 'Ray L.', vehicle: 'EV-Transit #309', status: 'Idle', avatar: 'RL' },
    { name: 'Vehicle 501', vehicle: 'EV-Transit #501', status: 'Offline', avatar: 'V5' },
  ])

  const toggleDriverStatus = (driverName) => {
    const cycle = { 'Active': 'Idle', 'Idle': 'Active', 'Offline': 'Active' }
    setDrivers(prev => prev.map(d => {
      if (d.name !== driverName) return d
      const next = cycle[d.status] || 'Active'
      addToast(`${d.name}: ${d.status} → ${next}`, 'info')
      return { ...d, status: next }
    }))
  }

  const activeCount = deliveries.filter(d => d.status !== 'Delivered').length

  return (
    <div className={`p-8 max-w-[1400px] mx-auto transition-all duration-500 ${loaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'}`}>
      {/* Modals */}
      {showDispatchModal && <NewDispatchModal onClose={() => setShowDispatchModal(false)} onSubmit={handleNewDispatch} />}
      {showFullMap && <FullMapModal onClose={() => setShowFullMap(false)} routeStops={routeStops} />}

      {/* Fleet Hold Banner */}
      {fleetHeld && (
        <div className="bg-tertiary-container/30 border border-tertiary/20 rounded-xl p-4 mb-6 flex items-center gap-3 animate-[fadeIn_0.3s_ease-out]">
          <span className="material-symbols-outlined text-tertiary">pause_circle</span>
          <p className="text-sm text-on-surface flex-1"><strong>Fleet on hold.</strong> All vehicles are holding their current positions.</p>
          <button onClick={toggleFleetHold} className="text-xs font-semibold text-tertiary hover:underline">Resume</button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-[2rem] font-extrabold text-on-surface tracking-tight">Redistribution Hub</h1>
          <p className="text-sm text-on-surface-variant mt-1">Active Fleet: <span className="font-semibold text-primary">{drivers.filter(d => d.status === 'Active').length} vehicles</span></p>
        </div>
        <button
          onClick={() => setShowDispatchModal(true)}
          className="btn-primary-gradient text-on-primary px-5 py-2.5 rounded-xl text-sm font-semibold transition-all hover:shadow-lg hover:shadow-primary/20 flex items-center justify-center gap-2 w-fit"
        >
          <span className="material-symbols-outlined text-lg">add_circle</span>
          New Dispatch
        </button>
      </div>

      {/* Fleet Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <FleetStat value={activeCount} label="Active Deliveries" icon="local_shipping" accent />
        <FleetStat value="34m" label="Avg. Route Time" icon="timer" />
        <FleetStat value={`${deliveries.reduce((sum, d) => sum + parseInt(d.weight) || 0, 0)}kg`} label="Waste Diverted Today" icon="recycling" />
        <FleetStat onClick={() => navigate('/alerts')} value="2" label="Critical Alerts" icon="warning" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        {/* Delivery Queue */}
        <div className="lg:col-span-3">
          <h3 className="text-lg font-bold text-on-surface mb-4">Delivery Queue</h3>
          <div className="space-y-3">
            {deliveries.map(d => <DeliveryCard key={d.name} {...d} onStatusChange={advanceDeliveryStatus} />)}
            {deliveries.length === 0 && (
              <p className="text-sm text-on-surface-variant py-6 text-center">No deliveries in queue. Create a new dispatch to get started.</p>
            )}
          </div>

          {/* Route Map */}
          <div className="mt-6 bg-surface-container-lowest rounded-xl p-6 ghost-border">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-on-surface">Active Route Map</h3>
              <button onClick={() => setShowFullMap(true)} className="text-xs text-primary font-medium hover:underline flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">open_in_full</span>
                Expand
              </button>
            </div>
            <div className="rounded-xl overflow-hidden h-48 cursor-pointer" onClick={() => setShowFullMap(true)}>
              <InlineRouteMap />
            </div>
          </div>
        </div>

        {/* Fleet Status */}
        <div className="lg:col-span-2">
          <h3 className="text-lg font-bold text-on-surface mb-4">Fleet Operational Status</h3>
          <div className="space-y-3">
            {drivers.map(d => <DriverCard key={d.name} {...d} onToggle={() => toggleDriverStatus(d.name)} />)}
          </div>

          {/* Quick Actions */}
          <div className="mt-6 bg-surface-container-lowest rounded-xl p-5 ghost-border">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-bold text-on-surface">Quick Actions</h4>
              {savedKm > 0 && <span className="text-xs font-bold text-primary">{savedKm} km saved</span>}
            </div>
            <div className="grid grid-cols-2 gap-2">
              {[
                { icon: 'refresh', label: 'Re-optimize', action: optimizeRoute },
                { icon: fleetHeld ? 'play_circle' : 'pause_circle', label: fleetHeld ? 'Resume Fleet' : 'Hold Fleet', action: toggleFleetHold },
                { icon: 'map', label: 'Full Map', action: () => setShowFullMap(true) },
                { icon: 'analytics', label: 'Reports', action: () => addToast('Generating fleet performance report...', 'info') },
              ].map(a => (
                <button key={a.label} onClick={a.action} className="flex items-center gap-2 p-3 rounded-xl bg-surface-container-low hover:bg-surface-container-high transition-colors text-sm text-on-surface-variant hover:text-on-surface">
                  <span className="material-symbols-outlined text-lg">{a.icon}</span>
                  {a.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
