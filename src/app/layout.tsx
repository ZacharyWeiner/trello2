import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { NetworkStatus } from '@/components/mobile/NetworkStatus';
import { Inter } from 'next/font/google'
import '../styles/design-system.css'
import { Toaster } from 'react-hot-toast'
import { mediaContact } from '@/config/media'

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: "Trello Clone - Advanced Project Management",
  description: "A comprehensive, mobile-first project management solution with advanced voting, dependency tracking, and collaboration features.",
  keywords: ["trello", "project management", "kanban", "productivity", "collaboration"],
  authors: [{ name: "Trello Clone Team" }],
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  creator: "Trello Clone",
  publisher: "Trello Clone",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Trello Clone",
    startupImage: [
      {
        url: "/icons/apple-splash-2048-2732.png",
        media: "(device-width: 1024px) and (device-height: 1366px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)",
      },
      {
        url: "/icons/apple-splash-1668-2224.png",
        media: "(device-width: 834px) and (device-height: 1112px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)",
      },
      {
        url: "/icons/apple-splash-1536-2048.png",
        media: "(device-width: 768px) and (device-height: 1024px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)",
      },
      {
        url: "/icons/apple-splash-1125-2436.png",
        media: "(device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)",
      },
      {
        url: "/icons/apple-splash-1242-2208.png",
        media: "(device-width: 414px) and (device-height: 736px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)",
      },
      {
        url: "/icons/apple-splash-750-1334.png",
        media: "(device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)",
      },
      {
        url: "/icons/apple-splash-640-1136.png",
        media: "(device-width: 320px) and (device-height: 568px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)",
      },
    ],
  },
  icons: {
    icon: [
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    other: [
      {
        rel: "mask-icon",
        url: "/icons/safari-pinned-tab.svg",
        color: "#0079bf",
      },
    ],
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://trello-clone.app",
    siteName: "Trello Clone",
    title: "Trello Clone - Project Management",
    description: "A modern, mobile-first Trello clone with offline capabilities",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Trello Clone - Project Management",
      },
    ],
    contact: mediaContact.email ? { email: mediaContact.email } as any : undefined,
  },
  twitter: {
    card: "summary_large_image",
    title: "Trello Clone - Project Management",
    description: "A modern, mobile-first Trello clone with offline capabilities",
    images: ["/og-image.png"],
  },
  other: {
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "default",
    "msapplication-TileColor": "#0079bf",
    "msapplication-config": "/browserconfig.xml",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#0079bf" },
    { media: "(prefers-color-scheme: dark)", color: "#1e293b" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-theme="dawn" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Initialize theme before page load to prevent flash
              (function() {
                const savedTheme = localStorage.getItem('preferred-theme');
                const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                const defaultTheme = prefersDark ? 'midnight' : 'dawn';
                const theme = savedTheme || defaultTheme;
                document.documentElement.setAttribute('data-theme', theme);
              })();
            `,
          }}
        />
        {/* PWA Meta Tags */}
        <meta name="application-name" content="Trello Clone" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Trello Clone" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
        <meta name="msapplication-TileColor" content="#0079bf" />
        <meta name="msapplication-tap-highlight" content="no" />
        
        {/* Preconnect to external domains */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://images.unsplash.com" />
        
        {/* DNS Prefetch */}
        <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
        <link rel="dns-prefetch" href="https://fonts.gstatic.com" />
        
        {/* Favicon */}
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/icons/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
        
        {/* Manifest */}
        <link rel="manifest" href="/manifest.json" />
        
        {/* Microsoft Tiles */}
        <meta name="msapplication-square70x70logo" content="/icons/mstile-70x70.png" />
        <meta name="msapplication-square150x150logo" content="/icons/mstile-150x150.png" />
        <meta name="msapplication-wide310x150logo" content="/icons/mstile-310x150.png" />
        <meta name="msapplication-square310x310logo" content="/icons/mstile-310x310.png" />
        
        {/* Safari Pinned Tab */}
        <link rel="mask-icon" href="/icons/safari-pinned-tab.svg" color="#0079bf" />
        
        {/* Disable automatic phone number detection */}
        <meta name="format-detection" content="telephone=no, date=no, email=no, address=no" />
        
        {/* Prevent zoom on input focus (iOS) */}
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5, user-scalable=yes, viewport-fit=cover" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${inter.className} antialiased min-h-screen bg-gradient-to-br from-blue-50 to-purple-50`}
      >
        <ThemeProvider>
          <AuthProvider>
            {/* Network Status Indicator */}
            <NetworkStatus position="top" />
            
            {/* Main Content */}
            <div className="relative min-h-screen">
              {children}
            </div>
            
            {/* PWA Install Prompt */}
            <div id="pwa-install-prompt" className="hidden" />
            
            {/* Service Worker Registration */}
            <script
              dangerouslySetInnerHTML={{
                __html: `
                  if ('serviceWorker' in navigator) {
                    window.addEventListener('load', function() {
                      navigator.serviceWorker.register('/sw.js')
                        .then(function(registration) {
                          console.log('SW registered: ', registration);
                        })
                        .catch(function(registrationError) {
                          console.log('SW registration failed: ', registrationError);
                        });
                    });
                  }
                  
                  // PWA Install Prompt
                  let deferredPrompt;
                  window.addEventListener('beforeinstallprompt', (e) => {
                    e.preventDefault();
                    deferredPrompt = e;
                    
                    // Show install button
                    const installPrompt = document.getElementById('pwa-install-prompt');
                    if (installPrompt) {
                      installPrompt.classList.remove('hidden');
                    }
                  });
                  
                  // Handle install button click
                  function installPWA() {
                    if (deferredPrompt) {
                      deferredPrompt.prompt();
                      deferredPrompt.userChoice.then((choiceResult) => {
                        if (choiceResult.outcome === 'accepted') {
                          console.log('User accepted the install prompt');
                        }
                        deferredPrompt = null;
                      });
                    }
                  }
                  
                  // Hide install prompt when app is installed
                  window.addEventListener('appinstalled', (evt) => {
                    console.log('App was installed');
                    const installPrompt = document.getElementById('pwa-install-prompt');
                    if (installPrompt) {
                      installPrompt.classList.add('hidden');
                    }
                  });
                  
                  // Prevent zoom on double tap (iOS)
                  let lastTouchEnd = 0;
                  document.addEventListener('touchend', function (event) {
                    const now = (new Date()).getTime();
                    if (now - lastTouchEnd <= 300) {
                      event.preventDefault();
                    }
                    lastTouchEnd = now;
                  }, false);
                  
                  // Handle viewport changes for mobile browsers
                  function handleViewportChange() {
                    const vh = window.innerHeight * 0.01;
                    document.documentElement.style.setProperty('--vh', vh + 'px');
                  }
                  
                  window.addEventListener('resize', handleViewportChange);
                  window.addEventListener('orientationchange', handleViewportChange);
                  handleViewportChange();
                `,
              }}
            />
            <Toaster 
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: 'var(--bg-surface)',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border-primary)',
                  borderRadius: 'var(--radius-md)',
                  boxShadow: 'var(--shadow-2)',
                },
                success: {
                  iconTheme: {
                    primary: 'var(--color-success)',
                    secondary: 'var(--text-inverse)',
                  },
                },
                error: {
                  iconTheme: {
                    primary: 'var(--color-error)',
                    secondary: 'var(--text-inverse)',
                  },
                },
              }}
            />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
