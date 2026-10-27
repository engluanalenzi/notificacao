window.montarFormularioAcidente = function montarFormularioAcidente(container, onVoltar) {
const template = document.getElementById('form-acidente-template');
if (!template) throw new Error('Modelo do formulario de acidente nao encontrado.');
container.replaceChildren(template.content.cloneNode(true));
const root = container.querySelector('.acidente-inline');
const TOTAL = 6;
const STORAGE_KEY = 'notificacao-acidente-v1-inline';
const defaultState = () => ({ screen: 1, values: {}, calcManual: false });
const status = root.querySelector('#form-status');
const setStatus = (message) => { status.textContent = message; };
let state = defaultState();
try {
  const saved = window.localStorage.getItem(STORAGE_KEY);
  if (saved) state = JSON.parse(saved);
} catch (error) {
  console.error('Nao foi possivel carregar o rascunho do formulario.', error);
  setStatus('O rascunho nao pode ser carregado do armazenamento deste navegador.');
}
if (!state || typeof state !== 'object') state = defaultState();
if (!state.values) state.values = {};
if (!state.screen) state.screen = 1;

const today = new Date().toISOString().slice(0, 10);
if (!state.values.dataFechamento) state.values.dataFechamento = today;
if (!state.values.tempoUnidade) state.values.tempoUnidade = 'Anos';

const area = root.querySelector('#mainArea');
const counter = root.querySelector('#stepCounter');
const btnVoltar = root.querySelector('#btnVoltar');
const btnContinuar = root.querySelector('#btnContinuar');
const bottomBar = root.querySelector('#bottomBar');
const progSegs = root.querySelectorAll('.progress-seg');


function save() {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.error('Nao foi possivel salvar o rascunho do formulario.', error);
    setStatus('O rascunho nao pode ser salvo neste navegador.');
  }
}

function getScreens() { return Array.from(root.querySelectorAll('.screen')); }

function persistInputs() {
root.querySelectorAll('[data-key]').forEach(el => {
state.values[el.dataset.key] = el.value;
});
root.querySelectorAll('[data-chips]').forEach(group => {
const key = group.dataset.chips;
const selected = Array.from(group.querySelectorAll('.chip.selected')).map(c => c.dataset.value);
if (group.dataset.multi) state.values[key] = selected;
else state.values[key] = selected[0] || '';
});
save();
}

function restoreInputs() {
root.querySelectorAll('[data-key]').forEach(el => {
const v = state.values[el.dataset.key];
if (v !== undefined) el.value = v;
});
root.querySelectorAll('[data-chips]').forEach(group => {
const key = group.dataset.chips;
const v = state.values[key];
group.querySelectorAll('.chip').forEach(chip => {
const on = group.dataset.multi ? Array.isArray(v) && v.includes(chip.dataset.value) : v === chip.dataset.value;
chip.classList.toggle('selected', !!on);
});
});
}



// Chip interactions
root.querySelectorAll('[data-chips]').forEach(group => {
group.querySelectorAll('.chip').forEach(chip => {
chip.addEventListener('click', () => {
if (group.dataset.multi) {
chip.classList.toggle('selected');
} else {
group.querySelectorAll('.chip').forEach(c => c.classList.remove('selected'));
chip.classList.add('selected');
}
clearErrorFor(group.dataset.chips);
persistInputs();
if (group.dataset.dynamic) applyDynamic();
});
});
});

function applyDynamic() {
// Tipo de acidente influences nothing structural in this prototype beyond saving;
// kept as hook for conditional requirements.
}

// Input listeners
root.querySelectorAll('[data-key]').forEach(el => {
const evt = el.tagName === 'SELECT' ? 'change' : 'input';
el.addEventListener(evt, () => {
clearErrorFor(el.dataset.key);
persistInputs();

});
});

