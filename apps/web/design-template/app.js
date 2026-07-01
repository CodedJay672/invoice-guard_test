/* ── InvoiceGuard app.js ─────────────────────────────────── */

const routes = {
  home:'index.html', results:'results.html', processing:'processing.html',
  success:'success.html', report:'premium-report.html', watchlist:'watchlist.html',
  watchlistSuccess:'watchlist-success.html', signin:'signin.html',
  dashboard:'dashboard.html', invoices:'invoices.html', addInvoice:'add-invoice.html',
  invoiceDetail:'invoice-detail.html', companySearch:'company-search.html',
  demandLetters:'demand-letters.html', notifications:'notifications.html',
  settings:'settings.html', onboarding:'onboarding.html', checkout:'checkout.html'
};

function go(page){ window.location.href = routes[page] || page; }

function goToResults(q){
  const query = q || document.querySelector('[data-company-search]')?.value || 'ACME';
  window.location.href = 'results.html?q=' + encodeURIComponent(query);
}

function handleSearchForm(e){
  e.preventDefault();
  const input = e.currentTarget.querySelector('input');
  goToResults(input?.value || 'ACME');
}

const tierData = {
  basic:{title:'Unlock Basic Report',tier:'Basic Report',price:'£7.99',sub:'Court records, directors, registered address history.'},
  standard:{title:'Unlock Standard Report',tier:'Standard Report',price:'£14.99',sub:'Basic plus CCJ amounts, filing changes and registered charges.'},
  premium:{title:'Unlock Premium Report',tier:'Premium Report',price:'£27.00',sub:'Full due diligence, Gazette depth checks, director network and PDF.'}
};

function setText(id,text){ const el=document.getElementById(id); if(el) el.textContent=text; }

