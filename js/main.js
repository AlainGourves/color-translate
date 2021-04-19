const query = document.querySelector('#leInput');
const colorsList = document.querySelector('#colors-list')
const newColor = document.querySelector('#clr-input');
const settings = document.querySelector('#settings');

window.addEventListener("load", e => {
  let clr = new MyColor();
  newColor.addEventListener('change', e => {
    clr.updateColor(e.target.value);
  });
  settings.addEventListener('change', e => {
    clr.updateSettings(e.target.dataset.id)
  });

  query.addEventListener('input', e => {
    let q = e.target.value;
    if (q.length > 0) {
      let matches = colorNames.filter(c => {
        let regex = new RegExp(`^${q}`, 'i');
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
        // TODO mettre ça aussi sur 'onBlur' ?
        // => vider la liste quand elle ne sert plus
        colorsList.innerHTML = '';
      }
    }
  });

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