// Masks
const cpfEl = root.querySelector('#cpf');
cpfEl.addEventListener('input', () => {
const d = cpfEl.value.replace(/\D/g, '').slice(0, 11);
cpfEl.value = d.replace(/^(\d{3})(\d{0,3})(\d{0,3})(\d{0,2}).*/, (m, a, b, c, e) =>
[a, b, c].filter(Boolean).join('.') + (e ? '-' + e : ''));
});
const cnpjEl = root.querySelector('#cnpj');
cnpjEl.addEventListener('input', () => {
let d = cnpjEl.value.replace(/\D/g, '');
if (d.length <= 11) {
d = d.slice(0, 11);
cnpjEl.value = d.replace(/^(\d{3})(\d{0,3})(\d{0,3})(\d{0,2}).*/, (m, a, b, c, e) =>
[a, b, c].filter(Boolean).join('.') + (e ? '-' + e : ''));
} else {
d = d.slice(0, 14);
cnpjEl.value = d.replace(/^(\d{2})(\d{0,3})(\d{0,3})(\d{0,4})(\d{0,2}).*/, (m, a, b, c, e, f) =>
[a, b, c].filter(Boolean).join('.') + (e ? '/' + e : '') + (f ? '-' + f : ''));
}
});

function clearErrorFor(key) {
const err = root.querySelector('[data-err="' + key + '"]');
if (err) err.classList.remove('show');
const input = root.querySelector('[data-key="' + key + '"]');
if (input) input.classList.remove('invalid');
}

function isFilled(key) {
const v = state.values[key];
if (Array.isArray(v)) return v.length > 0;
return v !== undefined && String(v).trim() !== '';
}

function validateCurrent() {
const screen = getScreens().find(s => s.dataset.screen == state.screen);
const missing = [];
return missing;
}

function showErrors(missing) {
missing.forEach(key => {
const err = root.querySelector('[data-err="' + key + '"]');
if (err) err.classList.add('show');
const input = root.querySelector('[data-key="' + key + '"]');
if (input) input.classList.add('invalid');
});
}

function renderProgress() {
progSegs.forEach((seg, i) => {
seg.classList.toggle('done', i < state.screen);
});
}

function showScreen(n) {
state.screen = n;
getScreens().forEach(s => s.classList.toggle('active', Number(s.dataset.screen) === n));
const isDone = n === 7;
bottomBar.style.display = isDone ? 'none' : 'block';
counter.textContent = isDone ? 'Concluído' : 'Tela ' + n + ' de ' + TOTAL;
btnVoltar.style.visibility = n === 1 ? 'hidden' : 'visible';
btnContinuar.textContent = n === TOTAL ? 'Concluir notificação' : 'Continuar →';
renderProgress();
save();
area.scrollTop = 0;
window.scrollTo({ top: 0, behavior: 'smooth' });
if (isDone) buildSummary();
}

function buildPrint() {
root.querySelector('#pfDataImpressao').textContent = formatDate(new Date().toISOString().slice(0, 10));
const blocks = root.querySelector('#pfBlocks');
blocks.replaceChildren();

function addField(block, labelText) {
  const field = document.createElement('div');
  field.className = 'pf-field';
  const label = document.createElement('h4');
  label.textContent = labelText;
  field.appendChild(label);
  block.appendChild(field);
  return field;
}

function addChoices(field, choices, selectedValues) {
  const list = document.createElement('ul');
  list.className = 'pf-choices';
  choices.forEach(({ value, label }) => {
    const option = document.createElement('li');
    option.textContent = `${selectedValues.includes(value) ? '[x]' : '[ ]'} ${label}`;
    list.appendChild(option);
  });
  field.appendChild(list);
}

function addAnswer(field, value) {
  const answer = document.createElement('p');
  answer.className = 'pf-answer';
  answer.textContent = value || '________________________________';
  field.appendChild(answer);
}

root.querySelectorAll('.screen[data-screen]').forEach((screen) => {
  if (Number(screen.dataset.screen) > TOTAL) return;

  const block = document.createElement('section');
  block.className = 'pf-block';
  const title = document.createElement('h3');
  title.textContent = screen.querySelector('.screen-title').textContent;
  block.appendChild(title);

  screen.querySelectorAll('.field-label').forEach((fieldLabel) => {
    const labelText = fieldLabel.textContent.trim();
    const following = fieldLabel.nextElementSibling;
    if (!following) return;

    if (following.matches('[data-chips]')) {
      const field = addField(block, labelText);
      const choices = Array.from(following.querySelectorAll('.chip')).map((chip) => ({
        value: chip.dataset.value,
        label: chip.textContent.trim()
      }));
      const selected = choices.filter((choice) =>
        following.dataset.multi
          ? Array.isArray(state.values[following.dataset.chips]) && state.values[following.dataset.chips].includes(choice.value)
          : state.values[following.dataset.chips] === choice.value
      ).map((choice) => choice.value);
      addChoices(field, choices, selected);
      return;
    }

    if (following.matches('.unit-row')) {
      const quantity = following.querySelector('[data-key]');
      const unit = following.querySelector('select[data-key]');
      const field = addField(block, labelText);
      addAnswer(field, quantity.value ? `${quantity.value} ${unit.value}` : '');
      addChoices(field, Array.from(unit.options).map((option) => ({
        value: option.value || option.textContent,
        label: option.textContent.trim()
      })), [unit.value]);
      return;
    }

    if (fieldLabel instanceof HTMLLabelElement && fieldLabel.htmlFor) {
      const control = root.querySelector(`#${fieldLabel.htmlFor}`);
      if (!control) return;
      const field = addField(block, labelText);
      if (control instanceof HTMLSelectElement) {
        const choices = Array.from(control.options)
          .filter((option) => option.value !== '')
          .map((option) => ({ value: option.value, label: option.textContent.trim() }));
        addChoices(field, choices, [control.value]);
      } else {
        const value = control.type === 'date' && control.value
          ? formatDate(control.value)
          : control.value;
        addAnswer(field, value);
      }
    }
  });

  blocks.appendChild(block);
});
}

