/**
 * SELFCARE DIAGNOSTICS - Core Configuration Engine
 * File: assets/js/config.js
 * Production Mode: TRUE
 */

const APP_CONFIG = Object.freeze({
  APP_NAME: 'SELFCARE DIAGNOSTICS',
  APP_SLOGAN: 'Premium Diagnostics & Health Testing At Your Doorstep',
  VERSION: '1.0.0',
  IS_PRODUCTION: true,

  // Backend Integration API (Google Apps Script Web App Endpoint)
  API_BASE_URL: 'https://script.google.com/macros/s/AKfycbxwge-ZUFkcShcUfFkgDfWGMoq6rOp8FUchyMVCKnh_GAxk-cavHbMkQMEB4V4-KMWH/exec',

  // Business Details
  BUSINESS: Object.freeze({
    NAME: 'SELFCARE DIAGNOSTICS',
    PHONE: '7010174890',
    WHATSAPP_NUMBER: '7010174890',
    WHATSAPP_URL: 'https://wa.me/message/3ZJWAPWYOS3AG1',
    UPI_ID: '0798545a0252206.bqr@kotak',
    PAYEE_NAME: 'SELFCARE DIAGNOSTICS',
    CURRENCY_SYMBOL: '₹'
  }),

  // User Roles
  ROLES: Object.freeze({
    CUSTOMER: 'CUSTOMER',
    ADMIN: 'ADMIN',
    TECHNICIAN: 'TECHNICIAN'
  }),

  // Local Storage & Session Keys
  STORAGE_KEYS: Object.freeze({
    AUTH_TOKEN: 'sc_auth_token',
    USER_DATA: 'sc_user_data',
    CART_ITEMS: 'sc_cart_items',
    BOOKING_DATA: 'sc_pending_booking',
    THEME_MODE: 'sc_theme_mode',
    NOTIFICATIONS: 'sc_notifications',
    AI_HISTORY: 'sc_ai_chat_history'
  }),

  // Booking & Report Status Constants
  BOOKING_STATUS: Object.freeze({
    PENDING: 'PENDING',
    CONFIRMED: 'CONFIRMED',
    TECHNICIAN_ASSIGNED: 'TECHNICIAN_ASSIGNED',
    SAMPLE_COLLECTED: 'SAMPLE_COLLECTED',
    PROCESSING: 'PROCESSING',
    COMPLETED: 'COMPLETED',
    CANCELLED: 'CANCELLED'
  }),

  // HTTP Response Codes
  HTTP_STATUS: Object.freeze({
    OK: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    SERVER_ERROR: 500
  }),

  // UI Colors & Visual System Configuration
  THEME: Object.freeze({
    PRIMARY_BG: '#0F172A',
    ACCENT_BLUE: '#2563EB',
    ACCENT_CYAN: '#06B6D4',
    SUCCESS: '#10B981',
    WARNING: '#F59E0B',
    DANGER: '#EF4444'
  }),

  // PWA Cache Keys
  CACHE: Object.freeze({
    STATIC_NAME: 'sc-static-v1',
    DYNAMIC_NAME: 'sc-dynamic-v1'
  })
});

// Make available globally across browser scripts
if (typeof window !== 'undefined') {
  window.APP_CONFIG = APP_CONFIG;
}

// Module export fallback for modular loaders
if (typeof module !== 'undefined' && module.exports) {
  module.exports = APP_CONFIG;
}
