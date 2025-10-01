// ===== EASILY EDITABLE CONTENT VARIABLES =====
const products = [
    {
        title: "NEIZ_GAME",
        subtitle: "NEIZ GAME CHAPTER 1",
        price: "$9999.99",
        salePrice: "$1.99",
        discount: "LOWEST PRICE!",
        emoji: "🎮"
    },
    {
        title: "C.BAR",
        subtitle: "A BAR OF C&nbsp;&nbsp;K&nbsp;LATE",
        price: "$199.99",
        salePrice: "$0.99",
        discount: "AMAZING DEAL!!",
        emoji: "🎮"
    },
    {
        title: "KEYGEN&VPN",
        subtitle: "NEVER BEFORE [As Seen On TV] DEAL",
        price: "$9999.99",
        salePrice: "$1.99",
        discount: "$£!#",
        emoji: "🎮"
    },
    {
        title: "CRYPTOMIN&nbsp;R",
        subtitle: "USE THIS CRYPT&nbsp;MIN&nbsp;R! FEED IT [Once in a Blue Moon]",
        price: "$9999.99",
        salePrice: "$1.99",
        discount: "NEVER AGAIN",
        emoji: "🎮"
    }
];

const guestbookMessages = [
    "AMAZING [DEALS]!",
    "MY [COMPUTER] EXPLODED BUT WORTH IT!",
    "10/10 WOULD [HYPERLINK] AGAIN!",
    "[GARETHCOIN] RECEIVED SUCCESSFULLY!",
    "BECAME A [BIG SHOT]!",
    "HELP I'M STUCK IN THE [CYBER WORLD]!",
    "THESE DEALS ARE [FIRE]! LITERALLY!",
    "MY [SOUL] WAS A FAIR TRADE!"
];

// ===== OPTIMIZED GLITCHY EARTHBOUND BACKGROUND =====
const canvas = document.getElementById('glitchCanvas');
const ctx = canvas.getContext('2d');

// Performance optimization: render at lower resolution
const SCALE_FACTOR = 4; // Bigger number = more pixelated/better performance
let offscreenCanvas, offscreenCtx;
let lastFrameTime = 0;
const FRAME_DELAY = 500; // Milliseconds between updates (10 FPS is plenty for glitchy effect)

function setupOffscreenCanvas() {
    offscreenCanvas = document.createElement('canvas');
    offscreenCanvas.width = Math.ceil(window.innerWidth / SCALE_FACTOR);
    offscreenCanvas.height = Math.ceil(window.innerHeight / SCALE_FACTOR);
    offscreenCtx = offscreenCanvas.getContext('2d');
    offscreenCtx.imageSmoothingEnabled = false;
}

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    ctx.imageSmoothingEnabled = false;
    setupOffscreenCanvas();
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// Pre-calculate some values for performance
const colorPalette = [
    [255, 0, 128], [128, 255, 0], [0, 128, 255],
    [255, 255, 0], [255, 0, 255], [0, 255, 255],
    [200, 100, 50], [50, 200, 100], [100, 50, 200]
];

// Pre-generate some noise patterns for efficiency
const noisePatterns = [];
for (let i = 0; i < 10; i++) {
    noisePatterns.push(Math.floor(Math.random() * 256));
}