function openModal(tier){
  tier = tier || 'standard';
  const d = tierData[tier] || tierData.standard;
  const modal = document.getElementById('payment-modal');
  if(!modal){ go('checkout'); return; }
  modal.dataset.tier = tier;
  setText('modal-title', d.title);
  setText('modal-sub', d.sub);
  setText('modal-tier-label', d.tier);
  setText('modal-price', d.price);
  setText('modal-total', d.price);
  setText('pay-btn-amount', d.price);
  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeModal(){
  const modal = document.getElementById('payment-modal');
  if(modal) modal.classList.remove('open');
  document.body.style.overflow = '';
}

function processPayment(){ closeModal(); go('processing'); }

function chooseBusiness(type){
  document.querySelectorAll('.business-option').forEach(function(el){ el.classList.remove('selected'); });
  var sel = document.querySelector('[data-business="'+type+'"]');
  if(sel) sel.classList.add('selected');
  sessionStorage.setItem('invoiceguard_business_type', type);
}

function selectBusinessType(type){
  chooseBusiness(type);
}

function activateTab(tab){
  document.querySelectorAll('[data-tab]').forEach(function(x){ x.classList.remove('active'); });
  document.querySelectorAll('[data-panel]').forEach(function(x){ x.classList.remove('active'); });
  var tabEl = document.querySelector('[data-tab="'+tab+'"]');
  var panelEl = document.querySelector('[data-panel="'+tab+'"]');
  if(tabEl) tabEl.classList.add('active');
  if(panelEl) panelEl.classList.add('active');
}

function markRead(btn){
  var item = btn.closest('.notification-item');
  if(item) item.classList.remove('unread');
  btn.textContent = 'Read';
}

function markAllRead(){
  document.querySelectorAll('.notification-item.unread').forEach(function(item){
    item.classList.remove('unread');
    var btn = item.querySelector('.btn');
    if(btn) btn.textContent = 'Read';
  });
  var countEl = document.querySelector('.app-nav .count');
  if(countEl) countEl.textContent = '0';
  if(typeof showToast === 'function') showToast('All notifications marked as read','success');
}

function subscribeAndWatch(){ go('watchlistSuccess'); }

function fakeCompanySearch(e){
  e.preventDefault();
  var wrap = document.getElementById('company-search-result');
  if(!wrap) return;
  wrap.classList.remove('hidden');
  wrap.scrollIntoView({behavior:'smooth',block:'start'});
}

/* Onboarding multi-step */
function nextOnboardingStep(){
  var current = document.querySelector('.onboarding-step.active');
  if(!current) return;
  var next = current.nextElementSibling;
  while(next && !next.classList.contains('onboarding-step')){
    next = next.nextElementSibling;
  }
  if(next){
    current.classList.remove('active');
    current.style.display = 'none';
    next.classList.add('active');
    next.style.display = 'block';
    updateStepIndicator();
  }
}

function prevOnboardingStep(){
  var current = document.querySelector('.onboarding-step.active');
  if(!current) return;
  var prev = current.previousElementSibling;
  while(prev && !prev.classList.contains('onboarding-step')){
    prev = prev.previousElementSibling;
  }
  if(prev){
    current.classList.remove('active');
    current.style.display = 'none';
    prev.classList.add('active');
    prev.style.display = 'block';
    updateStepIndicator();
  }
}

function updateStepIndicator(){
  var steps = document.querySelectorAll('.onboarding-step');
  var idx = 0;
  steps.forEach(function(s,i){ if(s.classList.contains('active')) idx = i; });
  document.querySelectorAll('.step-dot').forEach(function(dot,i){
    dot.classList.toggle('done', i < idx);
    dot.classList.toggle('active', i === idx);
    dot.style.background = (i < idx) ? 'var(--teal)' : (i === idx) ? 'var(--teal)' : 'var(--border)';
  });
  var caps = document.querySelector('.onboarding-step-text');
  if(caps) caps.textContent = 'Step ' + (idx+1) + ' of ' + steps.length;
}

/* Mobile nav (public pages) */
function initMobileNav(){
  var hamburger = document.querySelector('.nav-hamburger');
  var panel = document.querySelector('.nav-mobile-panel');
  if(!hamburger || !panel) return;
  hamburger.addEventListener('click', function(){
    var isOpen = panel.classList.contains('open');
    panel.classList.toggle('open');
    hamburger.setAttribute('aria-expanded', String(!isOpen));
  });
  panel.querySelectorAll('a').forEach(function(link){
    link.addEventListener('click', function(){ panel.classList.remove('open'); });
  });
}

/* App sidebar toggle */
function initSidebar(){
  var hamburger = document.querySelector('.app-hamburger');
  var sidebar = document.querySelector('.app-side');
  var overlay = document.querySelector('.sidebar-overlay');
  if(!hamburger || !sidebar) return;

  function openSidebar(){
    sidebar.classList.add('open');
    if(overlay) overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
  function closeSidebar(){
    sidebar.classList.remove('open');
    if(overlay) overlay.classList.remove('open');
    document.body.style.overflow = '';
  }

  hamburger.addEventListener('click', openSidebar);
  if(overlay) overlay.addEventListener('click', closeSidebar);
  sidebar.querySelectorAll('.app-nav a').forEach(function(link){
    link.addEventListener('click', closeSidebar);
  });
}

/* Notification dropdown */
function toggleNotifDropdown(){
  var dd = document.getElementById('notif-dropdown');
  if(dd) dd.classList.toggle('open');
}

/* Close dropdown on outside click */
document.addEventListener('click', function(e){
  var dd = document.getElementById('notif-dropdown');
  if(dd && dd.classList.contains('open') && !e.target.closest('.notif-bell') && !e.target.closest('.notif-dropdown')){
    dd.classList.remove('open');
  }
});

/* Invoice filter */
function filterInvoices(status, btn){
  document.querySelectorAll('[data-invoice-filter]').forEach(function(b){
    b.className = 'btn btn-sm btn-outline';
    b.style.background = '';
    b.style.color = '';
  });
  btn.className = 'btn btn-sm';
  btn.style.background = 'var(--ink)';
  btn.style.color = 'var(--white)';
  
  document.querySelectorAll('tr[data-status]').forEach(function(tr){
    if(status === 'all' || tr.dataset.status === status){
      tr.style.display = '';
    } else {
      tr.style.display = 'none';
    }
  });
}

/* Copy to clipboard */
function copyToClipboard(text, btn){
  navigator.clipboard.writeText(text).then(function(){
    if(typeof showToast === 'function') showToast('Copied to clipboard', 'success', 2000);
    if(btn){
      var orig = btn.textContent;
      btn.textContent = 'Copied!';
      setTimeout(function(){ btn.textContent = orig; }, 1500);
    }
  });
}

/* DOM Ready */
document.addEventListener('DOMContentLoaded', function(){
  document.querySelectorAll('[data-search-form]').forEach(function(form){
    form.addEventListener('submit', handleSearchForm);
  });
  document.querySelectorAll('[data-company-form]').forEach(function(form){
    form.addEventListener('submit', fakeCompanySearch);
  });
  document.querySelectorAll('[data-tab]').forEach(function(btn){
    btn.addEventListener('click', function(){ activateTab(btn.dataset.tab); });
  });
  document.querySelectorAll('[data-business]').forEach(function(el){
    el.addEventListener('click', function(){ chooseBusiness(el.dataset.business); });
  });
  var modal = document.getElementById('payment-modal');
  if(modal){
    modal.addEventListener('click', function(e){
      if(e.target.id === 'payment-modal') closeModal();
    });
  }
  var q = new URLSearchParams(location.search).get('q');
  if(q){
    document.querySelectorAll('[data-query-output]').forEach(function(el){ el.textContent = q; });
    document.querySelectorAll('[data-company-search]').forEach(function(el){ el.value = q; });
  }
  initMobileNav();
  initSidebar();

  /* Smooth scroll for anchor links */
  document.querySelectorAll('a[href^="#"]').forEach(function(a){
    a.addEventListener('click', function(e){
      var target = document.querySelector(this.getAttribute('href'));
      if(target){
        e.preventDefault();
        target.scrollIntoView({behavior:'smooth', block:'start'});
        // Close mobile panel if open
        var panel = document.querySelector('.nav-mobile-panel');
        if(panel) panel.classList.remove('open');
      }
    });
  });

  /* Back to top visibility */
  var btt = document.querySelector('.back-to-top');
  if(btt){
    window.addEventListener('scroll', function(){
      btt.classList.toggle('visible', window.scrollY > 400);
    }, {passive:true});
  }

  /* Reveal-on-scroll for .reveal and .stagger elements */
  var revealEls = document.querySelectorAll('.reveal, .stagger');
  if(revealEls.length && 'IntersectionObserver' in window){
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if(entry.isIntersecting){
          entry.target.classList.add('in');
          io.unobserve(entry.target);
        }
      });
    }, {threshold: .12, rootMargin: '0px 0px -40px 0px'});
    revealEls.forEach(function(el){ io.observe(el); });
  } else {
    revealEls.forEach(function(el){ el.classList.add('in'); });
  }
});