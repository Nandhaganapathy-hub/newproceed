import { useState, useEffect } from 'react'
import { useToast } from '../ToastContext'
import { API_BASE_URL } from '../api/config'
import { MapContainer, TileLayer, Marker, Popup, Polyline, Circle, createIcon, createHubIcon } from '../components/LeafletMap'
import { syncNGOsToFirestore, upsertNGO, deleteNGO as deleteFirebaseNGO, subscribeToNGOs } from '../firebaseService'

function ImpactMetric({ value, label, icon }) {
  return (
    <div className="text-center">
      <span className="material-symbols-outlined text-primary text-2xl mb-1">{icon}</span>
      <p className="text-2xl font-bold text-on-surface">{value}</p>
      <p className="text-[0.625rem] uppercase tracking-wider text-on-surface-variant mt-0.5">{label}</p>
    </div>
  )
}

function ConnectionMap({ partners }) {

  const hub = [40.72, -74.01]
  const colors = ['#625B71', '#6750A4', '#7D5260', '#4A635D', '#8C4A60']

  return (
    <div className="bg-surface-container-lowest rounded-xl p-6 ghost-border">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-bold text-on-surface">Live Connection View</h3>
          <p className="text-xs text-on-surface-variant mt-0.5">Status: <span className="text-primary font-semibold">Operational</span> • {partners.length} nodes</p>
        </div>
      </div>
      <div className="rounded-xl overflow-hidden h-64">
        <MapContainer center={hub} zoom={13} style={{ height: '100%', width: '100%' }} scrollWheelZoom={false} zoomControl={false}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/">OSM</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker position={hub} icon={createHubIcon()}>
            <Popup><strong>Living Ledger HQ</strong><br/>Central distribution hub</Popup>
          </Marker>
          <Circle center={hub} radius={800} color="#6750A4" fillColor="#6750A4" fillOpacity={0.05} weight={1} />
          {partners.slice(0, 5).map((p, i) => {
            const lat = (p.lat || 40.72) + (Math.random() * 0.01 - 0.005)
            const lng = (p.lng || -74.01) + (Math.random() * 0.01 - 0.005)
            const pos = [lat, lng]
            return (
              <Marker key={i} position={pos} icon={createIcon(colors[i % colors.length])}>
                <Popup><strong>{p.name}</strong><br/>{p.description || 'Partner NGO'}<br/>Status: {p.status}</Popup>
              </Marker>
            )
          })}
          {partners.slice(0, 5).map((p, i) => {
            const lat = p.lat || 40.72
            const lng = p.lng || -74.01
            return <Polyline key={`line-${i}`} positions={[hub, [lat, lng]]} color={colors[i % colors.length]} weight={2} opacity={0.4} dashArray="6 4" />
          })}
        </MapContainer>
      </div>
    </div>
  )
}

