/**
 * SELFCARE DIAGNOSTICS - Cart Engine
 * File: assets/js/cart.js
 * Production Mode: TRUE
 */

class CartService {
  constructor() {
    this.storageKey = (window.APP_CONFIG && window.APP_CONFIG.STORAGE_KEYS) 
      ? window.APP_CONFIG.STORAGE_KEYS.CART_ITEMS 
      : 'sc_cart_items';
    this.items = this.loadCart();
  }

  /**
   * Load cart from LocalStorage
   * @returns {Array} Array of cart items
   */
  loadCart() {
    try {
      const data = localStorage.getItem(this.storageKey);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('[CartService] Error reading local cart:', e);
      return [];
    }
  }

  /**
   * Save current cart to LocalStorage and trigger event broadcast
   */
  saveCart() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.items));
      this.broadcastChange();
    } catch (e) {
      console.error('[CartService] Error saving cart:', e);
    }
  }

  /**
   * Broadcast custom event to notify UI components (header badges, floating cart buttons)
   */
  broadcastChange() {
    const event = new CustomEvent('sc_cart_updated', {
      detail: {
        items: this.items,
        count: this.getItemCount(),
        total: this.getTotalPrice()
      }
    });
    window.dispatchEvent(event);
  }

  /**
   * Add a test or package to the cart
   * @param {Object} item - Test/Package object { id, name, price, type, fastTime }
   * @returns {boolean} True if added, false if already exists
   */
  addItem(item) {
    if (!item || !item.id) return false;

    // Avoid duplicate test entries in diagnostic booking
    const exists = this.items.some(existing => String(existing.id) === String(item.id));
    if (exists) {
      return false; // Item already in cart
    }

    const formattedItem = {
      id: String(item.id),
      name: item.name || item.title || 'Diagnostic Test',
      price: Number(item.price) || 0,
      type: item.type || 'TEST', // 'TEST' or 'PACKAGE'
      fastTime: item.fastTime || 'No Fasting Required',
      sampleType: item.sampleType || 'Blood'
    };

    this.items.push(formattedItem);
    this.saveCart();
    return true;
  }

  /**
   * Remove item from cart by ID
   * @param {string|number} itemId 
   */
  removeItem(itemId) {
    const initialLength = this.items.length;
    this.items = this.items.filter(item => String(item.id) !== String(itemId));
    
    if (this.items.length !== initialLength) {
      this.saveCart();
      return true;
    }
    return false;
  }

  /**
   * Check if specific test or package is in cart
   * @param {string|number} itemId 
   * @returns {boolean}
   */
  hasItem(itemId) {
    return this.items.some(item => String(item.id) !== String(itemId));
  }

  /**
   * Get all cart items
   * @returns {Array}
   */
  getItems() {
    return [...this.items];
  }

  /**
   * Get total item count in cart
   * @returns {number}
   */
  getItemCount() {
    return this.items.length;
  }

  /**
   * Calculate total monetary amount of items in cart
   * @returns {number}
   */
  getTotalPrice() {
    return this.items.reduce((sum, item) => sum + (Number(item.price) || 0), 0);
  }

  /**
   * Clear all items from cart
   */
  clearCart() {
    this.items = [];
    this.saveCart();
  }
}

// Global Cart Instance
if (typeof window !== 'undefined') {
  window.cartService = new CartService();
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = CartService;
}
