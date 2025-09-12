// Initialize particles
function createParticles() {
    const container = document.getElementById('particles');
    for (let i = 0; i < 50; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.animationDelay = Math.random() * 20 + 's';
        particle.style.animationDuration = (15 + Math.random() * 10) + 's';
        container.appendChild(particle);
    }
}

// Terminal functionality
const terminalOutput = document.getElementById('terminal-output');
const terminalInput = document.getElementById('terminal-input');
let commandHistory = [];
let historyIndex = -1;

const bootSequence = [
    { text: '//INITIATING CONNECTION...', class: 'info' },
    { text: 'ESTABLISHING SECURE LINK TO MAINFRAME_01...', class: 'info' },
    { text: '> Authentication required...', class: 'warning' },
    { text: '> Biometric scan... [OK]', class: 'success' },
    { text: '> Quantum key exchange... [OK]', class: 'success' },
    { text: 'CONNECTION ESTABLISHED', class: 'success' },
    { text: '', class: 'info' },
    { text: 'Welcome to AJDC SYSTEMS Terminal v0.1.09', class: 'info' },
    { text: 'Type "help" for available commands', class: 'info' },
    { text: '', class: 'info' }
];

const commands = {
    help: () => {
        return [
            { text: 'Available Commands:', class: 'info' },
            { text: '  help     - Show this help message', class: 'success' },
            { text: '  about    - About this portfolio', class: 'success' },
            { text: '  projects - List all projects', class: 'success' },
            { text: '  skills   - Display technical skills', class: 'success' },
            { text: '  contact  - Contact information', class: 'success' },
            { text: '  clear    - Clear terminal', class: 'success' },
            { text: '  matrix   - Enter the matrix', class: 'success' },
            { text: '  hack     - Initialize hack sequence', class: 'success' },
            { text: '  status   - System status report', class: 'success' },
            { text: '  date     - Current system date', class: 'success' }
        ];
    },
    about: () => {
        return [
            { text: '╔════════════════════════════════════╗', class: 'info' },
            { text: '║     PORTFOLIO SYSTEM v3.4.78      ║', class: 'info' },
            { text: '╚════════════════════════════════════╝', class: 'info' },
            { text: '', class: 'info' },
            { text: 'Welcome to my digital workspace.', class: 'success' },
            { text: 'I am a creative technologist specializing in:', class: 'success' },
            { text: '  • Full-stack development', class: 'info' },
            { text: '  • UI/UX design', class: 'info' },
            { text: '  • Creative coding', class: 'info' },
            { text: '  • Digital experiences', class: 'info' }
        ];
    },
    projects: () => {
        return [
            { text: 'Loading project database...', class: 'info' },
            { text: '', class: 'info' },
            { text: '[1] PROJECT ECHO - Neural network visualization', class: 'success' },
            { text: '[2] DATA CONDUIT - Real-time data pipeline', class: 'success' },
            { text: '[3] CHRONOS ARCHIVE - Time-series analysis tool', class: 'success' },
            { text: '[4] NEURAL BRIDGE - AI-human interface', class: 'success' },
            { text: '[5] QUANTUM MESH - Distributed computing framework', class: 'success' }
        ];
    },
    skills: () => {
        return [
            { text: 'Technical Skills Matrix:', class: 'info' },
            { text: '', class: 'info' },
            { text: 'LANGUAGES:', class: 'warning' },
            { text: '  JavaScript/TypeScript [████████░░] 80%', class: 'success' },
            { text: '  Python               [███████░░░] 70%', class: 'success' },
            { text: '  Rust                 [██████░░░░] 60%', class: 'success' },
            { text: '', class: 'info' },
            { text: 'FRAMEWORKS:', class: 'warning' },
            { text: '  React/Next.js        [█████████░] 90%', class: 'success' },
            { text: '  Node.js              [████████░░] 80%', class: 'success' },
            { text: '  Three.js             [███████░░░] 70%', class: 'success' }
        ];
    },
    contact: () => {
        return [
            { text: 'Establishing secure communication channel...', class: 'info' },
            { text: '', class: 'info' },
            { text: 'CONTACT PROTOCOLS:', class: 'warning' },
            { text: '  Email: commander@neogrid.systems', class: 'success' },
            { text: '  GitHub: github.com/commander7', class: 'success' },
            { text: '  Signal: +1-555-NEOGRID', class: 'success' }
        ];
    },
    clear: () => {
        terminalOutput.innerHTML = '';
        return [];
    },
    matrix: () => {
        return [
            { text: 'Follow the white rabbit...', class: 'success' },
            { text: 'Wake up, Neo...', class: 'warning' },
            { text: 'The Matrix has you...', class: 'error' }
        ];
    },
    hack: () => {
        return [
            { text: 'INITIALIZING HACK SEQUENCE...', class: 'warning' },
            { text: 'Bypassing firewall... [████████░░] 80%', class: 'info' },
            { text: 'Injecting payload... [██████████] 100%', class: 'success' },
            { text: 'ACCESS GRANTED', class: 'success' },
            { text: 'Just kidding! This is a portfolio site :)', class: 'info' }
        ];
    },
    status: () => {
        const uptime = Math.floor(Math.random() * 1000) + 1000;
        return [
            { text: 'SYSTEM STATUS REPORT:', class: 'info' },
            { text: `Uptime: ${uptime} hours`, class: 'success' },
            { text: `Active connections: ${Math.floor(Math.random() * 100) + 50}`, class: 'success' },
            { text: `CPU Load: ${Math.floor(Math.random() * 50) + 30}%`, class: 'success' },
            { text: `Memory Usage: ${(Math.random() * 2 + 1).toFixed(1)}GB / 4.0GB`, class: 'success' },
            { text: 'All systems operational', class: 'success' }
        ];
    },
    date: () => {
        const now = new Date();
        return [
            { text: `System Date: ${now.toLocaleDateString()}`, class: 'info' },
            { text: `System Time: ${now.toLocaleTimeString()}`, class: 'info' }
        ];
    }
};

