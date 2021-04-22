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

  cog.addEventListener('click', _ => modal.open());

  const copyBtns = document.querySelectorAll('.copy');
  copyBtns.forEach(b => {
    b.addEventListener('click', e => {
      const duration = window.getComputedStyle(e.target).transitionDuration;
      const parent = e.target.parentElement;
      const field = parent.querySelector('input[type=text]');
      if (field.value.length > 0) {
        e.target.style.transitionDuration = '1s';
        e.target.classList.add('copied');
        e.target.addEventListener('transitionend', _ => {
          e.target.style.transitionDuration = duration;
          e.target.classList.remove('copied');
        }, {
          once: true
        });
      }
    });
  });
});