// Global State
const AppState = {
    effects: [],
    durations: [],
    characters: [],
    activeCharacter: null,
    currentRoll: null,
    isSpinning: false,
    autoTimer: null,
    effectSet: 1,
    spinnerRotation: 0,
    lastWindowWidth: 0,
    performanceMode: false
};

// Initialize
async function init() {
    showLoading(true);
    createStarfield();
    loadSavedData(); // Load saved data first to get effect set preference
    await loadEffects(AppState.effectSet); // Load effects based on saved preference
    renderCharacters();
    renderEffects();
    initSpinnerCanvas();
    setupModalHandlers();
    updateEffectSetSelector(); // Update UI to match loaded effect set
    showLoading(false);

    if (AppState.characters.length === 0) {
        showToast('Create a character to begin!', 'warning');
    }
}

// Load Effects Data
async function loadEffects(effectSet = 1) {
    try {
        // Map effect sets to their corresponding files
        const effectFiles = {
            1: '/static/json/effects-1.20.json',
            2: '/static/json/effects-2.00.json',
            3: '/static/json/effects-1.20.json' // Fallback to set 1 for set 3
        };

        const effectsResponse = await fetch(effectFiles[effectSet] || effectFiles[1]);
        const durationsResponse = await fetch('/static/json/durations.json');

        if (effectsResponse.ok && durationsResponse.ok) {
            AppState.effects = await effectsResponse.json();
            AppState.durations = await durationsResponse.json();
            showToast(`Loaded Effect Set ${effectSet} (${AppState.effects.length} effects)`, 'success');
        } else {
            throw new Error('Files not found');
        }
    } catch (e) {
        console.warn('Failed to load effect files, using mock data:', e);
        // Generate mock data as fallback
        AppState.effects = generateMockEffects();
        AppState.durations = generateMockDurations();
        showToast('Using generated effects (file loading failed)', 'warning');
    }
}

function generateMockEffects() {
    const effects = [];
    const templates = [
        "'effects-1.20.json':'FAILED TO LOAD'"
    ];
    
    for (let i = 1; i <= 10000; i++) {
        effects.push({
            roll: i,
            effect: `Effect #${i}: ${templates[Math.floor(Math.random() * templates.length)]}`,
            has_condition: Math.random() > 0.7 ? "True" : "False"
        });
    }
    return effects;
}

function generateMockDurations() {
    const durations = [];
    const templates = [
        "'duration.json':'FAILED TO LOAD'"
    ];
    
    for (let i = 1; i <= 100; i++) {
        durations.push({
            roll: i,
            effect: templates[Math.floor(Math.random() * templates.length)].replace('{dice}', '1d6').replace('{number}', '2d4').replace('{timeunit}', 'days')
        });
    }
    return durations;
}

