// ===== EASILY EDITABLE CONTENT VARIABLES =====
const products = [
    {
        title: "NEIZ_GAME",
        subtitle: "NEIZ GAME CHAPTER 1",
        price: "$9999.99",
        salePrice: "$1.99",
        discount: "LOWEST PRICE!",
        emoji: "💾"
    },
    {
        title: "C.BAR",
        subtitle: "A BAR OF C&nbsp;&nbsp;K&nbsp;LATE",
        price: "$199.99",
        salePrice: "$0.99",
        discount: "AMAZING DEAL!!",
        emoji: "💾"
    },
    {
        title: "KEYGEN&VPN",
        subtitle: "NEVER BEFORE [As Seen On TV] DEAL",
        price: "$9999.99",
        salePrice: "$1.99",
        discount: "$£!#",
        emoji: "💾"
    },
    {
        title: "CRYPTOMIN&nbsp;R",
        subtitle: "USE THIS CRYPT&nbsp;MIN&nbsp;R! FEED IT [Once in a Blue Moon]",
        price: "$9999.99",
        salePrice: "$1.99",
        discount: "NEVER AGAIN",
        emoji: "💾"
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

// ===== GLITCHY EARTHBOUND BACKGROUND =====
const canvas = document.getElementById('glitchCanvas');
const ctx = canvas.getContext('2d');

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

function generateGlitchBackground() {
    const imageData = ctx.createImageData(canvas.width, canvas.height);
    const data = imageData.data;
    
    // Create base pattern
    for (let i = 0; i < data.length; i += 4) {
        const x = (i / 4) % canvas.width;
        const y = Math.floor((i / 4) / canvas.width);
        
        // Create multiple noise layers
        const noise1 = Math.sin(x * 0.01) * Math.cos(y * 0.01) * 255;
        const noise2 = Math.sin(x * 0.05 + Date.now() * 0.0001) * 128;
        const noise3 = Math.random() * 60;
        
        // Create pattern
        const pattern = (x ^ y) * Date.now() * 0.00001;
        
        // RGB values with earthbound-style colors
        data[i] = Math.abs(noise1 + noise3) % 255;     // Red
        data[i + 1] = Math.abs(noise2 + pattern) % 255; // Green
        data[i + 2] = Math.abs(noise1 - noise2 + noise3) % 255; // Blue
        data[i + 3] = 255; // Alpha
        
        // Add random glitch blocks
        if (Math.random() > 0.998) {
            const blockSize = Math.floor(Math.random() * 50) + 10;
            for (let bx = 0; bx < blockSize; bx++) {
                for (let by = 0; by < blockSize; by++) {
                    const idx = ((y + by) * canvas.width + (x + bx)) * 4;
                    if (idx < data.length - 3) {
                        const color = Math.random() * 255;
                        data[idx] = color;
                        data[idx + 1] = Math.random() > 0.5 ? color : 0;
                        data[idx + 2] = Math.random() > 0.5 ? color : 255;
                    }
                }
            }
        }
    }
    
    ctx.putImageData(imageData, 0, 0);
}

// Animate background
function animateBackground() {
    if (Math.random() > 0.7) { // Only update sometimes for that glitchy effect
        generateGlitchBackground();
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
            alert(`[PURCHASING ${product.title}...]\nTHANK YOU FOR THE GARETHCOIN\n[TRANSACTION FAILED SUCCESSFULLY!]`);
        };
        
        card.innerHTML = `
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
    alert('THERE ONCE WAS A [Hyperlink Blocked For Security Reasons]');
}

function donate() {
    const amount = prompt('HEY THERE KID, HOW MANY [Wacky Stacks] ARE YOU WILLING TO [Donate to a Good Cause]', '9999');
    if (amount) {
        alert(`[THANK YOU FOR YOUR [${amount}] GARETHCOIN!]\n[YOUR PAYMENT HAS BEEN [HYPERLINK BLOCKED]!]\n[TRANSACTION FAILED SUCCESSFULLY!]`);
    }
}

// ===== RANDOM POPUPS =====
setTimeout(() => {
    if (Math.random() > 0.7) {
        alert('[CONGRATULATIONS!]\n[YOU ARE THE 1997TH VISITOR!]\n[CLICK HERE TO CLAIM YOUR [Award Winning Prize]!]\n\n[HYPERLINK BLOCKED]');
    }
}, 500);

setTimeout(() => {
    if (Math.random() > 0.7) {
        alert('[CONGRATULATIONS!]\n[YOU ARE THE 1997TH VISITOR!]\n[CLICK HERE TO CLAIM YOUR [Award Winning Prize]!]\n\n[HYPERLINK BLOCKED]');
    }
}, 1000);

setTimeout(() => {
    if (Math.random() > 0.7) {
        alert('[CONGRATULATIONS!]\n[YOU ARE THE 1997TH VISITOR!]\n[CLICK HERE TO CLAIM YOUR [Award Winning Prize]!]\n\n[HYPERLINK BLOCKED]');
    }
}, 1500);

setTimeout(() => {
    if (Math.random() > 0.7) {
        alert('[CONGRATULATIONS!]\n[YOU ARE THE 1997TH VISITOR!]\n[CLICK HERE TO CLAIM YOUR [Award Winning Prize]!]\n\n[HYPERLINK BLOCKED]');
    }
}, 2000);

setTimeout(() => {
    if (Math.random() > 0.7) {
        alert('[CONGRATULATIONS!]\n[YOU ARE THE 1997TH VISITOR!]\n[CLICK HERE TO CLAIM YOUR [Award Winning Prize]!]\n\n[HYPERLINK BLOCKED]');
    }
}, 2500);

setTimeout(() => {
    if (Math.random() > 0.7) {
        alert('[CONGRATULATIONS!]\n[YOU ARE THE 1997TH VISITOR!]\n[CLICK HERE TO CLAIM YOUR [Award Winning Prize]!]\n\n[HYPERLINK BLOCKED]');
    }
}, 3000);

// ===== KONAMI CODE EASTER EGG =====
let konamiCode = [];
const konamiPattern = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];

document.addEventListener('keydown', (e) => {
    konamiCode.push(e.key);
    konamiCode = konamiCode.slice(-10);
    
    if (konamiCode.join(',') === konamiPattern.join(',')) {
        document.body.style.transform = 'rotate(180deg)';
        alert('[YOU FOUND THE SECRET!]\n[REALITY IS NOW [INVERTED]!]\n[ENJOY YOUR [UPSIDE DOWN] EXPERIENCE!]');
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

// ===== RIGHT CLICK MENU =====
document.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    alert('RIGHT CLICK BLOCKED!\n[NO [Copyright Infringed Material Removed...] MY [Award Winning Deals]!]\n[NICE TRY, YOU [Delicit Flower]!]');
    return false;
});