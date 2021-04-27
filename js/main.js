const query = document.querySelector('#leInput');
const colorsList = document.querySelector('#colors-list')
const newColor = document.querySelector('#clr-input');
const settings = document.querySelector('#settings');
// modal dialog for #settings
const modal = new AgModal('#settings');
const cog = document.querySelector('#cog');

let clr;
window.addEventListener("load", e => {

  clr = new MyColor();
  newColor.addEventListener('change', e => {
    clr.updateColor(e.target.value);
  });
  settings.addEventListener('change', e => {
    clr.updateSettings(e.target.dataset.id)
  });

  newColor.addEventListener('input', e => {
    if (clr.isError) clr.clearError();
    let q = e.target.value;
    let regex = /^[a-z]+$/i;
    if (q.length > 0 && regex.test(q)) {
      regex = new RegExp(`^${q}`, 'i');
      let matches = namedColors.filter(c => {
        return regex.test(c);
      });
      if (matches.length > 0) {
        colorsList.innerHTML = '';
        let optionList = '';
        for (let c of matches) {
          optionList += '<option value="' + c + '"></option>';
        }
        colorsList.innerHTML = optionList;
      } else {
        colorsList.innerHTML = '';
      }
    }
  });
  // auto-complétion des parenthèses
  newColor.addEventListener('keydown', e => {
    if (e.key === '(' || e.key === 'Backspace') {
      let val = [...e.target.value];
      let pos = e.target.selectionStart;
      let changed = false;
      switch (e.key) {
        case '(':
          val.splice(pos, 0, ')');
          changed = true;
          break;
        case 'Backspace':
          let delenda = val[pos - 1];
          if (delenda === '(' && val[pos] ===')') {
            val.splice(pos, 1);
            changed = true;
          }
          break;
      }
      if (changed){
        e.target.value = val.join('');
        e.target.selectionEnd = pos;
      }
    }
  });

  cog.addEventListener('click', _ => modal.open());

  document.querySelectorAll('.copy').forEach(b => clr.btnCopy(b));
});