// ============================================
// 1. CARD COMPONENT
// ============================================
class Card {
    constructor(options = {}) {
        this.title = options.title || 'Default Title';
        this.content = options.content || 'Default content';
        this.image = options.image || null;
        this.footer = options.footer || null;
        this.theme = options.theme || 'light';
        this.onClick = options.onClick || null;
    }

    render() {
        const card = document.createElement('div');
        card.className = `card card-${this.theme}`;
        
        // Add styles for this component
        this.addStyles();
        
        // Build card HTML
        let cardHTML = '';
        
        if (this.image) {
            cardHTML += `<div class="card-image">
                <img src="${this.image}" alt="${this.title}">
            </div>`;
        }
        
        cardHTML += `
            <div class="card-body">
                <h3 class="card-title">${this.title}</h3>
                <p class="card-content">${this.content}</p>
            </div>
        `;
        
        if (this.footer) {
            cardHTML += `<div class="card-footer">${this.footer}</div>`;
        }
        
        card.innerHTML = cardHTML;
        
        // Add click handler if provided
        if (this.onClick) {
            card.style.cursor = 'pointer';
            card.addEventListener('click', this.onClick);
        }
        
        return card;
    }

    addStyles() {
        // Check if styles already exist
        if (document.getElementById('card-styles')) return;
        
        const styles = document.createElement('style');
        styles.id = 'card-styles';
        styles.textContent = `
            .card {
                border-radius: 12px;
                overflow: hidden;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                transition: transform 0.3s, box-shadow 0.3s;
                background: white;
            }
            
            .card:hover {
                transform: translateY(-5px);
                box-shadow: 0 8px 15px rgba(0, 0, 0, 0.2);
            }
            
            .card-dark {
                background: #2d3748;
                color: white;
            }
            
            .card-image img {
                width: 100%;
                height: 200px;
                object-fit: cover;
            }
            
            .card-body {
                padding: 20px;
            }
            
            .card-title {
                margin-bottom: 10px;
                font-size: 1.25em;
            }
            
            .card-content {
                line-height: 1.6;
                opacity: 0.9;
            }
            
            .card-footer {
                padding: 15px 20px;
                background: rgba(0, 0, 0, 0.05);
                border-top: 1px solid rgba(0, 0, 0, 0.1);
            }
            
            .card-dark .card-footer {
                background: rgba(255, 255, 255, 0.05);
                border-top: 1px solid rgba(255, 255, 255, 0.1);
            }
        `;
        document.head.appendChild(styles);
    }
}

// ============================================
// 2. BUTTON COMPONENT
// ============================================
class Button {
    constructor(options = {}) {
        this.text = options.text || 'Click Me';
        this.type = options.type || 'primary'; // primary, secondary, danger, success
        this.size = options.size || 'medium'; // small, medium, large
        this.icon = options.icon || null;
        this.onClick = options.onClick || (() => console.log('Button clicked'));
        this.disabled = options.disabled || false;
    }

    render() {
        const button = document.createElement('button');
        button.className = `btn btn-${this.type} btn-${this.size}`;
        button.disabled = this.disabled;
        
        // Add styles
        this.addStyles();
        
        // Build button content
        let buttonContent = '';
        if (this.icon) {
            buttonContent += `<span class="btn-icon">${this.icon}</span>`;
        }
        buttonContent += `<span>${this.text}</span>`;
        
        button.innerHTML = buttonContent;
        button.addEventListener('click', this.onClick);
        
        return button;
    }