function generateGlitchBackground() {
    const width = offscreenCanvas.width;
    const height = offscreenCanvas.height;
    const imageData = offscreenCtx.createImageData(width, height);
    const data = imageData.data;
    
    // Use time for animation but cache it
    const time = Date.now() * 0.001;
    const timePattern = Math.floor(time * 10) & 255;
    const noiseIndex = Math.floor(time) % noisePatterns.length;
    
    // Simplified pattern generation using bitwise operations (much faster than sin/cos)
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const i = (y * width + x) * 4;
            
            // Fast pattern using bitwise XOR (creates interesting patterns)
            const pattern = ((x ^ y) * timePattern) & 255;
            
            // Use pre-generated noise with some variation
            const noise = (noisePatterns[noiseIndex] ^ (x * y)) & 127;
            
            // Pick color from palette based on pattern
            const colorIndex = ((pattern >> 4) + (noise >> 5)) % colorPalette.length;
            const [r, g, b] = colorPalette[colorIndex];
            
            // Apply color with pattern variation
            data[i] = (r * pattern) >> 8;
            data[i + 1] = (g * pattern) >> 8;
            data[i + 2] = (b * pattern) >> 8;
            data[i + 3] = 255;
        }
    }
    
    // Add glitch blocks (less frequently and more efficiently)
    const numGlitches = 2 + (Math.random() * 3) | 0;
    for (let g = 0; g < numGlitches; g++) {
        const blockX = (Math.random() * width) | 0;
        const blockY = (Math.random() * height) | 0;
        const blockW = Math.min(8 + (Math.random() * 8) | 0, width - blockX);
        const blockH = Math.min(8 + (Math.random() * 8) | 0, height - blockY);
        const glitchColor = colorPalette[(Math.random() * colorPalette.length) | 0];
        
        // More efficient block filling
        for (let by = 0; by < blockH; by++) {
            const rowStart = ((blockY + by) * width + blockX) * 4;
            for (let bx = 0; bx < blockW; bx++) {
                const i = rowStart + bx * 4;
                if (i < data.length - 3) {
                    data[i] = glitchColor[0];
                    data[i + 1] = glitchColor[1];
                    data[i + 2] = glitchColor[2];
                }
            }
        }
    }
    
    // Add scanlines for extra CRT effect
    for (let y = 0; y < height; y += 2) {
        for (let x = 0; x < width; x++) {
            const i = (y * width + x) * 4;
            data[i] = Math.max(0, data[i] - 30);
            data[i + 1] = Math.max(0, data[i + 1] - 30);
            data[i + 2] = Math.max(0, data[i + 2] - 30);
        }
    }
    
    // Put image data to offscreen canvas
    offscreenCtx.putImageData(imageData, 0, 0);
    
    // Scale up to main canvas (this gives us the pixelated look for free!)
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(offscreenCanvas, 0, 0, canvas.width, canvas.height);
}

// Animate background with throttling
function animateBackground(currentTime) {
    // Throttle updates for better performance
    if (currentTime - lastFrameTime >= FRAME_DELAY) {
        // Only update 60% of the time for more glitchy feel
        if (Math.random() > 0.4) {
            generateGlitchBackground();
        }
        lastFrameTime = currentTime;
    }
    requestAnimationFrame(animateBackground);
}
animateBackground();

// ===== POPULATE PRODUCTS =====
function populateProducts() {
    const grid = document.getElementById('productGrid');
    grid.innerHTML = '';
    
    products.forEach((product, index) => {
        const card = document.createElement('div');
        card.className = 'product-card';
        card.onclick = () => {
            playSound();
            popupSystem.createPopup
            ({
                title: `PURCHASING ${product.title}`,
                message: `[PURCHASING ${product.title}...]\nTHANK YOU FOR THE GARETHCOIN\n[TRANSACTION FAILED SUCCESSFULLY!]`,
                type: 'error',
                icon: '💳',
                shake: true,
                hasProgress: true,
                buttons:
                [
                    { text: 'Try Again', action: () => popupSystem.showGarethCoin() },
                    { text: 'Give Up' }
                ]
            });
        };
        
        card.innerHTML = 
        `
            <div class="product-sale">${product.discount}</div>
            <div class="product-image">${product.emoji}</div>
            <div class="product-title">${product.title}</div>
            <div style="font-size: 12px; margin-bottom: 5px;">${product.subtitle}</div>
            <div class="product-price">${product.price}</div>
            <div style="color: #00ff00; font-size: 20px; font-weight: bold;">
                NOW: ${product.salePrice}
            </div>
        `;
        
        grid.appendChild(card);
    });
}
populateProducts();

