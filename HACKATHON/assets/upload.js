// upload.js - handles dropzone, queue, validation, and simulated upload flow
(function(){
  const MAX_FILE_MB = 20;
  const MAX_TOTAL_MB = 200;
  const ALLOWED = ['pdf','doc','docx','txt'];

  function bytesToMB(n){ return n/1024/1024; }
  function humanSize(n){ if (n < 1024) return n + ' B'; if (n < 1024*1024) return (n/1024).toFixed(1)+' KB'; return (n/1024/1024).toFixed(1)+' MB'; }

  let queue = []; // { id, file, status, progress }
  const qEl = () => document.getElementById('queue');
  const summaryEl = () => document.getElementById('queueSummary');
  const dropzone = () => document.getElementById('dropzone');
  const fileInput = () => document.getElementById('fileInput');
  const uploadAllBtn = () => document.getElementById('uploadAll');
  const dropError = () => document.getElementById('dropError');
  const statusLive = () => document.getElementById('uploadStatus');

  function initUploadPage(){
    const dz = dropzone();
    if(!dz) return;
    dz.addEventListener('dragover', onDragOver);
    dz.addEventListener('dragleave', onDragLeave);
    dz.addEventListener('drop', onDrop);
    dz.addEventListener('click', ()=> fileInput().click());
    dz.addEventListener('keydown', (e)=>{ if(e.key==='Enter' || e.key===' ') fileInput().click(); });

    document.getElementById('browseBtn').addEventListener('click', function(e){ e.stopPropagation(); fileInput().click(); });
    fileInput().addEventListener('change', (e)=> handleFiles(Array.from(e.target.files)));
    uploadAllBtn().addEventListener('click', uploadAll);
    renderQueue();
  }

  function onDragOver(e){ e.preventDefault(); dropzone().classList.add('dragover'); }
  function onDragLeave(e){ dropzone().classList.remove('dragover'); }
  function onDrop(e){ e.preventDefault(); dropzone().classList.remove('dragover'); const dt = e.dataTransfer; if(dt && dt.files) handleFiles(Array.from(dt.files)); }

  function handleFiles(files){
    dropError().style.display='none';
    let added = 0;
    files.forEach(f => {
      const ext = (f.name.split('.').pop() || '').toLowerCase();
      if(!ALLOWED.includes(ext)){ showError(`Skipped ${f.name}: invalid type`); return; }
      if(bytesToMB(f.size) > MAX_FILE_MB){ showError(`Skipped ${f.name}: exceeds ${MAX_FILE_MB} MB`); return; }
      // dedupe
      const exists = queue.find(q => q.file.name===f.name && q.file.size===f.size && q.file.lastModified===f.lastModified);
      if(exists){ showError(`Skipped ${f.name}: duplicate`); return; }
      queue.push({ id: 'q_'+Date.now()+'_'+Math.random().toString(36).slice(2,8), file:f, status:'Queued', progress:0 });
      added++;
    });
    if(added) renderQueue();
  }

  function showError(msg){ dropError().textContent = msg; dropError().style.display='block'; statusLive().textContent = msg; console.warn(msg); }

  function renderQueue(){
    const list = qEl(); if(!list) return;
    list.innerHTML = '';
    let total = 0; let count=0;
    queue.forEach(item => {
      total += item.file.size; count++;
      const div = document.createElement('div'); div.className='queue-item'; div.dataset.id = item.id;
      div.innerHTML = `
        <div style="display:flex;gap:10px;align-items:center;">
          <div style="width:36px;height:36px;border-radius:6px;background:var(--tile);display:flex;align-items:center;justify-content:center;"><i data-lucide="file-text" class="icon"></i></div>
          <div>
            <div style="font-size:14px;font-weight:600;">${escapeHtml(item.file.name)}</div>
            <div style="font-size:12px;color:var(--muted);">${item.file.type || '-'} • ${humanSize(item.file.size)}</div>
          </div>
        </div>
        <div style="display:flex;flex-direction:column;align-items:flex-end;gap:8px;min-width:160px;">
          <div class="badge">${item.status}</div>
          <div class="progress" aria-hidden="true"><i style="width:${item.progress}%"></i></div>
          <div style="display:flex;gap:8px;">
            <button data-action="remove" data-id="${item.id}" ${item.status==='Queued' || item.status==='Failed' ? '' : 'disabled'}>Remove</button>
            <button data-action="retry" data-id="${item.id}" ${item.status==='Failed' ? '' : 'disabled'}>Retry</button>
          </div>
        </div>
      `;
      list.appendChild(div);
    });
    document.querySelectorAll('[data-action="remove"]').forEach(btn => btn.addEventListener('click', (e)=>{ const id = e.target.dataset.id; removeFromQueue(id); }));
    document.querySelectorAll('[data-action="retry"]').forEach(btn => btn.addEventListener('click', (e)=>{ const id = e.target.dataset.id; retryItem(id); }));
    summaryEl().textContent = `${count} files • ${humanSize(total)}`;
    uploadAllBtn().disabled = queue.filter(i=>i.status==='Queued').length===0;
    if(window.lucide) lucide.createIcons();
  }

  function removeFromQueue(id){ queue = queue.filter(q=>q.id!==id); renderQueue(); }
  function retryItem(id){ const item = queue.find(q=>q.id===id); if(!item) return; item.status='Queued'; item.progress=0; renderQueue(); }

  // Simulated upload flow (replace with real backend calls)
  async function uploadAll(){
    const toUpload = queue.filter(i=>i.status==='Queued');
    for(const item of toUpload){ await uploadOne(item); }
    const done = queue.filter(i=>i.status==='Done').length;
    if(done) showToast(`${done} files uploaded`);
  }

  function showToast(msg){ const t = document.createElement('div'); t.className='toast'; t.textContent = msg; document.body.appendChild(t); setTimeout(()=> t.remove(),4000); }

  function uploadOne(item){
    return new Promise((resolve)=>{
      item.status='Uploading'; item.progress=0; renderQueue();
      const steps = 20; let i=0;
      const iv = setInterval(()=>{
        i++; item.progress = Math.min(100, Math.round((i/steps)*100)); renderQueue();
        if(i>=steps){ clearInterval(iv); // simulate processing
          item.status='Processing'; item.progress=100; renderQueue(); setTimeout(()=>{ item.status='Done'; renderQueue(); resolve(); }, 800 + Math.random()*1200);
        }
      }, 120 + Math.random()*80);
    });
  }

  function escapeHtml(s){ return (s||'').toString().replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

  document.addEventListener('DOMContentLoaded', function(){
    app && app.initIcons();
    app && app.initTheme && app.initTheme();
    app && app.wireThemeButton && app.wireThemeButton();
    app && app.setActiveNav && app.setActiveNav('Upload');
    initUploadPage();
  });
})();