    addStyles() {
        if (document.getElementById('button-styles')) return;
        
        const styles = document.createElement('style');
        styles.id = 'button-styles';
        styles.textContent = `
            .btn {
                border: none;
                border-radius: 6px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.3s;
                display: inline-flex;
                align-items: center;
                gap: 8px;
                font-family: inherit;
            }
            
            .btn:disabled {
                opacity: 0.5;
                cursor: not-allowed;
            }
            
            /* Sizes */
            .btn-small {
                padding: 8px 16px;
                font-size: 14px;
            }
            
            .btn-medium {
                padding: 12px 24px;
                font-size: 16px;
            }
            
            .btn-large {
                padding: 16px 32px;
                font-size: 18px;
            }
            
            /* Types */
            .btn-primary {
                background: #4299e1;
                color: white;
            }
            
            .btn-primary:hover:not(:disabled) {
                background: #3182ce;
                transform: translateY(-2px);
                box-shadow: 0 4px 8px rgba(66, 153, 225, 0.4);
            }
            
            .btn-secondary {
                background: #718096;
                color: white;
            }
            
            .btn-secondary:hover:not(:disabled) {
                background: #4a5568;
                transform: translateY(-2px);
            }
            
            .btn-danger {
                background: #f56565;
                color: white;
            }
            
            .btn-danger:hover:not(:disabled) {
                background: #e53e3e;
                transform: translateY(-2px);
            }
            
            .btn-success {
                background: #48bb78;
                color: white;
            }
            
            .btn-success:hover:not(:disabled) {
                background: #38a169;
                transform: translateY(-2px);
            }
        `;
        document.head.appendChild(styles);
    }
}

// ============================================
// 3. MODAL COMPONENT
// ============================================
class Modal {
    constructor(options = {}) {
        this.title = options.title || 'Modal Title';
        this.content = options.content || 'Modal content goes here';
        this.buttons = options.buttons || [
            { text: 'Close', onClick: () => this.close() }
        ];
        this.isOpen = false;
        this.element = null;
    }

    render() {
        // Create modal wrapper
        const modalWrapper = document.createElement('div');
        modalWrapper.className = 'modal-wrapper';
        modalWrapper.style.display = 'none';
        
        // Add styles
        this.addStyles();
        
        // Build modal HTML
        modalWrapper.innerHTML = `
            <div class="modal-overlay"></div>
            <div class="modal">
                <div class="modal-header">
                    <h3>${this.title}</h3>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    ${this.content}
                </div>
                <div class="modal-footer"></div>
            </div>
        `;
        
        // Add close functionality
        const closeBtn = modalWrapper.querySelector('.modal-close');
        const overlay = modalWrapper.querySelector('.modal-overlay');
        closeBtn.addEventListener('click', () => this.close());
        overlay.addEventListener('click', () => this.close());
        
        // Add action buttons
        const footer = modalWrapper.querySelector('.modal-footer');
        this.buttons.forEach(btnConfig => {
            const btn = new Button({
                text: btnConfig.text,
                type: btnConfig.type || 'secondary',
                onClick: btnConfig.onClick
            });
            footer.appendChild(btn.render());
        });
        
        this.element = modalWrapper;
        document.body.appendChild(modalWrapper);
        
        // Return trigger button
        const triggerBtn = new Button({
            text: 'Open Modal',
            type: 'primary',
            onClick: () => this.open()
        });
        
        return triggerBtn.render();
    }

    open() {
        if (this.element) {
            this.element.style.display = 'block';
            this.isOpen = true;
            // Add animation
            setTimeout(() => {
                this.element.classList.add('modal-open');
            }, 10);
        }
    }

    close() {
        if (this.element) {
            this.element.classList.remove('modal-open');
            setTimeout(() => {
                this.element.style.display = 'none';
                this.isOpen = false;
            }, 300);
        }
    }

    addStyles() {
        if (document.getElementById('modal-styles')) return;
        
        const styles = document.createElement('style');
        styles.id = 'modal-styles';
        styles.textContent = `
            .modal-wrapper {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                z-index: 1000;
            }
            
            .modal-overlay {
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.5);
                opacity: 0;
                transition: opacity 0.3s;
            }
            
            .modal {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%) scale(0.9);
                background: white;
                border-radius: 12px;
                width: 90%;
                max-width: 500px;
                max-height: 90vh;
                overflow: auto;
                opacity: 0;
                transition: all 0.3s;
            }
            
            .modal-open .modal-overlay {
                opacity: 1;
            }
            
            .modal-open .modal {
                opacity: 1;
                transform: translate(-50%, -50%) scale(1);
            }
            
            .modal-header {
                padding: 20px;
                border-bottom: 1px solid #e2e8f0;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            
            .modal-close {
                background: none;
                border: none;
                font-size: 28px;
                cursor: pointer;
                color: #718096;
                line-height: 1;
                padding: 0;
                width: 30px;
                height: 30px;
            }
            
            .modal-close:hover {
                color: #2d3748;
            }
            
            .modal-body {
                padding: 20px;
            }
            
            .modal-footer {
                padding: 20px;
                border-top: 1px solid #e2e8f0;
                display: flex;
                justify-content: flex-end;
                gap: 10px;
            }
        `;
        document.head.appendChild(styles);
    }
}

