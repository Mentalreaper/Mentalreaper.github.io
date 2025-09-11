// ===== FAKE POP-UP SYSTEM =====
class PopupSystem {
    constructor() {
        this.popupCount = 0;
        this.activePopups = new Set();
        this.zIndexCounter = 9999;
        this.init();
    }

    init() {
        // Add styles dynamically
        this.injectStyles();
        
        // Start random pop-ups after a delay
        setTimeout(() => this.startRandomPopups(), 3000);
        
        // Add keyboard shortcut for pop-up bomb
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.shiftKey && e.key === 'P') {
                this.popupBomb();
            }
        });
    }

    injectStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .fake-popup {
                position: fixed;
                background: #c0c0c0;
                border: 2px solid;
                border-color: #ffffff #808080 #808080 #ffffff;
                box-shadow: 1px 1px 0 #000, 2px 2px 5px rgba(0,0,0,0.5);
                font-family: "MS Sans Serif", sans-serif;
                animation: popupAppear 0.1s ease-out;
                z-index: 9999;
            }

            @keyframes popupAppear {
                from {
                    transform: scale(0.3);
                    opacity: 0;
                }
                to {
                    transform: scale(1);
                    opacity: 1;
                }
            }

            .popup-title-bar {
                background: linear-gradient(90deg, #000080, #1084d0);
                color: white;
                padding: 2px 4px;
                display: flex;
                align-items: center;
                font-weight: bold;
                font-size: 11px;
                cursor: move;
                user-select: none;
            }

            .popup-title-bar.error {
                background: linear-gradient(90deg, #800000, #ff0000);
            }

            .popup-title-bar.warning {
                background: linear-gradient(90deg, #808000, #ffff00);
                color: black;
            }

            .popup-close-btn {
                margin-left: auto;
                width: 16px;
                height: 14px;
                background: #c0c0c0;
                border: 1px solid;
                border-color: #ffffff #808080 #808080 #ffffff;
                font-size: 10px;
                line-height: 1;
                text-align: center;
                cursor: pointer;
                font-weight: bold;
            }

            .popup-close-btn:hover {
                background: #e0e0e0;
            }

            .popup-close-btn:active {
                border-color: #808080 #ffffff #ffffff #808080;
            }

            .popup-content {
                padding: 10px;
                background: #c0c0c0;
                min-width: 250px;
                max-width: 400px;
            }

            .popup-icon {
                display: inline-block;
                width: 32px;
                height: 32px;
                margin-right: 10px;
                font-size: 28px;
                vertical-align: middle;
            }

            .popup-message {
                display: inline-block;
                vertical-align: middle;
                max-width: 300px;
            }

            .popup-buttons {
                text-align: center;
                margin-top: 15px;
            }

            .popup-button {
                background: #c0c0c0;
                border: 2px solid;
                border-color: #ffffff #808080 #808080 #ffffff;
                padding: 4px 15px;
                margin: 0 5px;
                cursor: pointer;
                font-size: 11px;
                font-family: inherit;
            }

            .popup-button:hover {
                background: #e0e0e0;
            }

            .popup-button:active {
                border-color: #808080 #ffffff #ffffff #808080;
            }

            .popup-progress-bar {
                background: #000;
                border: 2px inset #808080;
                height: 20px;
                margin: 10px 0;
                position: relative;
                overflow: hidden;
            }

            .popup-progress-fill {
                background: repeating-linear-gradient(
                    90deg,
                    #0000ff,
                    #0000ff 10px,
                    #00ffff 10px,
                    #00ffff 20px
                );
                height: 100%;
                width: 0%;
                animation: progress 3s linear forwards;
            }

            @keyframes progress {
                to { width: 100%; }
            }

            .popup-blink {
                animation: blink 0.5s infinite;
            }

            .popup-shake {
                animation: shake 0.5s infinite;
            }

            @keyframes shake {
                0%, 100% { transform: translateX(0); }
                25% { transform: translateX(-5px); }
                75% { transform: translateX(5px); }
            }

            .popup-toolbar {
                background: #e0e0e0;
                border-top: 1px solid #ffffff;
                border-bottom: 1px solid #808080;
                padding: 2px;
                display: flex;
                gap: 2px;
            }

            .toolbar-button {
                width: 23px;
                height: 22px;
                background: #c0c0c0;
                border: 1px solid;
                border-color: #ffffff #808080 #808080 #ffffff;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 16px;
            }

            .cascade-spawn {
                animation: cascadeIn 0.2s ease-out;
            }

            @keyframes cascadeIn {
                from {
                    transform: translate(-20px, -20px) scale(0.8);
                    opacity: 0;
                }
                to {
                    transform: translate(0, 0) scale(1);
                    opacity: 1;
                }
            }
        `;
        document.head.appendChild(style);
    }

    createPopup(options = {}) {
        const defaults = {
            title: 'Windows',
            message: 'A thing happened!',
            type: 'info', // info, error, warning, success
            x: Math.random() * (window.innerWidth - 400),
            y: Math.random() * (window.innerHeight - 200),
            closeable: true,
            buttons: [],
            icon: '💾',
            shake: false,
            blink: false,
            hasToolbar: false,
            hasProgress: false,
            onClose: null,
            cascadeSpawn: false
        };

        const config = { ...defaults, ...options };
        
        const popup = document.createElement('div');
        popup.className = 'fake-popup';
        if (config.shake) popup.classList.add('popup-shake');
        if (config.cascadeSpawn) popup.classList.add('cascade-spawn');
        
        popup.style.left = config.x + 'px';
        popup.style.top = config.y + 'px';
        popup.style.zIndex = this.zIndexCounter++;
        
        const popupId = 'popup-' + this.popupCount++;
        popup.id = popupId;

        // Title bar
        const titleBar = document.createElement('div');
        titleBar.className = `popup-title-bar ${config.type}`;
        titleBar.innerHTML = `
            <span>${config.title}</span>
            ${config.closeable ? `<button class="popup-close-btn" onclick="popupSystem.closePopup('${popupId}')">×</button>` : ''}
        `;

        // Toolbar (optional)
        let toolbar = '';
        if (config.hasToolbar) {
            toolbar = `
                <div class="popup-toolbar">
                    <button class="toolbar-button">📁</button>
                    <button class="toolbar-button">💾</button>
                    <button class="toolbar-button">✂️</button>
                    <button class="toolbar-button">📋</button>
                    <button class="toolbar-button">🔍</button>
                </div>
            `;
        }

        // Content
        const content = document.createElement('div');
        content.className = 'popup-content';
        if (config.blink) content.classList.add('popup-blink');
        
        let progressBar = '';
        if (config.hasProgress) {
            progressBar = `
                <div class="popup-progress-bar">
                    <div class="popup-progress-fill"></div>
                </div>
            `;
        }

        let buttonsHtml = '';
        if (config.buttons.length > 0) {
            buttonsHtml = '<div class="popup-buttons">';
            config.buttons.forEach((btn, index) => {
                buttonsHtml += `<button class="popup-button" onclick="popupSystem.handleButton('${popupId}', ${index})">${btn.text}</button>`;
            });
            buttonsHtml += '</div>';
        }

        content.innerHTML = `
            ${toolbar}
            <div>
                <span class="popup-icon">${config.icon}</span>
                <span class="popup-message">${config.message}</span>
            </div>
            ${progressBar}
            ${buttonsHtml}
        `;

        popup.appendChild(titleBar);
        popup.appendChild(content);
        document.body.appendChild(popup);

        // Make draggable
        this.makeDraggable(popup, titleBar);

        // Store popup info
        this.activePopups.add({
            id: popupId,
            element: popup,
            config: config
        });

        // Auto close after progress completes
        if (config.hasProgress) {
            setTimeout(() => {
                this.closePopup(popupId);
            }, 3000);
        }

        return popupId;
    }

    makeDraggable(popup, handle) {
        let isDragging = false;
        let currentX;
        let currentY;
        let initialX;
        let initialY;

        handle.addEventListener('mousedown', (e) => {
            isDragging = true;
            initialX = e.clientX - popup.offsetLeft;
            initialY = e.clientY - popup.offsetTop;
            popup.style.zIndex = this.zIndexCounter++;
        });

        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            e.preventDefault();
            currentX = e.clientX - initialX;
            currentY = e.clientY - initialY;
            popup.style.left = currentX + 'px';
            popup.style.top = currentY + 'px';
        });

        document.addEventListener('mouseup', () => {
            isDragging = false;
        });
    }

    closePopup(popupId) {
        const popup = document.getElementById(popupId);
        if (popup) {
            // Find and execute onClose callback
            const popupInfo = Array.from(this.activePopups).find(p => p.id === popupId);
            if (popupInfo && popupInfo.config.onClose) {
                popupInfo.config.onClose();
            }
            
            popup.style.animation = 'popupAppear 0.1s ease-out reverse';
            setTimeout(() => {
                popup.remove();
                this.activePopups.delete(popupInfo);
            }, 100);
        }
    }

    handleButton(popupId, buttonIndex) {
        const popupInfo = Array.from(this.activePopups).find(p => p.id === popupId);
        if (popupInfo && popupInfo.config.buttons[buttonIndex]) {
            const button = popupInfo.config.buttons[buttonIndex];
            if (button.action) {
                button.action();
            }
            if (button.closes !== false) {
                this.closePopup(popupId);
            }
        }
    }

    // Preset popup types
    showError(message, title = 'Error') {
        return this.createPopup({
            title,
            message,
            type: 'error',
            icon: '❌',
            shake: true,
            buttons: [
                { text: 'OK', action: () => this.showError('ERROR ACKNOWLEDGING ERROR!', 'ERROR ERROR') }
            ]
        });
    }

    showWarning(message, title = 'Warning!!!') {
        return this.createPopup({
            title,
            message,
            type: 'warning',
            icon: '⚠️',
            blink: true,
            buttons: [
                { text: 'Ignore', action: () => this.cascade() },
                { text: 'Panic', action: () => this.popupBomb() }
            ]
        });
    }

    showDownload(filename = 'james_work_folder_downloader.exe') {
        return this.createPopup({
            title: 'Downloading...',
            message: `Downloading ${filename} (47.2MB)`,
            type: 'info',
            icon: '💾',
            hasProgress: true,
            closeable: false
        });
    }

    showToolbar() {
        return this.createPopup({
            title: 'Free Toolbar Installed!',
            message: 'Congratulations! You have installed 17 new toolbars!',
            type: 'success',
            icon: '🎉',
            hasToolbar: true,
            buttons: [
                { text: 'Install More', action: () => this.showToolbar() },
                { text: 'Uninstall', action: () => this.showError('UNINSTALL FAILED!') }
            ]
        });
    }

    showGarethCoin() {
        return this.createPopup({
            title: '[GARETHCOIN MINER]',
            message: 'Mining [GARETHCOIN]... CPU Usage: 420%',
            type: 'info',
            icon: '⛏️',
            hasProgress: true,
            shake: true,
            onClose: () => {
                this.showWarning('MINING INTERRUPTED! [GARETHCOIN] LOST!');
            }
        });
    }

    showBigShot() {
        return this.createPopup({
            title: 'BECOME A [BIG SHOT]',
            message: 'NOW\'S YOUR CHANCE TO BE A [BIG SHOT]!\nBE A BIG BE A BIG BE A [BIG SHOT]!',
            type: 'info',
            icon: '💰',
            blink: true,
            buttons: [
                { text: '[HYPERLINK BLOCKED]', action: () => this.showError('[HYPERLINK BLOCKED]') },
                { text: 'ACCEPT DEAL', action: () => this.cascade() }
            ]
        });
    }

    // Cascade effect - spawns multiple popups
    cascade() {
        const messages = [
            'GREAT DEALS!!!',
            'CLICK HERE!!!',
            'im really going to do it this time',
            'WARNING!!!',
            'DOWNLOAD NOW!!!',
            'FREE GARETHCOIN!!!',
            '[HYPERLINK BLOCKED]',
            'CONGRATULATIONS!!!',
            'SYSTEM32 DELETED!!!',
            'VIRUS DETECTED!!!'
        ];

        for (let i = 0; i < 5; i++) {
            setTimeout(() => {
                this.createPopup({
                    title: messages[Math.floor(Math.random() * messages.length)],
                    message: messages[Math.floor(Math.random() * messages.length)],
                    type: ['info', 'error', 'warning'][Math.floor(Math.random() * 3)],
                    icon: ['💾', '❌', '⚠️', '🎉', '💰', '🔥'][Math.floor(Math.random() * 6)],
                    x: 100 + i * 30,
                    y: 100 + i * 30,
                    cascadeSpawn: true,
                    buttons: [
                        { text: 'OK', action: () => Math.random() > 0.5 && this.createRandomPopup() }
                    ]
                });
            }, i * 100);
        }
    }

    // Popup bomb - creates many popups at once
    popupBomb() {
        for (let i = 0; i < 10; i++) {
            setTimeout(() => this.createRandomPopup(), i * 50);
        }
    }

    createRandomPopup() {
        const popupTypes = [
            () => this.showError('CRITICAL ERROR IN MODULE [DEALS.DLL]'),
            () => this.showWarning('Low on GARETHCOIN! Mine more?'),
            () => this.showDownload(),
            () => this.showToolbar(),
            () => this.showGarethCoin(),
            () => this.showBigShot(),
            () => this.createPopup({
                title: 'Hot Singles',
                message: 'Hot singles in [NEIZ CITY] want to meet you!',
                icon: '❤️',
                buttons: [{ text: 'Show Me', action: () => this.showError('[HYPERLINK BLOCKED]') }]
            }),
            () => this.createPopup({
                title: 'You\'ve Got Mail!',
                message: '9,999 unread messages from N413@DEALS.COM',
                icon: '📧',
                hasProgress: true
            }),
            () => this.createPopup({
                title: 'Update Required',
                message: 'Internet Explorer 3 needs to update',
                icon: '🌐',
                buttons: [
                    { text: 'Update', action: () => this.showDownload('ie3_update.exe') },
                    { text: 'Remind Me Later', action: () => setTimeout(() => this.createRandomPopup(), 1000) }
                ]
            })
        ];

        popupTypes[Math.floor(Math.random() * popupTypes.length)]();
    }

    startRandomPopups() {
        // Create a popup every 8-15 seconds
        setInterval(() => {
            if (Math.random() > 0.3) {
                this.createRandomPopup();
            }
        }, 8000 + Math.random() * 7000);

        // Show initial popup
        this.showBigShot();
    }

    // Close all popups
    closeAll() {
        this.activePopups.forEach(popup => {
            if (popup.element) {
                popup.element.remove();
            }
        });
        this.activePopups.clear();
    }
}

// Initialize the popup system
const popupSystem = new PopupSystem();

// Expose some functions globally for onclick handlers
window.popupSystem = popupSystem;

// Add triggers to existing page elements (if they exist)
document.addEventListener('DOMContentLoaded', () => {
    // Add popup triggers to any elements with class 'nav-item'
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            popupSystem.createRandomPopup();
        });
    });

    // Add to product cards
    document.querySelectorAll('.product-card').forEach(card => {
        card.addEventListener('click', () => {
            popupSystem.showDownload('definitely_not_malware.exe');
        });
    });
});

// Console commands for fun
console.log('%cPOPUP SYSTEM LOADED!', 'color: #ff00ff; font-size: 20px; font-weight: bold;');
console.log('%cCommands:', 'color: #00ffff; font-size: 14px;');
console.log('%cpopupSystem.popupBomb() - Create popup explosion', 'color: #00ff00;');
console.log('%cpopupSystem.cascade() - Cascade effect', 'color: #00ff00;');
console.log('%cpopupSystem.closeAll() - Close all popups', 'color: #00ff00;');
console.log('%cPress Ctrl+Shift+P for popup bomb!', 'color: #ffff00;');