// Initialize Spinner SVG with vector graphics
function initSpinnerCanvas() {
    const container = document.getElementById('spinnerWrapper');
    const existingSvg = container.querySelector('#spinnerSVG');
    if (existingSvg) {
        existingSvg.remove();
    }

    const size = 500;
    const centerX = size / 2;
    const centerY = size / 2;
    const radius = size / 2 - 5;

    // Create SVG element
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.id = 'spinnerSVG';
    svg.setAttribute('width', '100%');
    svg.setAttribute('height', '100%');
    svg.setAttribute('viewBox', `0 0 ${size} ${size}`);
    svg.style.position = 'absolute';
    svg.style.top = '0';
    svg.style.left = '0';
    svg.style.borderRadius = '50%';
    svg.style.transition = 'transform 4s cubic-bezier(0.17, 0.67, 0.16, 0.99)';

    // Create gradient colors for visual appeal
    const colors = [
        '#9333ea', '#ec4899', '#06b6d4', '#10b981',
        '#f59e0b', '#ef4444', '#8b5cf6', '#14b8a6'
    ];

    // Create defs for gradients and patterns
    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    svg.appendChild(defs);

    // Create radial gradient for center shadow
    const radialGradient = document.createElementNS('http://www.w3.org/2000/svg', 'radialGradient');
    radialGradient.id = 'centerShadow';
    radialGradient.setAttribute('cx', '50%');
    radialGradient.setAttribute('cy', '50%');
    radialGradient.setAttribute('r', '50%');

    const stop1 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
    stop1.setAttribute('offset', '0%');
    stop1.setAttribute('stop-color', 'rgba(15, 23, 42, 0.8)');

    const stop2 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
    stop2.setAttribute('offset', '20%');
    stop2.setAttribute('stop-color', 'transparent');

    radialGradient.appendChild(stop1);
    radialGradient.appendChild(stop2);
    defs.appendChild(radialGradient);

    // Create segments group
    const segmentsGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    segmentsGroup.id = 'segments';

    // Draw 10,000 segments efficiently
    const segmentAngle = 360 / 10000;

    for (let i = 0; i < 10000; i++) {
        const startAngle = i * segmentAngle - 90;
        const endAngle = startAngle + segmentAngle;

        // Create path for segment
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');

        const startAngleRad = (startAngle * Math.PI) / 180;
        const endAngleRad = (endAngle * Math.PI) / 180;

        const x1 = centerX + radius * Math.cos(startAngleRad);
        const y1 = centerY + radius * Math.sin(startAngleRad);
        const x2 = centerX + radius * Math.cos(endAngleRad);
        const y2 = centerY + radius * Math.sin(endAngleRad);

        const pathData = [
            `M ${centerX} ${centerY}`,
            `L ${x1} ${y1}`,
            `A ${radius} ${radius} 0 0 1 ${x2} ${y2}`,
            'Z'
        ].join(' ');

        path.setAttribute('d', pathData);

        // Use color based on segment group for visual distinction
        const colorIndex = Math.floor(i / 1250) % colors.length;
        const opacity = i % 2 === 0 ? 'ff' : 'dd';
        path.setAttribute('fill', colors[colorIndex] + opacity);

        // Add stroke for every 100 segments
        if (i % 100 === 0) {
            path.setAttribute('stroke', 'rgba(255, 255, 255, 0.2)');
            path.setAttribute('stroke-width', '0.5');
        }

        // Add data attributes for identification
        path.setAttribute('data-segment', i + 1);
        path.setAttribute('data-effect-id', i + 1);

        path.addEventListener('mouseleave', () => {
            path.setAttribute('fill-opacity', '1');
            hideSegmentTooltip();
        });

        segmentsGroup.appendChild(path);
    }

    svg.appendChild(segmentsGroup);

    // Add center shadow overlay
    const shadowCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    shadowCircle.setAttribute('cx', centerX);
    shadowCircle.setAttribute('cy', centerY);
    shadowCircle.setAttribute('r', radius);
    shadowCircle.setAttribute('fill', 'url(#centerShadow)');
    shadowCircle.style.pointerEvents = 'none';
    svg.appendChild(shadowCircle);

    container.insertBefore(svg, container.firstChild);
}


// Spin Main Wheel
async function spinMainWheel() {
    if (AppState.isSpinning) return;

    if (!AppState.activeCharacter) {
        showToast('Select or create a character first!', 'warning');
        openCharacterModal();
        return;
    }

    AppState.isSpinning = true;
    document.getElementById('spinBtn').disabled = true;
    document.getElementById('instantSpinBtn').disabled = true;

    // Generate random roll
    const roll = Math.floor(Math.random() * 10000) + 1;
    const effect = AppState.effects.find(e => e.roll === roll);

    if (!effect) {
        AppState.isSpinning = false;
        document.getElementById('spinBtn').disabled = false;
        document.getElementById('instantSpinBtn').disabled = false;
        showToast('Error loading effect', 'error');
        return;
    }

    AppState.currentRoll = effect;

    // Calculate rotation with momentum
    const segmentAngle = 360 / 10000;
    const targetAngle = (roll - 1) * segmentAngle;
    const spins = 5 + Math.random() * 3; // 5-8 full rotations
    const totalRotation = (spins * 360) + targetAngle;

    // Apply rotation with easing
    const spinner = document.getElementById('mainSpinner');
    const svg = document.getElementById('spinnerSVG');

    if (spinner) {
        spinner.style.transition = 'transform 4s cubic-bezier(0.17, 0.67, 0.16, 0.99)';
        AppState.spinnerRotation += totalRotation;
        spinner.style.transform = `rotate(${AppState.spinnerRotation}deg)`;
    }

    if (svg) {
        svg.style.transition = 'transform 4s cubic-bezier(0.17, 0.67, 0.16, 0.99)';
        svg.style.transform = `rotate(${AppState.spinnerRotation}deg)`;
    }

    // Show result after animation
    setTimeout(() => {
        showResult(effect);
        AppState.isSpinning = false;
        document.getElementById('spinBtn').disabled = false;
        document.getElementById('instantSpinBtn').disabled = false;
    }, 4000);
}

