'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ThemeSwitcher, useTheme } from '@/components/theme/ThemeSwitcher';
import { 
  Palette, 
  Sun, 
  Moon, 
  Star, 
  Zap, 
  Heart, 
  Settings, 
  Download,
  Upload,
  Play,
  Pause,
  SkipForward,
  Volume2,
  Wifi,
  Battery,
  Signal,
  Bell,
  Search,
  Filter,
  MoreHorizontal,
  Plus,
  Edit,
  Trash2,
  Share,
  Bookmark,
  MessageCircle,
  ThumbsUp,
  Eye,
  Calendar,
  Clock,
  MapPin,
  User,
  Mail,
  Phone,
  Globe,
  Camera,
  Image,
  Video,
  Music,
  File,
  Folder,
  Archive,
  Tag,
  Flag,
  Award,
  Target,
  TrendingUp,
  BarChart3,
  PieChart,
  Activity,
  Layers,
  Grid,
  List,
  Layout,
  Sidebar,
  Menu,
  X,
  Check,
  AlertCircle,
  Info,
  HelpCircle,
  Shield,
  Lock,
  Unlock,
  Key,
  Fingerprint,
  Smartphone,
  Tablet,
  Monitor,
  Laptop,
  Headphones,
  Speaker,
  Mic,
  MicOff,
  VideoOff,
  Airplay,
  Cast,
  Bluetooth,
  Usb,
  HardDrive,
  Server,
  Database,
  Cloud,
  CloudDownload,
  CloudUpload,
  RefreshCw,
  RotateCcw,
  RotateCw,
  Maximize,
  Minimize,
  Move,
  Copy,
  Scissors,
  Clipboard,
  Link,
  ExternalLink,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsUp,
  ChevronsDown,
  ChevronsLeft,
  ChevronsRight
} from 'lucide-react';

