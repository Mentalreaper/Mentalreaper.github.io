const hamburger = document.querySelector('.hamburger');
const overlay = document.querySelector('.overlay');

hamburger.addEventListener('click', function() {
  this.classList.toggle('active');
  overlay.classList.toggle('active');
});