// Instant Spin - No Animation
async function instantSpin() {
    if (AppState.isSpinning) return;

    if (!AppState.activeCharacter) {
        showToast('Select or create a character first!', 'warning');
        openCharacterModal();
        return;
    }

    AppState.isSpinning = true;
    document.getElementById('spinBtn').disabled = true;
    document.getElementById('instantSpinBtn').disabled = true;

    // Generate random roll immediately
    const roll = Math.floor(Math.random() * 10000) + 1;
    const effect = AppState.effects.find(e => e.roll === roll);

    if (!effect) {
        AppState.isSpinning = false;
        document.getElementById('spinBtn').disabled = false;
        document.getElementById('instantSpinBtn').disabled = false;
        showToast('Error loading effect', 'error');
        return;
    }

    AppState.currentRoll = effect;

    // Update spinner position instantly without animation
    const segmentAngle = 360 / 10000;
    const targetAngle = (roll - 1) * segmentAngle;
    const spinner = document.getElementById('mainSpinner');
    const svg = document.getElementById('spinnerSVG');

    if (spinner) {
        spinner.style.transition = 'none';
        AppState.spinnerRotation = targetAngle;
        spinner.style.transform = `rotate(${AppState.spinnerRotation}deg)`;
    }

    if (svg) {
        svg.style.transition = 'none';
        svg.style.transform = `rotate(${AppState.spinnerRotation}deg)`;
    }

    // Show result immediately with brief visual feedback
    showToast(' Instant result!', 'success');
    setTimeout(() => {
        showResult(effect);
        AppState.isSpinning = false;
        document.getElementById('spinBtn').disabled = false;
        document.getElementById('instantSpinBtn').disabled = false;

        // Restore transitions for future animated spins
        if (spinner) spinner.style.transition = 'transform 4s cubic-bezier(0.17, 0.67, 0.16, 0.99)';
        if (svg) svg.style.transition = 'transform 4s cubic-bezier(0.17, 0.67, 0.16, 0.99)';
    }, 200);
}


// Show Result Modal
function showResult(effect) {
    document.getElementById('resultNumber').textContent = `#${effect.roll}`;
    document.getElementById('resultEffect').textContent = effect.effect;
    
    if (effect.has_condition === "True") {
        document.getElementById('resultCondition').style.display = 'block';
    } else {
        document.getElementById('resultCondition').style.display = 'none';
    }
    
    document.getElementById('resultModalOverlay').classList.add('active');
    document.getElementById('resultModal').classList.add('active');
}

function closeResultModal() {
    document.getElementById('resultModalOverlay').classList.remove('active');
    document.getElementById('resultModal').classList.remove('active');
}

// Character Management
function openCharacterModal() {
    document.getElementById('characterModalOverlay').classList.add('active');
    document.getElementById('characterModal').classList.add('active');
    document.getElementById('characterName').focus();
}

function closeCharacterModal() {
    document.getElementById('characterModalOverlay').classList.remove('active');
    document.getElementById('characterModal').classList.remove('active');
    document.getElementById('characterName').value = '';
}

function createCharacter() {
    const name = document.getElementById('characterName').value.trim();
    if (!name) {
        showToast('Enter a character name', 'error');
        return;
    }
    
    const character = {
        id: Date.now().toString(),
        name: name,
        effects: [],
        created: new Date().toISOString()
    };
    
    AppState.characters.push(character);
    
    // Auto-select if first character
    if (AppState.characters.length === 1) {
        AppState.activeCharacter = character.id;
    }
    
    renderCharacters();
    saveData();
    closeCharacterModal();
    showToast(`${name} created!`, 'success');
}

function selectCharacter(id) {
    AppState.activeCharacter = id;
    renderCharacters();
    renderEffects();
    saveData();
}

