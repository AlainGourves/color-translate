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

  const copyBtns = document.querySelectorAll('.copy');
  copyBtns.forEach(b => {
    b.addEventListener('click', e => {
      const duration = window.getComputedStyle(e.target).transitionDuration;
      e.target.style.transitionDuration = '1s';
      e.target.classList.add('copied');
      e.target.addEventListener('transitionend', _ => {
        e.target.style.transitionDuration = duration;
        e.target.classList.remove('copied');
      }, { once: true});
      const parent = e.target.parentElement;
      const field = parent.querySelector('input[type=text]');
      console.log(field.value);
    })
  });
});