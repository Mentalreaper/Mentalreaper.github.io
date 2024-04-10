const storageKey = 'theme-preference';
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

document.body.classList.toggle('dark-mode');

document.getElementById('theme-toggle').addEventListener('click', () => {
  document.body.classList.toggle('dark-mode');
});

const getColorPreference = () => {
  if (localStorage.getItem(storageKey)) {
    return localStorage.getItem(storageKey);
  }
  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';
};

const theme = {
  value: getColorPreference(),
};

const reflectPreference = () => {
  document.firstElementChild
    .setAttribute('data-theme', theme.value);

  document
    .querySelector('#theme-toggle')
    ?.setAttribute('aria-label', theme.value);
};

const setPreference = () => {
  localStorage.setItem(storageKey, theme.value);
  reflectPreference();
};

const onClick = () => {
  // flip current value
  theme.value = theme.value === 'light'
    ? 'dark'
    : 'light';

  setPreference();
};

// set early so no page flashes / CSS is made aware
reflectPreference();

window.onload = function onStart() {
  window.addEventListener('scroll', function onEventListenerAdded() {
    if (window.scrollY > 100) {
      this.document.querySelector('header').classList.add('is-scrolling');
    } else {
      this.document.querySelector('header').classList.remove('is-scrolling');
    }
  });

  reflectPreference();

  const menuButton = this.document.querySelector('.hamburger');
  const mobileMenu = this.document.querySelector('.mobile-nav');
  const themeToggle = this.document.querySelector('#theme-toggle');

  menuButton.addEventListener('click', () => {
    menuButton.classList.toggle('is-active');
    mobileMenu.classList.toggle('is-active');
  });

  themeToggle.addEventListener('click', onClick);
};

// sync with system changes
window
  .matchMedia('(prefers-color-scheme: dark)')
  .addEventListener('change', ({ matches: isDark }) => {
    theme.value = isDark ? 'dark' : 'light';
    setPreference();
  });
