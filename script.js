
document.addEventListener('DOMContentLoaded', () => {
  const ts = new Date().toISOString();
  const sb = document.getElementById('submitted_at_b');
  if (sb) sb.value = ts;

  // Mode switching (Bazowy only shown here; Pro/SimRig managed elsewhere)
  const modeNote = document.getElementById('mode-note');
  const modeRadios = document.querySelectorAll('input[name="build_mode"]');
  function switchMode(val){
    // This simplified file shows only Bazowy form; in full build use previous version with 3 forms
    if (modeNote) modeNote.innerHTML = `Tryb <strong>${val}</strong> — ${val==='Bazowy'?'prosty dobór bez szczegółowej konfiguracji podzespołów.':'(placeholder)'}`;
  }
  modeRadios.forEach(r=>r.addEventListener('change',e=>switchMode(e.target.value)));

  // Conditional: usage -> gaming
  const usageCheckboxes = document.querySelectorAll('#form-bazowy input[name="usage[]"]');
  const conditionalBlocks = document.querySelectorAll('#form-bazowy .cond');
  function updateUsageConditions(){
    const selected = new Set(Array.from(usageCheckboxes).filter(c=>c.checked).map(c=>c.value));
    conditionalBlocks.forEach(block => {
      const cond = block.getAttribute('data-condition');
      block.hidden = !selected.has(cond);
    });
  }
  usageCheckboxes.forEach(cb=>cb.addEventListener('change',updateUsageConditions));
  updateUsageConditions();

  // Storage toggle
  const osPrefRadios = document.querySelectorAll('#form-bazowy input[name="os_drive_pref"]');
  const storageDetails = document.getElementById('storage-details');
  function updateStorage(){
    const val = Array.from(osPrefRadios).find(r=>r.checked)?.value;
    if (storageDetails) storageDetails.hidden = (val !== 'Tak');
  }
  osPrefRadios.forEach(r=>r.addEventListener('change',updateStorage));
  updateStorage();

  // Monitor toggle
  const monitorRadios = document.querySelectorAll('#form-bazowy input[name="monitor_consult"]');
  const monitorDetails = document.getElementById('monitor-details');
  function updateMonitor(){
    const val = Array.from(monitorRadios).find(r=>r.checked)?.value;
    if (monitorDetails) monitorDetails.hidden = (val !== 'Tak');
  }
  monitorRadios.forEach(r=>r.addEventListener('change',updateMonitor));
  updateMonitor();

  // Case right-side info
  const caseInfoText = document.getElementById('case-info-text');
  const caseRadios = document.querySelectorAll('#form-bazowy input[name="case_size"]');
  const caseMap = {
    'Mini‑ITX (Mini)': 'Najmniejsza z wymienionych: kompaktowy PC, 1 slot GPU, ostrożnie z chłodzeniem i wysokością chłodzeń.',
    'mATX (Mały)': 'Mały komputer z większą elastycznością niż ITX: więcej slotów, lepszy airflow niż typowe ITX.',
    'ATX (Standardowy)': 'Najbardziej uniwersalny rozmiar: pełna kompatybilność, rozbudowa, dobre chłodzenie, wygodny montaż.',
    'Full Tower (Duży)': 'Najwięcej miejsca: świetny airflow, chłodzenie wodne, wiele dysków, duże GPU. Idealny pod rozbudowę/ciszę.'
  };
  function updateCaseInfo(){
    const val = Array.from(caseRadios).find(r=>r.checked)?.value;
    caseInfoText.textContent = caseMap[val] || 'Wybierz rozmiar po lewej — tutaj pokażemy krótki opis praktycznych zastosowań.';
  }
  caseRadios.forEach(r=>r.addEventListener('change',updateCaseInfo));
  updateCaseInfo();
});
