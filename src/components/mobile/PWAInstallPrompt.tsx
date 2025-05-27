'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, X, Smartphone, Monitor, Tablet } from 'lucide-react';

interface PWAInstallPromptProps {
  onInstall?: () => void;
  onDismiss?: () => void;
}

export const PWAInstallPrompt: React.FC<PWAInstallPromptProps> = ({
  onInstall,
  onDismiss,
}) => {
  const [showPrompt, setShowPrompt] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [deviceType, setDeviceType] = useState<'mobile' | 'tablet' | 'desktop'>('mobile');
  const [isStandalone, setIsStandalone] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);

  useEffect(() => {
    // Detect device type and platform
    const detectDevice = () => {
      const width = window.innerWidth;
      const userAgent = navigator.userAgent;
      
      if (width < 768) {
        setDeviceType('mobile');
      } else if (width < 1024) {
        setDeviceType('tablet');
      } else {
        setDeviceType('desktop');
      }
      
      setIsIOS(/iPad|iPhone|iPod/.test(userAgent));
      setIsAndroid(/Android/.test(userAgent));
      setIsStandalone(window.matchMedia('(display-mode: standalone)').matches);
    };

    detectDevice();
    window.addEventListener('resize', detectDevice);

    // Listen for PWA install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      
      // Don't show if already installed or dismissed recently
      const dismissed = localStorage.getItem('pwa-install-dismissed');
      const dismissedTime = dismissed ? parseInt(dismissed) : 0;
      const daysSinceDismissed = (Date.now() - dismissedTime) / (1000 * 60 * 60 * 24);
      
      if (!isStandalone && daysSinceDismissed > 7) {
        setShowPrompt(true);
      }
    };

    // Listen for app installed
    const handleAppInstalled = () => {
      setShowPrompt(false);
      setDeferredPrompt(null);
      localStorage.removeItem('pwa-install-dismissed');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('resize', detectDevice);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [isStandalone]);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        console.log('User accepted the install prompt');
        onInstall?.();
      }
      
      setDeferredPrompt(null);
      setShowPrompt(false);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('pwa-install-dismissed', Date.now().toString());
    onDismiss?.();
  };

  const getDeviceIcon = () => {
    switch (deviceType) {
      case 'mobile':
        return <Smartphone size={24} className="text-blue-500" />;
      case 'tablet':
        return <Tablet size={24} className="text-blue-500" />;
      default:
        return <Monitor size={24} className="text-blue-500" />;
    }
  };

  const getInstallInstructions = () => {
    if (isIOS) {
      return {
        title: 'Install Trello Clone',
        description: 'Add this app to your home screen for quick access',
        steps: [
          'Tap the Share button in Safari',
          'Scroll down and tap "Add to Home Screen"',
          'Tap "Add" to install the app',
        ],
      };
    }
    
    if (isAndroid) {
      return {
        title: 'Install Trello Clone',
        description: 'Get the full app experience with offline access',
        steps: [
          'Tap "Install" below',
          'Confirm installation in the popup',
          'Find the app on your home screen',
        ],
      };
    }
    
    return {
      title: 'Install Trello Clone',
      description: 'Install the app for a better experience',
      steps: [
        'Click "Install" below',
        'Confirm installation in your browser',
        'Access the app from your desktop',
      ],
    };
  };

  const instructions = getInstallInstructions();

  if (!showPrompt || isStandalone) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end sm:items-center justify-center p-4"
      >
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md mx-4 overflow-hidden"
        >
          {/* Header */}
          <div className="relative p-6 pb-4">
            <button
              onClick={handleDismiss}
              className="absolute top-4 right-4 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <X size={20} className="text-gray-500 dark:text-gray-400" />
            </button>
            
            <div className="flex items-center space-x-3 mb-4">
              {getDeviceIcon()}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {instructions.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {instructions.description}
                </p>
              </div>
            </div>
          </div>

          {/* Features */}
          <div className="px-6 pb-4">
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <span className="text-2xl">⚡</span>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400">Fast Loading</p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <span className="text-2xl">📱</span>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400">Native Feel</p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <span className="text-2xl">🔄</span>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400">Offline Sync</p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <span className="text-2xl">🔔</span>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400">Push Notifications</p>
              </div>
            </div>
          </div>

          {/* Instructions for iOS */}
          {isIOS && (
            <div className="px-6 pb-4">
              <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                How to install:
              </h4>
              <ol className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                {instructions.steps.map((step, index) => (
                  <li key={index} className="flex items-start">
                    <span className="flex-shrink-0 w-5 h-5 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 rounded-full text-xs flex items-center justify-center mr-2 mt-0.5">
                      {index + 1}
                    </span>
                    {step}
                  </li>
                ))}
              </ol>
            </div>
          )}

          {/* Actions */}
          <div className="px-6 pb-6">
            <div className="flex space-x-3">
              {!isIOS && deferredPrompt && (
                <button
                  onClick={handleInstall}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg 
                           font-medium transition-colors flex items-center justify-center space-x-2"
                >
                  <Download size={20} />
                  <span>Install App</span>
                </button>
              )}
              
              <button
                onClick={handleDismiss}
                className={`${!isIOS && deferredPrompt ? 'flex-shrink-0' : 'flex-1'} 
                          border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 
                          px-4 py-3 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-700 
                          transition-colors`}
              >
                {isIOS ? 'Got it' : 'Maybe later'}
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// Hook for PWA install state
export const usePWAInstall = () => {
  const [canInstall, setCanInstall] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    // Check if already installed
    setIsInstalled(window.matchMedia('(display-mode: standalone)').matches);

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setCanInstall(true);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setCanInstall(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const install = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        setCanInstall(false);
        setDeferredPrompt(null);
      }
      
      return outcome === 'accepted';
    }
    return false;
  };

  return {
    canInstall,
    isInstalled,
    install,
  };
}; 