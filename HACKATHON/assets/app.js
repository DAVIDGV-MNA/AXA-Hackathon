// Shared app JS: icons, theme, nav helpers
window.app = (function(){
  function initIcons(){ if (window.lucide) { lucide.createIcons(); } }

  const THEME_KEY = 'docuchat-theme';
  function setTheme(t){ document.documentElement.setAttribute('data-theme', t); localStorage.setItem(THEME_KEY, t); updateThemeIcon(t); }
  function updateThemeIcon(t){ const btn = document.getElementById('themeToggle'); if(!btn) return; btn.innerHTML = t === 'dark' ? '<i data-lucide="moon" class="icon"></i>' : '<i data-lucide="sun" class="icon"></i>'; initIcons(); }
  function initTheme(){ const saved = localStorage.getItem(THEME_KEY); if(saved) return setTheme(saved); const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches; setTheme(prefersDark ? 'dark' : 'light'); }
  function wireThemeButton(){ const btn = document.getElementById('themeToggle'); if(!btn) return; btn.addEventListener('click', function(){ const cur = document.documentElement.getAttribute('data-theme'); setTheme(cur === 'dark' ? 'light' : 'dark'); }); }

  function setActiveNav(name){ // name: 'Chat'|'Documents'|'Upload'
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    const items = document.querySelectorAll('.nav-item');
    items.forEach(i => { if (i.dataset && i.dataset.name === name) i.classList.add('active'); });
  }

  // Highlight based on path if no explicit setActive
  function highlightByPath(){ const map = {'/index.html':'Chat','/':'Chat','/documents.html':'Documents','/upload.html':'Upload'}; const name = map[location.pathname] || null; if (name) setActiveNav(name); }

  return { initIcons, initTheme, wireThemeButton, setActiveNav, highlightByPath };
})();

// Auto-init for pages that include this script with defer
document.addEventListener('DOMContentLoaded', function(){ if(window.app){ app.initIcons(); app.initTheme(); app.wireThemeButton(); app.highlightByPath(); } });