function addLine(text, className = '') {
    const line = document.createElement('div');
    line.className = `terminal-line ${className}`;
    line.textContent = text;
    line.style.animationDelay = '0s';
    terminalOutput.appendChild(line);
    terminalOutput.scrollTop = terminalOutput.scrollHeight;
}

function processCommand(input) {
    const cmd = input.toLowerCase().trim();
    addLine(`> ${input}`, 'info');
    
    if (commands[cmd]) {
        const output = commands[cmd]();
        output.forEach((line, index) => {
            setTimeout(() => {
                addLine(line.text, line.class);
            }, index * 50);
        });
    } else if (cmd === '') {
        // Empty command, do nothing
    } else {
        addLine(`Command not found: ${cmd}`, 'error');
        addLine('Type "help" for available commands', 'warning');
    }
}

// Terminal input handling
terminalInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        const input = terminalInput.value;
        if (input.trim()) {
            commandHistory.push(input);
            historyIndex = commandHistory.length;
            processCommand(input);
        }
        terminalInput.value = '';
    } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (historyIndex > 0) {
            historyIndex--;
            terminalInput.value = commandHistory[historyIndex];
        }
    } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (historyIndex < commandHistory.length - 1) {
            historyIndex++;
            terminalInput.value = commandHistory[historyIndex];
        } else {
            historyIndex = commandHistory.length;
            terminalInput.value = '';
        }
    }
});

// Project loading
function loadProject(projectName) {
    addLine(`Loading project: ${projectName.toUpperCase()}...`, 'info');
    setTimeout(() => {
        addLine(`Project ${projectName.toUpperCase()} loaded successfully`, 'success');
    }, 500);
}

// Terminal control functions
function clearTerminal() {
    terminalOutput.innerHTML = '';
    addLine('Terminal cleared', 'info');
}

function minimizeTerminal() {
    document.querySelector('.terminal').style.minHeight = '100px';
    document.querySelector('.terminal-content').style.display = 'none';
    document.querySelector('.terminal-prompt').style.display = 'none';
}

function maximizeTerminal() {
    document.querySelector('.terminal').style.minHeight = '500px';
    document.querySelector('.terminal-content').style.display = 'block';
    document.querySelector('.terminal-prompt').style.display = 'flex';
}

// Update system stats
function updateStats() {
    const cpuEl = document.getElementById('cpu');
    const memoryEl = document.getElementById('memory');
    const latencyEl = document.getElementById('latency');
    const packetsEl = document.getElementById('packets');
    
    if (cpuEl) cpuEl.textContent = `${Math.floor(Math.random() * 30) + 40}%`;
    if (memoryEl) memoryEl.textContent = `${(Math.random() * 1.5 + 1.5).toFixed(1)}GB`;
    if (latencyEl) latencyEl.textContent = `${Math.floor(Math.random() * 20) + 8}ms`;
    if (packetsEl) packetsEl.textContent = `${(Math.random() * 0.5 + 1.3).toFixed(3)}M`;
}

// Initialize
window.addEventListener('load', () => {
    createParticles();
    
    // Boot sequence
    bootSequence.forEach((line, index) => {
        setTimeout(() => {
            addLine(line.text, line.class);
        }, index * 200);
    });
    
    // Update stats periodically
    setInterval(updateStats, 3000);
    
    // Focus terminal input
    terminalInput.focus();
});

// Easter egg: Konami code
let konamiCode = [];
const konamiPattern = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];

document.addEventListener('keydown', (e) => {
    konamiCode.push(e.key);
    konamiCode = konamiCode.slice(-10);
    
    if (konamiCode.join(',') === konamiPattern.join(',')) {
        document.body.style.animation = 'glitch 0.5s infinite';
        addLine('KONAMI CODE ACTIVATED!', 'success');
        addLine('UNLOCKING HIDDEN FEATURES...', 'warning');
        setTimeout(() => {
            document.body.style.animation = '';
        }, 5000);
    }
});