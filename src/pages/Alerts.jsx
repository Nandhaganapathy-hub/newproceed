import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useToast } from '../ToastContext'

function AlertCard({ id, type, icon, title, description, time, actions, onAction }) {
  const [dismissed, setDismissed] = useState(false)
  const typeConfig = {
    critical: { bg: 'bg-error-container/30', border: 'border-l-4 border-error', iconColor: 'text-error' },
    warning: { bg: 'bg-tertiary-fixed/20', border: 'border-l-4 border-tertiary', iconColor: 'text-tertiary' },
    info: { bg: 'bg-surface-container-low', border: 'border-l-4 border-secondary', iconColor: 'text-secondary' },
  }
  const cfg = typeConfig[type] || typeConfig.info

  if (dismissed) return null

  return (
    <div className={`rounded-xl p-4 ${cfg.bg} ${cfg.border} transition-all duration-200 hover:shadow-md hover:shadow-on-surface/4`}>
      <div className="flex items-start gap-3">
        <span className={`material-symbols-outlined text-xl mt-0.5 ${cfg.iconColor}`}>{icon}</span>
        <div className="flex-1">
          <div className="flex items-start justify-between">
            <h4 className="text-sm font-bold text-on-surface">{title}</h4>
            <span className="text-[0.625rem] text-on-surface-variant">{time}</span>
          </div>
          <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">{description}</p>
          {actions && (
            <div className="flex gap-2 mt-3">
              {actions.map((a, i) => (
                <button
                  key={i}
                  onClick={() => {
                    if (a === 'Dismiss' || a === 'Hold' || a === 'Acknowledge') {
                      setDismissed(true)
                      onAction?.(id, a)
                    } else {
                      onAction?.(id, a)
                    }
                  }}
                  className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-colors ${i === 0 ? 'btn-primary-gradient text-on-primary' : 'bg-surface-container-high text-on-surface-variant hover:text-on-surface'}`}
                >
                  {a}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function NetworkHealth() {
  const metrics = [
    { label: 'API Uptime', value: 99.7, status: 'healthy' },
    { label: 'Sensor Grid', value: 94.2, status: 'healthy' },
    { label: 'Fleet Comms', value: 88.5, status: 'warning' },
    { label: 'NGO Gateway', value: 97.1, status: 'healthy' },
  ]

  return (
    <div className="bg-surface-container-lowest rounded-xl p-6 ghost-border">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-base font-bold text-on-surface">Network Health</h3>
        <span className="text-[0.625rem] bg-primary/10 text-primary font-bold px-2 py-0.5 rounded-full uppercase">Live</span>
      </div>
      <div className="space-y-4">
        {metrics.map(m => (
          <div key={m.label}>
            <div className="flex justify-between text-xs mb-1.5">
              <span className="text-on-surface-variant">{m.label}</span>
              <span className={`font-bold ${m.status === 'healthy' ? 'text-primary' : 'text-tertiary'}`}>{m.value}%</span>
            </div>
            <div className="h-2 bg-surface-container-high rounded-full overflow-hidden">
              <div className={`h-full rounded-full transition-all duration-1000 ${m.status === 'healthy' ? 'bg-gradient-to-r from-primary to-primary-fixed' : 'bg-gradient-to-r from-tertiary to-tertiary-fixed-dim'}`} style={{ width: `${m.value}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function ActivityLogs() {
  const logs = [
    { icon: 'local_shipping', text: 'Vehicle TR-42 loaded from North Canteen.', time: '2m ago' },
    { icon: 'inventory_2', text: 'Global inventory ledger updated successfully.', time: '8m ago' },
    { icon: 'group_add', text: 'Green Leaf Co. joined the redistribution chain.', time: '15m ago' },
    { icon: 'route', text: 'Route optimization completed for Zone B-12.', time: '22m ago' },
    { icon: 'verified', text: 'Daily Bread verified compliance documents.', time: '45m ago' },
  ]

  return (
    <div className="bg-surface-container-lowest rounded-xl p-6 ghost-border">
      <div className="flex items-center gap-2 mb-5">
        <span className="material-symbols-outlined text-on-surface-variant text-xl">history</span>
        <h3 className="text-base font-bold text-on-surface">Activity Logs</h3>
      </div>
      <div className="space-y-3">
        {logs.map((l, i) => (
          <div key={i} className="flex items-start gap-3 py-2">
            <div className="w-8 h-8 rounded-lg bg-surface-container-high flex items-center justify-center flex-shrink-0">
              <span className="material-symbols-outlined text-sm text-on-surface-variant">{l.icon}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-on-surface leading-snug">{l.text}</p>
              <p className="text-[0.625rem] text-on-surface-variant mt-0.5">{l.time}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function DeploymentBanner({ onViewFleet }) {
  return (
    <div className="bg-gradient-to-r from-primary-container to-primary rounded-xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-white/15 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
          <span className="material-symbols-outlined text-on-primary text-2xl">local_shipping</span>
        </div>
        <div>
          <p className="text-sm font-bold text-on-primary">Active Deployments</p>
          <p className="text-xs text-on-primary/70">12 Vehicles in Transit across Metro Area</p>
        </div>
      </div>
      <button
        onClick={onViewFleet}
        className="bg-white/20 backdrop-blur-sm text-on-primary text-xs font-semibold px-4 py-2 rounded-lg hover:bg-white/30 transition-colors shrink-0"
      >
        View Fleet
      </button>
    </div>
  )
}

export default function Alerts() {
  const [loaded, setLoaded] = useState(false)
  const [filter, setFilter] = useState('all')
  const { addToast } = useToast() || { addToast: () => {} }
  const navigate = useNavigate()

  const [criticalAlerts, setCriticalAlerts] = useState([])
  const [warnings, setWarnings] = useState([])
  const [infoAlerts] = useState([
    { id: 'i1', type: 'info', icon: 'info', title: 'System Update', description: 'Living Ledger v4.2 deployed. Neural model retrained with latest dataset.', time: '3h ago' },
    { id: 'i2', type: 'info', icon: 'cloud_done', title: 'Backup Complete', description: 'Nightly database backup completed successfully. 42MB archived.', time: '6h ago' },
  ])

  // Fetch initial alerts
  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const res = await fetch('http://127.0.0.1:8000/api/alerts/');
        if (!res.ok) throw new Error();
        let data = await res.json();
        
        // Auto-seed if empty
        if (data.length === 0) {
          const mockAlerts = [
            { alert_type: 'critical', icon: 'priority_high', title: 'Surplus Alert', description: 'Canteen #4: 50kg perishable surplus unassigned.', has_actions: true },
            { alert_type: 'critical', icon: 'sensors_off', title: 'Sensor Failure', description: 'Refrigeration Unit TR-204 signal lost.', has_actions: true },
            { alert_type: 'critical', icon: 'block', title: 'NGO Refusal', description: 'Hope Shelter rejected Batch #881 (Capacity reached).', has_actions: true },
            { alert_type: 'warning', icon: 'thermostat', title: 'Temperature Drift', description: 'Storage unit B-07 trending 2°C above threshold.', has_actions: false },
            { alert_type: 'warning', icon: 'schedule', title: 'Late Pickup', description: 'Scheduled pickup at North Canteen delayed by 20 minutes.', has_actions: false },
          ];
          for (let m of mockAlerts) await fetch('http://127.0.0.1:8000/api/alerts/', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(m) });
          data = await (await fetch('http://127.0.0.1:8000/api/alerts/')).json();
        }

        setCriticalAlerts(data.filter(a => a.alert_type === 'critical').map((a, i) => ({
          ...a, id: a.id || `c${i}`, type: a.alert_type, time: 'Recent',
          actions: a.has_actions ? ['Assign NGO', 'Dismiss'] : null,
        })));
        setWarnings(data.filter(a => a.alert_type === 'warning').map((a, i) => ({
          ...a, id: a.id || `w${i}`, type: a.alert_type, time: 'Recent',
        })));
      } catch (e) {
        console.warn('Backend unavailable.');
      } finally {
        setLoaded(true);
      }
    };
    fetchAlerts();
  }, [])

  // Live Alert Simulation Engine
  useEffect(() => {
    const pool = [
      { type: 'critical', icon: 'sensors_off', title: 'Sensor Failure', description: 'Refrigeration Unit TR-301 signal lost. Integrity at risk.', actions: ['Dispatch Tech', 'Acknowledge'] },
      { type: 'warning', icon: 'thermostat', title: 'Temperature Drift', description: 'Storage unit C-12 trending 3°C above threshold. Monitor closely.' },
      { type: 'critical', icon: 'food_bank', title: 'Surplus Spike', description: 'Unplanned 20kg surplus at East Wing kitchen.', actions: ['Assign NGO', 'Dismiss'] },
      { type: 'critical', icon: 'block', title: 'NGO Refusal', description: 'Downtown Shelter capacity full. Rerouting required.', actions: ['Re-route', 'Hold'] },
    ];

    const timer = setInterval(() => {
      const isCrit = Math.random() > 0.5;
      const baseAlert = pool[Math.floor(Math.random() * pool.length)];
      
      const alert = { ...baseAlert, id: `live_${Date.now()}`, type: isCrit ? 'critical' : 'warning', time: 'Just now' };
      
      const payload = {
        alert_type: alert.type,
        icon: alert.icon,
        title: alert.title,
        description: alert.description,
        has_actions: !!alert.actions
      };

      fetch('http://127.0.0.1:8000/api/alerts/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      }).catch(() => {});

      if (alert.type === 'critical') {
        setCriticalAlerts(prev => [alert, ...prev]);
        addToast?.(`Critical Alert: ${alert.title}`, 'error');
      } else {
        setWarnings(prev => [alert, ...prev]);
        addToast?.(`Warning: ${alert.title}`, 'warning');
      }
    }, 45000);

    return () => clearInterval(timer);
  }, [addToast]);

  // Handle alert action buttons
  const handleAlertAction = (alertId, action) => {
    switch (action) {
      case 'Assign NGO':
        addToast('Redirecting to NGO network for assignment...', 'success')
        setTimeout(() => navigate('/ngos'), 800)
        break
      case 'Dispatch Tech':
        addToast('Technician dispatched to location. ETA: 15 minutes.', 'success')
        break
      case 'Re-route':
        addToast('Re-routing delivery to next available partner...', 'info')
        setTimeout(() => navigate('/logistics'), 800)
        break
      case 'Dismiss':
        addToast('Alert dismissed.', 'info')
        setCriticalAlerts(prev => prev.filter(a => a.id !== alertId))
        break
      case 'Hold':
        addToast('Alert placed on hold. Will revisit in 30 minutes.', 'warning')
        setCriticalAlerts(prev => prev.filter(a => a.id !== alertId))
        break
      case 'Acknowledge':
        addToast('Alert acknowledged and logged.', 'info')
        setCriticalAlerts(prev => prev.filter(a => a.id !== alertId))
        break
      default:
        addToast(`Action "${action}" executed.`, 'info')
    }
  }

  // Filter logic
  const showCritical = filter === 'all' || filter === 'critical'
  const showWarnings = filter === 'all' || filter === 'warnings'
  const showInfo = filter === 'all' || filter === 'info'

  const filters = ['all', 'critical', 'warnings', 'info']

  return (
    <div className={`p-8 max-w-[1400px] mx-auto transition-all duration-500 ${loaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'}`}>
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-[2rem] font-extrabold text-on-surface tracking-tight">System Alerts</h1>
          <p className="text-sm text-on-surface-variant mt-1">Real-time monitoring of the food redistribution chain</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {filters.map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`text-xs font-medium px-3.5 py-2 rounded-xl capitalize transition-colors ${filter === f ? 'btn-primary-gradient text-on-primary' : 'bg-surface-container-lowest ghost-border text-on-surface-variant hover:text-on-surface'}`}>
              {f}
              {f === 'critical' && <span className="ml-1.5 bg-white/20 px-1.5 py-0.5 rounded-full text-[0.5rem]">{criticalAlerts.length}</span>}
              {f === 'warnings' && <span className="ml-1.5 bg-white/20 px-1.5 py-0.5 rounded-full text-[0.5rem]">{warnings.length}</span>}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-5">
          {/* Critical Section */}
          {showCritical && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="material-symbols-outlined text-error text-lg">priority_high</span>
                <h3 className="text-sm font-bold text-on-surface uppercase tracking-wider">Critical Exceptions</h3>
                <span className="text-[0.625rem] bg-error-container text-error font-bold px-2 py-0.5 rounded-full">{criticalAlerts.length}</span>
              </div>
              <div className="space-y-3">
                {criticalAlerts.length > 0 ? (
                  criticalAlerts.map((a, i) => <AlertCard key={a.id || i} {...a} onAction={handleAlertAction} />)
                ) : (
                  <p className="text-sm text-on-surface-variant py-4 text-center">No critical alerts. System operating normally.</p>
                )}
              </div>
            </div>
          )}

          {/* Warnings Section */}
          {showWarnings && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="material-symbols-outlined text-tertiary text-lg">warning_amber</span>
                <h3 className="text-sm font-bold text-on-surface uppercase tracking-wider">System Warnings</h3>
                <span className="text-[0.625rem] bg-tertiary-fixed text-tertiary font-bold px-2 py-0.5 rounded-full">{warnings.length}</span>
              </div>
              <div className="space-y-3">
                {warnings.length > 0 ? (
                  warnings.map((a, i) => <AlertCard key={a.id || i} {...a} onAction={handleAlertAction} />)
                ) : (
                  <p className="text-sm text-on-surface-variant py-4 text-center">No active warnings.</p>
                )}
              </div>
            </div>
          )}

          {/* Info Section */}
          {showInfo && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="material-symbols-outlined text-secondary text-lg">info</span>
                <h3 className="text-sm font-bold text-on-surface uppercase tracking-wider">Information</h3>
              </div>
              <div className="space-y-3">
                {infoAlerts.map((a, i) => <AlertCard key={a.id || i} {...a} onAction={handleAlertAction} />)}
              </div>
            </div>
          )}

          <DeploymentBanner onViewFleet={() => navigate('/logistics')} />
        </div>

        {/* Right Column */}
        <div className="space-y-5">
          <NetworkHealth />
          <ActivityLogs />
        </div>
      </div>
    </div>
  )
}
