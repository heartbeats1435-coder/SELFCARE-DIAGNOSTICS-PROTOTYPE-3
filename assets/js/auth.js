/**
 * SELFCARE DIAGNOSTICS - Authentication & Session Engine
 * File: assets/js/auth.js
 * Production Mode: TRUE
 */

class AuthService {
  constructor() {
    this.storageKeys = window.APP_CONFIG ? window.APP_CONFIG.STORAGE_KEYS : {
      AUTH_TOKEN: 'sc_auth_token',
      USER_DATA: 'sc_user_data'
    };
    this.roles = window.APP_CONFIG ? window.APP_CONFIG.ROLES : {
      CUSTOMER: 'CUSTOMER',
      ADMIN: 'ADMIN',
      TECHNICIAN: 'TECHNICIAN'
    };
  }

  /**
   * Save user session data into localStorage
   * @param {Object} userData - Complete user profile object
   * @param {string} token - Authentication token or session string
   */
  saveSession(userData, token) {
    if (!userData) return false;
    try {
      localStorage.setItem(this.storageKeys.USER_DATA, JSON.stringify(userData));
      if (token) {
        localStorage.setItem(this.storageKeys.AUTH_TOKEN, token);
      } else if (userData.token) {
        localStorage.setItem(this.storageKeys.AUTH_TOKEN, userData.token);
      }
      return true;
    } catch (e) {
      console.error('[AuthService] Failed to save session:', e);
      return false;
    }
  }

  /**
   * Retrieve active session user details
   * @returns {Object|null}
   */
  getCurrentUser() {
    try {
      const data = localStorage.getItem(this.storageKeys.USER_DATA);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      console.error('[AuthService] Error reading user session:', e);
      return null;
    }
  }

  /**
   * Retrieve current auth token
   * @returns {string|null}
   */
  getToken() {
    return localStorage.getItem(this.storageKeys.AUTH_TOKEN) || null;
  }

  /**
   * Check if user is logged in
   * @returns {boolean}
   */
  isAuthenticated() {
    const user = this.getCurrentUser();
    return user !== null && typeof user === 'object';
  }

  /**
   * Get role of current logged in user
   * @returns {string}
   */
  getUserRole() {
    const user = this.getCurrentUser();
    return user && user.role ? user.role.toUpperCase() : this.roles.CUSTOMER;
  }

  /**
   * Check if user has specific permission role
   * @param {string} requiredRole 
   * @returns {boolean}
   */
  hasRole(requiredRole) {
    if (!this.isAuthenticated()) return false;
    return this.getUserRole() === requiredRole.toUpperCase();
  }

  /**
   * Authenticate User via API
   * @param {string} email 
   * @param {string} password 
   * @returns {Promise<Object>}
   */
  async login(email, password) {
    if (!email || !password) {
      return { success: false, message: 'Please provide both email and password.' };
    }

    if (!window.apiService) {
      return { success: false, message: 'API Service unavailable.' };
    }

    const response = await window.apiService.login(email, password);

    if (response && response.success && response.user) {
      this.saveSession(response.user, response.token || 'SC_SESSION_' + Date.now());
    }

    return response;
  }

  /**
   * Register new user profile via API
   * @param {Object} userData 
   * @returns {Promise<Object>}
   */
  async signup(userData) {
    if (!userData || !userData.email || !userData.password || !userData.fullName) {
      return { success: false, message: 'Please fill in all required registration fields.' };
    }

    if (!window.apiService) {
      return { success: false, message: 'API Service unavailable.' };
    }

    // Default role to CUSTOMER unless explicitly set
    userData.role = userData.role || this.roles.CUSTOMER;

    const response = await window.apiService.signup(userData);

    if (response && response.success && response.user) {
      this.saveSession(response.user, response.token || 'SC_SESSION_' + Date.now());
    }

    return response;
  }

  /**
   * Request password reset link / email
   * @param {string} email 
   * @returns {Promise<Object>}
   */
  async forgotPassword(email) {
    if (!email) {
      return { success: false, message: 'Please enter your registered email address.' };
    }

    if (!window.apiService) {
      return { success: false, message: 'API Service unavailable.' };
    }

    return await window.apiService.forgotPassword(email);
  }

  /**
   * Clear session and log out
   */
  logout(redirectUrl = 'login.html') {
    try {
      localStorage.removeItem(this.storageKeys.USER_DATA);
      localStorage.removeItem(this.storageKeys.AUTH_TOKEN);
      localStorage.removeItem('sc_cart_items');
    } catch (e) {
      console.error('[AuthService] Error clearing local session:', e);
    }

    if (redirectUrl) {
      window.location.href = redirectUrl;
    }
  }

  /**
   * Protect private routes by verifying session and role
   * @param {Array<string>} allowedRoles 
   */
  requireAuth(allowedRoles = []) {
    if (!this.isAuthenticated()) {
      window.location.href = 'login.html?redirect=' + encodeURIComponent(window.location.pathname);
      return false;
    }

    if (allowedRoles.length > 0) {
      const userRole = this.getUserRole();
      if (!allowedRoles.includes(userRole)) {
        // Redirect unauthorized access to respective dashboard
        if (userRole === this.roles.ADMIN) {
          window.location.href = 'dashboard-admin.html';
        } else if (userRole === this.roles.TECHNICIAN) {
          window.location.href = 'dashboard-technician.html';
        } else {
          window.location.href = 'dashboard-customer.html';
        }
        return false;
      }
    }

    return true;
  }
}

// Global Auth Instance
if (typeof window !== 'undefined') {
  window.authService = new AuthService();
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = AuthService;
}
