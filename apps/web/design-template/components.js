/* ── InvoiceGuard components.js ─────────────────────────── */

/* ── Toast Notification System ── */
function getToastContainer(){
  var c = document.querySelector('.toast-container');
  if(!c){
    c = document.createElement('div');
    c.className = 'toast-container';
    document.body.appendChild(c);
  }
  return c;
}

function showToast(message, type, duration){
  type = type || 'info';
  duration = duration || 4000;
  var container = getToastContainer();
  var toast = document.createElement('div');
  toast.className = 'toast toast--' + type;
  var colorMap = {success:'var(--green)', error:'var(--red)', info:'var(--teal)'};
  var barColor = colorMap[type] || colorMap.info;
  toast.innerHTML =
    '<div style="flex:1"><div style="font-weight:800;font-size:.86rem">' + message + '</div></div>' +
    '<button class="toast__close" onclick="this.closest(\'.toast\').remove()" aria-label="Close" style="background:none;border:none;font-size:1.2rem;cursor:pointer;color:var(--muted);padding:0 0 0 8px">&times;</button>' +
    '<div class="toast__progress" style="position:absolute;bottom:0;left:0;right:0;height:3px;border-radius:0 0 14px 14px;overflow:hidden">' +
    '<div style="width:100%;height:100%;background:' + barColor + ';animation:toast-progress ' + duration + 'ms linear forwards"></div></div>';
  container.appendChild(toast);
  requestAnimationFrame(function(){
    requestAnimationFrame(function(){ toast.classList.add('toast--visible'); });
  });
  setTimeout(function(){
    toast.classList.remove('toast--visible');
    toast.classList.add('toast--hiding');
    setTimeout(function(){ if(toast.parentNode) toast.remove(); }, 300);
  }, duration);
}

/* Add toast animation keyframes */
(function(){
  var s = document.createElement('style');
  s.textContent =
    '@keyframes toast-progress{from{width:100%}to{width:0%}}';
  document.head.appendChild(s);
})();

/* ── Processing Page Auto-Advance ── */
function initProcessingPage(){
  if(!document.querySelector('.success-wrap .spinner')) return;
  var items = document.querySelectorAll('.source-row .badge');
  var delays = [800, 2000, 3500, 5000, 6500];
  items.forEach(function(badge, i){
    setTimeout(function(){
      badge.className = 'badge badge-green';
      badge.textContent = 'Done';
      if(i < items.length - 1){
        items[i+1].className = 'badge badge-teal';
        items[i+1].textContent = 'Running';
      }
    }, delays[i]);
  });
  setTimeout(function(){
    window.location.href = 'success.html';
  }, 8500);
}

/* ── Form Validation ── */
function isValidEmail(email){
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function showFieldError(field, message){
  var wrapper = field.closest('.field');
  if(!wrapper) return;
  var err = wrapper.querySelector('.field-error');
  if(!err){
    err = document.createElement('div');
    err.className = 'field-error';
    err.style.cssText = 'color:var(--red);font-size:.74rem;margin-top:4px;font-weight:700';
    wrapper.appendChild(err);
  }
  err.textContent = message;
  field.style.borderColor = 'var(--red)';
  field.style.boxShadow = '0 0 0 3px rgba(217,45,32,.14)';
}

function clearFieldError(field){
  var wrapper = field.closest('.field');
  if(!wrapper) return;
  var err = wrapper.querySelector('.field-error');
  if(err) err.remove();
  field.style.borderColor = '';
  field.style.boxShadow = '';
}

function validateForm(form){
  var valid = true;
  form.querySelectorAll('[required]').forEach(function(field){
    clearFieldError(field);
    if(!field.value.trim()){
      showFieldError(field, 'This field is required');
      valid = false;
    } else if(field.type === 'email' && !isValidEmail(field.value)){
      showFieldError(field, 'Please enter a valid email address');
      valid = false;
    }
  });
  return valid;
}

/* ── Init on DOMContentLoaded ── */
document.addEventListener('DOMContentLoaded', function(){
  initProcessingPage();

  document.querySelectorAll('form[data-validate]').forEach(function(form){
    form.addEventListener('submit', function(e){
      if(!validateForm(form)){
        e.preventDefault();
        e.stopPropagation();
        showToast('Please fix the errors above','error');
      }
    });
    form.querySelectorAll('input, textarea, select').forEach(function(field){
      field.addEventListener('input', function(){ clearFieldError(field); });
    });
  });
});