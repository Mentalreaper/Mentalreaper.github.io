// Modern Dropdown Navigation System
(function() {
    'use strict';

    // Configuration object for easy customization
    const config = {
        // Project structure - easily configurable
        projects: {
            displayPages: [
                // Add display pages here when identified
                // { title: "Display Project 1", url: "/projects/display1" }
            ],
            categories: [
                { title: "Live Demos", url: "/projects/liveDemos" },
                { title: "Games", url: "/projects/games" },
                { title: "Non-Games / Software", url: "/projects/nonGames" },
                { title: "Game Jams", url: "/projects/gameJams" },
                { title: "University Year 3", url: "/projects/UniversityYear3" },
                { title: "University Year 2", url: "/projects/universityYear2" },
                { title: "University Year 1", url: "/projects/universityYear1" }
            ]
        },
        blog: {
            posts: [
                { title: "My Game Development Journey", url: "/blog/my-game-development-journey.html" },
                { title: "Tools & Technologies I Use", url: "/blog/tools-and-technologies.html" },
                { title: "Games I Recommend", url: "/blog/gamesIRecommend.html" }
                // Additional blog posts will be added here
            ]
        }
    };

    // Initialize dropdown navigation
    function initDropdownNav() {
        createProjectsDropdown();
        createBlogDropdown();
        setupMobileDropdowns();
        setupKeyboardNavigation();
    }

    // Create projects dropdown
    function createProjectsDropdown() {
        const projectsNav = document.querySelector('.header-list-item a[href="/projects"]');
        if (!projectsNav) return;

        const listItem = projectsNav.parentElement;
        
        // Convert to dropdown container
        listItem.classList.add('nav-dropdown', 'projects-dropdown');
        
        // Add dropdown arrow to the link
        if (!projectsNav.querySelector('.dropdown-arrow')) {
            // The arrow is handled by CSS ::after
        }

        // Create dropdown content
        const dropdownContent = document.createElement('div');
        dropdownContent.className = 'dropdown-content';
        
        let dropdownHTML = '';

        // Add display pages if any exist
        if (config.projects.displayPages.length > 0) {
            dropdownHTML += '<div class="dropdown-display-section">';
            config.projects.displayPages.forEach(page => {
                dropdownHTML += `<a href="${page.url}" class="dropdown-item dropdown-display-item">${page.title}</a>`;
            });
            dropdownHTML += '</div>';
            dropdownHTML += '<div class="dropdown-separator"></div>';
        }

        // Add project categories
        config.projects.categories.forEach(category => {
            dropdownHTML += `<a href="${category.url}" class="dropdown-item">${category.title}</a>`;
        });

        dropdownContent.innerHTML = dropdownHTML;
        listItem.appendChild(dropdownContent);
    }

    // Create blog dropdown
    function createBlogDropdown() {
        const blogNav = document.querySelector('.header-list-item a[href="/blog"]');
        if (!blogNav) return;

        const listItem = blogNav.parentElement;
        
        // Convert to dropdown container
        listItem.classList.add('nav-dropdown', 'blog-dropdown');

        // Create dropdown content
        const dropdownContent = document.createElement('div');
        dropdownContent.className = 'dropdown-content';
        
        let dropdownHTML = '';

        // Add recent blog posts (limit to 5)
        const recentPosts = config.blog.posts.slice(0, 5);
        recentPosts.forEach(post => {
            dropdownHTML += `<a href="${post.url}" class="dropdown-item">${post.title}</a>`;
        });

        // If no posts, show a placeholder
        if (recentPosts.length === 0) {
            dropdownHTML += '<div class="dropdown-item" style="cursor: default; color: var(--text-muted);">No posts yet</div>';
        }

        dropdownContent.innerHTML = dropdownHTML;
        listItem.appendChild(dropdownContent);
    }

    // Setup mobile dropdown functionality
    function setupMobileDropdowns() {
        const overlay = document.querySelector('.overlay .overlay-header-list');
        if (!overlay) return;

        // Find projects and blog items in mobile menu
        const mobileProjectsItem = overlay.querySelector('a[href="/projects"]')?.parentElement;
        const mobileBlogItem = overlay.querySelector('a[href="/blog"]')?.parentElement;

        if (mobileProjectsItem) {
            createMobileDropdown(mobileProjectsItem, 'projects');
        }

        if (mobileBlogItem) {
            createMobileDropdown(mobileBlogItem, 'blog');
        }
    }

    // Create mobile dropdown
    function createMobileDropdown(listItem, type) {
        const link = listItem.querySelector('a');
        const originalText = link.textContent;
        
        // Create toggle button
        const toggleButton = document.createElement('button');
        toggleButton.className = 'mobile-dropdown-toggle';
        toggleButton.textContent = originalText + ' ▼';
        toggleButton.style.cssText = `
            background: none;
            border: none;
            color: inherit;
            font: inherit;
            cursor: pointer;
            width: 100%;
            text-align: left;
            padding: inherit;
        `;

        // Create mobile dropdown content
        const mobileDropdown = document.createElement('div');
        mobileDropdown.className = 'dropdown-content-mobile';
        mobileDropdown.style.display = 'none';

        let dropdownHTML = '';

        if (type === 'projects') {
            // Add display pages if any
            if (config.projects.displayPages.length > 0) {
                config.projects.displayPages.forEach(page => {
                    dropdownHTML += `<a href="${page.url}" class="dropdown-item dropdown-display-item">${page.title}</a>`;
                });
                dropdownHTML += '<div class="dropdown-separator"></div>';
            }

            // Add project categories
            config.projects.categories.forEach(category => {
                dropdownHTML += `<a href="${category.url}" class="dropdown-item">${category.title}</a>`;
            });
        } else if (type === 'blog') {
            const recentPosts = config.blog.posts.slice(0, 5);
            recentPosts.forEach(post => {
                dropdownHTML += `<a href="${post.url}" class="dropdown-item">${post.title}</a>`;
            });

            if (recentPosts.length === 0) {
                dropdownHTML += '<div class="dropdown-item" style="cursor: default; color: var(--text-muted);">No posts yet</div>';
            }
        }

        mobileDropdown.innerHTML = dropdownHTML;

        // Toggle functionality
        toggleButton.addEventListener('click', function(e) {
            e.preventDefault();
            const isOpen = mobileDropdown.style.display !== 'none';
            
            if (isOpen) {
                mobileDropdown.style.display = 'none';
                toggleButton.textContent = originalText + ' ▼';
            } else {
                mobileDropdown.style.display = 'block';
                toggleButton.textContent = originalText + ' ▲';
            }
        });

        // Replace original link with toggle button and add dropdown
        listItem.replaceChild(toggleButton, link);
        listItem.appendChild(mobileDropdown);
    }

    // Setup keyboard navigation for accessibility
    function setupKeyboardNavigation() {
        const dropdownItems = document.querySelectorAll('.dropdown-item');
        
        dropdownItems.forEach(item => {
            item.addEventListener('keydown', function(e) {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.click();
                }
            });

            // Make items focusable
            if (!item.hasAttribute('tabindex')) {
                item.setAttribute('tabindex', '0');
            }
        });
    }

    // Auto-discovery function for display pages (can be extended)
    function discoverDisplayPages() {
        // This function can be enhanced to automatically discover pages
        // marked with data-display attributes or specific classes
        // For now, it's a placeholder for future enhancement
        
        // Example: Scan for pages with data-display="true"
        // const displayPages = document.querySelectorAll('[data-display="true"]');
        // displayPages.forEach(page => {
        //     // Extract page info and add to config
        // });
    }

    // Utility function to add a display page dynamically
    function addDisplayPage(title, url) {
        config.projects.displayPages.push({ title, url });
        // Refresh the dropdowns
        refreshDropdowns();
    }

    // Utility function to add a blog post dynamically
    function addBlogPost(title, url) {
        config.blog.posts.unshift({ title, url }); // Add to beginning
        // Keep only the 5 most recent
        config.blog.posts = config.blog.posts.slice(0, 5);
        // Refresh the dropdowns
        refreshDropdowns();
    }

    // Refresh dropdowns when content changes
    function refreshDropdowns() {
        // Remove existing dropdowns
        document.querySelectorAll('.dropdown-content').forEach(dropdown => dropdown.remove());
        document.querySelectorAll('.dropdown-content-mobile').forEach(dropdown => dropdown.remove());
        
        // Recreate dropdowns
        initDropdownNav();
    }

    // Expose public API for dynamic content management
    window.DropdownNav = {
        addDisplayPage,
        addBlogPost,
        refreshDropdowns,
        config
    };

    // Initialize when DOM is ready
    document.addEventListener('DOMContentLoaded', function() {
        initDropdownNav();
        discoverDisplayPages();
    });

    // Handle page transitions (for SPA-like behavior if needed)
    window.addEventListener('popstate', function() {
        // Refresh dropdowns on navigation if needed
        setTimeout(initDropdownNav, 100);
    });

})();