// ===== VISITOR COUNTER =====
function updateVisitorCounter() {
    const stored = localStorage.getItem('visitorCount') || 194738;
    const count = parseInt(stored) + 1;
    localStorage.setItem('visitorCount', count);
    document.getElementById('visitorCount').textContent = count;
    document.getElementById('luckyNumber').textContent = 
        Math.floor(Math.random() * 9000) + 1000 + 'TH';
}
updateVisitorCounter();

// ===== GUESTBOOK =====
function addGuestbookEntry() {
    const name = document.getElementById('guestName').value || 'ANONYMOUS_[CUSTOMER]';
    const message = document.getElementById('guestMessage').value || 
        guestbookMessages[Math.floor(Math.random() * guestbookMessages.length)];
    
    const entries = document.getElementById('guestbookEntries');
    const entry = document.createElement('div');
    entry.className = 'guestbook-entry';
    entry.innerHTML = `<strong>${name.toUpperCase()}:</strong> ${message.toUpperCase()}`;
    entries.appendChild(entry);
    
    // Clear inputs
    document.getElementById('guestName').value = '';
    document.getElementById('guestMessage').value = '';
    
    // Scroll to bottom
    entries.scrollTop = entries.scrollHeight;
    
    playSound();
}

// ===== SOUND EFFECTS =====
const audioContext = new (window.AudioContext || window.webkitAudioContext)();

function playSound() {
    // Create a simple beep sound
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = 800 + Math.random() * 400;
    oscillator.type = 'square';
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.1);
}

// ===== MIDI MUSIC =====
let musicPlaying = false;
let musicInterval;

function toggleMusic() {
    const button = document.getElementById('musicToggle');
    
    if (musicPlaying) {
        clearInterval(musicInterval);
        button.textContent = '🎵';
        musicPlaying = false;
    } else {
        // Simple melody loop
        const notes = [440, 494, 523, 587, 659, 523, 494, 440];
        let noteIndex = 0;
        
        musicInterval = setInterval(() => {
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.value = notes[noteIndex];
            oscillator.type = 'sine';
            
            gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.3);
            
            noteIndex = (noteIndex + 1) % notes.length;
        }, 200);
        
        button.textContent = '🔇';
        musicPlaying = true;
    }
}

// ===== EXTRA FUNCTIONS =====
function showStory() {
    // REPLACED ALERT WITH POPUP SYSTEM
    popupSystem.createPopup
    ({
        title: '📖 STORY TIME',
        message: 'THERE ONCE WAS A [Hyperlink Blocked For Security Reasons]',
        icon: '📚',
        blink: true,
        buttons:
        [
            { text: 'Tell me more!', action: () => popupSystem.showError('[HYPERLINK BLOCKED]') },
            { text: 'Boring!' }
        ]
    });
}

function donate() {
    const amount = prompt('HEY THERE KID, HOW MANY [Wacky Stacks] ARE YOU WILLING TO [Donate to a Good Cause]', '9999');
    if (amount) 
    {
        popupSystem.createPopup
        ({
            title: 'DONATION RECEIVED!',
            message: `[THANK YOU FOR YOUR [${amount}] GARETHCOIN!]\n[YOUR PAYMENT HAS BEEN [HYPERLINK BLOCKED]!]\n[TRANSACTION FAILED SUCCESSFULLY!]`,
            type: 'success',
            icon: '💰',
            hasProgress: true,
            shake: true,
            onClose: () => {
                // Spawn more popups when closed
                popupSystem.showGarethCoin();
            }
        });
    }
}

// ===== RANDOM POPUPS (REPLACED ALERTS) =====
// Using the popup system instead of alerts for all the timed popups
const popupMessages = [
    { delay: 100, chance: 0.7 },
];

