import { useState, useEffect } from 'react';

export default function ThemeToggle({ collapsed }) {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains('dark'));
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains('dark'));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  const toggle = () => {
    const root = document.documentElement;
    if (root.classList.contains('dark')) {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    } else {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    }
  };

  if (collapsed) {
    return (
      <button 
        onClick={toggle}
        className="w-10 h-10 rounded-full bg-surface-container-high hover:bg-surface-container-highest flex items-center justify-center text-on-surface transition-colors focus:outline-none"
        aria-label="Toggle theme"
      >
        <span className="material-symbols-outlined text-xl">{isDark ? 'dark_mode' : 'light_mode'}</span>
      </button>
    );
  }

  return (
    <button 
      onClick={toggle}
      className={`relative w-[3.25rem] h-7 rounded-full flex items-center px-1 shadow-inner transition-colors duration-300 focus:outline-none ${isDark ? 'bg-primary' : 'bg-surface-container-highest border border-outline-variant/30'}`}
      aria-label="Toggle theme"
    >
      <span className="sr-only">Toggle theme</span>
      <div 
        className={`w-5 h-5 rounded-full shadow-md transform transition-transform duration-300 flex items-center justify-center ${
          isDark ? 'translate-x-6 bg-on-primary' : 'translate-x-0 bg-surface-container-lowest'
        }`}
      />
      <span className={`absolute left-[6px] text-[10px] pointer-events-none transition-opacity ${isDark ? 'opacity-0' : 'opacity-60 text-on-surface'}`}>☼</span>
      <span className={`absolute right-[7px] text-[10px] pointer-events-none transition-opacity ${isDark ? 'opacity-80 text-on-primary' : 'opacity-0'}`}>☾</span>
    </button>
  );
}
