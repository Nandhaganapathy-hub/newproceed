import { NavLink, useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'
import ThemeToggle from './ThemeToggle'

const navItems = [
  { to: '/', icon: 'dashboard', label: 'Dashboard' },
  { to: '/predictor', icon: 'query_stats', label: 'Predictor' },
  { to: '/ngos', icon: 'handshake', label: 'NGOs' },
  { to: '/logistics', icon: 'local_shipping', label: 'Logistics' },
  { to: '/alerts', icon: 'notifications', label: 'Alerts', badge: 3 },
  { to: '/settings', icon: 'settings', label: 'Settings' },
]

export default function Sidebar({ mobileOpen, setMobileOpen }) {
  const [collapsed, setCollapsed] = useState(false)
  const location = useLocation()
  const [efficiency, setEfficiency] = useState(82)

  // Close mobile sidebar on route change
  useEffect(() => {
    if (mobileOpen) setMobileOpen(false)
  }, [location.pathname])

  // Simulate real-time efficiency API
  useEffect(() => {
    const interval = setInterval(() => {
      setEfficiency(prev => {
        const variation = Math.floor(Math.random() * 9) - 4; // -4 to +4
        let newValue = prev + variation;
        if (newValue > 99) newValue = 99;
        if (newValue < 60) newValue = 60;
        return newValue;
      })
    }, 2000); // Faster updates
    return () => clearInterval(interval);
  }, [])

  const forceRegenerate = () => {
    setEfficiency(Math.floor(Math.random() * 30) + 65);
  };

  return (
    <aside className={`
      fixed md:relative z-50 h-screen transition-transform duration-300 ease-in-out
      ${mobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full md:translate-x-0'}
      ${collapsed ? 'md:w-20' : 'md:w-64'} 
      flex flex-col bg-surface-container-lowest w-64 md:border-r border-surface-container
    `}>
      {/* Header */}
      <div className="p-5 pb-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary-container flex items-center justify-center flex-shrink-0">
            <span className="material-symbols-outlined text-on-primary text-xl">eco</span>
          </div>
          {!collapsed && (
            <div className="overflow-hidden">
              <h1 className="text-sm font-bold text-on-surface tracking-tight leading-tight">Living Ledger</h1>
              <p className="text-[0.6875rem] text-on-surface-variant tracking-wider uppercase">Canteen Management</p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              `group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 relative
              ${isActive
                ? 'bg-surface-container-high text-primary'
                : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
              }`
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-r-full" />
                )}
                <span className={`material-symbols-outlined text-xl ${isActive ? 'text-primary' : 'text-on-surface-variant group-hover:text-on-surface'}`}>
                  {item.icon}
                </span>
                {!collapsed && <span>{item.label}</span>}
                {item.badge && (
                  <span className="ml-auto bg-tertiary-container text-on-tertiary-container text-[0.625rem] font-bold px-1.5 py-0.5 rounded-full min-w-5 text-center">
                    {item.badge}
                  </span>
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 space-y-4">
        {/* Efficiency Ring */}
        <div 
          onClick={forceRegenerate}
          className="flex flex-col items-center gap-1 cursor-pointer active:scale-95 transition-transform group"
          title="Click to regenerate AI prediction"
        >
          <div className="relative w-16 h-16">
            <svg viewBox="0 0 80 80" className="w-full h-full -rotate-90">
              <circle cx="40" cy="40" r="34" fill="none" stroke="currentColor" strokeWidth="4" className="text-surface-container-high group-hover:text-surface-container-highest transition-colors" />
              <circle cx="40" cy="40" r="34" fill="none" stroke="currentColor" strokeWidth="4"
                className="text-primary transition-all duration-1000 ease-out group-hover:brightness-110"
                strokeDasharray="213.6"
                strokeDashoffset={213.6 - (213.6 * efficiency) / 100}
                strokeLinecap="round"
              />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-on-surface group-hover:text-primary transition-colors">{efficiency}%</span>
          </div>
          {!collapsed && <p className="text-[0.625rem] text-on-surface-variant uppercase tracking-wider group-hover:text-on-surface transition-colors">Carbon Positive</p>}
        </div>

        {/* Theme Toggle */}
        <div className="flex items-center justify-center p-2 hidden md:flex">
          <ThemeToggle collapsed={collapsed} />
        </div>

        {/* User Profile */}
        <div className="flex items-center gap-3 p-2 rounded-xl bg-surface-container-low hidden md:flex">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-primary-container flex items-center justify-center text-on-primary text-xs font-bold flex-shrink-0">
            AR
          </div>
          {!collapsed && (
            <div className="overflow-hidden">
              <p className="text-xs font-semibold text-on-surface truncate">Alex Rivera</p>
              <p className="text-[0.625rem] text-on-surface-variant truncate">Manager #402</p>
            </div>
          )}
        </div>
      </div>

      {/* Collapse Button - Hidden on Mobile */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="hidden md:flex absolute -right-3 top-8 w-6 h-6 rounded-full bg-surface-container-highest items-center justify-center shadow-sm hover:bg-surface-container-high transition-colors cursor-pointer ghost-border z-10"
      >
        <span className={`material-symbols-outlined text-sm text-on-surface-variant transition-transform ${collapsed ? 'rotate-180' : ''}`}>
          chevron_left
        </span>
      </button>
    </aside>
  )
}