function showDeleteConfirmation(id) {
    // Clear any existing delete modes
    document.querySelectorAll('.character-item').forEach(item => {
        item.classList.remove('delete-mode');
    });

    // Show confirmation for this character
    const characterItem = document.querySelector(`[data-character-id="${id}"]`);
    if (characterItem) {
        characterItem.classList.add('delete-mode');
    }
}

function confirmDeleteCharacter(id) {
    const index = AppState.characters.findIndex(c => c.id === id);
    if (index > -1) {
        AppState.characters.splice(index, 1);
        if (AppState.activeCharacter === id) {
            AppState.activeCharacter = AppState.characters[0]?.id || null;
        }
        renderCharacters();
        renderEffects();
        saveData();
        showToast('Character deleted', 'success');
    }
}

function hideDeleteConfirmation() {
    document.querySelectorAll('.character-item').forEach(item => {
        item.classList.remove('delete-mode');
    });
}

function renderCharacters() {
    const list = document.getElementById('characterList');
    list.innerHTML = '';
    
    AppState.characters.forEach(char => {
        const item = document.createElement('div');
        item.className = 'character-item';
        if (char.id === AppState.activeCharacter) {
            item.classList.add('active');
        }
        
        item.setAttribute('data-character-id', char.id);
        item.innerHTML = `
            <div class="character-name">${char.name}</div>
            <div class="character-stats">${char.effects.length} active effects</div>
            <button class="character-delete" onclick="event.stopPropagation(); showDeleteConfirmation('${char.id}')">×</button>
            <button class="character-confirm" onclick="event.stopPropagation(); confirmDeleteCharacter('${char.id}')">✓</button>
        `;
        
        item.onclick = () => selectCharacter(char.id);
        list.appendChild(item);
    });
}

// Add Effect to Character
function addEffectToCharacter() {
    if (!AppState.activeCharacter || !AppState.currentRoll) {
        showToast('No effect to add', 'error');
        return;
    }

    const character = AppState.characters.find(c => c.id === AppState.activeCharacter);
    if (!character) {
        showToast('Please select a character first!', 'error');
        return;
    }

    const effect = {
        id: Date.now().toString(),
        rollNumber: AppState.currentRoll.roll,
        text: AppState.currentRoll.effect,
        hasCondition: AppState.currentRoll.has_condition === "True",
        condition: '',
        duration: { value: 0, unit: 'turns' },
        category: categorizeEffect(AppState.currentRoll.effect),
        timestamp: new Date().toISOString()
    };

    character.effects.push(effect);
    renderEffects();
    renderCharacters(); // Update character list to show new effect count
    saveData();
    closeResultModal();
    showToast('Effect added!', 'success');
}

function categorizeEffect(text) {
    const lower = text.toLowerCase();
    if (lower.includes('gain') || lower.includes('bonus') || lower.includes('heal')) return 'buff';
    if (lower.includes('lose') || lower.includes('damage') || lower.includes('curse')) return 'debuff';
    return 'neutral';
}