// ============================================
// 4. ALERT COMPONENT
// ============================================
class Alert {
    constructor(options = {}) {
        this.message = options.message || 'Alert message';
        this.type = options.type || 'info'; // info, success, warning, error
        this.dismissible = options.dismissible !== false;
        this.autoClose = options.autoClose || 0; // milliseconds, 0 = no auto close
    }

    render() {
        const alert = document.createElement('div');
        alert.className = `alert alert-${this.type}`;
        
        // Add styles
        this.addStyles();
        
        // Get icon based on type
        const icons = {
            info: 'ℹ️',
            success: '✅',
            warning: '⚠️',
            error: '❌'
        };
        
        // Build alert HTML
        let alertHTML = `
            <span class="alert-icon">${icons[this.type]}</span>
            <span class="alert-message">${this.message}</span>
        `;
        
        if (this.dismissible) {
            alertHTML += `<button class="alert-close">&times;</button>`;
        }
        
        alert.innerHTML = alertHTML;
        
        // Add dismiss functionality
        if (this.dismissible) {
            const closeBtn = alert.querySelector('.alert-close');
            closeBtn.addEventListener('click', () => {
                alert.style.animation = 'slideOut 0.3s forwards';
                setTimeout(() => alert.remove(), 300);
            });
        }
        
        // Auto close if specified
        if (this.autoClose > 0) {
            setTimeout(() => {
                if (alert.parentNode) {
                    alert.style.animation = 'slideOut 0.3s forwards';
                    setTimeout(() => alert.remove(), 300);
                }
            }, this.autoClose);
        }
        
        // Add entrance animation
        setTimeout(() => {
            alert.classList.add('alert-show');
        }, 10);
        
        return alert;
    }

    addStyles() {
        if (document.getElementById('alert-styles')) return;
        
        const styles = document.createElement('style');
        styles.id = 'alert-styles';
        styles.textContent = `
            @keyframes slideIn {
                from {
                    transform: translateX(-100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
            
            @keyframes slideOut {
                from {
                    transform: translateX(0);
                    opacity: 1;
                }
                to {
                    transform: translateX(-100%);
                    opacity: 0;
                }
            }
            
            .alert {
                padding: 16px 20px;
                border-radius: 8px;
                margin-bottom: 16px;
                display: flex;
                align-items: center;
                gap: 12px;
                opacity: 0;
                transform: translateX(-20px);
                transition: all 0.3s;
            }
            
            .alert-show {
                opacity: 1;
                transform: translateX(0);
            }
            
            .alert-icon {
                font-size: 20px;
            }
            
            .alert-message {
                flex: 1;
                font-weight: 500;
            }
            
            .alert-close {
                background: none;
                border: none;
                font-size: 24px;
                cursor: pointer;
                opacity: 0.7;
                padding: 0;
                line-height: 1;
            }
            
            .alert-close:hover {
                opacity: 1;
            }
            
            .alert-info {
                background: #bee3f8;
                color: #2c5282;
                border-left: 4px solid #2b6cb0;
            }
            
            .alert-success {
                background: #c6f6d5;
                color: #22543d;
                border-left: 4px solid #48bb78;
            }
            
            .alert-warning {
                background: #feebc8;
                color: #7c2d12;
                border-left: 4px solid #ed8936;
            }
            
            .alert-error {
                background: #fed7d7;
                color: #742a2a;
                border-left: 4px solid #f56565;
            }
        `;
        document.head.appendChild(styles);
    }
}

// ============================================
// 1. CARD COMPONENT
// ============================================

// ============================================
// INITIALIZE COMPONENTS
// ============================================

// Create multiple Card instances
const cardsContainer = document.getElementById('cards-container');

