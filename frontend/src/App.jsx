import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import Sidebar from './components/Sidebar'
import Dashboard from './pages/Dashboard'
import Predictor from './pages/Predictor'
import NGOs from './pages/NGOs'
import Logistics from './pages/Logistics'
import Alerts from './pages/Alerts'
import Settings from './pages/Settings'
import { ToastProvider } from './ToastContext'
import ThemeToggle from './components/ThemeToggle'

export default function App() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [onboardStep, setOnboardStep] = useState(0)
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    // Feature 6/Ui Modernization: Dark/Light Theme defaulting to light mode
    const isThemeDark = localStorage.getItem('theme') === 'dark'; // Force fallback to light mode by default
    if (isThemeDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }

    // Feature 7: Onboarding check
    if (!localStorage.getItem('onboarded')) {
      setOnboardStep(1);
    }
  }, [])



  const dismissOnboarding = () => {
    if (onboardStep === 3) {
      localStorage.setItem('onboarded', 'true');
      setOnboardStep(0);
    } else {
      setOnboardStep(prev => prev + 1);
    }
  }

  const navItems = [
    { path: '/', icon: 'dashboard', label: 'Dashboard' },
    { path: '/predictor', icon: 'batch_prediction', label: 'Predictor' },
    { path: '/ngos', icon: 'handshake', label: 'NGOs' },
    { path: '/logistics', icon: 'local_shipping', label: 'Logistics' },
    { path: '/alerts', icon: 'notifications', label: 'Alerts' },
  ];

  return (
    <ToastProvider>
      <div className="flex h-screen bg-surface overflow-hidden relative">
        {onboardStep > 0 && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-surface-container-lowest p-6 rounded-2xl max-w-sm w-full text-center ghost-border shadow-2xl">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="material-symbols-outlined text-primary text-3xl">
                  {onboardStep === 1 ? 'waving_hand' : onboardStep === 2 ? 'auto_awesome' : 'check_circle'}
                </span>
              </div>
              <h2 className="text-xl font-bold text-on-surface mb-2">
                {onboardStep === 1 ? 'Welcome to Living Ledger' : onboardStep === 2 ? 'AI Predictor' : "You're ready!"}
              </h2>
              <p className="text-sm text-on-surface-variant mb-6">
                {onboardStep === 1 ? 'Your intelligent food redistribution network.' : 
                 onboardStep === 2 ? 'Use the Predictor to forecast surplus and optimize delivery routes.' : 
                 'Start managing food waste effectively.'}
              </p>
              <button onClick={dismissOnboarding} className="w-full btn-primary-gradient text-on-primary py-3 rounded-xl font-bold">
                {onboardStep === 3 ? "Let's Go" : 'Next'}
              </button>
            </div>
          </div>
        )}

        {isMobileMenuOpen && (
          <div className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm transition-opacity" onClick={() => setIsMobileMenuOpen(false)} />
        )}

        <Sidebar mobileOpen={isMobileMenuOpen} setMobileOpen={setIsMobileMenuOpen} />
        
        <main className="flex-1 flex flex-col h-screen overflow-hidden relative pb-16 md:pb-0">
          <div className="md:hidden flex shrink-0 items-center justify-between p-4 bg-surface-container-lowest border-b border-surface-container/50 z-30 shadow-sm">
            <div className="flex items-center gap-3">
              <button onClick={() => setIsMobileMenuOpen(true)} className="p-1.5 rounded-xl hover:bg-surface-container active:bg-surface-container-high transition-colors text-on-surface">
                <span className="material-symbols-outlined text-2xl">menu</span>
              </button>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary-container flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-on-primary text-sm">eco</span>
                </div>
                <span className="font-bold text-sm tracking-tight text-on-surface">Living Ledger</span>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <div className="w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center text-xs font-bold text-on-surface ring-2 ring-primary/20 shrink-0">
                AR
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto overscroll-y-none">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/predictor" element={<Predictor />} />
              <Route path="/ngos" element={<NGOs />} />
              <Route path="/logistics" element={<Logistics />} />
              <Route path="/alerts" element={<Alerts />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>

          {/* Bottom Mobile Navigation */}
          <div className="md:hidden fixed bottom-0 left-0 right-0 bg-surface-container-lowest border-t border-surface-container z-40 flex items-center justify-around p-2 pb-safe">
            {navItems.map(item => {
              const isActive = location.pathname === item.path;
              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={`flex flex-col items-center p-2 min-w-[64px] rounded-xl transition-colors ${isActive ? 'text-primary' : 'text-on-surface-variant hover:bg-surface-container'}`}
                >
                  <div className={`w-10 h-8 flex items-center justify-center rounded-full mb-1 transition-colors ${isActive ? 'bg-primary/10' : ''}`}>
                    <span className="material-symbols-outlined text-xl">{item.icon}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </main>
      </div>
    </ToastProvider>
  )
}
