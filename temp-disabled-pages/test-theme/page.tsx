'use client';

import React from 'react';
import { ThemeSwitcher, useTheme } from '@/components/theme/ThemeSwitcher';

export default function TestThemePage() {
  const { currentTheme, changeTheme } = useTheme();
  const [showThemeSwitcher, setShowThemeSwitcher] = React.useState(false);

  return (
    <div className="min-h-screen p-8" style={{ background: 'var(--bg-primary)' }}>
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-4xl font-bold" style={{ color: 'var(--text-primary)' }}>
          Theme Test Page
        </h1>
        
        <div className="space-y-4">
          <p style={{ color: 'var(--text-secondary)' }}>
            Current theme: <strong>{currentTheme}</strong>
          </p>
          
          <button
            onClick={() => setShowThemeSwitcher(true)}
            className="ds-button-primary"
          >
            Open Theme Switcher
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="ds-card p-6">
            <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
              Card Example
            </h3>
            <p style={{ color: 'var(--text-secondary)' }}>
              This is a test card to see how the theme affects different components.
            </p>
            <div className="mt-4 space-x-2">
              <button className="ds-button-primary">Primary</button>
              <button className="ds-button-secondary">Secondary</button>
              <button className="ds-button-ghost">Ghost</button>
            </div>
          </div>

          <div className="ds-card p-6">
            <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
              Form Example
            </h3>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Test input"
                className="ds-input w-full px-3 py-2 rounded"
              />
              <button className="ds-button-accent w-full">
                Submit
              </button>
            </div>
          </div>

          <div className="ds-card p-6">
            <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
              Color Variables
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded" style={{ background: 'var(--gradient-primary)' }}></div>
                <span style={{ color: 'var(--text-secondary)' }}>Primary Gradient</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded" style={{ background: 'var(--bg-surface)' }}></div>
                <span style={{ color: 'var(--text-secondary)' }}>Surface</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded" style={{ background: 'var(--border-accent)' }}></div>
                <span style={{ color: 'var(--text-secondary)' }}>Accent</span>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-semibold" style={{ color: 'var(--text-primary)' }}>
            Quick Theme Test
          </h2>
          <div className="flex gap-4 flex-wrap">
            {['dawn', 'zenith', 'dusk', 'midnight', 'aurora', 'monochrome'].map((theme) => (
              <button
                key={theme}
                onClick={() => changeTheme(theme)}
                className={`capitalize ${
                  currentTheme === theme ? 'ds-button-primary' : 'ds-button-ghost'
                }`}
              >
                {theme}
              </button>
            ))}
          </div>
        </div>
      </div>

      <ThemeSwitcher
        isOpen={showThemeSwitcher}
        onClose={() => setShowThemeSwitcher(false)}
        currentTheme={currentTheme}
        onThemeChange={changeTheme}
      />
    </div>
  );
} 