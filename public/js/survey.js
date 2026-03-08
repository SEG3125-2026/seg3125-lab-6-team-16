let currentStep = 1;
const TOTAL_STEPS = 3;
const STORAGE_KEY = 'lab6_responses';

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('next-step').addEventListener('click', handleNext);
  document.getElementById('prev-step').addEventListener('click', handlePrev);
});

function showStep(step) {
  currentStep = step;
  document.querySelectorAll('.survey-step').forEach(section => {
    const sectionStep = Number(section.dataset.step);
    section.classList.toggle('d-none', sectionStep !== step);
  });

  document.getElementById('step-number').textContent = step.toString();
  document.getElementById('step-progress').style.width = `${(step / TOTAL_STEPS) * 100}%`;

  document.getElementById('prev-step').disabled = step === 1;
  const nextBtn = document.getElementById('next-step');
  nextBtn.textContent = step === TOTAL_STEPS ? 'Submit' : 'Next';
}

function handleNext() {
  if (!validateStep(currentStep)) return;

  if (currentStep < TOTAL_STEPS) {
    showStep(currentStep + 1);
  } else {
    submitSurvey();
  }
}

function handlePrev() {
  if (currentStep > 1) showStep(currentStep - 1);
}

function validateStep(step) {
  let valid = true;

  if (step === 1) {
    const nameInput = document.getElementById('name');
    if (!nameInput.value.trim()) {
      nameInput.classList.add('is-invalid');
      valid = false;
    } else {
      nameInput.classList.remove('is-invalid');
    }
  } else if (step === 2) {
    const radios = document.querySelectorAll('input[name="satisfaction"]');
    const error = document.getElementById('satisfaction-error');
    const anyChecked = Array.from(radios).some(r => r.checked);
    if (!anyChecked) {
      error.classList.remove('d-none');
      valid = false;
    } else {
      error.classList.add('d-none');
    }
  }

  return valid;
}

function saveToLocalStorage(entry) {
  const existing = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  existing.push(entry);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
}

async function submitSurvey() {
  const nextBtn = document.getElementById('next-step');
  const spinner = document.getElementById('submit-spinner');
  nextBtn.disabled = true;
  spinner.classList.remove('d-none');

  const services = [];
  if (document.getElementById('svc-haircut').checked) services.push('Haircut');
  if (document.getElementById('svc-color').checked) services.push('Color');
  if (document.getElementById('svc-beard').checked) services.push('Beard Trim');
  if (document.getElementById('svc-style').checked) services.push('Wash & Style');

  const payload = {
    id: Date.now(),
    submittedAt: new Date().toISOString(),
    name: document.getElementById('name').value.trim(),
    ageRange: document.getElementById('ageRange').value || null,
    answers: {
      satisfaction: document.querySelector('input[name="satisfaction"]:checked')?.value || null,
      services,
      improvement: document.getElementById('improvement').value.trim() || null,
      recommend: document.getElementById('recommend').value || null
    }
  };

  // Always save to localStorage (works everywhere, including GitHub Pages)
  saveToLocalStorage(payload);

  // Also try the Node API (works when running locally with node server.js)
  try {
    await axios.post('/api/responses', payload);
  } catch (_) {
    // Server not available (GitHub Pages) – fine, localStorage has it
  }

  // Relative path so it works on both localhost and GitHub Pages
  window.location.href = 'analyst.html';
}

showStep(1);
