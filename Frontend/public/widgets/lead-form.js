(function() {
  function initWidget() {
    var container = document.getElementById('infotattva-lead-widget');
    if (!container) return;

    // Prevent duplicate rendering
    if (container.querySelector('iframe')) return;

    var companyId = container.getAttribute('data-company') || 'company-infotattva-id';
    var theme = container.getAttribute('data-theme') || 'light';
    var accent = container.getAttribute('data-accent') || '#6366f1';
    var title = container.getAttribute('data-title') || '';
    
    // Find current script tag origin to dynamically determine the frontend host
    var script = document.currentScript;
    var host = 'http://localhost:3000';
    if (script && script.src) {
      try {
        var url = new URL(script.src);
        host = url.origin;
      } catch (e) {
        console.error('Error parsing widget script src URL', e);
      }
    }

    var iframe = document.createElement('iframe');
    var iframeSrc = host + '/embed/forms?id=' + encodeURIComponent(companyId) +
                    '&theme=' + encodeURIComponent(theme) +
                    '&accent=' + encodeURIComponent(accent);
    
    if (title) {
      iframeSrc += '&title=' + encodeURIComponent(title);
    }

    iframe.setAttribute('src', iframeSrc);
    iframe.setAttribute('width', '100%');
    iframe.setAttribute('height', '450px');
    iframe.style.border = 'none';
    iframe.style.borderRadius = '12px';
    iframe.style.boxShadow = '0 4px 20px rgba(0,0,0,0.05)';
    iframe.style.overflow = 'hidden';

    container.appendChild(iframe);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initWidget);
  } else {
    initWidget();
  }
})();