function GlobalImpact({ partnerCount, matchedCount }) {
  const goalPercent = Math.min(100, Math.round((matchedCount / Math.max(partnerCount, 1)) * 100))

  return (
    <div className="bg-surface-container-lowest rounded-xl p-6 ghost-border">
      <h3 className="text-base font-bold text-on-surface mb-2">Global Impact</h3>
      <p className="text-xs text-on-surface-variant mb-6">Surplus redirected this month</p>

      <div className="grid grid-cols-2 gap-5 mb-6">
        <ImpactMetric value={partnerCount} label="Active Hubs" icon="hub" />
        <ImpactMetric value="$128K" label="Est. Savings" icon="savings" />
      </div>

      {/* Progress bar */}
      <div className="mb-6">
        <div className="flex justify-between text-xs mb-2">
          <span className="text-on-surface-variant">Monthly Goal</span>
          <span className="font-bold text-on-surface">{goalPercent}%</span>
        </div>
        <div className="h-3 bg-surface-container-high rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-primary to-primary-fixed rounded-full transition-all duration-1000" style={{ width: `${goalPercent}%` }} />
        </div>
      </div>

      {/* Critical Delay Alert */}
      <div className="bg-tertiary-container/10 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <span className="material-symbols-outlined text-tertiary text-lg flex-shrink-0">warning</span>
          <div>
            <p className="text-sm font-bold text-on-surface">Critical Delay</p>
            <p className="text-xs text-on-surface-variant leading-relaxed mt-1">
              Canteen-04 pickup delayed by 45m due to heavy traffic on Route 9. Cold storage priority activated.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

function PartnerCard({ name, description, frequency, score, status, onMatch, onStatusChange, onRemove, matched }) {
  const statusColors = {
    verified: 'bg-primary/10 text-primary',
    pending: 'bg-tertiary-fixed text-tertiary',
    new: 'bg-secondary/10 text-secondary',
  }

  return (
    <div className={`bg-surface-container-lowest rounded-xl p-5 ghost-border hover:shadow-lg hover:shadow-on-surface/4 transition-all duration-200 group ${matched ? 'ring-2 ring-primary/30' : ''}`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary/10 to-primary-fixed/20 flex items-center justify-center">
            <span className="material-symbols-outlined text-primary">{matched ? 'handshake' : 'apartment'}</span>
          </div>
          <div>
            <h4 className="text-sm font-bold text-on-surface">{name}</h4>
            <p className="text-xs text-on-surface-variant">{description}</p>
          </div>
        </div>
        <button
          onClick={() => onStatusChange?.(name)}
          className={`text-[0.625rem] uppercase font-bold px-2 py-0.5 rounded-full cursor-pointer hover:opacity-70 transition-opacity ${statusColors[status]}`}
          title="Click to change status"
        >
          {status}
        </button>
      </div>
      <div className="flex items-center gap-6 mt-4">
        <div>
          <p className="text-[0.625rem] uppercase tracking-wider text-on-surface-variant">Frequency</p>
          <p className="text-sm font-semibold text-on-surface">{frequency}</p>
        </div>
        <div>
          <p className="text-[0.625rem] uppercase tracking-wider text-on-surface-variant">Impact Score</p>
          <p className="text-sm font-semibold text-on-surface">{score}</p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          {!matched ? (
            <button 
              onClick={onMatch}
              className="opacity-0 group-hover:opacity-100 transition-opacity text-primary text-xs font-medium flex items-center gap-1">
              Match Now <span className="material-symbols-outlined text-sm">handshake</span>
            </button>
          ) : (
            <span className="text-[0.625rem] text-primary font-bold flex items-center gap-1">
              <span className="material-symbols-outlined text-sm">check_circle</span> Matched
            </span>
          )}
          <button
            onClick={() => onRemove?.(name)}
            className="opacity-0 group-hover:opacity-100 transition-opacity text-error text-xs font-medium flex items-center gap-1"
            title="Remove partner"
          >
            <span className="material-symbols-outlined text-sm">delete</span>
          </button>
        </div>
      </div>
    </div>
  )
}

// Add Partner Modal
function AddPartnerModal({ onClose, onSubmit }) {
  const [form, setForm] = useState({ name: '', description: '', frequency: 'Daily', status: 'new', lat: 40.72, lng: -74.00, capacity: 50, reliability: 80, foodType: 'All' })

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]">
      <div className="bg-surface-container-lowest rounded-2xl p-6 w-full max-w-md mx-4 shadow-2xl">
        <div className="flex items-center gap-3 mb-5">
          <span className="material-symbols-outlined text-primary text-xl">person_add</span>
          <h3 className="text-base font-bold text-on-surface">Add New Partner</h3>
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-[0.6875rem] uppercase tracking-wider text-on-surface-variant font-medium">Organization Name</label>
            <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Community Food Bank"
              className="mt-1 w-full bg-surface-container-low rounded-xl px-4 py-2.5 text-sm text-on-surface outline-none border-b-2 border-transparent focus:border-primary transition-all placeholder:text-on-surface-variant/40" />
          </div>
          <div>
            <label className="text-[0.6875rem] uppercase tracking-wider text-on-surface-variant font-medium">Description</label>
            <input value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="e.g. Local food redistribution center"
              className="mt-1 w-full bg-surface-container-low rounded-xl px-4 py-2.5 text-sm text-on-surface outline-none border-b-2 border-transparent focus:border-primary transition-all placeholder:text-on-surface-variant/40" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[0.6875rem] uppercase tracking-wider text-on-surface-variant font-medium">Frequency</label>
              <select value={form.frequency} onChange={e => setForm({ ...form, frequency: e.target.value })}
                className="mt-1 w-full bg-surface-container-low rounded-xl px-4 py-2.5 text-sm text-on-surface outline-none border-b-2 border-transparent focus:border-primary transition-all cursor-pointer">
                <option value="Daily">Daily</option>
                <option value="Weekly">Weekly</option>
                <option value="Bi-Weekly">Bi-Weekly</option>
                <option value="Monthly">Monthly</option>
              </select>
            </div>
            <div>
              <label className="text-[0.6875rem] uppercase tracking-wider text-on-surface-variant font-medium">Food Type</label>
              <select value={form.foodType} onChange={e => setForm({ ...form, foodType: e.target.value })}
                className="mt-1 w-full bg-surface-container-low rounded-xl px-4 py-2.5 text-sm text-on-surface outline-none border-b-2 border-transparent focus:border-primary transition-all cursor-pointer">
                <option value="All">All Types</option>
                <option value="Prepared">Prepared Meals</option>
                <option value="Baked">Baked Goods</option>
                <option value="Produce">Fresh Produce</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[0.6875rem] uppercase tracking-wider text-on-surface-variant font-medium">Capacity (%)</label>
              <input type="number" min="0" max="100" value={form.capacity} onChange={e => setForm({ ...form, capacity: parseInt(e.target.value) || 0 })}
                className="mt-1 w-full bg-surface-container-low rounded-xl px-4 py-2.5 text-sm text-on-surface outline-none border-b-2 border-transparent focus:border-primary transition-all" />
            </div>
            <div>
              <label className="text-[0.6875rem] uppercase tracking-wider text-on-surface-variant font-medium">Reliability (%)</label>
              <input type="number" min="0" max="100" value={form.reliability} onChange={e => setForm({ ...form, reliability: parseInt(e.target.value) || 0 })}
                className="mt-1 w-full bg-surface-container-low rounded-xl px-4 py-2.5 text-sm text-on-surface outline-none border-b-2 border-transparent focus:border-primary transition-all" />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button onClick={onClose} className="px-4 py-2 rounded-xl text-sm font-medium text-on-surface-variant hover:bg-surface-container-high transition-colors">
            Cancel
          </button>
          <button
            onClick={() => { if (form.name && form.description) onSubmit(form) }}
            className="btn-primary-gradient text-on-primary px-5 py-2 rounded-xl text-sm font-semibold hover:shadow-lg hover:shadow-primary/20 transition-all"
          >
            Add Partner
          </button>
        </div>
      </div>
    </div>
  )
}

// Confirm Modal
function ConfirmModal({ title, message, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]">
      <div className="bg-surface-container-lowest rounded-2xl p-6 w-full max-w-sm mx-4 shadow-2xl">
        <div className="flex items-center gap-3 mb-3">
          <span className="material-symbols-outlined text-error text-xl">warning</span>
          <h3 className="text-base font-bold text-on-surface">{title}</h3>
        </div>
        <p className="text-sm text-on-surface-variant mb-6 leading-relaxed">{message}</p>
        <div className="flex justify-end gap-3">
          <button onClick={onCancel} className="px-4 py-2 rounded-xl text-sm font-medium text-on-surface-variant hover:bg-surface-container-high transition-colors">Cancel</button>
          <button onClick={onConfirm} className="bg-error text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-error/90 transition-all">Remove</button>
        </div>
      </div>
    </div>
  )
}

