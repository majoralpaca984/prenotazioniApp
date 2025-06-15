import React, { useEffect, useState } from 'react';

const ThemeToggle = () => {
  const [isDark, setIsDark] = useState(() => {
    return localStorage.getItem('theme') === 'dark';
  });

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  const toggleTheme = () => {
    setIsDark(!isDark);
  };

  return (
    <button
      onClick={toggleTheme}
      className="btn btn-primary btn-sm transition-all duration-300 hover:scale-105"
      type="button"
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} theme`}
    >
      <span className="text-lg mr-1">{isDark ? '🌞' : '🌙'}</span>
      <span className="hidden sm:inline">{isDark ? 'Light' : 'Dark'}</span>
    </button>
  );
};

export default ThemeToggle;