const cardData = [
    {
        title: 'Mountain Adventure',
        content: 'Explore the breathtaking mountain ranges with guided tours and camping experiences.',
        image: 'https://picsum.photos/400/300?random=1',
        footer: '5 days tour • $299',
        theme: 'light',
        onClick: () => alert('Mountain Adventure clicked!')
    },
    {
        title: 'Ocean Paradise',
        content: 'Dive into crystal clear waters and discover the underwater world.',
        image: 'https://picsum.photos/400/300?random=2',
        footer: '7 days tour • $599',
        theme: 'dark'
    },
    {
        title: 'City Lights',
        content: 'Experience the vibrant nightlife and cultural attractions of the metropolis.',
        image: 'https://picsum.photos/400/300?random=3',
        footer: '3 days tour • $199',
        theme: 'light'
    }
];

cardData.forEach(data => {
    const card = new Card(data);
    cardsContainer.appendChild(card.render());
});

// Create multiple Button instances
const buttonsContainer = document.getElementById('buttons-container');

const buttonConfigs = [
    { text: 'Save Changes', type: 'success', size: 'large', icon: '💾' },
    { text: 'Delete', type: 'danger', size: 'medium', icon: '🗑️' },
    { text: 'Cancel', type: 'secondary', size: 'medium' },
    { text: 'Download', type: 'primary', size: 'small', icon: '⬇️' },
    { text: 'Disabled Button', type: 'primary', size: 'medium', disabled: true }
];

buttonConfigs.forEach(config => {
    const button = new Button(config);
    buttonsContainer.appendChild(button.render());
});

// Create Modal instance
const modalContainer = document.getElementById('modal-container');
const modal = new Modal({
    title: 'Welcome to Reusable Components!',
    content: `
        <p>This modal is a reusable component that can be configured with:</p>
        <ul style="margin: 15px 0; padding-left: 20px;">
            <li>Custom title and content</li>
            <li>Multiple action buttons</li>
            <li>Click-outside-to-close functionality</li>
            <li>Smooth animations</li>
        </ul>
        <p>Try clicking outside the modal or the X button to close it!</p>
    `,
    buttons: [
        { 
            text: 'Got it!', 
            type: 'success',
            onClick: function() { 
                modal.close();
                // Create a success alert
                const alert = new Alert({
                    message: 'Modal closed successfully!',
                    type: 'success',
                    autoClose: 3000
                });
                document.getElementById('alerts-container').appendChild(alert.render());
            }
        },
        { text: 'Cancel', type: 'secondary', onClick: () => modal.close() }
    ]
});

modalContainer.appendChild(modal.render());

// Create Alert instances
const alertsContainer = document.getElementById('alerts-container');

const alerts = [
    { message: 'This is an info alert with auto-close', type: 'info', autoClose: 5000 },
    { message: 'Success! Your changes have been saved.', type: 'success' },
    { message: 'Warning: Please review your input.', type: 'warning' },
    { message: 'Error: Something went wrong.', type: 'error', dismissible: false }
];

// Add alerts with staggered animation
alerts.forEach((alertConfig, index) => {
    setTimeout(() => {
        const alert = new Alert(alertConfig);
        alertsContainer.appendChild(alert.render());
    }, index * 200);
});

// ============================================
// COMPONENT FACTORY PATTERN (Alternative Approach)
// ============================================
class ComponentFactory {
    static create(type, options) {
        const components = {
            'card': Card,
            'button': Button,
            'modal': Modal,
            'alert': Alert
        };
        
        const ComponentClass = components[type];
        if (!ComponentClass) {
            throw new Error(`Component type "${type}" not found`);
        }
        
        return new ComponentClass(options);
    }
}

// Example of using the factory pattern
console.log('Factory Pattern Example:');
const factoryButton = ComponentFactory.create('button', {
    text: 'Factory Button',
    type: 'primary'
});
// buttonsContainer.appendChild(factoryButton.render());

// ============================================
// COMPONENT REGISTRY (For Dynamic Component Loading)
// ============================================
class ComponentRegistry {
    constructor() {
        this.components = new Map();
    }
    
    register(name, component) {
        this.components.set(name, component);
    }
    
    get(name) {
        return this.components.get(name);
    }
    
    create(name, options) {
        const Component = this.get(name);
        if (!Component) {
            throw new Error(`Component "${name}" not registered`);
        }
        return new Component(options);
    }
}

// Register all components
const registry = new ComponentRegistry();
registry.register('card', Card);
registry.register('button', Button);
registry.register('modal', Modal);
registry.register('alert', Alert);