// Render Effects
function renderEffects() {
    const list = document.getElementById('effectsList');
    list.innerHTML = '';
    
    if (!AppState.activeCharacter) {
        list.innerHTML = '<div style="text-align: center; padding: 20px; color: var(--text-dim);">Select a character to view effects</div>';
        document.getElementById('effectCount').textContent = '0 effects';
        return;
    }
    
    const character = AppState.characters.find(c => c.id === AppState.activeCharacter);
    if (!character) return;
    
    document.getElementById('effectCount').textContent = `${character.effects.length} effects`;
    
    if (character.effects.length === 0) {
        list.innerHTML = '<div style="text-align: center; padding: 20px; color: var(--text-dim);">No active effects</div>';
        return;
    }
    
    character.effects.forEach(effect => {
        const item = document.createElement('div');
        item.className = 'effect-item';
        
        item.innerHTML = `
            <div class="effect-header">
                <span class="effect-number">#${effect.rollNumber}</span>
                <span class="effect-category ${effect.category}">${effect.category}</span>
            </div>
            <div class="effect-text">${effect.text}</div>
            ${effect.condition ? `
                <div class="effect-condition">
                    <strong>Duration/How To Remove:</strong> ${effect.condition}
                </div>
            ` : ''}
            <div class="effect-duration">
                <div class="duration-control">
                    <span style="color: var(--text-dim); margin-right: 8px; flex-shrink: 0;">Duration:</span>
                    <button class="duration-btn" onclick="updateDuration('${effect.id}', -1)">−</button>
                    <span class="duration-value">${effect.duration.value}</span>
                    <button class="duration-btn" onclick="updateDuration('${effect.id}', 1)">+</button>
                    <select class="duration-unit" onchange="changeDurationUnit('${effect.id}', this.value)">
                        <option value="turns" ${effect.duration.unit === 'turns' ? 'selected' : ''}>turns</option>
                        <option value="minutes" ${effect.duration.unit === 'minutes' ? 'selected' : ''}>minutes</option>
                        <option value="hours" ${effect.duration.unit === 'hours' ? 'selected' : ''}>hours</option>
                        <option value="days" ${effect.duration.unit === 'days' ? 'selected' : ''}>days</option>
                    </select>
                </div>
            </div>
            <div class="effect-actions">
                ${effect.condition ? `
                    <button class="effect-action-btn duration" onclick="removeDurationFromEffect('${effect.id}')">Remove Duration</button>
                ` : `
                    <button class="effect-action-btn duration" onclick="addDurationToEffect('${effect.id}')">Add Duration</button>
                `}
                <button class="effect-action-btn remove" onclick="removeEffect('${effect.id}')">Remove</button>
            </div>
        `;
        
        list.appendChild(item);
    });
}

function updateDuration(effectId, delta) {
    const character = AppState.characters.find(c => c.id === AppState.activeCharacter);
    if (!character) return;

    const effect = character.effects.find(e => e.id === effectId);
    if (!effect) return;

    effect.duration.value = Math.max(0, effect.duration.value + delta);
    renderEffects();
    renderCharacters(); // Update character list to show changes
    saveData();
}

function changeDurationUnit(effectId, unit) {
    const character = AppState.characters.find(c => c.id === AppState.activeCharacter);
    if (!character) return;

    const effect = character.effects.find(e => e.id === effectId);
    if (!effect) return;

    effect.duration.unit = unit;
    renderEffects();
    renderCharacters(); // Update character list to show changes
    saveData();
}

function removeEffect(effectId) {
    const character = AppState.characters.find(c => c.id === AppState.activeCharacter);
    if (!character) return;

    const index = character.effects.findIndex(e => e.id === effectId);
    if (index > -1) {
        character.effects.splice(index, 1);
        renderEffects();
        renderCharacters(); // Update character list to show new effect count
        saveData();
        showToast('Effect removed', 'success');
    }
}

function addDurationToEffect(effectId) {
    const character = AppState.characters.find(c => c.id === AppState.activeCharacter);
    if (!character) return;

    const effect = character.effects.find(e => e.id === effectId);
    if (!effect) return;

    // Generate random duration
    const roll = Math.floor(Math.random() * 100) + 1;
    const duration = AppState.durations.find(d => d.roll === roll);

    if (!duration) {
        showToast('Error loading duration', 'error');
        return;
    }

    // Apply duration to the specific effect instantly
    effect.condition = duration.effect;
    renderEffects();
    renderCharacters(); // Update character list
    saveData();
    showToast(`Duration added: ${duration.effect}`, 'success');
}

function removeDurationFromEffect(effectId) {
    const character = AppState.characters.find(c => c.id === AppState.activeCharacter);
    if (!character) return;

    const effect = character.effects.find(e => e.id === effectId);
    if (!effect) return;

    effect.condition = '';

    renderEffects();
    renderCharacters(); // Update character list
    saveData();
    showToast('Duration removed', 'success');
}

function updateTransform() {
    const wrapper = document.getElementById('spinnerWrapper');
    const svg = document.getElementById('spinnerSVG');
    const spinner = document.getElementById('mainSpinner');

    if (svg) {
        svg.style.transformOrigin = 'center center';
        const currentRotation = svg.style.transform.match(/rotate\(([-\d.]+)deg\)/);
        const rotation = currentRotation ? currentRotation[1] : 0;
        svg.style.transform = `translate(${AppState.panOffset.x}px, ${AppState.panOffset.y}px) rotate(${rotation}deg)`;
    }

    if (spinner) {
        spinner.style.transformOrigin = 'center center';
        const currentRotation = spinner.style.transform.match(/rotate\(([-\d.]+)deg\)/);
        const rotation = currentRotation ? currentRotation[1] : 0;
        spinner.style.transform = `translate(${AppState.panOffset.x}px, ${AppState.panOffset.y}px) rotate(${rotation}deg)`;
    }
}

