const slides = document.querySelectorAll('.carousel-slide');
let currentSlide = 0;

function nextSlide() {
  slides[currentSlide].className = 'carousel-slide';
  currentSlide = (currentSlide + 1) % slides.length;
  slides[currentSlide].className = 'carousel-slide active';
}

// eslint-disable-next-line no-unused-vars
function previousSlide() {
  slides[currentSlide].className = 'carousel-slide';
  currentSlide = (currentSlide - 1 + slides.length) % slides.length;
  slides[currentSlide].className = 'carousel-slide active';
}

let slideInterval = setInterval(nextSlide, 5000);

document.querySelectorAll('.arrow').forEach((arrow) => {
  arrow.addEventListener('mouseover', () => {
    clearInterval(slideInterval);
  });

  arrow.addEventListener('mouseout', () => {
    slideInterval = setInterval(nextSlide, 5000);
  });
});

window.onload = function onStart() {
  window.addEventListener('scroll', function onEventListenerAdded() {
    if (window.scrollY > 100) {
      this.document.querySelector('header').classList.add('is-scrolling');
    } else {
      this.document.querySelector('header').classList.remove('is-scrolling');
    }
  });

  const menuButton = this.document.querySelector('.hamburger');
  const mobileMenu = this.document.querySelector('.mobile-nav');

  menuButton.addEventListener('click', () => {
    menuButton.classList.toggle('is-active');
    mobileMenu.classList.toggle('is-active');
  });
};