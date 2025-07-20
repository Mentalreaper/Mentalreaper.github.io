// Modern Carousel Functionality
(function() {
    'use strict';

    // Wait for DOM to be fully loaded
    document.addEventListener('DOMContentLoaded', function() {
        const slides = document.querySelectorAll('.carousel-slide');
        const arrows = document.querySelectorAll('.arrow');
        let currentSlide = 0;
        let slideInterval;
        let isAutoPlaying = true;

        // Initialize carousel
        function initCarousel() {
            if (slides.length === 0) return;
            
            // Ensure first slide is active
            slides.forEach((slide, index) => {
                slide.classList.toggle('active', index === 0);
            });
            
            // Start auto-play
            startAutoPlay();
        }

        // Navigate to specific slide
        function goToSlide(slideIndex) {
            if (slideIndex < 0 || slideIndex >= slides.length) return;
            
            // Remove active class from current slide
            slides[currentSlide].classList.remove('active');
            
            // Update current slide index
            currentSlide = slideIndex;
            
            // Add active class to new slide
            slides[currentSlide].classList.add('active');
        }

        // Next slide function
        function nextSlide() {
            const nextIndex = (currentSlide + 1) % slides.length;
            goToSlide(nextIndex);
        }

        // Previous slide function  
        function previousSlide() {
            const prevIndex = (currentSlide - 1 + slides.length) % slides.length;
            goToSlide(prevIndex);
        }

        // Auto-play functionality
        function startAutoPlay() {
            if (slides.length <= 1) return;
            
            slideInterval = setInterval(() => {
                if (isAutoPlaying) {
                    nextSlide();
                }
            }, 5000);
        }

        function stopAutoPlay() {
            if (slideInterval) {
                clearInterval(slideInterval);
                slideInterval = null;
            }
        }

        function pauseAutoPlay() {
            isAutoPlaying = false;
        }

        function resumeAutoPlay() {
            isAutoPlaying = true;
        }

        // Event listeners for arrows
        arrows.forEach(arrow => {
            arrow.addEventListener('click', function(e) {
                e.preventDefault();
                
                if (this.classList.contains('arrow-left')) {
                    previousSlide();
                } else if (this.classList.contains('arrow-right')) {
                    nextSlide();
                }
                
                // Pause auto-play briefly when user interacts
                pauseAutoPlay();
                setTimeout(resumeAutoPlay, 3000);
            });

            // Pause auto-play on hover
            arrow.addEventListener('mouseenter', pauseAutoPlay);
            arrow.addEventListener('mouseleave', resumeAutoPlay);
        });

        // Pause auto-play when carousel is hovered
        const carousel = document.getElementById('carousel');
        if (carousel) {
            carousel.addEventListener('mouseenter', pauseAutoPlay);
            carousel.addEventListener('mouseleave', resumeAutoPlay);
        }

        // Keyboard navigation
        document.addEventListener('keydown', function(e) {
            // Only handle if carousel is in viewport
            if (!carousel || !isElementInViewport(carousel)) return;
            
            switch(e.key) {
                case 'ArrowLeft':
                    e.preventDefault();
                    previousSlide();
                    pauseAutoPlay();
                    setTimeout(resumeAutoPlay, 3000);
                    break;
                case 'ArrowRight':
                    e.preventDefault();
                    nextSlide();
                    pauseAutoPlay();
                    setTimeout(resumeAutoPlay, 3000);
                    break;
            }
        });

        // Touch/swipe support for mobile
        let touchStartX = 0;
        let touchEndX = 0;

        if (carousel) {
            carousel.addEventListener('touchstart', function(e) {
                touchStartX = e.changedTouches[0].screenX;
            }, { passive: true });

            carousel.addEventListener('touchend', function(e) {
                touchEndX = e.changedTouches[0].screenX;
                handleSwipe();
            }, { passive: true });
        }

        function handleSwipe() {
            const swipeThreshold = 50;
            const diff = touchStartX - touchEndX;

            if (Math.abs(diff) > swipeThreshold) {
                if (diff > 0) {
                    // Swiped left - go to next slide
                    nextSlide();
                } else {
                    // Swiped right - go to previous slide
                    previousSlide();
                }
                
                pauseAutoPlay();
                setTimeout(resumeAutoPlay, 3000);
            }
        }

        // Utility function to check if element is in viewport
        function isElementInViewport(el) {
            const rect = el.getBoundingClientRect();
            return (
                rect.top >= 0 &&
                rect.left >= 0 &&
                rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
                rect.right <= (window.innerWidth || document.documentElement.clientWidth)
            );
        }

        // Handle visibility change (pause when tab is not visible)
        document.addEventListener('visibilitychange', function() {
            if (document.hidden) {
                pauseAutoPlay();
            } else {
                resumeAutoPlay();
            }
        });

        // Expose functions globally for onclick handlers in HTML
        window.nextSlide = nextSlide;
        window.previousSlide = previousSlide;

        // Initialize the carousel
        initCarousel();

        // Reinitialize if window is resized (for responsive behavior)
        let resizeTimeout;
        window.addEventListener('resize', function() {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(function() {
                // Could add responsive logic here if needed
            }, 250);
        });
    });
})();
