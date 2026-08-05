/**
 * Search & Category Filter Controller
 * Selfcare Diagnostics Platform
 */
window.SearchFilter = {
  targetGridId: 'dynamicTestGrid',

  /**
   * Initializes input listeners and connects search UI to renderer
   * @param {string} gridContainerId - ID of target grid element
   */
  init: function(gridContainerId) {
    if (gridContainerId) this.targetGridId = gridContainerId;
    this.bindEvents();
  },

  bindEvents: function() {
    var self = this;

    // 1. Search Input Listener (Instant Typing Search)
    var searchInput = document.getElementById('heroSearchInput');
    if (searchInput) {
      searchInput.addEventListener('input', function(e) {
        self.filterTests(e.target.value);
      });
    }

    // 2. Search Button Listener
    var searchBtn = document.getElementById('heroSearchBtn');
    if (searchBtn && searchInput) {
      searchBtn.addEventListener('click', function() {
        self.filterTests(searchInput.value);
      });
    }

    // 3. Quick Filter Tags Listener
    var filterPills = document.querySelectorAll('.hero-section .glass-pill[href*="tests.html?q="]');
    filterPills.forEach(function(pill) {
      pill.addEventListener('click', function(e) {
        e.preventDefault();
        var href = this.getAttribute('href') || '';
        var queryMatch = href.split('?q=');
        if (queryMatch.length > 1) {
          var query = decodeURIComponent(queryMatch[1].replace(/\+/g, ' '));
          if (searchInput) searchInput.value = query;
          self.filterTests(query);
        }
      });
    });
  },

  /**
   * Filters TESTS_DATA based on query string
   * @param {string} query 
   */
  filterTests: function(query) {
    if (!window.TESTS_DATA || !window.TestRenderer) return;

    var q = (query || '').toLowerCase().trim();

    if (!q) {
      window.TestRenderer.renderGrid(this.targetGridId, window.TESTS_DATA);
      return;
    }

    var filtered = window.TESTS_DATA.filter(function(test) {
      var nameMatch = (test.name || '').toLowerCase().indexOf(q) !== -1;
      var catMatch = (test.category || '').toLowerCase().indexOf(q) !== -1;
      var descMatch = (test.description || '').toLowerCase().indexOf(q) !== -1;
      return nameMatch || catMatch || descMatch;
    });

    window.TestRenderer.renderGrid(this.targetGridId, filtered);
  }
};
