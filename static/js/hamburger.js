const hamburger = document.querySelector('.hamburger');
const overlay = document.querySelector('.overlay');

// Toggle menu when clicking hamburger
hamburger.addEventListener('click', function() {
  this.classList.toggle('active');
  overlay.classList.toggle('active');
});

// Close menu when clicking overlay background
overlay.addEventListener('click', function(e) {
  // Only close if clicking the overlay itself, not the menu items
  if (e.target === overlay) {
    hamburger.classList.remove('active');
    overlay.classList.remove('active');
  }
});

// Close menu when clicking a link
const overlayLinks = document.querySelectorAll('.overlay-header-list-item a');
overlayLinks.forEach(link => {
  link.addEventListener('click', function() {
    hamburger.classList.remove('active');
    overlay.classList.remove('active');
  });
});