// Auto Timer
function toggleAutoDecrement() {
    if (AppState.autoTimer) {
        clearInterval(AppState.autoTimer);
        AppState.autoTimer = null;
        showToast('Auto timer stopped', 'warning');
    } else {
        AppState.autoTimer = setInterval(() => {
            const character = AppState.characters.find(c => c.id === AppState.activeCharacter);
            if (!character) return;
            
            let updated = false;
            character.effects.forEach(effect => {
                if (effect.duration.value > 0) {
                    effect.duration.value--;
                    updated = true;
                }
            });
            
            if (updated) {
                renderEffects();
                saveData();
            }
        }, 6000); // Every 6 seconds
        showToast('Auto timer started (6s intervals)', 'success');
    }
}

// Mobile Panel Toggle
function togglePanel(panel) {
    const charactersPanel = document.getElementById('charactersPanel');
    const effectsPanel = document.getElementById('effectsPanel');
    
    if (panel === 'characters') {
        charactersPanel.classList.toggle('mobile-show');
        effectsPanel.classList.remove('mobile-show');
    } else {
        effectsPanel.classList.toggle('mobile-show');
        charactersPanel.classList.remove('mobile-show');
    }
}

// Data Persistence
function saveData() {
    const data = {
        characters: AppState.characters,
        activeCharacter: AppState.activeCharacter,
        effectSet: AppState.effectSet
    };
    localStorage.setItem('magicalEffectsData', JSON.stringify(data));
}

function loadSavedData() {
    const saved = localStorage.getItem('magicalEffectsData');
    if (saved) {
        const data = JSON.parse(saved);
        AppState.characters = data.characters || [];
        AppState.activeCharacter = data.activeCharacter || null;
        AppState.effectSet = data.effectSet || 1;
    }
}

