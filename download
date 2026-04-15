// detect.js — handles live detection (Fig 7.3)

let detectFileId = null;
let lastResults  = [];

window.addEventListener('DOMContentLoaded', () => {
  const jobId = getJobId();
  if (!jobId) {
    document.getElementById('noModelWarning').style.display = '';
    document.getElementById('detectReady').style.display = 'none';
    return;
  }
  // Check job is done
  fetch(`/api/job/${jobId}`).then(r => r.json()).then(data => {
    if (data.status === 'done') {
      document.getElementById('noModelWarning').style.display = 'none';
      document.getElementById('detectReady').style.display   = '';
      document.getElementById('modelInfo').textContent =
        `Model ready — Accuracy: ${data.accuracy}%  |  Rounds: ${data.rounds.length}  |  Classes: ${(data.label_names||[]).join(', ')}`;
    } else {
      document.getElementById('noModelWarning').style.display = '';
    }
  }).catch(() => {
    document.getElementById('noModelWarning').style.display = '';
  });
});

async function handleDetectFile(file) {
  if (!file) return;
  const formData = new FormData();
  formData.append('file', file);
  const res  = await fetch('/api/upload', { method: 'POST', body: formData });
  const data = await res.json();
  if (data.error) { showDetectStatus(data.error, 'error'); return; }
  detectFileId = data.file_id;
  showDetectStatus(`Loaded: ${file.name} — ${data.rows} rows`, 'ok');
  document.getElementById('detectUploadBtn').style.display = '';
}

function showDetectStatus(msg, type) {
  const el = document.getElementById('detectFileStatus');
  el.textContent = msg;
  el.className = 'file-status' + (type === 'error' ? ' error' : '');
  el.classList.remove('hidden');
}

async function runDetection(mode) {
  const jobId = getJobId();
  if (!jobId) { alert('No trained model. Please train first.'); return; }

  let url, payload;
  if (mode === 'upload' && detectFileId) {
    url     = '/api/detect';
    payload = { job_id: jobId, file_id: detectFileId };
  } else {
    url     = '/api/demo_detect';
    payload = { job_id: jobId };
  }

  try {
    const res  = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (data.error) { alert(data.error); return; }
    lastResults = data.results;
    setResults(lastResults);
    renderFlowsTable(lastResults);
  } catch (e) {
    alert('Detection error: ' + e.message);
  }
}

function renderFlowsTable(results) {
  const panel = document.getElementById('detectResultsPanel');
  const tbody = document.getElementById('flowsBody');
  panel.classList.remove('hidden');
  tbody.innerHTML = '';

  const attacks = results.filter(r => r.status === 'ATTACK').length;
  document.getElementById('detectStats').textContent =
    `${attacks} attacks  /  ${results.length} total flows  |  Attack rate: ${(attacks/results.length*100).toFixed(1)}%`;

  results.forEach(r => {
    const tr = document.createElement('tr');
    const statusHtml = r.status === 'ATTACK'
      ? `<span class="status-attack">ATTACK</span>`
      : `<span class="status-normal">NORMAL</span>`;
    tr.innerHTML = `
      <td>${r.timestamp}</td>
      <td>${r.source_ip}</td>
      <td>${r.dest_ip}</td>
      <td>${r.protocol}</td>
      <td style="color:${r.status==='ATTACK'?'#ff6666':'#ccd8e8'};font-weight:600">${r.prediction}</td>
      <td>${r.confidence}%</td>
      <td>${statusHtml}</td>
    `;
    tbody.appendChild(tr);
  });
}

async function downloadResults() {
  if (!lastResults.length) return;
  const res  = await fetch('/api/download_results', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ results: lastResults }),
  });
  const blob = await res.blob();
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'threat_detection_results.csv';
  a.click();
}

// Drag-drop
const ddz = document.getElementById('detectDropZone');
if (ddz) {
  ddz.addEventListener('dragover',  e => { e.preventDefault(); ddz.classList.add('drag'); });
  ddz.addEventListener('dragleave', () => ddz.classList.remove('drag'));
  ddz.addEventListener('drop', e => {
    e.preventDefault(); ddz.classList.remove('drag');
    if (e.dataTransfer.files[0]) handleDetectFile(e.dataTransfer.files[0]);
  });
}