export default function NGOs() {
  const [loaded, setLoaded] = useState(false)
  const { addToast } = useToast() || { addToast: () => {} }
  const [partners, setPartners] = useState([])
  const [matchedPartners, setMatchedPartners] = useState(new Set())
  const [showAddModal, setShowAddModal] = useState(false)
  const [confirmRemove, setConfirmRemove] = useState(null)

  useEffect(() => {
    const loadData = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/ngos/`);
        if (!res.ok) throw new Error('Network error');
        let data = await res.json();

        if (data.length === 0) {
          const mocks = [
            { name: 'City Harvest', description: 'Regional distribution hub', frequency: 'Daily', status: 'verified', lat: 40.71, lng: -74.00, capacity: 80, reliability: 98, foodType: 'All' },
            { name: 'Daily Bread', description: 'Community bakery and dry goods', frequency: 'Weekly', status: 'verified', lat: 40.75, lng: -73.98, capacity: 40, reliability: 85, foodType: 'Baked' },
            { name: 'Unity Kitchen', description: 'Hot meal program for shelters', frequency: 'TBD', status: 'new', lat: 40.73, lng: -73.99, capacity: 90, reliability: 70, foodType: 'Prepared' },
          ];
          for (let m of mocks) {
            await fetch(`${API_BASE_URL}/api/ngos/`, {
              method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(m)
            });
          }
          const res2 = await fetch(`${API_BASE_URL}/api/ngos/`);
          data = await res2.json();
        }
        setPartners(data);

        // 🔥 Sync NGO data to Firebase Firestore
        syncNGOsToFirestore(data).then(() => {
          console.log('🔥 NGOs synced to Firebase Firestore');
        }).catch(() => {});
      } catch (e) {
        console.warn('Backend unavailable. Showing empty state.');
      } finally {
        setLoaded(true);
      }
    };
    loadData();
  }, [])

  // 🔥 Firebase real-time listener for cross-device NGO sync
  useEffect(() => {
    const unsubscribe = subscribeToNGOs((firebaseNGOs) => {
      console.log('🔥 Firebase NGOs updated:', firebaseNGOs.length, 'partners');
    });
    return () => unsubscribe();
  }, [])

  // Fake hub origin
  const origin = { lat: 40.72, lng: -74.01 };

  // Calculate scores and rank
  const rankedPartners = [...partners].map(p => {
    const dist = Math.sqrt(Math.pow(p.lat - origin.lat, 2) + Math.pow(p.lng - origin.lng, 2)) * 100;
    const reliabilityScore = ((p.reliability || 80) / 100) * 5;
    const capacityScore = ((100 - (p.capacity || 50)) / 100) * 3;
    const distanceScore = Math.max(0, 2 - (dist * 0.2)); 
    const totalScore = (reliabilityScore + capacityScore + distanceScore).toFixed(1);
    
    return { ...p, score: `${totalScore}/10` };
  }).sort((a, b) => parseFloat(b.score) - parseFloat(a.score));

  // Match partner
  const handleMatch = (partnerName) => {
    setMatchedPartners(prev => {
      const next = new Set(prev)
      next.add(partnerName)
      return next
    })
    // Update status to verified in backend
    const partner = partners.find(p => p.name === partnerName)
    if (partner?.id) {
      fetch(`http://127.0.0.1:8000/api/ngos/${partner.id}/`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'verified' })
      }).catch(() => {})
      // Sync to Firebase
      upsertNGO({ ...partner, status: 'verified' }).catch(() => {})
    }
    setPartners(prev => prev.map(p => p.name === partnerName ? { ...p, status: 'verified' } : p))
    addToast(`Successfully matched with ${partnerName}! Pickup coordination initiated.`, 'success')
  }

  // Cycle status: new → pending → verified
  const cycleStatus = (partnerName) => {
    const flow = { 'new': 'pending', 'pending': 'verified', 'verified': 'new' }
    setPartners(prev => prev.map(p => {
      if (p.name !== partnerName) return p
      const nextStatus = flow[p.status] || 'new'
      addToast(`${partnerName}: status updated to ${nextStatus}`, 'info')
      // Update backend
      if (p.id) {
        fetch(`http://127.0.0.1:8000/api/ngos/${p.id}/`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: nextStatus })
        }).catch(() => {})
      }
      return { ...p, status: nextStatus }
    }))
  }

  // Add new partner
  const handleAddPartner = (form) => {
    fetch('http://127.0.0.1:8000/api/ngos/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    })
      .then(res => res.json())
      .then(data => {
        setPartners(prev => [...prev, data])
        // 🔥 Sync new partner to Firebase
        upsertNGO(data).catch(() => {})
        addToast(`${form.name} added as a new partner!`, 'success')
      })
      .catch(() => {
        setPartners(prev => [...prev, form])
        // Still push to Firebase even if Django is offline
        upsertNGO(form).catch(() => {})
        addToast(`${form.name} added locally (backend offline).`, 'warning')
      })
    setShowAddModal(false)
  }

  // Remove partner
  const handleRemove = (partnerName) => {
    const partner = partners.find(p => p.name === partnerName)
    if (partner?.id) {
      fetch(`http://127.0.0.1:8000/api/ngos/${partner.id}/`, { method: 'DELETE' }).catch(() => {})
      // 🔥 Remove from Firebase too
      deleteFirebaseNGO(partner.id).catch(() => {})
    }
    setPartners(prev => prev.filter(p => p.name !== partnerName))
    setMatchedPartners(prev => {
      const next = new Set(prev)
      next.delete(partnerName)
      return next
    })
    setConfirmRemove(null)
    addToast(`${partnerName} removed from partner network.`, 'warning')
  }

  return (
    <div className={`p-8 max-w-[1400px] mx-auto transition-all duration-500 ${loaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'}`}>
      {/* Modals */}
      {showAddModal && <AddPartnerModal onClose={() => setShowAddModal(false)} onSubmit={handleAddPartner} />}
      {confirmRemove && (
        <ConfirmModal
          title="Remove Partner"
          message={`Are you sure you want to remove "${confirmRemove}" from the partner network? This action cannot be undone.`}
          onConfirm={() => handleRemove(confirmRemove)}
          onCancel={() => setConfirmRemove(null)}
        />
      )}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-[2rem] font-extrabold text-on-surface tracking-tight">NGO Network</h1>
          <p className="text-sm text-on-surface-variant mt-1">Coordinating real-time surplus distribution across {partners.length} verified regional partners.</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="btn-primary-gradient text-on-primary px-5 py-2.5 rounded-xl text-sm font-semibold transition-all hover:shadow-lg hover:shadow-primary/20 flex items-center justify-center gap-2 w-fit"
        >
          <span className="material-symbols-outlined text-lg">person_add</span>
          Add Partner
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-8">
        <ConnectionMap partners={partners} />
        <GlobalImpact partnerCount={partners.length} matchedCount={matchedPartners.size} />
      </div>

      {/* Partner Verification Board */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-on-surface">Partner Verification Board</h3>
          <span className="text-xs text-on-surface-variant">{matchedPartners.size}/{partners.length} matched</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {rankedPartners.map(p => (
            <PartnerCard 
              key={p.name} 
              {...p}
              matched={matchedPartners.has(p.name)}
              onMatch={() => handleMatch(p.name)}
              onStatusChange={cycleStatus}
              onRemove={(name) => setConfirmRemove(name)}
            />
          ))}
        </div>
        {partners.length === 0 && (
          <p className="text-sm text-on-surface-variant py-8 text-center">No partners in the network yet. Click "Add Partner" to get started.</p>
        )}
      </div>
    </div>
  )
}
