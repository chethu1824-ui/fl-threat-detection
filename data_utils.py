// dashboard.js — loads stored session data and renders charts

window.addEventListener('DOMContentLoaded', () => {
  loadTrainingData();
  loadDetectionData();
});

function loadTrainingData() {
  const raw = sessionStorage.getItem('fl_job_data');
  if (!raw) return;
  const data = JSON.parse(raw);
  const rounds = data.rounds || [];

  document.getElementById('dmAcc').textContent    = data.accuracy + '%';
  document.getElementById('dmRounds').textContent = rounds.length;
  document.getElementById('dmClients').textContent = '—';

  const labels = rounds.map(r => 'R' + r.round);
  const accs   = rounds.map(r => r.accuracy);
  const losses = rounds.map(r => r.loss);

  new Chart(document.getElementById('dashChart').getContext('2d'), {
    type: 'line',
    data: {
      labels,
      datasets: [
        { label: 'Accuracy (%)', data: accs, borderColor: '#00e5ff', borderWidth: 2, pointRadius: 2, fill: false, tension: 0.4, yAxisID: 'y' },
        { label: 'Loss',         data: losses, borderColor: '#ff4444', borderWidth: 2, pointRadius: 2, fill: false, tension: 0.4, yAxisID: 'y2', borderDash: [4,3] },
      ],
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { labels: { color: '#8899aa', font: { size: 11 } } } },
      scales: {
        x: { grid: { color: 'rgba(30,48,80,0.5)' }, ticks: { color: '#5a7a9a', font: { size: 10 } } },
        y: { position: 'left', ticks: { color: '#00e5ff', font: { size: 10 }, callback: v => v + '%' }, grid: { color: 'rgba(30,48,80,0.5)' } },
        y2: { position: 'right', grid: { display: false }, ticks: { color: '#ff4444', font: { size: 10 } } },
      },
    },
  });
}

function loadDetectionData() {
  const results = getResults();
  if (!results || !results.length) return;

  const attacks = results.filter(r => r.status === 'ATTACK').length;
  document.getElementById('dmThreats').textContent = attacks;

  // Pie chart — attack type distribution
  const counts = {};
  results.forEach(r => { counts[r.prediction] = (counts[r.prediction] || 0) + 1; });
  const pieLabels = Object.keys(counts);
  const pieData   = Object.values(counts);
  const colors    = ['#00e676', '#ff4444', '#ff6622', '#ffaa00', '#aa44ff', '#00e5ff', '#ff44aa'];

  new Chart(document.getElementById('pieChart').getContext('2d'), {
    type: 'doughnut',
    data: {
      labels: pieLabels,
      datasets: [{ data: pieData, backgroundColor: colors.slice(0, pieLabels.length), borderWidth: 0 }],
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { position: 'right', labels: { color: '#8899aa', font: { size: 11 }, padding: 10 } } },
    },
  });

  // Feed table
  document.getElementById('dashFeedEmpty').style.display = 'none';
  document.getElementById('dashFeedTable').classList.remove('hidden');
  const tbody = document.getElementById('dashFeedBody');
  results.slice(0, 30).forEach(r => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${r.timestamp}</td>
      <td>${r.source_ip}</td>
      <td>${r.protocol}</td>
      <td style="color:${r.status==='ATTACK'?'#ff6666':'#ccd8e8'};font-weight:600">${r.prediction}</td>
      <td>${r.confidence}%</td>
      <td>${r.status==='ATTACK'?'<span class="status-attack">ATTACK</span>':'<span class="status-normal">NORMAL</span>'}</td>
    `;
    tbody.appendChild(tr);
  });
}
