let currentStep = 1;
const TOTAL_STEPS = 3;

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
  const form = document.getElementById('survey-form');

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
    name: document.getElementById('name').value.trim(),
    ageRange: document.getElementById('ageRange').value || null,
    answers: {
      satisfaction: document.querySelector('input[name=\"satisfaction\"]:checked')?.value || null,
      services,
      improvement: document.getElementById('improvement').value.trim() || null,
      recommend: document.getElementById('recommend').value || null
    }
  };

  try {
    await axios.post('/api/responses', payload);
    window.location.href = '/analyst';
  } catch (err) {
    console.error(err);
    alert('There was an error submitting the survey. Please try again.');
    nextBtn.disabled = false;
    spinner.classList.add('d-none');
  }
}

// Initialise first step
showStep(1);