root.querySelector('#btnImprimir').addEventListener('click', () => {
buildPrint();
window.print();
});

function buildSummary() {
const v = state.values;
const items = [
['Nome', v.nome],
['Data do acidente', v.dataAcidente ? formatDate(v.dataAcidente) : ''],
['Tipo de acidente', v.tipoAcidente],
['Parte do corpo', v.parteCorpo],
['Evolução', v.evolucao],
['CAT emitida', v.cat]
];
root.querySelector('#summaryGrid').innerHTML = items.map(([k, val]) =>
'<div class="summary-item"><span>' + k + '</span><strong>' + escapeHtml(val || '—') + '</strong></div>'
).join('');
}

function formatDate(iso) {
const [y, m, d] = iso.split('-');
return d + '/' + m + '/' + y;
}

function escapeHtml(s) {
return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

btnVoltar.addEventListener('click', () => {
if (state.screen > 1) showScreen(state.screen - 1);
});

btnContinuar.addEventListener('click', () => {
persistInputs();
if (state.screen < TOTAL) {
showScreen(state.screen + 1);
} else {
showScreen(7);
}
});

root.querySelector('#btnRevisar').addEventListener('click', () => {
showScreen(1);
});

const dlg = root.querySelector('#dlgNova');
root.querySelector('[data-dialog-close]').addEventListener('click', () => dlg.close());
root.querySelector('[data-voltar-consulta]').addEventListener('click', onVoltar);
root.querySelector('#btnNova').addEventListener('click', () => dlg.showModal());
root.querySelector('#btnConfirmaNova').addEventListener('click', () => {
state = { screen: 1, values: { dataFechamento: today, tempoUnidade: 'Anos' }, calcManual: false };
save();
root.querySelectorAll('[data-key]').forEach(el => { el.value = ''; el.classList.remove('invalid'); });
root.querySelector('#tempoUnidade').value = 'Anos';
root.querySelector('#dataFechamento').value = today;
root.querySelectorAll('.chip.selected').forEach(c => c.classList.remove('selected'));
root.querySelectorAll('.field-error').forEach(e => e.classList.remove('show'));
dlg.close();
showScreen(1);
setStatus('Novo formulario pronto para preenchimento.');
});

// Init
restoreInputs();

root.querySelector('#tempoUnidade').value = state.values.tempoUnidade || 'Anos';
root.querySelector('#dataFechamento').value = state.values.dataFechamento || today;
showScreen(state.screen >= 1 && state.screen <= 7 ? state.screen : 1);
const activeHeading = root.querySelector('.screen.active h1');
if (activeHeading) {
  activeHeading.tabIndex = -1;
  activeHeading.focus();
}
return root;
};