function exportData() {
    const data = {
        version: '1.0',
        timestamp: new Date().toISOString(),
        characters: AppState.characters,
        activeCharacter: AppState.activeCharacter
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `magical-effects-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Data exported!', 'success');
}

function importData() {
    const fileInput = document.getElementById('importFileInput');

    // Set up file change handler
    fileInput.onchange = function(event) {
        const file = event.target.files[0];
        if (!file) return;

        // Validate file type
        if (!file.name.toLowerCase().endsWith('.json')) {
            showToast('Please select a JSON file', 'error');
            return;
        }

        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const importedData = JSON.parse(e.target.result);
                processImportedData(importedData);
            } catch (error) {
                showToast('Invalid JSON file', 'error');
                console.error('Import error:', error);
            }
        };

        reader.onerror = function() {
            showToast('Error reading file', 'error');
        };

        reader.readAsText(file);

        // Reset input for future use
        fileInput.value = '';
    };

    // Trigger file picker
    fileInput.click();
}

// Store import data temporarily
let pendingImportData = null;

function processImportedData(data) {
    try {
        // Validate data structure
        if (!validateImportData(data)) {
            return;
        }

        const importedCharacters = data.characters || [];

        if (importedCharacters.length === 0) {
            showToast('No characters found in file', 'warning');
            return;
        }

        // Store data for modal
        pendingImportData = data;

        // Show import modal with character info
        showImportModal(importedCharacters);

    } catch (error) {
        showToast('Error processing import data', 'error');
        console.error('Import processing error:', error);
    }
}

function showImportModal(characters) {
    // Update character count
    document.getElementById('importCharCount').textContent = characters.length;

    // Calculate total effects
    let totalEffects = 0;
    characters.forEach(char => {
        if (char.effects && Array.isArray(char.effects)) {
            totalEffects += char.effects.length;
        }
    });
    document.getElementById('importEffectCount').textContent = totalEffects;

    // Display character list
    const charList = document.getElementById('importCharacterList');
    charList.innerHTML = '';

    characters.forEach(char => {
        const charItem = document.createElement('div');
        charItem.className = 'import-character-item';
        charItem.innerHTML = `
            <span class="import-character-name">${char.name || 'Unnamed Character'}</span>
            <span class="import-character-effects">${(char.effects || []).length} effects</span>
        `;
        charList.appendChild(charItem);
    });

    // Show modal
    document.getElementById('importModalOverlay').classList.add('active');
    document.getElementById('importModal').classList.add('active');
}

function closeImportModal() {
    document.getElementById('importModalOverlay').classList.remove('active');
    document.getElementById('importModal').classList.remove('active');
    pendingImportData = null;
}

function confirmImport(mode) {
    if (!pendingImportData) {
        closeImportModal();
        return;
    }

    const importedCharacters = pendingImportData.characters || [];

    if (mode === 'replace') {
        // Replace mode - clear existing characters
        AppState.characters = [];
        AppState.activeCharacter = null;
    }
    // mode === 'merge' keeps existing characters

    // Import characters with new IDs to avoid conflicts
    let importedCount = 0;
    const timestamp = Date.now();

    importedCharacters.forEach((char, index) => {
        if (validateCharacterData(char)) {
            const newCharacter = {
                id: `${timestamp}_${index}`, // Generate new unique ID
                name: char.name || 'Imported Character',
                effects: char.effects ? char.effects.map((effect, effectIndex) => ({
                    id: `${timestamp}_${index}_${effectIndex}`, // Generate new effect ID
                    rollNumber: effect.rollNumber || 0,
                    text: effect.text || 'Unknown effect',
                    hasCondition: effect.hasCondition || false,
                    condition: effect.condition || '',
                    duration: effect.duration || { value: 0, unit: 'turns' },
                    category: effect.category || 'neutral',
                    timestamp: effect.timestamp || new Date().toISOString()
                })) : [],
                created: char.created || new Date().toISOString()
            };

            AppState.characters.push(newCharacter);
            importedCount++;

            // Set as active character if none is active
            if (!AppState.activeCharacter) {
                AppState.activeCharacter = newCharacter.id;
            }
        }
    });

    if (importedCount > 0) {
        renderCharacters();
        renderEffects();
        saveData();
        const action = mode === 'merge' ? 'merged' : 'replaced with';
        showToast(`Successfully ${action} ${importedCount} character(s)!`, 'success');
    } else {
        showToast('No valid characters found to import', 'error');
    }

    closeImportModal();
}

function validateImportData(data) {
    if (!data || typeof data !== 'object') {
        showToast('Invalid file format', 'error');
        return false;
    }

    if (!data.version) {
        showToast('Missing version information', 'warning');
        // Continue anyway for backward compatibility
    }

    if (!Array.isArray(data.characters)) {
        showToast('Invalid characters data', 'error');
        return false;
    }

    return true;
}

function validateCharacterData(char) {
    if (!char || typeof char !== 'object') {
        return false;
    }

    if (!char.name || typeof char.name !== 'string') {
        return false;
    }

    if (char.effects && !Array.isArray(char.effects)) {
        return false;
    }

    return true;
}

async function changeEffectSet(set) {
    const effectSetNum = parseInt(set);

    if (effectSetNum === AppState.effectSet) return; // No change needed

    showLoading(true);

    try {
        await loadEffects(effectSetNum);
        AppState.effectSet = effectSetNum;

        // Reinitialize spinner with new effect count
        initSpinnerCanvas();

        saveData();
        showToast(`Switched to Effect Set ${effectSetNum}`, 'success');
    } catch (error) {
        showToast('Failed to load effect set', 'error');
        console.error('Error loading effect set:', error);
    } finally {
        showLoading(false);
    }
}

// Utilities
function showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = `toast ${type} show`;
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

function showLoading(show) {
    document.getElementById('loading').style.display = show ? 'block' : 'none';
}

function createStarfield() {
    const starfield = document.getElementById('starfield');
    const starCount = 100;
    
    for (let i = 0; i < starCount; i++) {
        const star = document.createElement('div');
        star.className = 'star';
        star.style.left = Math.random() * 100 + '%';
        star.style.top = Math.random() * 100 + '%';
        star.style.animationDelay = Math.random() * 3 + 's';
        star.style.width = star.style.height = Math.random() * 2 + 1 + 'px';
        starfield.appendChild(star);
    }
}

// Modal Event Handlers
function setupModalHandlers() {
    // Prevent modal content clicks from closing modal
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        modal.addEventListener('click', (e) => {
            e.stopPropagation();
        });
    });

    // Handle ESC key for modal closing
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            const characterModal = document.getElementById('characterModal');
            const resultModal = document.getElementById('resultModal');

            if (characterModal.classList.contains('active')) {
                closeCharacterModal();
            } else if (resultModal.classList.contains('active')) {
                closeResultModal();
            }
        }
    });
}

// Keyboard Shortcuts
document.addEventListener('keydown', (e) => {
    // Skip if user is typing in an input field
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') {
        return;
    }

    if (e.key === ' ' && !AppState.isSpinning) {
        e.preventDefault();
        spinMainWheel();
    } else if (e.key === 'i' && !AppState.isSpinning) {
        e.preventDefault();
        instantSpin();
    } else if (e.key === 'Escape') {
        closeResultModal();
        closeCharacterModal();
    }
});

// Update Effect Set Selector
function updateEffectSetSelector() {
    // Update custom dropdown to show current effect set
    const selectedText = document.getElementById('selectedText');
    if (selectedText) {
        if (AppState.effectSet === 1) {
            selectedText.textContent = 'v1.2 (d10,000)';
        } else if (AppState.effectSet === 2) {
            selectedText.textContent = 'v2.0 (d10,000)';
        }
    }

    // Update selected state in dropdown options
    document.querySelectorAll('.dropdown-option').forEach(option => {
        if (option.dataset.value === AppState.effectSet.toString()) {
            option.classList.add('selected');
        } else {
            option.classList.remove('selected');
        }
    });
}

// Custom dropdown functions
function toggleDropdown() {
    const dropdown = document.getElementById('customDropdown');
    dropdown.classList.toggle('open');
}

function selectOption(value, text) {
    const dropdown = document.getElementById('customDropdown');
    const selectedText = document.getElementById('selectedText');

    selectedText.textContent = text;
    dropdown.classList.remove('open');

    // Update selected state
    document.querySelectorAll('.dropdown-option').forEach(option => {
        if (option.dataset.value === value.toString()) {
            option.classList.add('selected');
        } else {
            option.classList.remove('selected');
        }
    });

    // Trigger the effect set change
    changeEffectSet(value);
}

// Close dropdown when clicking outside
document.addEventListener('click', (e) => {
    if (!e.target.closest('.custom-dropdown')) {
        const dropdown = document.getElementById('customDropdown');
        if (dropdown) {
            dropdown.classList.remove('open');
        }
    }
});

// Mobile-specific optimizations
function setupMobileOptimizations() {
    // Detect mobile device
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

    if (isMobile) {
        // Add mobile class to body for CSS targeting
        document.body.classList.add('mobile-device');

        // Reduce segment rendering on mobile for better performance
        const originalOptimize = optimizeSegmentRendering;
        optimizeSegmentRendering = function() {
            originalOptimize();
        };
    }
}

// Debounced resize handler for responsive design
let resizeTimeout;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        // Reinitialize spinners on resize
        if (window.innerWidth !== AppState.lastWindowWidth) {
            initSpinnerCanvas();
            AppState.lastWindowWidth = window.innerWidth;
        }
    }, 250);
});

// Performance monitoring and optimization
function monitorPerformance() {
    let frameCount = 0;
    let lastTime = performance.now();

    function measureFPS() {
        frameCount++;
        const currentTime = performance.now();

        if (currentTime - lastTime >= 1000) {
            const fps = frameCount;
            frameCount = 0;
            lastTime = currentTime;
        }

        requestAnimationFrame(measureFPS);
    }

    requestAnimationFrame(measureFPS);
}

// Enhanced error handling
window.addEventListener('error', (e) => {
    console.error('Application error:', e.error);
    showToast('An error occurred. Check console for details.', 'error');
});

window.addEventListener('unhandledrejection', (e) => {
    console.error('Unhandled promise rejection:', e.reason);
    showToast('Failed to load resources. Check your internet connection.', 'error');
});

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
    AppState.lastWindowWidth = window.innerWidth;
    setupMobileOptimizations();
    monitorPerformance();
    init();

    // Hide delete confirmation when clicking outside character items
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.character-item')) {
            hideDeleteConfirmation();
        }
    });
});