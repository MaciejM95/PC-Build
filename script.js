
document.addEventListener('DOMContentLoaded', () => {
  const submittedAt = document.getElementById('submitted_at');
  if (submittedAt) submittedAt.value = new Date().toISOString();

  // Mode bar note
  const modeNote = document.getElementById('mode-note');
  const modeRadios = document.querySelectorAll('input[name="build_mode"]');
  const modeTexts = {
    'Bazowy': 'Tryb Bazowy — prosty dobór bez szczegółowej konfiguracji podzespołów. (Pro/SimRig: placeholder, wkrótce rozszerzymy.)',
    'Pro': 'Tryb Pro — szczegółowe wybory poszczególnych podzespołów (placeholder).',
    'SimRig': 'Tryb SimRig — builder zestawu symracingowego (placeholder).'
  };
  function updateMode() {
    const val = Array.from(modeRadios).find(r => r.checked)?.value || 'Bazowy';
    if (modeNote) modeNote.innerHTML = `Tryb <strong>${val}</strong> — ${modeTexts[val]}`;
  }
  modeRadios.forEach(r => r.addEventListener('change', updateMode));
  updateMode();

  // Warunkowe sekcje: usage[]
  const usageCheckboxes = document.querySelectorAll('input[name="usage[]"]');
  const conditionalBlocks = document.querySelectorAll('.cond');
  function updateUsageConditions() {
    const selected = new Set(Array.from(usageCheckboxes).filter(c => c.checked).map(c => c.value));
    conditionalBlocks.forEach(block => {
      const cond = block.getAttribute('data-condition');
      block.hidden = !selected.has(cond);
    });
  }
  usageCheckboxes.forEach(cb => cb.addEventListener('change', updateUsageConditions));
  updateUsageConditions();

  // Storage details toggle
  const osPrefRadios = document.querySelectorAll('input[name="os_drive_pref"]');
  const storageDetails = document.getElementById('storage-details');
  function updateStorage() {
    const val = Array.from(osPrefRadios).find(r => r.checked)?.value;
    storageDetails.hidden = (val !== 'Tak');
  }
  osPrefRadios.forEach(r => r.addEventListener('change', updateStorage));

  // Monitor details toggle
  const monitorRadios = document.querySelectorAll('input[name="monitor_consult"]');
  const monitorDetails = document.getElementById('monitor-details');
  function updateMonitor() {
    const val = Array.from(monitorRadios).find(r => r.checked)?.value;
    monitorDetails.hidden = (val !== 'Tak');
  }
  monitorRadios.forEach(r => r.addEventListener('change', updateMonitor));

  // Progress bar: detect current section on scroll
  const sections = Array.from(document.querySelectorAll('section.block'));
  const progressStepEl = document.getElementById('progress-step');
  const progressFillEl = document.querySelector('.progress-fill');
  const totalSteps = sections.length; // should be 9

  function setProgress(stepIndex) {
    const step = Math.min(Math.max(stepIndex, 1), totalSteps);
    if (progressStepEl) progressStepEl.textContent = step;
    const pct = Math.round((step / totalSteps) * 100);
    if (progressFillEl) progressFillEl.style.width = pct + '%';
  }

  // IntersectionObserver to find most visible section
  const observer = new IntersectionObserver((entries) => {
    let topMost = null;
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const stepAttr = entry.target.getAttribute('data-step');
        const rect = entry.target.getBoundingClientRect();
        const visible = Math.max(0, Math.min(window.innerHeight, rect.bottom) - Math.max(0, rect.top));
        topMost = (!topMost || visible > topMost.visible) ? { step: Number(stepAttr), visible } : topMost;
      }
    });
    if (topMost) setProgress(topMost.step);
  }, { root: null, threshold: [0.3, 0.6] });

  sections.forEach(sec => observer.observe(sec));
  setProgress(1);

  // Submit
  const form = document.getElementById('pc-form');
  const status = document.getElementById('status');
  const submitBtn = document.getElementById('submit-btn');
  const thanks = document.getElementById('thanks');

  async function handleSubmit(event) {
    event.preventDefault();
    status.textContent = '';
    submitBtn.disabled = true;

    const formData = new FormData(form);

    // Zbierz wielokrotne pola jako CSV-friendly
    const usage = formData.getAll('usage[]').join('; ');
    const gamingKinds = formData.getAll('gaming_kinds[]').join('; ');

    formData.delete('usage[]'); formData.set('usage', usage);
    formData.delete('gaming_kinds[]'); formData.set('gaming_kinds', gamingKinds);

    // E-mail required
    const email = formData.get('contact_email');
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      status.textContent = 'Podaj poprawny adres e‑mail (pole jest wymagane).';
      submitBtn.disabled = false;
      return;
    }

    // JSON payload
    const payload = {};
    for (const [key, value] of formData.entries()) payload[key] = value;

    try {
      const resp = await fetch(form.action, {
        method: form.method,
        headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (resp.ok) {
        form.hidden = true;
        if (thanks) thanks.hidden = false;
      } else {
        const data = await resp.json().catch(() => ({}));
        status.textContent = (data && data.error) ? `Błąd: ${data.error}` : 'Wystąpił problem z wysyłką.';
      }
    } catch (e) {
      status.textContent = 'Brak połączenia lub błąd po stronie usługi.';
    } finally {
      submitBtn.disabled = false;
    }
  }

  form.addEventListener('submit', handleSubmit);
});