export default function DesignSystemPlayground() {
  const { currentTheme, changeTheme, themes } = useTheme();
  const [showThemeSwitcher, setShowThemeSwitcher] = useState(false);
  const [activeSection, setActiveSection] = useState('overview');
  const [formData, setFormData] = useState({
    name: 'John Doe',
    email: 'john@example.com',
    message: 'This is a sample message to demonstrate form styling.',
    subscribe: true,
    plan: 'pro',
    notifications: 'all'
  });

  const sections = [
    { id: 'overview', name: 'Overview', icon: <Eye className="h-4 w-4" /> },
    { id: 'colors', name: 'Colors', icon: <Palette className="h-4 w-4" /> },
    { id: 'typography', name: 'Typography', icon: <Type className="h-4 w-4" /> },
    { id: 'buttons', name: 'Buttons', icon: <Play className="h-4 w-4" /> },
    { id: 'forms', name: 'Forms', icon: <Edit className="h-4 w-4" /> },
    { id: 'cards', name: 'Cards', icon: <Layout className="h-4 w-4" /> },
    { id: 'navigation', name: 'Navigation', icon: <Menu className="h-4 w-4" /> },
    { id: 'feedback', name: 'Feedback', icon: <Bell className="h-4 w-4" /> },
    { id: 'data', name: 'Data Display', icon: <BarChart3 className="h-4 w-4" /> },
    { id: 'responsive', name: 'Responsive', icon: <Smartphone className="h-4 w-4" /> }
  ];

  const sampleData = [
    { name: 'Tasks Completed', value: 85, color: 'var(--color-success)' },
    { name: 'In Progress', value: 45, color: 'var(--gradient-primary)' },
    { name: 'Pending Review', value: 23, color: 'var(--color-warning)' },
    { name: 'Blocked', value: 12, color: 'var(--color-error)' }
  ];

  const renderOverview = () => (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold gradient-text mb-4">
          Unified Design System
        </h1>
        <p className="text-xl opacity-75 max-w-3xl mx-auto">
          A comprehensive, adaptive design system with 6 carefully crafted themes, 
          complete mobile-web parity, and seamless responsive behavior.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {themes.map((theme) => (
          <motion.div
            key={theme.id}
            className="card cursor-pointer"
            onClick={() => changeTheme(theme.id)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="card-header">
              <div className="flex items-center gap-3">
                {theme.icon}
                <h3 className="font-semibold">{theme.name}</h3>
                {currentTheme === theme.id && (
                  <div className="ml-auto p-1 bg-green-500 rounded-full">
                    <Check className="h-3 w-3 text-white" />
                  </div>
                )}
              </div>
            </div>
            <div className="card-body">
              <div
                className="h-16 rounded-lg mb-3"
                style={{ background: theme.gradient }}
              />
              <p className="text-sm opacity-75">{theme.description}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-semibold">Design Principles</h3>
        </div>
        <div className="card-body">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <Zap className="h-4 w-4" />
                Adaptive Consistency
              </h4>
              <p className="text-sm opacity-75">
                Components gracefully scale between mobile and web contexts while maintaining their essential character.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <Target className="h-4 w-4" />
                Feature Parity
              </h4>
              <p className="text-sm opacity-75">
                Complete feature parity between mobile and web platforms with unified interaction patterns.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <Palette className="h-4 w-4" />
                Dynamic Theming
              </h4>
              <p className="text-sm opacity-75">
                Switchable color palettes with optimal contrast ratios and accessibility standards.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <Activity className="h-4 w-4" />
                Performance First
              </h4>
              <p className="text-sm opacity-75">
                Optimized gradients, smooth animations, and efficient rendering across all devices.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderColors = () => (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold mb-4">Color System</h2>
        <p className="opacity-75 mb-6">
          Dynamic color architecture with interchangeable palettes maintaining optimal contrast ratios.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="card">
          <div className="card-header">
            <h3 className="font-semibold">Primary Gradients</h3>
          </div>
          <div className="card-body space-y-4">
            <div>
              <div className="h-16 rounded-lg mb-2" style={{ background: 'var(--gradient-primary)' }} />
              <p className="text-sm font-medium">Primary Gradient</p>
              <p className="text-xs opacity-75">Hero elements and CTAs</p>
            </div>
            <div>
              <div className="h-16 rounded-lg mb-2" style={{ background: 'var(--gradient-secondary)' }} />
              <p className="text-sm font-medium">Secondary Gradient</p>
              <p className="text-xs opacity-75">Supporting UI elements</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="font-semibold">Semantic Colors</h3>
          </div>
          <div className="card-body space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="h-12 rounded-lg mb-2" style={{ backgroundColor: 'var(--color-success)' }} />
                <p className="text-sm font-medium">Success</p>
              </div>
              <div>
                <div className="h-12 rounded-lg mb-2" style={{ backgroundColor: 'var(--color-warning)' }} />
                <p className="text-sm font-medium">Warning</p>
              </div>
              <div>
                <div className="h-12 rounded-lg mb-2" style={{ backgroundColor: 'var(--color-error)' }} />
                <p className="text-sm font-medium">Error</p>
              </div>
              <div>
                <div className="h-12 rounded-lg mb-2" style={{ backgroundColor: 'var(--color-info)' }} />
                <p className="text-sm font-medium">Info</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3 className="font-semibold">Neutral Scale</h3>
        </div>
        <div className="card-body">
          <div className="grid grid-cols-5 md:grid-cols-10 gap-2">
            {[50, 100, 200, 300, 400, 500, 600, 700, 800, 900].map((shade) => (
              <div key={shade} className="text-center">
                <div 
                  className="h-16 rounded-lg mb-2" 
                  style={{ backgroundColor: `var(--color-gray-${shade})` }} 
                />
                <p className="text-xs">{shade}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderButtons = () => (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold mb-4">Button System</h2>
        <p className="opacity-75 mb-6">
          Adaptive buttons with consistent touch targets and smooth interactions.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="card">
          <div className="card-header">
            <h3 className="font-semibold">Button Variants</h3>
          </div>
          <div className="card-body space-y-4">
            <div className="space-y-3">
              <button className="btn btn-primary">
                <Play className="h-4 w-4" />
                Primary Button
              </button>
              <button className="btn btn-secondary">
                <Settings className="h-4 w-4" />
                Secondary Button
              </button>
              <button className="btn btn-ghost">
                <Download className="h-4 w-4" />
                Ghost Button
              </button>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="font-semibold">Button Sizes</h3>
          </div>
          <div className="card-body space-y-4">
            <div className="space-y-3">
              <button className="btn btn-primary btn-sm">
                <Plus className="h-3 w-3" />
                Small
              </button>
              <button className="btn btn-primary">
                <Star className="h-4 w-4" />
                Default
              </button>
              <button className="btn btn-primary btn-lg">
                <Heart className="h-5 w-5" />
                Large
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3 className="font-semibold">Interactive States</h3>
        </div>
        <div className="card-body">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button className="btn btn-primary">Normal</button>
            <button className="btn btn-primary" disabled>Disabled</button>
            <button className="btn btn-primary animate-pulse">Loading</button>
            <button className="btn btn-primary">
              <Check className="h-4 w-4" />
              Success
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderForms = () => (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold mb-4">Form System</h2>
        <p className="opacity-75 mb-6">
          Consistent form inputs with validation states and accessibility features.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="card">
          <div className="card-header">
            <h3 className="font-semibold">Input Types</h3>
          </div>
          <div className="card-body space-y-4">
            <div className="form-group">
              <label className="form-label">Text Input</label>
              <input 
                type="text" 
                className="form-input" 
                placeholder="Enter your name"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">Email Input</label>
              <input 
                type="email" 
                className="form-input" 
                placeholder="Enter your email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">Textarea</label>
              <textarea 
                className="form-input" 
                rows={3}
                placeholder="Enter your message"
                value={formData.message}
                onChange={(e) => setFormData({...formData, message: e.target.value})}
              />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="font-semibold">Selection Controls</h3>
          </div>
          <div className="card-body space-y-4">
            <div className="form-group">
              <label className="form-label">Select Dropdown</label>
              <select 
                className="form-input"
                value={formData.plan}
                onChange={(e) => setFormData({...formData, plan: e.target.value})}
              >
                <option value="free">Free Plan</option>
                <option value="pro">Pro Plan</option>
                <option value="enterprise">Enterprise Plan</option>
              </select>
            </div>
            
            <div className="form-group">
              <label className="form-label">Radio Buttons</label>
              <div className="space-y-2">
                {['all', 'important', 'none'].map((option) => (
                  <label key={option} className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="radio" 
                      name="notifications"
                      value={option}
                      checked={formData.notifications === option}
                      onChange={(e) => setFormData({...formData, notifications: e.target.value})}
                      className="text-blue-500"
                    />
                    <span className="capitalize">{option} notifications</span>
                  </label>
                ))}
              </div>
            </div>
            
            <div className="form-group">
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="checkbox"
                  checked={formData.subscribe}
                  onChange={(e) => setFormData({...formData, subscribe: e.target.checked})}
                  className="text-blue-500"
                />
                <span>Subscribe to newsletter</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3 className="font-semibold">Validation States</h3>
        </div>
        <div className="card-body">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="form-group">
              <label className="form-label">Valid Input</label>
              <input type="text" className="form-input success" value="Valid input" readOnly />
            </div>
            <div className="form-group">
              <label className="form-label">Error Input</label>
              <input type="text" className="form-input error" value="Invalid input" readOnly />
            </div>
            <div className="form-group">
              <label className="form-label">Normal Input</label>
              <input type="text" className="form-input" placeholder="Normal state" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderCards = () => (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold mb-4">Card System</h2>
        <p className="opacity-75 mb-6">
          Flexible card components with consistent elevation and interactive states.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="card">
          <div className="card-header">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg" style={{ background: 'var(--gradient-primary)' }}>
                <Star className="h-4 w-4 text-white" />
              </div>
              <div>
                <h3 className="font-semibold">Basic Card</h3>
                <p className="text-sm opacity-75">Simple card layout</p>
              </div>
            </div>
          </div>
          <div className="card-body">
            <p className="text-sm">
              This is a basic card with header and body sections. Perfect for displaying content with clear hierarchy.
            </p>
          </div>
          <div className="card-footer">
            <div className="flex justify-between items-center">
              <span className="text-sm opacity-75">Updated 2 hours ago</span>
              <button className="btn btn-sm btn-ghost">
                <MoreHorizontal className="h-3 w-3" />
              </button>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full" style={{ background: 'var(--gradient-secondary)' }} />
              <div>
                <h3 className="font-semibold">User Profile</h3>
                <p className="text-sm opacity-75">@johndoe</p>
              </div>
            </div>
            <p className="text-sm mb-4">
              "The new design system is absolutely fantastic! The adaptive consistency across devices is impressive."
            </p>
            <div className="flex items-center gap-4 text-sm opacity-75">
              <button className="flex items-center gap-1 hover:opacity-100">
                <ThumbsUp className="h-3 w-3" />
                <span>24</span>
              </button>
              <button className="flex items-center gap-1 hover:opacity-100">
                <MessageCircle className="h-3 w-3" />
                <span>8</span>
              </button>
              <button className="flex items-center gap-1 hover:opacity-100">
                <Share className="h-3 w-3" />
                <span>Share</span>
              </button>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="font-semibold">Statistics</h3>
          </div>
          <div className="card-body">
            <div className="space-y-4">
              {sampleData.map((item, index) => (
                <div key={index}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium">{item.name}</span>
                    <span className="text-sm">{item.value}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="h-2 rounded-full transition-all duration-500"
                      style={{ 
                        width: `${item.value}%`,
                        background: item.color
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderNavigation = () => (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold mb-4">Navigation System</h2>
        <p className="opacity-75 mb-6">
          Responsive navigation patterns that transform seamlessly across breakpoints.
        </p>
      </div>

      <div className="card">
        <div className="card-header">
          <h3 className="font-semibold">Top Navigation</h3>
        </div>
        <div className="card-body">
          <nav className="nav">
            <div className="nav-brand">Brand</div>
            <div className="nav-menu">
              <a href="#" className="nav-item active">Home</a>
              <a href="#" className="nav-item">Products</a>
              <a href="#" className="nav-item">About</a>
              <a href="#" className="nav-item">Contact</a>
            </div>
          </nav>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="card">
          <div className="card-header">
            <h3 className="font-semibold">Sidebar Navigation</h3>
          </div>
          <div className="card-body">
            <div className="space-y-2">
              {[
                { icon: <Layout className="h-4 w-4" />, label: 'Dashboard', active: true },
                { icon: <BarChart3 className="h-4 w-4" />, label: 'Analytics' },
                { icon: <User className="h-4 w-4" />, label: 'Profile' },
                { icon: <Settings className="h-4 w-4" />, label: 'Settings' },
                { icon: <HelpCircle className="h-4 w-4" />, label: 'Help' }
              ].map((item, index) => (
                <a 
                  key={index}
                  href="#" 
                  className={`nav-item w-full justify-start ${item.active ? 'active' : ''}`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="font-semibold">Tab Navigation</h3>
          </div>
          <div className="card-body">
            <div className="flex border-b border-gray-200 mb-4">
              {['Overview', 'Details', 'Settings'].map((tab, index) => (
                <button
                  key={tab}
                  className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                    index === 0 
                      ? 'border-blue-500 text-blue-600' 
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
            <div className="text-sm opacity-75">
              Tab content would appear here. This demonstrates how tabs can be styled consistently across the design system.
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSection = () => {
    switch (activeSection) {
      case 'overview': return renderOverview();
      case 'colors': return renderColors();
      case 'buttons': return renderButtons();
      case 'forms': return renderForms();
      case 'cards': return renderCards();
      case 'navigation': return renderNavigation();
      default: return renderOverview();
    }
  };

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-secondary)' }}>
      {/* Header */}
      <header className="nav">
        <div className="nav-brand">Design System</div>
        <div className="nav-menu">
          <button
            onClick={() => setShowThemeSwitcher(true)}
            className="btn btn-ghost btn-sm"
          >
            <Palette className="h-4 w-4" />
            <span>Themes</span>
          </button>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 min-h-screen border-r" style={{ borderColor: 'var(--border-primary)', background: 'var(--bg-surface)' }}>
          <div className="p-6">
            <h2 className="font-semibold mb-4">Sections</h2>
            <nav className="space-y-1">
              {sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`nav-item w-full justify-start ${
                    activeSection === section.id ? 'active' : ''
                  }`}
                >
                  {section.icon}
                  <span>{section.name}</span>
                </button>
              ))}
            </nav>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8">
          <motion.div
            key={activeSection}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {renderSection()}
          </motion.div>
        </main>
      </div>

      {/* Theme Switcher */}
      <ThemeSwitcher
        isOpen={showThemeSwitcher}
        onClose={() => setShowThemeSwitcher(false)}
        currentTheme={currentTheme}
        onThemeChange={changeTheme}
      />
    </div>
  );
}

// Type component for typography section
const Type = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="4,7 4,4 20,4 20,7" />
    <line x1="9" y1="20" x2="15" y2="20" />
    <line x1="12" y1="4" x2="12" y2="20" />
  </svg>
); 