popupMessages.forEach(({ delay, chance }) => {
    setTimeout(() => {
        if (Math.random() > chance) {
            popupSystem.createPopup({
                title: '🎉 CONGRATULATIONS! 🎉',
                message: '[CONGRATULATIONS!]\n[YOU ARE THE 1997TH VISITOR!]\n[CLICK HERE TO CLAIM YOUR [Award Winning Prize]!]',
                type: 'warning',
                icon: '🏆',
                blink: true,
                buttons: [
                    { 
                        text: 'CLAIM PRIZE!', 
                        action: () => {
                            popupSystem.showDownload('prize.exe');
                            setTimeout(() => popupSystem.showError('[HYPERLINK BLOCKED]'), 1000);
                        }
                    },
                    { text: 'No thanks', action: () => popupSystem.cascade() }
                ]
            });
        }
    }, delay);
});

// ===== KONAMI CODE EASTER EGG =====
let konamiCode = [];
const konamiPattern = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];

document.addEventListener('keydown', (e) => {
    konamiCode.push(e.key);
    konamiCode = konamiCode.slice(-10);
    
    if (konamiCode.join(',') === konamiPattern.join(','))
    {
        document.body.style.transform = 'rotate(180deg)';
        popupSystem.createPopup
        ({
            title: '🎮 SECRET FOUND! 🎮',
            message: 'YOU FOUND THE [Specil Prise!]\nREALITY IS NOW [Stranger Things: The Upsidedown]!\nENJOY YOUR [35% Off Vacation] EXPERIENCE!',
            type: 'success',
            icon: '🙃',
            shake: true,
            blink: true,
            closeable: false,  // Can't close it!
            buttons: [
                { 
                    text: 'FLIP BACK!', 
                    action: () => {
                        document.body.style.transform = 'rotate(0deg)';
                        popupSystem.closeAll();
                    }
                }
            ]
        });
        setTimeout(() => {
            document.body.style.transform = 'rotate(0deg)';
        }, 10000);
    }
});

// ===== CONSOLE EASTER EGG =====
console.log('%c[BIG SHOT] CONSOLE DETECTED!', 'color: #00ff00; font-size: 30px; font-weight: bold; text-shadow: 2px 2px 0 #ff0000;');
console.log('%c[WELCOME TO THE [CYBER WORLD]!]', 'color: #ffff00; font-size: 20px;');
console.log('%cTYPE dealMaker() FOR [SPECIAL DEALS]!', 'color: #00ffff; font-size: 16px;');

window.dealMaker = function() {
    console.log('[INITIATING DEAL PROTOCOL...]');
    console.log('[GARETHCOIN GENERATION: ACTIVE]');
    console.log('[HYPERLINK STATUS: BLOCKED]');
    console.log('[CONGRATULATIONS! YOU ARE NOW A [BIG SHOT]!]');
    document.body.style.animation = 'shake 0.5s infinite';
    popupSystem.popupBomb();
    setTimeout(() => {
        document.body.style.animation = '';
    }, 3000);
};

// ===== SHAKE ANIMATION =====
const style = document.createElement('style');
style.textContent = `
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-10px); }
        75% { transform: translateX(10px); }
    }
`;
document.head.appendChild(style);

// ===== RIGHT CLICK MENU (REPLACED ALERT) =====
document.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    // REPLACED ALERT WITH POPUP SYSTEM - positioned near mouse!
    popupSystem.createPopup({
        title: '🚫 RIGHT CLICK BLOCKED!',
        message: 'RIGHT CLICK BLOCKED!\n[NO [Copyright Infringed Material Removed...] MY [Award Winning Deals]!]\n[NICE TRY, YOU [Delicit Flower]!]',
        type: 'error',
        icon: '🚫',
        shake: true,
        x: Math.min(e.clientX - 150, window.innerWidth - 400),  // Position near mouse
        y: Math.min(e.clientY - 100, window.innerHeight - 200),
        buttons: [
            { text: 'Sorry!', action: () => popupSystem.showWarning('APOLOGY NOT ACCEPTED!') },
            { text: 'Try Left Click', action: () => popupSystem.popupBomb() }
        ]
    });
    return false;
});