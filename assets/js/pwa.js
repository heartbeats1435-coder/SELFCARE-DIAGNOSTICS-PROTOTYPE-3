/**
 * SELFCARE DIAGNOSTICS - PWA & Offline Engine
 * File: assets/js/pwa.js
 * Production Mode: TRUE
 */

class PwaService {
  constructor() {
    this.deferredPrompt = null;
    this.isInstalled = false;
    this.swRegistration = null;

    this.init();
  }

  /**
   * Initialize Service Worker and PWA event listeners
   */
  init() {
    this.registerServiceWorker();
    this.setupInstallPrompt();
    this.setupNetworkMonitoring();
  }

  /**
   * Register root Service Worker
   */
  async registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/service-worker.js', {
          scope: '/'
        });
        this.swRegistration = registration;
        console.log('[PWA] ServiceWorker registered with scope:', registration.scope);

        // Check for worker updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                this.notifyUpdateAvailable();
              }
            });
          }
        });
      } catch (error) {
        console.warn('[PWA] ServiceWorker registration failed:', error);
      }
    }
  }

  /**
   * Capture deferred install prompt for custom PWA UI triggers
   */
  setupInstallPrompt() {
    window.addEventListener('beforeinstallprompt', (e) => {
      // Prevent automatic browser banner
      e.preventDefault();
      this.deferredPrompt = e;
      
      // Dispatch custom event to activate "Install App" UI buttons
      const installEvent = new CustomEvent('sc_pwa_installable');
      window.dispatchEvent(installEvent);
    });

    window.addEventListener('appinstalled', () => {
      this.isInstalled = true;
      this.deferredPrompt = null;
      console.log('[PWA] Application successfully installed');
      
      const installedEvent = new CustomEvent('sc_pwa_installed');
      window.dispatchEvent(installedEvent);
    });
  }

  /**
   * Monitor online/offline state transitions
   */
  setupNetworkMonitoring() {
    window.addEventListener('online', () => {
      this.showNetworkBanner(true);
      const onlineEvent = new CustomEvent('sc_network_change', { detail: { online: true } });
      window.dispatchEvent(onlineEvent);
    });

    window.addEventListener('offline', () => {
      this.showNetworkBanner(false);
      const offlineEvent = new CustomEvent('sc_network_change', { detail: { online: false } });
      window.dispatchEvent(offlineEvent);
    });
  }

  /**
   * Trigger native app install prompt from UI button click
   * @returns {Promise<boolean>}
   */
  async promptInstall() {
    if (!this.deferredPrompt) {
      return false;
    }

    this.deferredPrompt.prompt();
    const { outcome } = await this.deferredPrompt.userChoice;
    this.deferredPrompt = null;

    return outcome === 'accepted';
  }

  /**
   * Check if app can be installed right now
   * @returns {boolean}
   */
  canInstall() {
    return this.deferredPrompt !== null;
  }

  /**
   * Notify user when a new app version is ready
   */
  notifyUpdateAvailable() {
    const banner = document.createElement('div');
    banner.id = 'sc-update-banner';
    banner.style.cssText = `
      position: fixed;
      bottom: 20px;
      left: 50%;
      transform: translateX(-50%);
      background: #2563EB;
      color: #FFFFFF;
      padding: 12px 20px;
      border-radius: 9999px;
      font-size: 0.875rem;
      font-weight: 600;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.4);
      z-index: 999999;
      display: flex;
      align-items: center;
      gap: 12px;
    `;
    banner.innerHTML = `
      <span>A new version of Selfcare Diagnostics is available!</span>
      <button id="sc-reload-btn" style="background:#FFFFFF; color:#2563EB; border:none; padding:4px 12px; border-radius:9999px; font-weight:700; cursor:pointer;">Update</button>
    `;

    document.body.appendChild(banner);

    document.getElementById('sc-reload-btn')?.addEventListener('click', () => {
      if (this.swRegistration && this.swRegistration.waiting) {
        this.swRegistration.waiting.postMessage({ type: 'SKIP_WAITING' });
      }
      window.location.reload();
    });
  }

  /**
   * Display visual online/offline toast banner
   * @param {boolean} isOnline 
   */
  showNetworkBanner(isOnline) {
    const existing = document.getElementById('sc-network-banner');
    if (existing) existing.remove();

    const banner = document.createElement('div');
    banner.id = 'sc-network-banner';
    banner.style.cssText = `
      position: fixed;
      top: 10px;
      left: 50%;
      transform: translateX(-50%);
      background: ${isOnline ? '#10B981' : '#EF4444'};
      color: #FFFFFF;
      padding: 8px 16px;
      border-radius: 9999px;
      font-size: 0.8rem;
      font-weight: 600;
      box-shadow: 0 8px 20px rgba(0,0,0,0.3);
      z-index: 999999;
      transition: all 0.3s ease;
    `;
    banner.textContent = isOnline ? '✓ Internet connection restored' : '⚠ You are operating in offline mode';

    document.body.appendChild(banner);

    setTimeout(() => {
      banner.style.opacity = '0';
      setTimeout(() => banner.remove(), 300);
    }, 4000);
  }
}

// Global PWA Instance
if (typeof window !== 'undefined') {
  window.pwaService = new PwaService();
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = PwaService;
}
