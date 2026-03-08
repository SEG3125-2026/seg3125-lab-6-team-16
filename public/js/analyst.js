const STORAGE_KEY = 'lab6_responses';

async function fetchResponses() {
  let data = [];

  // Try the Node API first (works on localhost with node server.js)
  try {
    const res = await axios.get('/api/responses');
    data = res.data || [];
  } catch (_) {
    // Server not available (GitHub Pages) – read from localStorage instead
    data = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  }

  renderOverview(data);
  renderSatisfactionChart(data);
  renderServicesChart(data);
  renderRecentList(data);
}

async function resetResponses() {
  if (!window.confirm('This will permanently delete all saved survey responses. Continue?')) {
    return;
  }

  // Clear localStorage
  localStorage.removeItem(STORAGE_KEY);

  // Also try clearing on the server
  try {
    await axios.post('/api/responses/reset');
  } catch (_) {
    // Server not available – fine, localStorage already cleared
  }

  window.location.reload();
}

function renderOverview(responses) {
  const total = responses.length;
  document.getElementById('total-responses').textContent = total.toString();

  if (!total) {
    document.getElementById('avg-satisfaction').textContent = '–';
    return;
  }

  const sats = responses
    .map(r => Number(r.answers?.satisfaction))
    .filter(n => !Number.isNaN(n));
  const avg = sats.length ? (sats.reduce((a, b) => a + b, 0) / sats.length).toFixed(1) : '–';
  document.getElementById('avg-satisfaction').textContent = avg;
}

function renderSatisfactionChart(responses) {
  const counts = [0, 0, 0, 0, 0];
  responses.forEach(r => {
    const s = Number(r.answers?.satisfaction);
    if (s >= 1 && s <= 5) counts[s - 1] += 1;
  });

  const ctx = document.getElementById('satisfactionChart');
  if (!ctx) return;

  new Chart(ctx, {
    type: 'pie',
    data: {
      labels: ['1', '2', '3', '4', '5'],
      datasets: [
        {
          data: counts,
          backgroundColor: ['#ffcdd2', '#ffe082', '#fff59d', '#c5e1a5', '#81c784']
        }
      ]
    },
    options: {
      plugins: {
        legend: {
          position: 'bottom'
        }
      }
    }
  });
}

function renderServicesChart(responses) {
  const services = ['Haircut', 'Color', 'Beard Trim', 'Wash & Style'];
  const counts = [0, 0, 0, 0];

  responses.forEach(r => {
    const used = r.answers?.services || [];
    used.forEach(s => {
      const idx = services.indexOf(s);
      if (idx !== -1) counts[idx] += 1;
    });
  });

  const ctx = document.getElementById('servicesChart');
  if (!ctx) return;

  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: services,
      datasets: [
        {
          label: 'Number of users',
          data: counts,
          backgroundColor: '#64b5f6'
        }
      ]
    },
    options: {
      scales: {
        y: {
          beginAtZero: true,
          precision: 0
        }
      }
    }
  });
}

function renderRecentList(responses) {
  const container = document.getElementById('responses-list');
  if (!container) return;
  if (!responses.length) {
    container.textContent = 'No responses yet.';
    return;
  }

  const latest = [...responses].sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt)).slice(0, 10);
  container.innerHTML = latest
    .map(
      r => `
      <div class="response">
        <div><strong>${r.name || 'Anonymous'}</strong> – satisfaction: ${r.answers?.satisfaction || 'n/a'}</div>
        <div class="text-muted">${new Date(r.submittedAt).toLocaleString()}</div>
      </div>
    `
    )
    .join('');
}

document.addEventListener('DOMContentLoaded', () => {
  fetchResponses();
  const resetBtn = document.getElementById('reset-responses');
  if (resetBtn) {
    resetBtn.addEventListener('click', resetResponses);
  }
});
