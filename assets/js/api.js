/**
 * SELFCARE DIAGNOSTICS - API Engine
 * File: assets/js/api.js
 * Production Mode: TRUE
 */

class ApiService {
  constructor() {
    this.baseUrl = window.APP_CONFIG ? window.APP_CONFIG.API_BASE_URL : '';
    this.timeoutLimit = 20000; // 20 seconds request timeout
  }

  /**
   * Core HTTP Request Handler optimized for Google Apps Script Web App
   * @param {string} action - Backend action / route name
   * @param {Object} payload - Object containing query params or POST body data
   * @param {string} method - 'GET' or 'POST'
   * @returns {Promise<Object>} Response object from backend
   */
  async request(action, payload = {}, method = 'POST') {
    if (!this.baseUrl) {
      if (window.APP_CONFIG && window.APP_CONFIG.API_BASE_URL) {
        this.baseUrl = window.APP_CONFIG.API_BASE_URL;
      } else {
        return { success: false, message: 'API Base URL is not configured.' };
      }
    }

    if (!navigator.onLine) {
      return {
        success: false,
        message: 'No internet connection. Please check your network and try again.',
        isOffline: true
      };
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeoutLimit);

    try {
      let url = this.baseUrl;
      let options = {
        method: method,
        redirect: 'follow', // Required for Google Apps Script 302 redirects
        signal: controller.signal
      };

      if (method === 'GET') {
        const queryParams = new URLSearchParams({ action, ...payload }).toString();
        url += `?${queryParams}`;
      } else {
        // Google Apps Script handles POST requests cleanly with text/plain body parsing
        const postData = {
          action: action,
          ...payload,
          timestamp: new Date().toISOString()
        };

        options.headers = {
          'Content-Type': 'text/plain;charset=utf-8'
        };
        options.body = JSON.stringify(postData);
      }

      const response = await fetch(url, options);
      clearTimeout(timer);

      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
      }

      const responseText = await response.text();
      let data;

      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.warn('API Response was not valid JSON:', responseText);
        // Fallback if Apps Script returns plain text confirmation
        data = { success: true, message: responseText };
      }

      return data;
    } catch (error) {
      clearTimeout(timer);
      console.error(`[API Error] Action '${action}' failed:`, error);

      if (error.name === 'AbortError') {
        return { success: false, message: 'Request timed out. Please try again.' };
      }

      return {
        success: false,
        message: error.message || 'An unexpected network error occurred.'
      };
    }
  }

  // ==========================================
  // AUTHENTICATION ENDPOINTS
  // ==========================================

  async login(email, password) {
    return await this.request('login', { email, password });
  }

  async signup(userData) {
    return await this.request('signup', { userData });
  }

  async forgotPassword(email) {
    return await this.request('forgotPassword', { email });
  }

  async resetPassword(token, newPassword) {
    return await this.request('resetPassword', { token, newPassword });
  }

  // ==========================================
  // DIAGNOSTIC TESTS & PACKAGES
  // ==========================================

  async getTests() {
    return await this.request('getTests', {}, 'GET');
  }

  async getPackages() {
    return await this.request('getPackages', {}, 'GET');
  }

  async searchCatalog(query) {
    return await this.request('searchCatalog', { query }, 'GET');
  }

  // ==========================================
  // BOOKINGS & CART
  // ==========================================

  async createBooking(bookingDetails) {
    return await this.request('createBooking', { bookingDetails });
  }

  async getUserBookings(userId) {
    return await this.request('getUserBookings', { userId }, 'GET');
  }

  async getBookingDetails(bookingId) {
    return await this.request('getBookingDetails', { bookingId }, 'GET');
  }

  async cancelBooking(bookingId, reason) {
    return await this.request('cancelBooking', { bookingId, reason });
  }

  // ==========================================
  // PAYMENTS & RECEIPTS
  // ==========================================

  async submitPaymentReceipt(bookingId, receiptData) {
    return await this.request('submitPaymentReceipt', {
      bookingId,
      transactionId: receiptData.transactionId,
      receiptImageBase64: receiptData.fileBase64,
      fileName: receiptData.fileName
    });
  }

  // ==========================================
  // LAB REPORTS & TRACKING
  // ==========================================

  async getUserReports(userId) {
    return await this.request('getUserReports', { userId }, 'GET');
  }

  async trackBookingStatus(bookingId) {
    return await this.request('trackBookingStatus', { bookingId }, 'GET');
  }

  // ==========================================
  // USER PROFILE & NOTIFICATIONS
  // ==========================================

  async getUserProfile(userId) {
    return await this.request('getUserProfile', { userId }, 'GET');
  }

  async updateUserProfile(userId, profileData) {
    return await this.request('updateUserProfile', { userId, profileData });
  }

  async getNotifications(userId) {
    return await this.request('getNotifications', { userId }, 'GET');
  }

  // ==========================================
  // AI ASSISTANT ENDPOINT
  // ==========================================

  async queryAiAssistant(userPrompt, conversationHistory = []) {
    return await this.request('queryAiAssistant', {
      prompt: userPrompt,
      history: conversationHistory
    });
  }

  // ==========================================
  // TECHNICIAN DASHBOARD ENDPOINTS
  // ==========================================

  async getTechnicianAssignedTasks(technicianId) {
    return await this.request('getTechnicianAssignedTasks', { technicianId }, 'GET');
  }

  async updateSampleCollectionStatus(bookingId, status, notes = '') {
    return await this.request('updateSampleCollectionStatus', { bookingId, status, notes });
  }

  // ==========================================
  // ADMIN DASHBOARD ENDPOINTS
  // ==========================================

  async adminGetAllBookings() {
    return await this.request('adminGetAllBookings', {}, 'GET');
  }

  async adminUpdateBookingStatus(bookingId, newStatus, technicianId = '') {
    return await this.request('adminUpdateBookingStatus', { bookingId, newStatus, technicianId });
  }

  async adminUploadReport(bookingId, reportFileBase64, fileName) {
    return await this.request('adminUploadReport', { bookingId, reportFileBase64, fileName });
  }
}

// Global API Instance
if (typeof window !== 'undefined') {
  window.apiService = new ApiService();
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = ApiService;
}
