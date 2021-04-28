const modal = new AgModal('#panel');
const cog = document.querySelector('#cog');

let clr;
window.addEventListener("load", e => {
  clr = new MyColor();
  cog.addEventListener('click', _ => modal.open());
});