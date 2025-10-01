// Theme Toggle Functionality
(function() {
    'use strict';

    // Get the theme toggle button
    const themeToggle = document.getElementById('theme-toggle');
    const html = document.documentElement;
    
    // Check for saved theme preference or default to 'dark'
    const currentTheme = localStorage.getItem('theme') || 'dark';
    
    // Set initial theme
    html.setAttribute('data-theme', currentTheme);
    
    // Update button text based on current theme
    function updateButtonText() {
        const currentTheme = html.getAttribute('data-theme');
        if (currentTheme === 'dark') {
            themeToggle.textContent = '[light]';
            themeToggle.setAttribute('aria-label', 'Switch to light theme');
        } else {
            themeToggle.textContent = '[dark]';
            themeToggle.setAttribute('aria-label', 'Switch to dark theme');
        }
    }
    
    // Initialize button text
    updateButtonText();
    
    // Add click event listener to toggle theme
    themeToggle.addEventListener('click', function() {
        const currentTheme = html.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        // Update the data-theme attribute
        html.setAttribute('data-theme', newTheme);
        
        // Save the theme preference
        localStorage.setItem('theme', newTheme);
        
        // Update button text
        updateButtonText();
        
        // Add a subtle animation class for feedback
        themeToggle.style.transform = 'scale(0.95)';
        setTimeout(() => {
            themeToggle.style.transform = '';
        }, 150);
    });
    
    // Listen for system theme changes (optional enhancement)
    if (window.matchMedia) {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        
        // Only auto-switch if user hasn't manually set a preference
        if (!localStorage.getItem('theme')) {
            const systemTheme = mediaQuery.matches ? 'dark' : 'light';
            html.setAttribute('data-theme', systemTheme);
            updateButtonText();
        }
    }
})();
