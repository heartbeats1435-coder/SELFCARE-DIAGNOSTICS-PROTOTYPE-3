/**
 * Dynamic Test Card Renderer Service
 * Selfcare Diagnostics Platform
 */
window.TestRenderer = {
  createCardHTML: function(test) {
    var category = test.category || 'General';
    var tat = test.tat || '24 Hrs Report';
    var name = test.name || 'Diagnostic Test';
    var desc = test.description || '';
    var params = test.parametersCount || 0;
    var fasting = test.fastingRequired ? '<span class="badge badge-success text-xs">Fasting Required</span>' : '';
    var origPrice = test.originalPrice ? '<span class="text-muted text-xs style-strike" style="text-decoration: line-through;">₹' + test.originalPrice + '</span>' : '';
    var price = test.price || 0;
    var id = test.id || '';
    var safeName = name.replace(/'/g, "\\'");

    return '<div class="glass-card p-3 d-flex flex-column justify-between h-100" style="min-height: 260px;">' +
      '<div>' +
        '<div class="d-flex justify-between align-center mb-2">' +
          '<span class="glass-pill pill-sm text-xs text-accent">' + category + '</span>' +
          '<span class="text-xs text-muted">⏱ ' + tat + '</span>' +
        '</div>' +
        '<h3 class="test-title mb-1" style="font-size: 1.1rem; color: #fff;">' + name + '</h3>' +
        '<p class="text-muted text-xs mb-3">' + desc + '</p>' +
        '<div class="d-flex align-center gap-2 mb-3">' +
          '<span class="badge badge-info text-xs">' + params + ' Parameters</span>' +
          fasting +
        '</div>' +
      '</div>' +
      '<div class="pt-2 border-top-glass d-flex align-center justify-between mt-auto">' +
        '<div>' +
          origPrice +
          '<div class="text-gradient font-bold" style="font-size: 1.2rem;">₹' + price + '</div>' +
        '</div>' +
        '<button class="btn btn-primary btn-sm px-3" onclick="if(window.cartService){ window.cartService.addItem({id:\'' + id + '\', name:\'' + safeName + '\', price:' + price + '}); }">' +
          '+ Add' +
        '</button>' +
      '</div>' +
    '</div>';
  },

  renderGrid: function(containerId, testsList) {
    var container = document.getElementById(containerId);
    if (!container) return;

    if (!testsList || testsList.length === 0) {
      container.innerHTML = '<div class="glass-card p-4 text-center w-100">' +
        '<p class="text-muted mb-0">No diagnostic tests found matching your search.</p>' +
      '</div>';
      return;
    }

    var cardsHTML = '';
    for (var i = 0; i < testsList.length; i++) {
      cardsHTML += '<div class="col-12 col-md-6 col-lg-4 mb-3">' +
        this.createCardHTML(testsList[i]) +
      '</div>';
    }

    container.innerHTML = '<div class="row d-flex flex-wrap">' + cardsHTML + '</div>';
  }
};
