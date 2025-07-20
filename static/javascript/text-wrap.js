/**
 * Text Wrap Utility
 * 
 * This utility provides a programmatic way to apply text wrapping around images.
 * It can be used to automatically convert any image into a text-wrapped layout.
 */

class TextWrap {
    /**
     * Apply text wrapping to an image element
     * @param {HTMLElement|string} element - The image element or selector
     * @param {Object} options - Configuration options
     * @param {string} options.position - 'left' or 'right' (default: 'left')
     * @param {boolean} options.preserveStyles - Keep existing styles (default: true)
     */
    static apply(element, options = {}) {
        const defaults = {
            position: 'left',
            preserveStyles: true
        };
        
        const config = { ...defaults, ...options };
        
        // Get the element if a selector was passed
        const img = typeof element === 'string' 
            ? document.querySelector(element) 
            : element;
        
        if (!img) {
            console.error('TextWrap: Element not found');
            return;
        }
        
        // Get the parent container
        let container = img.parentElement;
        
        // Check if already wrapped
        if (container.classList.contains('text-wrap-image-left') || 
            container.classList.contains('text-wrap-image-right')) {
            console.log('TextWrap: Image already wrapped');
            return;
        }
        
        // Find the text content (next sibling or parent's next sibling)
        let textContent = null;
        let searchElement = container;
        
        while (searchElement && !textContent) {
            // Check next siblings
            let sibling = searchElement.nextElementSibling;
            while (sibling) {
                if (sibling.tagName === 'P' || sibling.tagName === 'DIV' || 
                    sibling.classList.contains('text-content')) {
                    textContent = sibling;
                    break;
                }
                sibling = sibling.nextElementSibling;
            }
            
            // If not found, go up one level
            if (!textContent && searchElement.parentElement) {
                searchElement = searchElement.parentElement;
            } else {
                break;
            }
        }
        
        // Apply the wrapper structure
        const grandParent = container.parentElement;
        
        // Add text-wrap-container class to the grand parent
        grandParent.classList.add('text-wrap-container');
        
        // Add appropriate image wrapper class
        const wrapClass = config.position === 'right' 
            ? 'text-wrap-image-right' 
            : 'text-wrap-image-left';
        
        if (config.preserveStyles) {
            container.classList.add(wrapClass);
        } else {
            container.className = wrapClass;
        }
        
        // Wrap the text content if found
        if (textContent && !textContent.parentElement.classList.contains('text-wrap-content')) {
            const contentWrapper = document.createElement('div');
            contentWrapper.className = 'text-wrap-content';
            textContent.parentNode.insertBefore(contentWrapper, textContent);
            contentWrapper.appendChild(textContent);
        }
    }
    
    /**
     * Apply text wrapping to multiple images
     * @param {string} selector - CSS selector for images
     * @param {Object} options - Configuration options
     */
    static applyToAll(selector, options = {}) {
        const images = document.querySelectorAll(selector);
        images.forEach(img => this.apply(img, options));
    }
    
    /**
     * Remove text wrapping from an element
     * @param {HTMLElement|string} element - The wrapped element or selector
     */
    static remove(element) {
        const wrapped = typeof element === 'string' 
            ? document.querySelector(element) 
            : element;
        
        if (!wrapped) return;
        
        const container = wrapped.closest('.text-wrap-container');
        if (!container) return;
        
        // Remove wrapper classes
        container.classList.remove('text-wrap-container');
        
        const imageWrapper = container.querySelector('.text-wrap-image-left, .text-wrap-image-right');
        if (imageWrapper) {
            imageWrapper.classList.remove('text-wrap-image-left', 'text-wrap-image-right');
        }
        
        // Unwrap text content
        const contentWrapper = container.querySelector('.text-wrap-content');
        if (contentWrapper && contentWrapper.children.length > 0) {
            while (contentWrapper.firstChild) {
                contentWrapper.parentNode.insertBefore(contentWrapper.firstChild, contentWrapper);
            }
            contentWrapper.remove();
        }
    }
    
    /**
     * Toggle text wrapping on an element
     * @param {HTMLElement|string} element - The element or selector
     * @param {Object} options - Configuration options
     */
    static toggle(element, options = {}) {
        const el = typeof element === 'string' 
            ? document.querySelector(element) 
            : element;
        
        if (!el) return;
        
        const isWrapped = el.closest('.text-wrap-container') !== null;
        
        if (isWrapped) {
            this.remove(el);
        } else {
            this.apply(el, options);
        }
    }
}

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TextWrap;
}

// Example usage:
// TextWrap.apply('.about-me-aside img', { position: 'left' });
// TextWrap.applyToAll('.blog-post img', { position: 'right' });
// TextWrap.toggle('#my-image');
