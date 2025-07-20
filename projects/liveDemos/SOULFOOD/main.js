/**
 * ====================================================================
 * UNDERTALE-STYLE GAME - MAIN GAME ENGINE
 * ====================================================================
 * A comprehensive 2D RPG engine with dialogue, battle, and menu systems
 * Features mobile and desktop controls, save/load functionality
 * ====================================================================
 */

// ====================================================================
// CANVAS SETUP AND CONFIGURATION
// ====================================================================

/** @type {HTMLCanvasElement} Main game canvas element */
const canvas = document.getElementById('gameCanvas');

/** @type {CanvasRenderingContext2D} 2D rendering context for the canvas */
const ctx = canvas.getContext('2d');

// Disable image smoothing for crisp pixel art rendering
ctx.imageSmoothingEnabled = false;

// ====================================================================
// GLOBAL DATA STORAGE
// ====================================================================

/** @type {Object} Stores all dialogue data loaded from dialogue.json */
let dialogueData = {};

/** @type {Object} Stores all enemy data loaded from enemies.json */
let enemyData = {};

/** @type {Object} Stores all map data loaded from JSON files */
let mapData = {};

/** @type {Image|null} Player character sprite image */
let playerSprite = null;

/** @type {Object} Cache for NPC sprites */
let npcSpriteCache = {};

// ====================================================================
// MAIN GAME STATE OBJECT
// ====================================================================

/**
 * Central game state object containing all game data and configuration
 * @type {Object}
 */
const game = {
    state: 'overworld', // overworld, dialogue, battle, battleMenu, battleAttack, battleDodge, menu, inventory
    player: {
        x: 160,
        y: 120,
        width: 16,
        height: 16,
        speed: 2,
        facing: 'down',
        name: 'Edd',
        hp: 52,
        maxHp: 52,
        lv: 9,
        atk: 16,
        def: 2,
        gold: 331,
        exp: 1163,
        nextExp: 1200,
        weapon: 'Tough Glove',
        armor: 'Manly Bandanna',
        weaponAtk: 5,
        armorDef: 7
    },
    phonebook: [{
        name: 'TEST',
        number: '555-0001'
    }],
    camera: {
        x: 0,
        y: 0
    },
    dialogue: {
        active: false,
        pages: [],
        currentPage: 0,
        currentChar: 0,
        speed: 50,
        maxLines: 2,
        maxCharsPerLine: 35,
        commands: [] // Store commands for each page
    },
    pendingBattle: null,
    afterDialogueAction: null,
    flags: {},
    menu: {
        active: false,
        option: 0,
        options: ['ITEM', 'STAT', 'CELL'],
        subMenu: null, // null, 'item', 'stat', 'cell'
        itemAction: null, // null, 'use', 'info', 'drop'
        itemActionOption: 0, // 0=USE, 1=INFO, 2=DROP
        cellOption: 0
    },
    escMenu: {
        active: false,
        option: 0,
        options: ['SETTINGS', 'LOAD', 'RETURN']
    },
    settings: {
        active: false,
        option: 0,
        options: ['RESOLUTION', 'FULLSCREEN', 'BACK'],
        scale: 2,
        fullscreen: false,
        resolutionOptions: ['1x (320x240)', '2x (640x480)', '3x (960x720)', '4x (1280x960)'],
        currentResolution: 1
    },
    inventory: {
        items: [{
                name: 'Ballet Shoes',
                description: '* These used shoes make you feel like\\n  you could dance all day.',
                tag: 'ARMOR',
                defense: 7,
                attack: 0
            },
            {
                name: 'Toy Knife',
                description: '* Made of plastic. A relic from\\n  the past.',
                tag: 'WEAPON',
                attack: 3,
                defense: 0
            },
            {
                name: 'Faded Ribbon',
                description: '* A fashionable yellow ribbon for\\n  your hair.',
                tag: 'ARMOR',
                defense: 3,
                attack: 0
            },
            {
                name: 'Stick',
                description: '* Its bark is worse than its bite.',
                tag: 'WEAPON',
                attack: 0,
                defense: 0
            },
            {
                name: 'Crab Apple',
                description: '* An apple that looks like it would\\n  be good in a fight.',
                tag: 'CONSUMABLE',
                healing: 5
            },
            {
                name: 'Crab Apple',
                description: '* An apple that looks like it would\\n  be good in a fight.',
                tag: 'CONSUMABLE',
                healing: 5
            },
            {
                name: 'Crab Apple',
                description: '* An apple that looks like it would\\n  be good in a fight.',
                tag: 'CONSUMABLE',
                healing: 5
            },
            null, null, null, null, null // Empty slots
        ],
        selectedItem: 0
    },
    savePoint: {
        x: 200,
        y: 50,
        width: 20,
        height: 20,
        dialogueId: "savePoint.ruins"
    },
    battle: {
        active: false,
        enemies: [], // Changed from single enemy to array (max 3)
        enemyCount: 0,
        selectedEnemyIndex: 0,
        showEnemySelection: false,
        menuOption: 0,
        menuOptions: [
            'FIGHT',
            'ACT',
            'ITEM',
            'MERCY'
        ],
        actMenuOption: 0, // For ACT sub-menu navigation
        soul: {
            x: 160,
            y: 160,
            width: 8,
            height: 8,
            speed: 2
        },
        bullets: [],
        turnTimer: 0,
        turnDuration: 5000,
        boxBounds: {
            x: 60,
            y: 140,
            width: 200,
            height: 80
        },
        attackBar: {
            position: 0,
            speed: 3,
            active: false
        },
        enemySprites: [] // Array of sprite objects for each enemy
    },
    // Track action usage for varied dialogue responses
    actionUsage: {},
    // Track conversation states for NPCs
    conversationStates: {},
    currentNPC: null,
    // Map system
    currentMap: '01_ruins',
    currentRoom: 'room_01_entrance',
    currentRoomData: null,
    mapTransitions: [],
    // Player sprite system (future-proof for sprite sheets)
    sprite: {
        image: null,
        loaded: false,
        type: 'single', // Will become 'sheet' when sprite sheets are implemented
        frameWidth: 16,
        frameHeight: 16,
        frames: {
            down: {
                x: 0,
                y: 0
            }, // Current: all same, Future: different positions
            up: {
                x: 0,
                y: 0
            },
            left: {
                x: 0,
                y: 0
            },
            right: {
                x: 0,
                y: 0
            }
        },
        currentFrame: 'down'
    },
    keys: {},
    joystick: {
        active: false,
        startX: 0,
        startY: 0,
        knobX: 0,
        knobY: 0,
        distance: 0,
        angle: 0
    },
    npcs: [{
            x: 100,
            y: 100,
            width: 16,
            height: 16,
            dialogueId: "npcs.dummy",
            color: '#ff6b6b',
            canBattle: true,
            enemyId: "dummy",
            npcId: "dummy"
        },
        {
            x: 250,
            y: 150,
            width: 16,
            height: 16,
            dialogueId: "npcs.character1",
            color: '#4ecdc4',
            npcId: "character1"
        }
    ],
    walls: [{
            x: 50,
            y: 50,
            width: 20,
            height: 100
        },
        {
            x: 280,
            y: 80,
            width: 20,
            height: 80
        },
        {
            x: 150,
            y: 200,
            width: 100,
            height: 20
        }
    ]
};

// Load dialogue data from JSON
async function loadDialogueData() {
    try {
        const response = await fetch('dialogue.json');
        dialogueData = await response.json();
        console.log('Dialogue data loaded successfully');
    } catch (error) {
        console.error('Failed to load dialogue data:', error);
        // Fallback to empty object
        dialogueData = {};
    }
}

// Load enemy data from JSON
async function loadEnemyData() {
    try {
        const response = await fetch('enemies.json');
        enemyData = await response.json();
        console.log('Enemy data loaded successfully');
    } catch (error) {
        console.error('Failed to load enemy data:', error);
        // Fallback to empty object
        enemyData = {};
    }
}

// Load map data from JSON files
async function loadMapData(mapName, roomName) {
    try {
        const response = await fetch(`maps/${mapName}/${roomName}.json`);
        const roomData = await response.json();

        // Store in cache
        if (!mapData[mapName]) {
            mapData[mapName] = {};
        }
        mapData[mapName][roomName] = roomData;

        console.log(`Map data loaded successfully: ${mapName}/${roomName}`);
        return roomData;
    } catch (error) {
        console.error(`Failed to load map data: ${mapName}/${roomName}`, error);
        return null;
    }
}

// Load and switch to a new room
async function loadRoom(mapName, roomName, playerPosition = null) {
    // Check if already loaded
    let roomData = mapData[mapName] ? mapData[mapName][roomName] : null;

    if (!roomData) {
        roomData = await loadMapData(mapName, roomName);
    }

    if (!roomData) {
        console.error(`Failed to load room: ${mapName}/${roomName}`);
        return false;
    }

    // Update game state
    game.currentMap = mapName;
    game.currentRoom = roomName;
    game.currentRoomData = roomData;

    // Update room elements
    game.walls = roomData.walls || [];
    game.npcs = roomData.npcs || [];
    game.mapTransitions = roomData.transitions || [];

    // Load NPC sprites for this room
    if (game.npcs.length > 0) {
        game.npcs.forEach((npc, index) => {
            if (npc.overworldSprite) {
                loadNPCSprite(npc.overworldSprite, npc.npcId || `npc_${index}`);
            }
        });
    }

    // Update save point (if exists in room)
    if (roomData.savePoints && roomData.savePoints.length > 0) {
        game.savePoint = roomData.savePoints[0]; // Use first save point
    } else {
        // No save point in this room
        game.savePoint = null;
    }

    // Set player position
    if (playerPosition) {
        game.player.x = playerPosition.x;
        game.player.y = playerPosition.y;
    } else if (roomData.playerStart) {
        game.player.x = roomData.playerStart.x;
        game.player.y = roomData.playerStart.y;
        game.player.facing = roomData.playerStart.facing || 'down';
    }

    console.log(`Loaded room: ${mapName}/${roomName}`);
    return true;
}

// Check for room transitions
function checkRoomTransitions() {
    if (!game.mapTransitions || game.mapTransitions.length === 0) {
        return;
    }

    const playerRect = {
        x: game.player.x,
        y: game.player.y,
        width: game.player.width,
        height: game.player.height
    };

    for (const transition of game.mapTransitions) {
        // Check if player is overlapping with transition zone
        if (playerRect.x < transition.x + transition.width &&
            playerRect.x + playerRect.width > transition.x &&
            playerRect.y < transition.y + transition.height &&
            playerRect.y + playerRect.height > transition.y) {
            // Trigger room transition
            loadRoom(transition.toMap, transition.toRoom, transition.toPosition);
            break;
        }
    }
}

// Load player sprite
async function loadPlayerSprite() {
    try {
        playerSprite = new Image();
        playerSprite.onload = function () {
            game.sprite.loaded = true;
            game.sprite.image = playerSprite;
            console.log('Player sprite loaded successfully');
        };
        playerSprite.onerror = function () {
            console.error('Failed to load player sprite');
            game.sprite.loaded = false;
        };
        playerSprite.src = 'img/UTCook-GameJam-MainChar.png';
    } catch (error) {
        console.error('Failed to load player sprite:', error);
        game.sprite.loaded = false;
    }
}

// Load NPC sprite
async function loadNPCSprite(spriteUrl, npcId) {
    if (!spriteUrl) {
        console.warn('No sprite URL provided for NPC:', npcId);
        return null;
    }

    // Check if already loaded in cache
    if (npcSpriteCache[spriteUrl]) {
        return npcSpriteCache[spriteUrl];
    }

    try {
        const npcSprite = new Image();
        npcSprite.onload = function () {
            npcSpriteCache[spriteUrl] = {
                image: npcSprite,
                loaded: true,
                loading: false
            };
            console.log('NPC sprite loaded successfully:', spriteUrl);
        };
        npcSprite.onerror = function () {
            console.error('Failed to load NPC sprite:', spriteUrl);
            npcSpriteCache[spriteUrl] = {
                image: null,
                loaded: false,
                loading: false
            };
        };

        // Mark as loading
        npcSpriteCache[spriteUrl] = {
            image: npcSprite,
            loaded: false,
            loading: true
        };

        npcSprite.src = spriteUrl;
        return npcSpriteCache[spriteUrl];
    } catch (error) {
        console.error('Failed to load NPC sprite:', error);
        npcSpriteCache[spriteUrl] = {
            image: null,
            loaded: false,
            loading: false
        };
        return null;
    }
}

// Load enemy sprite for specific enemy index
async function loadEnemySprite(spriteUrl, enemyIndex) {
    if (!spriteUrl) {
        console.warn('No sprite URL provided for enemy');
        if (game.battle.enemySprites[enemyIndex]) {
            game.battle.enemySprites[enemyIndex].loaded = false;
            game.battle.enemySprites[enemyIndex].loading = false;
        }
        return;
    }

    // Ensure enemySprites array exists and has entry for this index
    if (!game.battle.enemySprites[enemyIndex]) {
        game.battle.enemySprites[enemyIndex] = {
            image: null,
            loaded: false,
            loading: false
        };
    }

    // Don't reload the same sprite
    if (game.battle.enemySprites[enemyIndex].image &&
        game.battle.enemySprites[enemyIndex].image.src.endsWith(spriteUrl)) {
        return;
    }

    try {
        game.battle.enemySprites[enemyIndex].loading = true;
        game.battle.enemySprites[enemyIndex].loaded = false;

        const enemySprite = new Image();
        enemySprite.onload = function () {
            game.battle.enemySprites[enemyIndex].loaded = true;
            game.battle.enemySprites[enemyIndex].loading = false;
            game.battle.enemySprites[enemyIndex].image = enemySprite;
            console.log('Enemy sprite loaded successfully:', spriteUrl, 'for enemy', enemyIndex);
        };
        enemySprite.onerror = function () {
            console.error('Failed to load enemy sprite:', spriteUrl, 'for enemy', enemyIndex);
            game.battle.enemySprites[enemyIndex].loaded = false;
            game.battle.enemySprites[enemyIndex].loading = false;
            game.battle.enemySprites[enemyIndex].image = null;
        };

        enemySprite.src = spriteUrl;
    } catch (error) {
        console.error('Failed to load enemy sprite:', error, 'for enemy', enemyIndex);
        game.battle.enemySprites[enemyIndex].loaded = false;
        game.battle.enemySprites[enemyIndex].loading = false;
        game.battle.enemySprites[enemyIndex].image = null;
    }
}

// Check if a string is a valid dialogue ID
function isDialogueId(text) {
    if (!text || typeof text !== 'string') {
        return false;
    }

    // Dialogue IDs should have at least one dot and follow a specific pattern
    if (!text.includes('.')) {
        return false;
    }

    // Check if it matches expected dialogue ID patterns
    const validPrefixes = [
        'npcs.',
        'battle.',
        'savePoint.',
        'menu.',
        'items.',
        'system.'
    ];
    const hasValidPrefix = validPrefixes.some(prefix => text.startsWith(prefix));

    // Also check if it doesn't start with common dialogue markers
    const isDialogueText = text.startsWith('*') || text.includes('\\\\n') || text.length > 50;

    return hasValidPrefix && !isDialogueText;
}

// Get dialogue by ID with usage tracking for varied responses
function getDialogue(dialogueId, actionName = null, enemyId = null, npcId = null) {
    if (!dialogueId || !dialogueData) {
        return [];
    }

    const keys = dialogueId.split('.');
    let current = dialogueData;

    for (const key of keys) {
        if (current && typeof current === 'object' && key in current) {
            current = current[key];
        } else {
            console.warn(`Dialogue not found: ${dialogueId}`);
            return [`* Missing dialogue: ${dialogueId}`];
        }
    }

    // Check if this is NPC conversation format
    if (current && typeof current === 'object' && current.conversations && Array.isArray(current.conversations)) {
        // Get conversation count for this NPC
        const conversationCount = game.conversationStates[npcId] || 0;

        // Select conversation based on count (clamped to available conversations)
        const conversationIndex = Math.min(conversationCount, current.conversations.length - 1);
        return current.conversations[conversationIndex];
    }

    // Check if this is the battle format with multiple responses
    if (current && typeof current === 'object' && current.responses && Array.isArray(current.responses)) {
        // Get usage count for this action
        const usageKey = `${enemyId}_${actionName}`;
        const usageCount = game.actionUsage[usageKey] || 0;

        // Select response based on usage count (clamped to available responses)
        const responseIndex = Math.min(usageCount, current.responses.length - 1);
        return current.responses[responseIndex];
    }

    // Fallback to old format
    return Array.isArray(current) ? current : [current];
}

// Get enemy by ID
function getEnemy(enemyId) {
    if (!enemyId || !enemyData) {
        console.warn(`Enemy not found: ${enemyId}`);
        return null;
    }

    if (enemyData[enemyId]) {
        // Return a deep copy to avoid modifying the original data
        return JSON.parse(JSON.stringify(enemyData[enemyId]));
    } else {
        console.warn(`Enemy not found: ${enemyId}`);
        return null;
    }
}

// Text processing functions
function wrapText(text, maxCharsPerLine) {
    const words = text.split(' ');
    const lines = [];
    let currentLine = '';

    for (const word of words) {
        const testLine = currentLine ? `${currentLine} ${word}` : word;

        if (testLine.length <= maxCharsPerLine) {
            currentLine = testLine;
        } else {
            if (currentLine) {
                lines.push(currentLine);
                currentLine = word;
            } else {
                // Word is too long, force break
                lines.push(word);
            }
        }
    }

    if (currentLine) {
        lines.push(currentLine);
    }

    return lines;
}

// Extract dialogue commands from text
function extractDialogueCommands(text) {
    const commandRegex = /\[([^\]]+)\]/g;
    const commands = [];
    let cleanText = text;
    let match;

    // Find all commands in the text
    while ((match = commandRegex.exec(text)) !== null) {
        const fullCommand = match[0]; // e.g., "[BATTLE:dummy]"
        const commandContent = match[1]; // e.g., "BATTLE:dummy"
        commands.push(parseCommand(commandContent));

        // Remove command from display text
        cleanText = cleanText.replace(fullCommand, '');
    }

    return {
        cleanLine: cleanText,
        lineCommands: commands
    };
}

// Parse individual commands
function parseCommand(commandString) {
    const parts = commandString.split(':');
    const command = parts[0].toUpperCase();
    const args = parts.slice(1);

    return {
        command,
        args
    };
}

// Execute dialogue commands
function executeDialogueCommands(pageIndex) {
    if (!game.dialogue.commands || !game.dialogue.commands[pageIndex]) {
        return;
    }

    const commands = game.dialogue.commands[pageIndex];

    for (const cmd of commands) {
        switch (cmd.command) {
            case 'BATTLE':
                const enemyId = cmd.args[0];
                // Load enemy data from JSON
                const enemyData = getEnemy(enemyId);
                if (enemyData) {
                    game.pendingBattle = enemyData;
                }
                break;

            case 'SHOP':
                // Future shop implementation
                console.log('Shop command triggered');
                break;

            case 'END_DIALOGUE':
                game.dialogue.active = false;
                game.state = 'overworld';
                break;

            case 'HEAL':
                game.player.hp = game.player.maxHp;
                break;

            case 'SAVE':
                saveGame();
                break;

            case 'ITEM':
                const itemName = cmd.args[0];
                giveItem(itemName);
                break;

            case 'STATE':
                const newState = cmd.args[0];
                game.state = newState;
                break;

            case 'SET_FLAG':
                const flagName = cmd.args[0];
                if (!game.flags) {
                    game.flags = {};
                }
                game.flags[flagName] = true;
                break;

            case 'GOTO':
                const targetState = parseInt(cmd.args[0]) || 0;
                if (game.currentNPC) {
                    game.conversationStates[game.currentNPC] = targetState;
                }
                break;

            default:
                console.warn(`Unknown dialogue command: ${cmd.command}`);
        }
    }
}

// Helper function to give items to player
function giveItem(itemName) {
    const emptySlot = game.inventory.items.findIndex(item => item === null);
    if (emptySlot !== -1) {
        let newItem = null;

        // Create item based on name
        switch (itemName.toLowerCase()) {
            case 'monster_candy':
                newItem = {
                    name: 'Monster Candy',
                    description: '* Heals 10 HP\\n* Has a distinct, non-licorice flavor.',
                    tag: 'CONSUMABLE',
                    healing: 10
                };
                break;
            case 'spider_donut':
                newItem = {
                    name: 'Spider Donut',
                    description: '* Heals 12 HP\\n* A donut made with Spider Cider\\n  in the batter.',
                    tag: 'CONSUMABLE',
                    healing: 12
                };
                break;
            default:
                newItem = {
                    name: itemName,
                    description: '* A mysterious item.',
                    tag: 'MISC'
                };
        }

        game.inventory.items[emptySlot] = newItem;
    }
}

function processDialogueText(dialogueLines) {
    const pages = [];
    const commands = [];
    let currentPageLines = [];
    let currentPageCommands = [];

    for (const line of dialogueLines) {
        // Extract commands from the line
        const {
            cleanLine,
            lineCommands
        } = extractDialogueCommands(line);
        currentPageCommands.push(...lineCommands);

        const wrappedLines = wrapText(cleanLine, game.dialogue.maxCharsPerLine);

        for (const wrappedLine of wrappedLines) {
            if (currentPageLines.length >= game.dialogue.maxLines) {
                // Current page is full, start new page
                pages.push(currentPageLines.join('\n'));
                commands.push(currentPageCommands);
                currentPageLines = [wrappedLine];
                currentPageCommands = [];
            } else {
                currentPageLines.push(wrappedLine);
            }
        }
    }

    if (currentPageLines.length > 0) {
        pages.push(currentPageLines.join('\n'));
        commands.push(currentPageCommands);
    }

    // Store commands in dialogue state
    game.dialogue.commands = commands;

    return pages.length > 0 ? pages : ['* ...'];
}

// Input handling
document.addEventListener('keydown', (e) => {
    game.keys[e.code] = true;

    if (e.code === 'Space' || e.code === 'Enter') {
        handleAction();
    }
    if (e.code === 'KeyX') {
        if (game.state === 'overworld') {
            toggleMenu();
        } else if (game.state === 'menu') {
            if (game.menu.subMenu) {
                // Go back from submenu to main menu
                game.menu.subMenu = null;
                game.menu.itemAction = null;
                game.menu.itemActionOption = 0;
            } else {
                closeMenu();
            }
        } else if (game.state === 'inventory') {
            if (game.battle.active) {
                game.state = 'battleMenu';
            } else {
                game.state = 'menu';
            }
        } else if (game.state === 'battleActMenu') {
            // Cancel ACT menu, go back to main battle menu
            game.state = 'battleMenu';
        }
    }
    if (e.code === 'Escape') {
        handleEscKey();
    }
});

document.addEventListener('keyup', (e) => {
    game.keys[e.code] = false;
});

// Virtual joystick setup
function setupMobileControls() {
    const joystickBase = document.getElementById('joystickBase');
    const joystickKnob = document.getElementById('joystickKnob');
    const joystickContainer = document.getElementById('joystickContainer');

    // Joystick touch events
    joystickContainer.addEventListener('touchstart', (e) => {
        e.preventDefault();
        const touch = e.touches[0];
        const rect = joystickBase.getBoundingClientRect();

        game.joystick.active = true;
        game.joystick.startX = rect.left + rect.width / 2;
        game.joystick.startY = rect.top + rect.height / 2;

        updateJoystick(touch.clientX, touch.clientY);
    });

    document.addEventListener('touchmove', (e) => {
        if (game.joystick.active) {
            e.preventDefault();
            const touch = e.touches[0];
            updateJoystick(touch.clientX, touch.clientY);
        }
    });

    document.addEventListener('touchend', (e) => {
        if (game.joystick.active) {
            e.preventDefault();
            game.joystick.active = false;
            game.joystick.distance = 0;

            // Reset knob position
            joystickKnob.style.left = '30px';
            joystickKnob.style.top = '30px';
        }
    });

    // Action button
    const actionBtn = document.getElementById('actionBtn');
    actionBtn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        handleAction();
    });

    // Menu button  
    const menuBtn = document.getElementById('menuBtn');
    let longPressTimer;
    let isLongPress = false;

    menuBtn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        isLongPress = false;
        longPressTimer = setTimeout(() => {
            isLongPress = true;
            handleEscKey();
        }, 800);
    });

    menuBtn.addEventListener('touchend', (e) => {
        e.preventDefault();
        clearTimeout(longPressTimer);

        if (!isLongPress) {
            // Regular tap functionality
            if (game.state === 'overworld') {
                toggleMenu();
            } else if (game.state === 'menu') {
                closeMenu();
            } else if (game.state === 'inventory') {
                if (game.battle.active) {
                    game.state = 'battleMenu';
                } else {
                    game.state = 'menu';
                }
            }
        }
    });

    menuBtn.addEventListener('touchcancel', () => {
        clearTimeout(longPressTimer);
    });
}

function updateJoystick(touchX, touchY) {
    const dx = touchX - game.joystick.startX;
    const dy = touchY - game.joystick.startY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const maxDistance = 35;

    game.joystick.distance = Math.min(distance, maxDistance);
    game.joystick.angle = Math.atan2(dy, dx);

    // Update knob position
    const knobX = Math.cos(game.joystick.angle) * game.joystick.distance;
    const knobY = Math.sin(game.joystick.angle) * game.joystick.distance;

    const joystickKnob = document.getElementById('joystickKnob');
    joystickKnob.style.left = (30 + knobX) + 'px';
    joystickKnob.style.top = (30 + knobY) + 'px';
}

function handleAction() {
    if (game.dialogue.active) {
        const currentPageText = game.dialogue.pages[game.dialogue.currentPage] || '';

        if (game.dialogue.currentChar >= currentPageText.length) {
            // Current page is fully displayed
            if (game.dialogue.currentPage < game.dialogue.pages.length - 1) {
                // Execute commands for current page before moving to next
                executeDialogueCommands(game.dialogue.currentPage);

                // Move to next page
                game.dialogue.currentPage++;
                game.dialogue.currentChar = 0;
            } else {
                // Execute commands for final page
                executeDialogueCommands(game.dialogue.currentPage);

                // End dialogue
                game.dialogue.active = false;

                // Clear current NPC reference
                game.currentNPC = null;

                // Check what to do after dialogue ends
                if (game.pendingBattle) {
                    // Start battle after NPC dialogue
                    startBattle(game.pendingBattle);
                    game.pendingBattle = null;
                } else if (game.state === 'battle') {
                    // Go to battle menu after enemy encounter dialogue
                    game.state = 'battleMenu';
                } else if (game.afterDialogueAction === 'enemyTurn') {
                    // Start enemy turn after ACT/ITEM/failed MERCY
                    game.afterDialogueAction = null;
                    startEnemyTurn();
                } else if (game.afterDialogueAction === 'returnToBattleMenu') {
                    // Return to battle menu after non-consumable item use
                    game.afterDialogueAction = null;
                    game.state = 'battleMenu';
                } else if (game.menu.active) {
                    // Return to menu after menu dialogue
                    game.state = 'menu';
                } else if (game.state === 'inventory') {
                    // Return to inventory after item use
                    game.state = 'inventory';
                } else {
                    // Return to overworld
                    game.state = 'overworld';
                }
            }
        } else {
            // Fast forward current page
            game.dialogue.currentChar = currentPageText.length;
        }
    } else if (game.state === 'overworld') {
        checkInteraction();
    } else if (game.state === 'menu') {
        handleMenuSelect();
    } else if (game.state === 'escMenu') {
        handleEscMenuSelect();
    } else if (game.state === 'settings') {
        handleSettingsSelect();
    } else if (game.state === 'inventory') {
        handleInventorySelect();
    } else if (game.state === 'battleMenu') {
        handleBattleMenuSelect();
    } else if (game.state === 'battleActMenu') {
        handleBattleActMenuSelect();
    } else if (game.state === 'battleAttack' && !game.battle.attackBar.active) {
        // Start attack
        game.battle.attackBar.active = true;
        game.battle.attackBar.position = 0;
    } else if (game.state === 'battleAttack' && game.battle.attackBar.active) {
        // Calculate damage
        const accuracy = 1 - Math.abs(game.battle.attackBar.position - 160) / 160;
        const damage = Math.floor(game.player.atk * accuracy);
        const targetEnemy = game.battle.enemies[game.battle.selectedEnemyIndex];

        if (targetEnemy) {
            targetEnemy.hp -= damage;

            game.battle.attackBar.active = false;

            if (targetEnemy.hp <= 0) {
                // Check if all enemies are defeated
                const aliveEnemies = game.battle.enemies.filter(e => e.hp > 0);
                if (aliveEnemies.length === 0) {
                    endBattle(true);
                } else {
                    startEnemyTurn();
                }
            } else {
                startEnemyTurn();
            }
        } else {
            game.battle.attackBar.active = false;
            startEnemyTurn();
        }
    }
}

// Menu functions
function toggleMenu() {
    if (game.state === 'overworld') {
        game.state = 'menu';
        game.menu.active = true;
        game.menu.option = 0;
    } else if (game.state === 'menu') {
        closeMenu();
    }
}

function closeMenu() {
    if (game.state === 'menu') {
        game.state = 'overworld';
        game.menu.active = false;
    }
}

// ESC Menu functions
function handleEscKey() {
    if (game.state === 'overworld' || game.state === 'dialogue') {
        openEscMenu();
    } else if (game.state === 'escMenu') {
        closeEscMenu();
    } else if (game.state === 'settings') {
        game.state = 'escMenu';
        game.settings.active = false;
    }
}

function openEscMenu() {
    game.state = 'escMenu';
    game.escMenu.active = true;
    game.escMenu.option = 0;
}

function closeEscMenu() {
    game.state = 'overworld';
    game.escMenu.active = false;
    game.settings.active = false;
}

function handleEscMenuSelect() {
    const option = game.escMenu.options[game.escMenu.option];
    switch (option) {
        case 'SETTINGS':
            game.state = 'settings';
            game.settings.active = true;
            game.settings.option = 0;
            break;

        case 'LOAD':
            loadGame();
            startDialogue("* Game loaded!");
            break;

        case 'RETURN':
            closeEscMenu();
            break;
    }
}

function handleSettingsSelect() {
    const option = game.settings.options[game.settings.option];

    switch (option) {
        case 'RESOLUTION':
            cycleResolution();
            break;

        case 'FULLSCREEN':
            toggleFullscreen();
            break;

        case 'BACK':
            game.state = 'escMenu';
            game.settings.active = false;
            break;
    }
}

function cycleResolution() {
    game.settings.currentResolution = (game.settings.currentResolution + 1) % game.settings.resolutionOptions.length;
    game.settings.scale = game.settings.currentResolution + 1;
    setResolutionScale(game.settings.scale);
    saveSettings();
}

function toggleFullscreen() {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(err => {
            console.log('Fullscreen not supported');
        });
        game.settings.fullscreen = true;
    } else {
        document.exitFullscreen();
        game.settings.fullscreen = false;
    }

    saveSettings();
}

function setResolutionScale(scale) {
    const gameContainer = document.getElementById('gameContainer');
    const baseWidth = 320;
    const baseHeight = 240;

    gameContainer.style.width = (baseWidth * scale) + 'px';
    gameContainer.style.height = (baseHeight * scale) + 'px';
    gameContainer.style.maxWidth = 'none';
    gameContainer.style.maxHeight = 'none';

    // Update resolution display
    updateResolutionDisplay();
}

function saveGame() {
    const saveData = {
        player: game.player,
        inventory: game.inventory,
        actionUsage: game.actionUsage,
        conversationStates: game.conversationStates,
        timestamp: Date.now()
    };

    localStorage.setItem('undertaleGameSave', JSON.stringify(saveData));
}

function loadGame() {
    const saveData = localStorage.getItem('undertaleGameSave');

    if (saveData) {
        const parsed = JSON.parse(saveData);
        game.player = parsed.player;
        game.inventory = parsed.inventory;

        // Load action usage if it exists in save data
        game.actionUsage = parsed.actionUsage || {};

        // Load conversation states if it exists in save data
        game.conversationStates = parsed.conversationStates || {};
        closeEscMenu();
    }
}

function saveSettings() {
    const settingsData = {
        scale: game.settings.scale,
        fullscreen: game.settings.fullscreen,
        currentResolution: game.settings.currentResolution
    };

    localStorage.setItem('undertaleGameSettings', JSON.stringify(settingsData));
}

function loadSettings() {
    const settingsData = localStorage.getItem('undertaleGameSettings');

    if (settingsData) {
        const parsed = JSON.parse(settingsData);

        game.settings.scale = parsed.scale || 2;
        game.settings.fullscreen = parsed.fullscreen || false;
        game.settings.currentResolution = parsed.currentResolution || 1;

        setResolutionScale(game.settings.scale);
    }
}

function updateEscMenu() {
    // Menu navigation with keyboard
    if (game.keys['ArrowUp'] && !game.prevKeys['ArrowUp']) {
        game.escMenu.option = (game.escMenu.option - 1 + game.escMenu.options.length) % game.escMenu.options.length;
    }

    if (game.keys['ArrowDown'] && !game.prevKeys['ArrowDown']) {
        game.escMenu.option = (game.escMenu.option + 1) % game.escMenu.options.length;
    }

    // Joystick navigation
    if (game.joystick.active && game.joystick.distance > 15) {
        if (!game.joystickMenuCooldown) {
            const angle = game.joystick.angle;

            // Up
            if (angle < -Math.PI / 4 && angle > -3 * Math.PI / 4) {
                game.escMenu.option = (game.escMenu.option - 1 + game.escMenu.options.length) % game.escMenu.options.length;
                game.joystickMenuCooldown = true;
            }
            // Down
            else if (angle > Math.PI / 4 && angle < 3 * Math.PI / 4) {
                game.escMenu.option = (game.escMenu.option + 1) % game.escMenu.options.length;
                game.joystickMenuCooldown = true;
            }
        }
    } else {
        game.joystickMenuCooldown = false;
    }
}

function updateSettings() {
    // Menu navigation with keyboard
    if (game.keys['ArrowUp'] && !game.prevKeys['ArrowUp']) {
        game.settings.option = (game.settings.option - 1 + game.settings.options.length) % game.settings.options.length;
    }

    if (game.keys['ArrowDown'] && !game.prevKeys['ArrowDown']) {
        game.settings.option = (game.settings.option + 1) % game.settings.options.length;
    }

    // Joystick navigation
    if (game.joystick.active && game.joystick.distance > 15) {
        if (!game.joystickMenuCooldown) {
            const angle = game.joystick.angle;

            // Up
            if (angle < -Math.PI / 4 && angle > -3 * Math.PI / 4) {
                game.settings.option = (game.settings.option - 1 + game.settings.options.length) % game.settings.options.length;
                game.joystickMenuCooldown = true;
            }
            // Down
            else if (angle > Math.PI / 4 && angle < 3 * Math.PI / 4) {
                game.settings.option = (game.settings.option + 1) % game.settings.options.length;
                game.joystickMenuCooldown = true;
            }
        }
    } else {
        game.joystickMenuCooldown = false;
    }
}

function handleMenuSelect() {
    if (!game.menu.subMenu) {
        // Main menu selection
        const option = game.menu.options[game.menu.option];
        switch (option) {
            case 'ITEM':
                game.menu.subMenu = 'item';
                game.inventory.selectedItem = 0;
                game.menu.itemAction = null;
                game.menu.itemActionOption = 0;
                break;

            case 'STAT':
                game.menu.subMenu = 'stat';
                break;

            case 'CELL':
                game.menu.subMenu = 'cell';
                game.menu.cellOption = 0;
                break;
        }
    } else if (game.menu.subMenu === 'item') {
        if (game.menu.itemAction) {
            // Execute item action
            const item = game.inventory.items[game.inventory.selectedItem];
            if (item) {
                const actions = [
                    'USE',
                    'INFO',
                    'DROP'
                ];

                const selectedAction = actions[game.menu.itemActionOption];

                switch (selectedAction) {
                    case 'USE':
                        useItem(game.inventory.selectedItem);
                        game.menu.itemAction = null;
                        break;

                    case 'INFO':
                        startDialogue(item.description);
                        break;

                    case 'DROP':
                        startDialogue(`* You dropped the ${item.name}.`);
                        game.inventory.items[game.inventory.selectedItem] = null;
                        game.menu.itemAction = null;
                        break;
                }
            }
        } else {
            // Enter action mode for selected item
            const item = game.inventory.items[game.inventory.selectedItem];

            if (item) {
                game.menu.itemAction = true;
                game.menu.itemActionOption = 0;
            }
        }
    } else if (game.menu.subMenu === 'cell') {
        // Call selected contact
        if (game.phonebook.length > 0) {
            const contact = game.phonebook[game.menu.cellOption];
            startDialogue(`* Calling ${contact.name}...\\n* Ring ring...`);
        }
    }
    // STAT submenu has no actions
}

function updateMenu() {
    if (!game.menu.subMenu) {
        // Main menu navigation
        if (game.keys['ArrowUp'] && !game.prevKeys['ArrowUp']) {
            game.menu.option = (game.menu.option - 1 + game.menu.options.length) % game.menu.options.length;
        }

        if (game.keys['ArrowDown'] && !game.prevKeys['ArrowDown']) {
            game.menu.option = (game.menu.option + 1) % game.menu.options.length;
        }

        // Joystick navigation for main menu
        if (game.joystick.active && game.joystick.distance > 15) {
            if (!game.joystickMenuCooldown) {
                const angle = game.joystick.angle;

                // Up
                if (angle < -Math.PI / 4 && angle > -3 * Math.PI / 4) {
                    game.menu.option = (game.menu.option - 1 + game.menu.options.length) % game.menu.options.length;
                    game.joystickMenuCooldown = true;
                }
                // Down
                else if (angle > Math.PI / 4 && angle < 3 * Math.PI / 4) {
                    game.menu.option = (game.menu.option + 1) % game.menu.options.length;
                    game.joystickMenuCooldown = true;
                }
            }
        } else {
            game.joystickMenuCooldown = false;
        }
    } else if (game.menu.subMenu === 'item') {
        // Item submenu navigation
        if (game.menu.itemAction) {
            // Navigate between action buttons (USE, INFO, DROP)
            if (game.keys['ArrowLeft'] && !game.prevKeys['ArrowLeft']) {
                game.menu.itemActionOption = Math.max(0, game.menu.itemActionOption - 1);
            }

            if (game.keys['ArrowRight'] && !game.prevKeys['ArrowRight']) {
                game.menu.itemActionOption = Math.min(2, game.menu.itemActionOption + 1);
            }
        } else {
            // Navigate through items
            if (game.keys['ArrowUp'] && !game.prevKeys['ArrowUp']) {
                game.inventory.selectedItem = Math.max(0, game.inventory.selectedItem - 1);
            }
            if (game.keys['ArrowDown'] && !game.prevKeys['ArrowDown']) {
                game.inventory.selectedItem = Math.min(11, game.inventory.selectedItem + 1);
            }
        }

        // Joystick navigation for item menu
        if (game.joystick.active && game.joystick.distance > 15) {
            if (!game.joystickMenuCooldown) {
                const angle = game.joystick.angle;
                if (game.menu.itemAction) {
                    // Navigate action buttons
                    // Left
                    if (angle > 2.356 || angle < -2.356) {
                        game.menu.itemActionOption = Math.max(0, game.menu.itemActionOption - 1);
                        game.joystickMenuCooldown = true;
                    }
                    // Right
                    else if (angle < 0.785 && angle > -0.785) {
                        game.menu.itemActionOption = Math.min(2, game.menu.itemActionOption + 1);
                        game.joystickMenuCooldown = true;
                    }
                } else {
                    // Navigate items
                    // Up
                    if (angle < -Math.PI / 4 && angle > -3 * Math.PI / 4) {
                        game.inventory.selectedItem = Math.max(0, game.inventory.selectedItem - 1);
                        game.joystickMenuCooldown = true;
                    }
                    // Down
                    else if (angle > Math.PI / 4 && angle < 3 * Math.PI / 4) {
                        game.inventory.selectedItem = Math.min(11, game.inventory.selectedItem + 1);
                        game.joystickMenuCooldown = true;
                    }
                }
            }
        } else {
            game.joystickMenuCooldown = false;
        }
    } else if (game.menu.subMenu === 'cell') {
        // Cell submenu navigation
        if (game.phonebook.length > 0) {
            if (game.keys['ArrowUp'] && !game.prevKeys['ArrowUp']) {
                game.menu.cellOption = Math.max(0, game.menu.cellOption - 1);
            }
            if (game.keys['ArrowDown'] && !game.prevKeys['ArrowDown']) {
                game.menu.cellOption = Math.min(game.phonebook.length - 1, game.menu.cellOption + 1);
            }

            // Joystick navigation for cell menu
            if (game.joystick.active && game.joystick.distance > 15) {
                if (!game.joystickMenuCooldown) {
                    const angle = game.joystick.angle;

                    // Up
                    if (angle < -Math.PI / 4 && angle > -3 * Math.PI / 4) {
                        game.menu.cellOption = Math.max(0, game.menu.cellOption - 1);
                        game.joystickMenuCooldown = true;
                    }
                    // Down
                    else if (angle > Math.PI / 4 && angle < 3 * Math.PI / 4) {
                        game.menu.cellOption = Math.min(game.phonebook.length - 1, game.menu.cellOption + 1);
                        game.joystickMenuCooldown = true;
                    }
                }
            } else {
                game.joystickMenuCooldown = false;
            }
        }
    }
    // STAT submenu has no navigation
}

// Player movement
function updatePlayer() {
    if (game.state !== 'overworld') {
        return;
    }

    let newX = game.player.x;
    let newY = game.player.y;
    let moving = false;

    // Keyboard controls
    if (game.keys['ArrowLeft']) {
        newX -= game.player.speed;
        game.player.facing = 'left';
        moving = true;
    }

    if (game.keys['ArrowRight']) {
        newX += game.player.speed;
        game.player.facing = 'right';
        moving = true;
    }

    if (game.keys['ArrowUp']) {
        newY -= game.player.speed;
        game.player.facing = 'up';
        moving = true;
    }

    if (game.keys['ArrowDown']) {
        newY += game.player.speed;
        game.player.facing = 'down';
        moving = true;
    }

    // Joystick controls
    if (game.joystick.active && game.joystick.distance > 10) {
        const moveX = Math.cos(game.joystick.angle) * game.player.speed * (game.joystick.distance / 35);
        const moveY = Math.sin(game.joystick.angle) * game.player.speed * (game.joystick.distance / 35);

        newX += moveX;
        newY += moveY;
        moving = true;

        // Update facing direction
        if (Math.abs(moveX) > Math.abs(moveY)) {
            game.player.facing = moveX > 0 ? 'right' : 'left';
        } else {
            game.player.facing = moveY > 0 ? 'down' : 'up';
        }
    }

    // Check collision with walls
    if (moving && !checkWallCollision(newX, newY)) {
        game.player.x = newX;
        game.player.y = newY;

        // Check for room transitions after moving
        checkRoomTransitions();
    }

    // Keep player in bounds
    game.player.x = Math.max(0, Math.min(canvas.width - game.player.width, game.player.x));
    game.player.y = Math.max(0, Math.min(canvas.height - game.player.height, game.player.y));
}

// Battle system functions
function startBattle(enemyOrEnemies) {
    game.battle.active = true;

    // Handle both single enemy and enemy array
    let enemies = Array.isArray(enemyOrEnemies) ? enemyOrEnemies : [enemyOrEnemies];

    // Limit to maximum 3 enemies
    enemies = enemies.slice(0, 3);

    // Deep copy enemies and initialize battle state
    game.battle.enemies = enemies.map(enemy => JSON.parse(JSON.stringify(enemy)));
    game.battle.enemyCount = game.battle.enemies.length;
    game.battle.selectedEnemyIndex = 0;
    game.battle.showEnemySelection = false; // Always start with main menu, not enemy selection
    game.battle.menuOption = 0;
    game.battle.actMenuOption = 0;
    game.battle.soul.x = 160;
    game.battle.soul.y = 160;
    game.battle.bullets = [];

    // Initialize each enemy and apply positioning
    game.battle.enemies.forEach((enemy, index) => {
        // Initialize mercy system
        if (!enemy.mercy) enemy.mercy = 0;
        if (!enemy.maxMercy) enemy.maxMercy = 100;
        if (!enemy.spareable) enemy.spareable = false;

        // Apply positioning based on enemy count if not explicitly set
        applyEnemyPositioning(enemy, index, game.battle.enemyCount);
    });

    // Initialize action usage tracking if not exists
    if (!game.actionUsage) {
        game.actionUsage = {};
    }

    // Load enemy combat sprites
    game.battle.enemySprites = [];
    game.battle.enemies.forEach((enemy, index) => {
        const spriteData = {
            image: null,
            loaded: false,
            loading: false
        };

        if (enemy.combatSprite) {
            loadEnemySprite(enemy.combatSprite, index);
        }

        game.battle.enemySprites.push(spriteData);
    });

    // Show enemy encounter dialogue first (from first enemy)
    game.state = 'battle';
    const firstEnemy = game.battle.enemies[0];
    startDialogue(firstEnemy.dialogueId);
    // After dialogue ends, it will automatically go to battleMenu
}

// Apply positioning to enemies based on count and index
function applyEnemyPositioning(enemy, index, count) {
    // Apply battle position if not set
    if (!enemy.battlePosition) {
        enemy.battlePosition = calculateBattlePosition(index, count);
    }

    // Apply health display position if not set
    if (!enemy.healthDisplayPos) {
        enemy.healthDisplayPos = calculateHealthDisplayPosition(index, count);
    }

    // Apply mercy display position if not set  
    if (!enemy.mercyDisplayPos) {
        const healthPos = enemy.healthDisplayPos;
        enemy.mercyDisplayPos = {
            x: healthPos.x,
            y: healthPos.y + 12,
            visible: healthPos.visible !== false
        };
    }

    // Set default visibility if not specified
    if (enemy.healthDisplayPos.visible === undefined) {
        enemy.healthDisplayPos.visible = true;
    }
    if (enemy.mercyDisplayPos.visible === undefined) {
        enemy.mercyDisplayPos.visible = true;
    }
}

// Calculate battle positions for enemies
function calculateBattlePosition(index, count) {
    if (count === 1) {
        return {
            x: 160,
            y: 50
        }; // Center
    } else if (count === 2) {
        return index === 0 ? {
            x: 100,
            y: 50
        } : {
            x: 220,
            y: 50
        };
    } else { // count === 3
        const positions = [{
            x: 80,
            y: 50
        }, {
            x: 160,
            y: 50
        }, {
            x: 240,
            y: 50
        }];
        return positions[index];
    }
}

// Calculate health display positions for enemies
function calculateHealthDisplayPosition(index, count) {
    if (count === 1) {
        return {
            x: 120,
            y: 90,
            visible: true
        }; // Center
    } else if (count === 2) {
        return index === 0 ?
            {
                x: 60,
                y: 90,
                visible: true
            } :
            {
                x: 180,
                y: 90,
                visible: true
            };
    } else { // count === 3
        const positions = [{
                x: 40,
                y: 90,
                visible: true
            },
            {
                x: 120,
                y: 90,
                visible: true
            },
            {
                x: 200,
                y: 90,
                visible: true
            }
        ];
        return positions[index];
    }
}

function handleBattleMenuSelect() {
    const option = game.battle.menuOptions[game.battle.menuOption];

    // If showing enemy selection, handle enemy targeting
    if (game.battle.showEnemySelection) {
        // Target selected, now execute the action
        game.battle.showEnemySelection = false;

        switch (option) {
            case 'FIGHT':
                game.state = 'battleAttack';
                break;

            case 'ACT':
                // Enter ACT sub-menu for selected enemy
                const selectedEnemy = game.battle.enemies[game.battle.selectedEnemyIndex];
                if (selectedEnemy && selectedEnemy.acts && selectedEnemy.acts.length > 0) {
                    game.state = 'battleActMenu';
                    game.battle.actMenuOption = 0;
                } else {
                    // Fallback for enemies without ACT options
                    startDialogue("* You try to act, but nothing happens.");
                    game.afterDialogueAction = 'enemyTurn';
                }
                break;

            case 'MERCY':
                const targetEnemy = game.battle.enemies[game.battle.selectedEnemyIndex];
                if (targetEnemy && (targetEnemy.spareable || targetEnemy.mercy >= targetEnemy.maxMercy)) {
                    // Spare this enemy
                    targetEnemy.hp = 0;
                    targetEnemy.spareable = true;

                    // Check if all enemies are defeated/spared
                    const aliveEnemies = game.battle.enemies.filter(e => e.hp > 0);
                    if (aliveEnemies.length === 0) {
                        endBattle(false); // Victory through mercy
                    } else {
                        startDialogue("* You spared the " + targetEnemy.name + ".");
                        game.afterDialogueAction = 'enemyTurn';
                    }
                } else {
                    startDialogue("* You spare the " + targetEnemy.name + ".\\n* But it wasn't ready to spare you.");
                    game.afterDialogueAction = 'enemyTurn';
                }
                break;
        }
        return;
    }

    // If multiple enemies and selecting targeting action, show enemy selection
    if (game.battle.enemyCount > 1 && (option === 'FIGHT' || option === 'ACT' || option === 'MERCY')) {
        game.battle.showEnemySelection = true;
        return;
    }

    switch (option) {
        case 'FIGHT':
            game.state = 'battleAttack';
            break;

        case 'ACT':
            // Enter ACT sub-menu for selected enemy
            const selectedEnemy = game.battle.enemies[game.battle.selectedEnemyIndex];
            if (selectedEnemy && selectedEnemy.acts && selectedEnemy.acts.length > 0) {
                game.state = 'battleActMenu';
                game.battle.actMenuOption = 0;
            } else {
                // Fallback for enemies without ACT options
                startDialogue("* You try to act, but nothing happens.");
                game.afterDialogueAction = 'enemyTurn';
            }
            break;

        case 'ITEM':
            game.state = 'inventory';
            game.inventory.selectedItem = 0;
            break;

        case 'MERCY':
            const targetEnemy = game.battle.enemies[game.battle.selectedEnemyIndex];
            if (targetEnemy && (targetEnemy.spareable || targetEnemy.mercy >= targetEnemy.maxMercy)) {
                // Spare this enemy
                targetEnemy.hp = 0;
                targetEnemy.spareable = true;

                // Check if all enemies are defeated/spared
                const aliveEnemies = game.battle.enemies.filter(e => e.hp > 0);
                if (aliveEnemies.length === 0) {
                    endBattle(false); // Victory through mercy
                } else {
                    startDialogue("* You spared the " + targetEnemy.name + ".");
                    game.afterDialogueAction = 'enemyTurn';
                }
            } else {
                startDialogue("* You spare the " + targetEnemy.name + ".\\n* But it wasn't ready to spare you.");
                game.afterDialogueAction = 'enemyTurn';
            }
            break;
    }
}

function startEnemyTurn() {
    game.state = 'battleDodge';
    game.battle.turnTimer = 0;
    game.battle.bullets = [];

    // Reset soul position
    game.battle.soul.x = 160;
    game.battle.soul.y = 180;
}

function updateBattleMenu() {
    // Handle enemy selection mode
    if (game.battle.showEnemySelection) {
        // Filter to alive enemies only
        const aliveEnemies = [];
        game.battle.enemies.forEach((enemy, index) => {
            if (enemy.hp > 0) {
                aliveEnemies.push(index);
            }
        });

        if (aliveEnemies.length === 0) {
            // No alive enemies, exit selection mode
            game.battle.showEnemySelection = false;
            return;
        }

        // Navigate between alive enemies
        if (game.keys['ArrowUp'] && !game.prevKeys['ArrowUp']) {
            const currentIndex = aliveEnemies.indexOf(game.battle.selectedEnemyIndex);
            const newIndex = currentIndex > 0 ? currentIndex - 1 : aliveEnemies.length - 1;
            game.battle.selectedEnemyIndex = aliveEnemies[newIndex];
        }

        if (game.keys['ArrowDown'] && !game.prevKeys['ArrowDown']) {
            const currentIndex = aliveEnemies.indexOf(game.battle.selectedEnemyIndex);
            const newIndex = currentIndex < aliveEnemies.length - 1 ? currentIndex + 1 : 0;
            game.battle.selectedEnemyIndex = aliveEnemies[newIndex];
        }

        // Joystick navigation for enemy selection
        if (game.joystick.active && game.joystick.distance > 15) {
            if (!game.joystickMenuCooldown) {
                const angle = game.joystick.angle;

                // Up
                if (angle < -Math.PI / 4 && angle > -3 * Math.PI / 4) {
                    const currentIndex = aliveEnemies.indexOf(game.battle.selectedEnemyIndex);
                    const newIndex = currentIndex > 0 ? currentIndex - 1 : aliveEnemies.length - 1;
                    game.battle.selectedEnemyIndex = aliveEnemies[newIndex];
                    game.joystickMenuCooldown = true;
                }

                // Down
                else if (angle > Math.PI / 4 && angle < 3 * Math.PI / 4) {
                    const currentIndex = aliveEnemies.indexOf(game.battle.selectedEnemyIndex);
                    const newIndex = currentIndex < aliveEnemies.length - 1 ? currentIndex + 1 : 0;
                    game.battle.selectedEnemyIndex = aliveEnemies[newIndex];
                    game.joystickMenuCooldown = true;
                }
            }
        } else {
            game.joystickMenuCooldown = false;
        }

        return; // Don't process normal menu navigation while in enemy selection
    }

    // Normal menu navigation
    if (game.keys['ArrowLeft'] && !game.prevKeys['ArrowLeft']) {
        if (game.battle.menuOption % 2 === 1) game.battle.menuOption--;
    }

    if (game.keys['ArrowRight'] && !game.prevKeys['ArrowRight']) {
        if (game.battle.menuOption % 2 === 0) game.battle.menuOption++;
    }

    if (game.keys['ArrowUp'] && !game.prevKeys['ArrowUp']) {
        if (game.battle.menuOption >= 2) game.battle.menuOption -= 2;
    }

    if (game.keys['ArrowDown'] && !game.prevKeys['ArrowDown']) {
        if (game.battle.menuOption < 2) game.battle.menuOption += 2;
    }

    // Joystick navigation for battle menu
    if (game.joystick.active && game.joystick.distance > 15) {
        if (!game.joystickMenuCooldown) {
            const angle = game.joystick.angle;

            // Convert angle to 8 directions
            // Left
            if (angle > 2.356 || angle < -2.356) {
                if (game.battle.menuOption % 2 === 1) {
                    game.battle.menuOption--;
                    game.joystickMenuCooldown = true;
                }
            }

            // Right
            else if (angle < 0.785 && angle > -0.785) {
                if (game.battle.menuOption % 2 === 0) {
                    game.battle.menuOption++;
                    game.joystickMenuCooldown = true;
                }
            }

            // Up
            else if (angle < -0.785 && angle > -2.356) {
                if (game.battle.menuOption >= 2) {
                    game.battle.menuOption -= 2;
                    game.joystickMenuCooldown = true;
                }
            }

            // Down
            else if (angle > 0.785 && angle < 2.356) {
                if (game.battle.menuOption < 2) {
                    game.battle.menuOption += 2;
                    game.joystickMenuCooldown = true;
                }
            }
        }
    } else {
        game.joystickMenuCooldown = false;
    }
}

function updateBattleActMenu() {
    const selectedEnemy = game.battle.enemies[game.battle.selectedEnemyIndex];
    const actCount = (selectedEnemy && selectedEnemy.acts) ? selectedEnemy.acts.length : 0;

    if (actCount === 0) {
        return;
    }

    // Menu navigation with keyboard
    if (game.keys['ArrowUp'] && !game.prevKeys['ArrowUp']) {
        game.battle.actMenuOption = (game.battle.actMenuOption - 1 + actCount) % actCount;
    }

    if (game.keys['ArrowDown'] && !game.prevKeys['ArrowDown']) {
        game.battle.actMenuOption = (game.battle.actMenuOption + 1) % actCount;
    }

    // Joystick navigation for ACT menu
    if (game.joystick.active && game.joystick.distance > 15) {
        if (!game.joystickMenuCooldown) {
            const angle = game.joystick.angle;

            // Up
            if (angle < -Math.PI / 4 && angle > -3 * Math.PI / 4) {
                game.battle.actMenuOption = (game.battle.actMenuOption - 1 + actCount) % actCount;
                game.joystickMenuCooldown = true;
            }

            // Down
            else if (angle > Math.PI / 4 && angle < 3 * Math.PI / 4) {
                game.battle.actMenuOption = (game.battle.actMenuOption + 1) % actCount;
                game.joystickMenuCooldown = true;
            }
        }
    } else {
        game.joystickMenuCooldown = false;
    }
}

function handleBattleActMenuSelect() {
    const selectedEnemy = game.battle.enemies[game.battle.selectedEnemyIndex];
    if (!selectedEnemy || !selectedEnemy.acts) {
        return;
    }

    const actOption = selectedEnemy.acts[game.battle.actMenuOption];

    if (!actOption) {
        return;
    }

    // Execute the selected ACT
    executeActOption(actOption, selectedEnemy);

    // Return to main battle menu
    game.state = 'battleMenu';
}

// Process dialogue commands for dynamic content
function processDialogueCommands(text, targetEnemy = null) {
    if (!text || typeof text !== 'string') {
        return text;
    }

    // Use provided enemy, selected enemy, or first enemy as fallback
    let enemy = targetEnemy;
    if (!enemy && game.battle.enemies && game.battle.enemies.length > 0) {
        enemy = game.battle.enemies[game.battle.selectedEnemyIndex] || game.battle.enemies[0];
    }

    // Replace enemy stat commands
    if (enemy) {
        text = text.replace(/\[GET_AT\]/g, enemy.atk);
        text = text.replace(/\[GET_DF\]/g, enemy.def);
        text = text.replace(/\[GET_HP\]/g, enemy.hp);
        text = text.replace(/\[GET_MAX_HP\]/g, enemy.maxHp);
        text = text.replace(/\[ENEMY_NAME\]/g, enemy.name);
    }

    // Replace player stat commands
    text = text.replace(/\[PLAYER_HP\]/g, game.player.hp);
    text = text.replace(/\[PLAYER_MAX_HP\]/g, game.player.maxHp);
    text = text.replace(/\[PLAYER_LV\]/g, game.player.lv);
    text = text.replace(/\[PLAYER_ATK\]/g, game.player.atk + game.player.weaponAtk);
    text = text.replace(/\[PLAYER_DEF\]/g, game.player.def + game.player.armorDef);

    return text;
}

// Execute ACT option
function executeActOption(actName, enemy = null) {
    // Use provided enemy or fall back to selected enemy
    if (!enemy) {
        enemy = game.battle.enemies[game.battle.selectedEnemyIndex];
    }

    if (!enemy) {
        return;
    }

    // Track usage for this action
    const usageKey = `${enemy.name.toLowerCase()}_${actName.toLowerCase()}`;

    if (!game.actionUsage[usageKey]) {
        game.actionUsage[usageKey] = 0;
    }

    // Get dialogue for this ACT with usage tracking
    const actKey = `act_${actName.toLowerCase()}`;
    let dialogueId = `battle.${enemy.name.toLowerCase()}.${actKey}`;
    let dialogueLines = getDialogue(dialogueId, actName.toLowerCase(), enemy.name.toLowerCase());

    // If no specific dialogue found, use generic response
    if (dialogueLines.length === 1 && dialogueLines[0].includes('Missing dialogue')) {
        dialogueLines = [`* You ${actName.toLowerCase()} the ${enemy.name}.`];
    }

    // Increment usage count after getting dialogue
    game.actionUsage[usageKey]++;

    // Process dialogue commands and mercy effects
    const processedLines = [];
    let mercyChange = 0;

    for (const line of dialogueLines) {
        // Process dialogue commands for dynamic content
        const processedLine = processDialogueCommands(line, enemy);

        // Check for mercy commands
        const mercyMatch = processedLine.match(new RegExp(`${actName.toLowerCase()}:(-?\\d+)`, 'i'));
        if (mercyMatch) {
            mercyChange += parseInt(mercyMatch[1]);
            // Don't display mercy commands as dialogue
            continue;
        }

        processedLines.push(processedLine);
    }

    // Apply mercy change
    if (mercyChange !== 0) {
        enemy.mercy = Math.max(0, Math.min(enemy.maxMercy, enemy.mercy + mercyChange));

        // Check if enemy becomes spareable
        if (enemy.mercy >= enemy.maxMercy) {
            enemy.spareable = true;
        }

        // Add mercy change notification
        if (mercyChange > 0) {
            processedLines.push(`* ${enemy.name}'s MERCY increased by ${mercyChange}.`);
        } else {
            processedLines.push(`* ${enemy.name}'s MERCY decreased by ${Math.abs(mercyChange)}.`);
        }
    }

    // Start dialogue
    startDialogue(processedLines);
    game.afterDialogueAction = 'enemyTurn';
}

function updateBattleDodge(deltaTime) {
    game.battle.turnTimer += deltaTime;

    // Update soul position
    let soulSpeed = game.battle.soul.speed;

    if (game.keys['ArrowLeft'] || (game.joystick.active && Math.cos(game.joystick.angle) < -0.5)) {
        game.battle.soul.x -= soulSpeed;
    }

    if (game.keys['ArrowRight'] || (game.joystick.active && Math.cos(game.joystick.angle) > 0.5)) {
        game.battle.soul.x += soulSpeed;
    }

    if (game.keys['ArrowUp'] || (game.joystick.active && Math.sin(game.joystick.angle) < -0.5)) {
        game.battle.soul.y -= soulSpeed;
    }

    if (game.keys['ArrowDown'] || (game.joystick.active && Math.sin(game.joystick.angle) > 0.5)) {
        game.battle.soul.y += soulSpeed;
    }

    // Keep soul in battle box
    const box = game.battle.boxBounds;
    game.battle.soul.x = Math.max(box.x + 4, Math.min(box.x + box.width - 4, game.battle.soul.x));
    game.battle.soul.y = Math.max(box.y + 4, Math.min(box.y + box.height - 4, game.battle.soul.y));

    // Spawn bullets (simple pattern)
    if (game.battle.turnTimer % 500 < deltaTime) {
        game.battle.bullets.push({
            x: box.x + Math.random() * box.width,
            y: box.y,
            vx: (Math.random() - 0.5) * 2,
            vy: 1 + Math.random(),
            size: 6
        });
    }

    // Update bullets
    game.battle.bullets = game.battle.bullets.filter(bullet => {
        bullet.x += bullet.vx;
        bullet.y += bullet.vy;

        // Check collision with soul
        const dx = bullet.x - game.battle.soul.x;
        const dy = bullet.y - game.battle.soul.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < bullet.size + 4) {
            game.player.hp -= 1;
            return false;
        }

        // Remove bullets outside box
        return bullet.y < box.y + box.height + 10;
    });

    // End turn
    if (game.battle.turnTimer > game.battle.turnDuration || game.player.hp <= 0) {
        game.battle.bullets = [];

        if (game.player.hp <= 0) {
            endBattle(false, true); // Game over
        } else {
            game.state = 'battleMenu';
        }
    }
}

function updateBattleAttack() {
    if (game.battle.attackBar.active) {
        game.battle.attackBar.position += game.battle.attackBar.speed;
        if (game.battle.attackBar.position > 320) {
            game.battle.attackBar.active = false;
            // Missed attack
            startEnemyTurn();
        }
    }
}

function endBattle(victory, gameOver = false) {
    game.battle.active = false;
    game.afterDialogueAction = null;
    game.menu.active = false;

    if (gameOver) {
        startDialogue("* You died...\n* Game Over!");
        game.player.hp = game.player.maxHp; // Reset HP
    } else if (victory) {
        startDialogue("* You won!\n* You earned 0 EXP and 0 gold.");
    } else {
        startDialogue("* You spared the enemies.");
    }

    game.state = 'dialogue';
}

// Collision detection
function checkWallCollision(x, y) {
    const playerRect = {
        x,
        y,
        width: game.player.width,
        height: game.player.height
    };

    return game.walls.some(wall => {
        return playerRect.x < wall.x + wall.width &&
            playerRect.x + playerRect.width > wall.x &&
            playerRect.y < wall.y + wall.height &&
            playerRect.y + playerRect.height > wall.y;
    });
}

// NPC interaction
function checkNPCInteraction() {
    const interactionDistance = 25;

    game.npcs.forEach((npc, index) => {
        const distance = Math.sqrt(
            Math.pow(game.player.x - npc.x, 2) +
            Math.pow(game.player.y - npc.y, 2)
        );

        if (distance < interactionDistance) {
            // Set current NPC for conversation tracking
            const npcId = npc.npcId || `npc_${index}`;
            game.currentNPC = npcId;

            // Initialize conversation state if not exists
            if (game.conversationStates[npcId] === undefined) {
                game.conversationStates[npcId] = 0;
            }

            if (npc.canBattle) {
                // Handle both single enemy and multi-enemy encounters
                if (npc.enemyEncounter && Array.isArray(npc.enemyEncounter)) {
                    // Multi-enemy encounter
                    const enemies = npc.enemyEncounter.map(enemyId => getEnemy(enemyId)).filter(e => e !== null);
                    if (enemies.length > 0) {
                        game.pendingBattle = enemies;
                    }
                } else if (npc.enemyId) {
                    // Single enemy encounter (backwards compatibility)
                    const enemyData = getEnemy(npc.enemyId);
                    if (enemyData) {
                        game.pendingBattle = enemyData;
                    }
                }
            }

            // Get dialogue with conversation tracking
            const dialogueLines = getDialogue(npc.dialogueId, null, null, npcId);
            startDialogue(dialogueLines);

            // Increment conversation count after starting dialogue
            game.conversationStates[npcId]++;
        }
    });
}

// Dialogue system
function startDialogue(dialogueIdOrText) {
    let dialogueLines;

    if (typeof dialogueIdOrText === 'string' && isDialogueId(dialogueIdOrText)) {
        // This is a dialogue ID
        dialogueLines = getDialogue(dialogueIdOrText);
    } else if (Array.isArray(dialogueIdOrText)) {
        // This is already an array of lines
        dialogueLines = dialogueIdOrText;
    } else {
        // This is legacy text format, split by \n
        dialogueLines = dialogueIdOrText.split('\n');
    }

    game.dialogue.active = true;
    game.dialogue.pages = processDialogueText(dialogueLines);
    game.dialogue.currentPage = 0;
    game.dialogue.currentChar = 0;

    if (game.state === 'overworld') {
        game.state = 'dialogue';
    }
}

function updateDialogue() {
    if (game.dialogue.active && game.dialogue.pages.length > 0) {
        const currentPageText = game.dialogue.pages[game.dialogue.currentPage] || '';
        if (game.dialogue.currentChar < currentPageText.length) {
            game.dialogue.currentChar++;
        }
    }
}

// Rendering
function render() {
    // Clear canvas
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (game.state === 'overworld' || game.state === 'dialogue') {
        renderOverworld();
    } else if (game.state === 'menu') {
        renderOverworld();
        renderMenu();
    } else if (game.state === 'escMenu') {
        renderOverworld();
        renderEscMenu();
    } else if (game.state === 'settings') {
        renderOverworld();
        renderSettings();
    } else if (game.state === 'inventory') {
        renderOverworld();
        renderInventory();
    } else if (game.battle.active || game.state === 'battle') {
        renderBattle();
    }

    // Draw dialogue box
    if (game.dialogue.active) {
        renderDialogue();
    }
}

function renderOverworld() {
    // Background
    ctx.fillStyle = '#2c1810';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw walls
    ctx.fillStyle = '#8b4513';
    game.walls.forEach(wall => {
        ctx.fillRect(wall.x, wall.y, wall.width, wall.height);
    });

    // Draw save point (if exists in current room)
    if (game.savePoint) {
        const sp = game.savePoint;
        // Draw star shape
        ctx.fillStyle = '#ffff00';
        ctx.save();
        ctx.translate(sp.x + sp.width / 2, sp.y + sp.height / 2);
        ctx.beginPath();
        for (let i = 0; i < 4; i++) {
            const angle = (i * Math.PI * 2) / 4 - Math.PI / 4;
            const x = Math.cos(angle) * 8;
            const y = Math.sin(angle) * 8;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);

            const midAngle = angle + Math.PI / 4;
            const midX = Math.cos(midAngle) * 4;
            const midY = Math.sin(midAngle) * 4;
            ctx.lineTo(midX, midY);
        }
        ctx.closePath();
        ctx.fill();
        ctx.restore();

        // Save point sparkle effect
        const time = Date.now() / 1000;
        ctx.fillStyle = 'rgba(255, 255, 255, ' + (Math.sin(time * 3) * 0.3 + 0.7) + ')';
        ctx.fillRect(sp.x + 8, sp.y + 3, 2, 2);
        ctx.fillRect(sp.x + 13, sp.y + 8, 2, 2);
    }

    // Draw NPCs
    game.npcs.forEach(npc => {
        // Check if custom sprite is available and loaded
        if (npc.overworldSprite && npcSpriteCache[npc.overworldSprite] && npcSpriteCache[npc.overworldSprite].loaded) {
            const spriteData = npcSpriteCache[npc.overworldSprite];
            const sprite = spriteData.image;

            // Calculate sprite dimensions
            const spriteSize = npc.spriteSize || 16;
            const renderWidth = spriteSize;
            const renderHeight = spriteSize;

            // Center sprite on NPC collision box
            const centerX = npc.x + npc.width / 2;
            const centerY = npc.y + npc.height / 2;

            ctx.save();

            // Apply opacity if specified
            if (npc.opacity !== undefined && npc.opacity !== 1.0) {
                ctx.globalAlpha = npc.opacity;
            }

            // Apply color tint if specified
            if (npc.colorTint) {
                ctx.globalCompositeOperation = 'multiply';
                ctx.fillStyle = npc.colorTint;
                ctx.fillRect(
                    centerX - renderWidth / 2,
                    centerY - renderHeight / 2,
                    renderWidth,
                    renderHeight
                );
                ctx.globalCompositeOperation = 'destination-atop';
            }

            // Draw the sprite
            ctx.drawImage(
                sprite,
                centerX - renderWidth / 2,
                centerY - renderHeight / 2,
                renderWidth,
                renderHeight
            );

            ctx.restore();
        } else {
            // Fallback to colored rectangle if sprite not available
            ctx.fillStyle = npc.color;
            ctx.fillRect(npc.x, npc.y, npc.width, npc.height);

            // Simple face
            ctx.fillStyle = '#fff';
            ctx.fillRect(npc.x + 3, npc.y + 4, 2, 2);
            ctx.fillRect(npc.x + 11, npc.y + 4, 2, 2);
            ctx.fillRect(npc.x + 6, npc.y + 10, 4, 1);
        }
    });

    // Draw player
    if (game.sprite.loaded && game.sprite.image) {
        // Save canvas state for transformations
        ctx.save();

        // Use sprite's natural dimensions for optimal scaling
        const spriteWidth = game.sprite.image.width;
        const spriteHeight = game.sprite.image.height;
        const aspectRatio = spriteWidth / spriteHeight;

        // Calculate optimal fit within collision box (16x16)
        const collisionWidth = game.player.width; // 16px
        const collisionHeight = game.player.height; // 16px

        let renderWidth, renderHeight;

        // Try fitting by width first
        const widthConstrainedHeight = collisionWidth / aspectRatio;

        // Try fitting by height first  
        const heightConstrainedWidth = collisionHeight * aspectRatio;

        // Choose the constraint that keeps sprite within collision box
        if (widthConstrainedHeight <= collisionHeight) {
            // Width-constrained fit works
            renderWidth = collisionWidth;
            renderHeight = widthConstrainedHeight;
        } else {
            // Height-constrained fit needed
            renderWidth = heightConstrainedWidth;
            renderHeight = collisionHeight;
        }

        // Center the sprite on the collision box
        const centerX = game.player.x + game.player.width / 2;
        const centerY = game.player.y + game.player.height / 2;

        ctx.translate(centerX, centerY);

        // Apply rotation/flip based on direction
        switch (game.player.facing) {
            case 'down':
                // Default orientation - no transformation needed
                break;
            case 'up':
                ctx.rotate(Math.PI); // 180 degrees
                break;
            case 'left':
                ctx.scale(-1, 1); // Horizontal flip
                break;
            case 'right':
                // Default orientation works for right too
                break;
        }

        // Draw the sprite with crisp pixel rendering
        ctx.drawImage(
            game.sprite.image,
            -renderWidth / 2,
            -renderHeight / 2,
            renderWidth,
            renderHeight
        );

        // Restore canvas state
        ctx.restore();
    } else {
        // Fallback to original rectangle rendering if sprite not loaded
        ctx.fillStyle = '#ffeb3b';
        ctx.fillRect(game.player.x, game.player.y, game.player.width, game.player.height);

        // Simple player face based on direction
        ctx.fillStyle = '#000';
        if (game.player.facing === 'down') {
            ctx.fillRect(game.player.x + 3, game.player.y + 4, 2, 2);
            ctx.fillRect(game.player.x + 11, game.player.y + 4, 2, 2);
            ctx.fillRect(game.player.x + 6, game.player.y + 10, 4, 1);
        } else if (game.player.facing === 'up') {
            ctx.fillRect(game.player.x + 3, game.player.y + 8, 2, 2);
            ctx.fillRect(game.player.x + 11, game.player.y + 8, 2, 2);
        } else if (game.player.facing === 'left') {
            ctx.fillRect(game.player.x + 8, game.player.y + 4, 2, 2);
            ctx.fillRect(game.player.x + 8, game.player.y + 8, 2, 2);
        } else if (game.player.facing === 'right') {
            ctx.fillRect(game.player.x + 6, game.player.y + 4, 2, 2);
            ctx.fillRect(game.player.x + 6, game.player.y + 8, 2, 2);
        }
    }

    // Draw UI
    ctx.fillStyle = '#fff';
    ctx.font = '10px Courier New';
    ctx.fillText(`HP: ${game.player.hp}/${game.player.maxHp}`, 10, 20);
    ctx.fillText(`LV: ${game.player.lv}`, 10, 35);
}

function renderBattle() {
    // Battle background
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw all enemies
    game.battle.enemies.forEach((enemy, index) => {
        if (enemy.hp <= 0) return; // Skip defeated enemies

        // Get enemy position from battlePosition or use calculated position
        let enemyX = enemy.battlePosition ? enemy.battlePosition.x : 160;
        let enemyY = enemy.battlePosition ? enemy.battlePosition.y : 50;

        // Draw enemy sprite FIRST (behind UI elements) if loaded, otherwise fallback to rectangle
        if (game.battle.enemySprites[index] && game.battle.enemySprites[index].loaded && game.battle.enemySprites[index].image) {
            const sprite = game.battle.enemySprites[index].image;
            const spriteWidth = sprite.width;
            const spriteHeight = sprite.height;
            const aspectRatio = spriteWidth / spriteHeight;

            // Use spriteSize from enemy data if available, otherwise use default max size
            const maxSize = enemy.spriteSize || 80;

            let renderWidth, renderHeight;

            // Scale to fit within specified size while preserving aspect ratio
            if (spriteWidth > spriteHeight) {
                renderWidth = Math.min(maxSize, spriteWidth);
                renderHeight = renderWidth / aspectRatio;
            } else {
                renderHeight = Math.min(maxSize, spriteHeight);
                renderWidth = renderHeight * aspectRatio;
            }

            // Apply display scale if specified
            if (enemy.displayScale) {
                renderWidth *= enemy.displayScale;
                renderHeight *= enemy.displayScale;
            }

            ctx.save();

            // Draw the enemy sprite with crisp pixel rendering
            ctx.drawImage(
                sprite,
                enemyX - renderWidth / 2,
                enemyY - renderHeight / 2,
                renderWidth,
                renderHeight
            );

            ctx.restore();
        } else {
            // Fallback to rectangle if sprite not loaded
            ctx.fillStyle = enemy.colorTint || '#fff';
            const rectSize = (enemy.spriteSize || 40) * (enemy.displayScale || 1);
            ctx.fillRect(enemyX - rectSize / 2, enemyY - rectSize / 2, rectSize, rectSize);
        }

        // Get display positions or use defaults
        const healthPos = enemy.healthDisplayPos || {
            x: enemyX - 40,
            y: enemyY + 40,
            visible: true
        };
        const mercyPos = enemy.mercyDisplayPos || {
            x: healthPos.x,
            y: healthPos.y + 12,
            visible: true
        };

        // Show selection indicator for selected enemy
        if (game.battle.showEnemySelection && index === game.battle.selectedEnemyIndex) {
            ctx.fillStyle = '#f00';
            ctx.fillRect(enemyX - 6, enemyY - 6, 12, 12);
        }

        // Enemy name (yellow if spareable) - drawn OVER sprite
        if (healthPos.visible !== false) {
            ctx.fillStyle = enemy.spareable || (enemy.mercy >= enemy.maxMercy) ? '#ff0' : '#fff';
            ctx.font = '10px Courier New';
            ctx.fillText(enemy.name, healthPos.x, healthPos.y - 5);

            // Enemy HP bar - drawn OVER sprite
            ctx.strokeStyle = '#fff';
            ctx.strokeRect(healthPos.x, healthPos.y, 80, 8);
            ctx.fillStyle = '#0f0';
            const hpWidth = (enemy.hp / enemy.maxHp) * 78;
            ctx.fillRect(healthPos.x + 1, healthPos.y + 1, hpWidth, 6);
        }

        // Enemy mercy bar - drawn OVER sprite
        if (mercyPos.visible !== false) {
            ctx.strokeStyle = '#fff';
            ctx.strokeRect(mercyPos.x, mercyPos.y, 80, 6);
            ctx.fillStyle = '#ff0'; // Yellow for mercy
            const mercyWidth = (enemy.mercy / enemy.maxMercy) * 78;
            ctx.fillRect(mercyPos.x + 1, mercyPos.y + 1, mercyWidth, 4);

            // Mercy label - drawn OVER sprite
            ctx.fillStyle = '#fff';
            ctx.font = '8px Courier New';
            ctx.fillText(`MERCY ${enemy.mercy}/${enemy.maxMercy}`, mercyPos.x, mercyPos.y + 15);
        }
    });

    if (game.state === 'battleMenu') {
        // Draw battle box
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 3;
        ctx.strokeRect(game.battle.boxBounds.x, game.battle.boxBounds.y,
            game.battle.boxBounds.width, game.battle.boxBounds.height);

        // Draw menu options
        ctx.fillStyle = '#fff';
        ctx.font = '12px Courier New';
        game.battle.menuOptions.forEach((option, i) => {
            const x = 70 + (i % 2) * 110;
            const y = 160 + Math.floor(i / 2) * 25;

            if (i === game.battle.menuOption) {
                // Draw soul next to selected option
                ctx.fillStyle = '#f00';
                ctx.fillRect(x - 15, y - 8, 8, 8);
                ctx.fillStyle = '#fff';
            }

            if (option === 'MERCY') {
                const selectedEnemy = game.battle.enemies[game.battle.selectedEnemyIndex];
                if (selectedEnemy && (selectedEnemy.spareable || selectedEnemy.mercy >= selectedEnemy.maxMercy)) {
                    ctx.fillStyle = '#ff0';
                }
            }

            ctx.fillText(option, x, y);
            ctx.fillStyle = '#fff';
        });
    } else if (game.state === 'battleActMenu') {
        // Draw battle box
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 3;
        ctx.strokeRect(game.battle.boxBounds.x, game.battle.boxBounds.y,
            game.battle.boxBounds.width, game.battle.boxBounds.height);

        // Draw ACT menu options
        const selectedEnemy = game.battle.enemies[game.battle.selectedEnemyIndex];
        if (selectedEnemy && selectedEnemy.acts && selectedEnemy.acts.length > 0) {
            ctx.fillStyle = '#fff';
            ctx.font = '12px Courier New';

            // Title
            ctx.fillText('* ' + selectedEnemy.name, 70, 150);

            // ACT options
            selectedEnemy.acts.forEach((act, i) => {
                const x = 80;
                const y = 170 + i * 15;

                if (i === game.battle.actMenuOption) {
                    // Draw soul next to selected option
                    ctx.fillStyle = '#f00';
                    ctx.fillRect(x - 15, y - 8, 8, 8);
                    ctx.fillStyle = '#fff';
                }

                ctx.fillText('* ' + act, x, y);
            });
        }
    } else if (game.state === 'battleDodge') {
        // Draw battle box
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 3;
        ctx.strokeRect(game.battle.boxBounds.x, game.battle.boxBounds.y,
            game.battle.boxBounds.width, game.battle.boxBounds.height);

        // Draw soul
        ctx.fillStyle = '#f00';
        ctx.fillRect(game.battle.soul.x - 4, game.battle.soul.y - 4, 8, 8);

        // Draw bullets
        ctx.fillStyle = '#fff';
        game.battle.bullets.forEach(bullet => {
            ctx.beginPath();
            ctx.arc(bullet.x, bullet.y, bullet.size, 0, Math.PI * 2);
            ctx.fill();
        });
    } else if (game.state === 'battleAttack') {
        // Draw attack bar
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.strokeRect(10, 120, 300, 40);

        // Draw target zone
        ctx.fillStyle = '#0f0';
        ctx.fillRect(155, 125, 10, 30);

        if (game.battle.attackBar.active) {
            // Draw moving bar
            ctx.fillStyle = '#fff';
            ctx.fillRect(game.battle.attackBar.position, 125, 2, 30);
        }

        ctx.fillStyle = '#fff';
        ctx.font = '12px Courier New';
        ctx.fillText('Press ACTION when the bar is in the green!', 60, 180);
    }

    // Player stats
    ctx.fillStyle = '#fff';
    ctx.font = '10px Courier New';
    ctx.fillText(`HP: ${game.player.hp}/${game.player.maxHp}`, 10, 230);
}

function renderDialogue() {
    // Dialogue background
    ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
    ctx.fillRect(20, canvas.height - 80, canvas.width - 40, 60);

    // Dialogue border
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.strokeRect(20, canvas.height - 80, canvas.width - 40, 60);

    // Dialogue text
    ctx.fillStyle = '#fff';
    ctx.font = '12px Courier New';

    if (game.dialogue.pages.length > 0) {
        const currentPageText = game.dialogue.pages[game.dialogue.currentPage] || '';
        const displayText = currentPageText.substring(0, game.dialogue.currentChar);
        const lines = displayText.split('\n');

        // Display up to 2 lines
        lines.slice(0, 2).forEach((line, index) => {
            ctx.fillText(line, 30, canvas.height - 55 + (index * 15));
        });

        // Show page indicator if there are multiple pages
        if (game.dialogue.pages.length > 1) {
            ctx.fillStyle = '#aaa';
            ctx.font = '10px Courier New';
            const pageText = `${game.dialogue.currentPage + 1}/${game.dialogue.pages.length}`;
            ctx.fillText(pageText, canvas.width - 60, canvas.height - 25);
            ctx.fillStyle = '#fff';
            ctx.font = '12px Courier New';
        }

        // Cursor or continuation indicator
        if (game.dialogue.currentChar >= currentPageText.length) {
            const cursorY = canvas.height - 30;
            const cursorX = canvas.width - 40;

            if (game.dialogue.currentPage < game.dialogue.pages.length - 1) {
                ctx.fillText('...', cursorX - 10, cursorY);
            } else {
                ctx.fillText('▶', cursorX, cursorY);
            }
        }
    }
}

function renderMenu() {
    // Main menu border
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.strokeRect(10, 10, canvas.width - 20, canvas.height - 20);

    // Left panels
    renderCharacterInfo();
    renderMenuNavigation();

    // Right panel content based on submenu
    if (game.menu.subMenu === 'item') {
        renderItemSubmenu();
    } else if (game.menu.subMenu === 'stat') {
        renderStatSubmenu();
    } else if (game.menu.subMenu === 'cell') {
        renderCellSubmenu();
    }
}

function renderCharacterInfo() {
    // Character info panel (top left)
    ctx.fillStyle = '#000';
    ctx.fillRect(20, 20, 90, 60);

    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 1;
    ctx.strokeRect(20, 20, 90, 60);

    ctx.fillStyle = '#fff';
    ctx.font = '10px Courier New';
    ctx.fillText(game.player.name, 25, 35);
    ctx.fillText(`LV  ${game.player.lv}`, 25, 50);
    ctx.fillText(`HP  ${game.player.hp}/${game.player.maxHp}`, 25, 65);
    ctx.fillText(`G   ${game.player.gold}`, 25, 75);
}

function renderMenuNavigation() {
    // Menu navigation panel (bottom left)
    ctx.fillStyle = '#000';
    ctx.fillRect(20, 90, 90, 80);

    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 1;
    ctx.strokeRect(20, 90, 90, 80);

    ctx.fillStyle = '#fff';
    ctx.font = '12px Courier New';

    game.menu.options.forEach((option, i) => {
        const y = 110 + i * 20;

        if (!game.menu.subMenu && i === game.menu.option) {
            // Draw heart cursor next to selected option
            ctx.fillStyle = '#f00';
            ctx.fillText('♥', 25, y);
            ctx.fillStyle = '#fff';
        }

        ctx.fillText(option, 40, y);
    });
}

function renderItemSubmenu() {
    // Right panel for items
    ctx.fillStyle = '#000';
    ctx.fillRect(120, 20, 180, 150);

    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 1;
    ctx.strokeRect(120, 20, 180, 150);

    ctx.fillStyle = '#fff';
    ctx.font = '10px Courier New';

    // Draw numbered item list
    for (let i = 0; i < 12; i++) {
        const y = 40 + i * 12;
        const item = game.inventory.items[i];

        // Show cursor
        if (i === game.inventory.selectedItem && !game.menu.itemAction) {
            ctx.fillStyle = '#f00';
            ctx.fillText('♥', 125, y);
            ctx.fillStyle = '#fff';
        }

        // Show equipped items with special marker and tags
        let itemText = `${i + 1}.`;
        if (item) {
            const isEquipped = (item.name === game.player.weapon || item.name === game.player.armor);
            const tagPrefix = item.tag ? `[${item.tag}] ` : '';

            if (isEquipped) {
                itemText += ` ♥ ${tagPrefix}${item.name}`;
            } else {
                itemText += ` ${tagPrefix}${item.name}`;
            }
        } else {
            itemText += '';
        }

        ctx.fillText(itemText, 140, y);
    }

    // Action buttons at bottom
    ctx.fillStyle = '#000';
    ctx.fillRect(120, 175, 180, 20);

    ctx.strokeStyle = '#fff';
    ctx.strokeRect(120, 175, 180, 20);

    if (game.menu.itemAction) {
        const actions = ['USE', 'INFO', 'DROP'];
        actions.forEach((action, i) => {
            const x = 130 + i * 55;

            if (i === game.menu.itemActionOption) {
                ctx.fillStyle = '#f00';
                ctx.fillText('♥', x - 10, 190);
                ctx.fillStyle = '#fff';
            }

            ctx.fillText(action, x, 190);
        });
    } else {
        ctx.fillText('USE                INFO               DROP', 130, 190);
    }
}

function renderStatSubmenu() {
    // Right panel for stats
    ctx.fillStyle = '#000';
    ctx.fillRect(120, 20, 180, 150);

    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 1;
    ctx.strokeRect(120, 20, 180, 150);

    ctx.fillStyle = '#fff';
    ctx.font = '10px Courier New';

    // Player name in quotes
    ctx.fillText(`"${game.player.name}"`, 130, 40);

    // Stats
    ctx.fillText(`LV ${game.player.lv}`, 130, 60);
    ctx.fillText(`HP ${game.player.hp}/${game.player.maxHp}`, 130, 75);

    // Attack and defense with equipment bonuses
    const totalAtk = game.player.atk + game.player.weaponAtk;
    const totalDef = game.player.def + game.player.armorDef;

    ctx.fillText(`AT ${totalAtk}(${game.player.weaponAtk})    EXP:${game.player.exp}`, 130, 95);
    ctx.fillText(`DF ${totalDef}(${game.player.armorDef})     NEXT:${game.player.nextExp - game.player.exp}`, 130, 110);

    // Equipment
    ctx.fillText(`WEAPON:${game.player.weapon}`, 130, 130);
    ctx.fillText(`ARMOR:${game.player.armor}`, 130, 145);

    // Gold
    ctx.fillText(`GOLD:${game.player.gold}`, 130, 165);
}

function renderCellSubmenu() {
    // Right panel for phone contacts
    ctx.fillStyle = '#000';
    ctx.fillRect(120, 20, 180, 150);

    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 1;
    ctx.strokeRect(120, 20, 180, 150);

    ctx.fillStyle = '#fff';
    ctx.font = '10px Courier New';

    if (game.phonebook.length === 0) {
        ctx.fillText('No contacts yet...', 130, 40);
    } else {
        game.phonebook.forEach((contact, i) => {
            const y = 40 + i * 15;

            if (i === game.menu.cellOption) {
                ctx.fillStyle = '#f00';
                ctx.fillText('♥', 125, y);
                ctx.fillStyle = '#fff';
            }

            ctx.fillText(contact.name, 140, y);
        });
    }
}

function renderEscMenu() {
    // Dark overlay
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Menu background
    ctx.fillStyle = 'rgba(0, 0, 0, 0.95)';
    ctx.fillRect(80, 60, 160, 120);

    // Menu border
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.strokeRect(80, 60, 160, 120);

    // Menu title
    ctx.fillStyle = '#fff';
    ctx.font = '14px Courier New';
    ctx.fillText('PAUSE', 145, 80);

    // Menu options
    ctx.font = '12px Courier New';
    game.escMenu.options.forEach((option, i) => {
        const y = 110 + i * 20;

        if (i === game.escMenu.option) {
            // Draw soul next to selected option
            ctx.fillStyle = '#f00';
            ctx.fillRect(90, y - 10, 8, 8);
            ctx.fillStyle = '#fff';
        }

        ctx.fillText(option, 110, y);
    });

    // Instructions
    ctx.font = '10px Courier New';
    ctx.fillText('ESC to close', 90, 190);
}

function renderSettings() {
    // Dark overlay
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Menu background
    ctx.fillStyle = 'rgba(0, 0, 0, 0.95)';
    ctx.fillRect(40, 40, 240, 160);

    // Menu border
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.strokeRect(40, 40, 240, 160);

    // Menu title
    ctx.fillStyle = '#fff';
    ctx.font = '14px Courier New';
    ctx.fillText('SETTINGS', 140, 60);

    // Settings options with values
    ctx.font = '12px Courier New';
    game.settings.options.forEach((option, i) => {
        const y = 90 + i * 25;

        if (i === game.settings.option) {
            // Draw soul next to selected option
            ctx.fillStyle = '#f00';
            ctx.fillRect(50, y - 10, 8, 8);
            ctx.fillStyle = '#fff';
        }

        ctx.fillText(option, 70, y);

        // Show current values
        if (option === 'RESOLUTION') {
            ctx.fillText(game.settings.resolutionOptions[game.settings.currentResolution], 170, y);
        } else if (option === 'FULLSCREEN') {
            ctx.fillText(game.settings.fullscreen ? 'ON' : 'OFF', 170, y);
        }
    });

    // Instructions
    ctx.font = '10px Courier New';
    ctx.fillText('SPACE to select, ESC to go back', 50, 185);
}

function renderInventory() {
    // If in battle, render battle background first
    if (game.battle.active) {
        renderBattle();
    }

    // Inventory background
    ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
    ctx.fillRect(20, 20, canvas.width - 40, canvas.height - 40);

    // Inventory border
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.strokeRect(20, 20, canvas.width - 40, canvas.height - 40);

    // Title
    ctx.fillStyle = '#fff';
    ctx.font = '14px Courier New';
    ctx.fillText('INVENTORY', 140, 40);

    // Draw item grid (4x3)
    ctx.font = '11px Courier New';
    for (let i = 0; i < 12; i++) {
        const col = i % 4;
        const row = Math.floor(i / 4);
        const x = 40 + col * 65;
        const y = 70 + row * 25;

        // Draw selection cursor
        if (i === game.inventory.selectedItem) {
            ctx.fillStyle = '#f00';
            ctx.fillRect(x - 12, y - 10, 8, 8);
            ctx.fillStyle = '#fff';
        }

        // Draw item or empty slot
        const item = game.inventory.items[i];
        if (item) {
            const isEquipped = (item.name === game.player.weapon || item.name === game.player.armor);
            const tagColor = {
                'WEAPON': '#ff6666',
                'ARMOR': '#66ff66',
                'CONSUMABLE': '#6666ff',
                'QUEST': '#ffff66',
                'MISC': '#ffffff'
            };

            // Show equipped marker
            if (isEquipped) {
                ctx.fillStyle = '#ff0';
                ctx.fillText('♥', x - 15, y);
            }

            // Show item with tag color
            ctx.fillStyle = tagColor[item.tag] || '#ffffff';
            ctx.fillText(item.name.substring(0, 10), x, y);

            // Show tag in smaller text
            ctx.fillStyle = '#aaa';
            ctx.font = '8px Courier New';
            ctx.fillText(item.tag || 'MISC', x, y + 10);
            ctx.font = '11px Courier New';
            ctx.fillStyle = '#fff';
        } else {
            ctx.fillStyle = '#666';
            ctx.fillText(`${i + 1}: ---`, x, y);
            ctx.fillStyle = '#fff';
        }
    }

    // Instructions
    ctx.font = '10px Courier New';
    ctx.fillText('Press X to go back', 30, canvas.height - 30);
}

// Equipment helper functions
function equipWeapon(item) {
    // Unequip current weapon first
    if (game.player.weapon !== 'Tough Glove') {
        const currentWeaponSlot = game.inventory.items.findIndex(invItem =>
            invItem && invItem.name === game.player.weapon);
        // Current weapon stays in inventory, just update stats
    }

    // Equip new weapon
    game.player.weapon = item.name;
    game.player.weaponAtk = item.attack || 0;

    return `* You equipped the ${item.name}.`;
}

function equipArmor(item) {
    // Unequip current armor first
    if (game.player.armor !== 'Manly Bandanna') {
        const currentArmorSlot = game.inventory.items.findIndex(invItem =>
            invItem && invItem.name === game.player.armor);
        // Current armor stays in inventory, just update stats
    }

    // Equip new armor
    game.player.armor = item.name;
    game.player.armorDef = item.defense || 0;

    return `* You equipped the ${item.name}.`;
}

function useConsumable(item) {
    const healing = item.healing || 0;
    const oldHp = game.player.hp;
    game.player.hp = Math.min(game.player.hp + healing, game.player.maxHp);
    const actualHealing = game.player.hp - oldHp;

    if (actualHealing > 0) {
        return `* You consumed the ${item.name}.\\n* You recovered ${actualHealing} HP!`;
    } else {
        return `* You consumed the ${item.name}.\\n* Your HP is already full.`;
    }
}

// Inventory functions
function handleInventorySelect() {
    const item = game.inventory.items[game.inventory.selectedItem];
    if (item) {
        if (game.battle.active) {
            // In battle, use item immediately
            useItem(game.inventory.selectedItem);
        } else {
            // In overworld, show item description
            startDialogue(item.description + '\\n* Use this item?');
            game.afterDialogueAction = 'useItem';
        }
    }
}

// Save point interaction
function checkSavePointInteraction() {
    const interactionDistance = 25;
    const sp = game.savePoint;

    const distance = Math.sqrt(
        Math.pow(game.player.x + game.player.width / 2 - (sp.x + sp.width / 2), 2) +
        Math.pow(game.player.y + game.player.height / 2 - (sp.y + sp.height / 2), 2)
    );

    if (distance < interactionDistance) {
        game.player.hp = game.player.maxHp; // Restore HP
        startDialogue(sp.dialogueId);
    }
}

function useItem(index) {
    const item = game.inventory.items[index];
    if (!item) return;

    let message = '';
    let shouldConsume = false;

    switch (item.tag) {
        case 'CONSUMABLE':
            message = useConsumable(item);
            shouldConsume = true;
            break;

        case 'WEAPON':
            if (game.battle.active) {
                message = `* You can't equip weapons during battle!`;
            } else {
                message = equipWeapon(item);
            }
            break;

        case 'ARMOR':
            if (game.battle.active) {
                message = `* You can't equip armor during battle!`;
            } else {
                message = equipArmor(item);
            }
            break;

        case 'QUEST':
            message = `* The ${item.name} might be important later.\\n* This isn't the time to use it.`;
            break;

        case 'MISC':
        default:
            message = `* You used the ${item.name}.\\n* Nothing happened.`;
            break;
    }

    // Remove item from inventory if it was consumed
    if (shouldConsume) {
        game.inventory.items[index] = null;
    }

    // Show dialogue and handle state transitions
    startDialogue(message);

    if (game.battle.active && shouldConsume) {
        game.afterDialogueAction = 'enemyTurn';
    } else if (game.battle.active) {
        // For non-consumables in battle, return to battle menu after dialogue
        game.afterDialogueAction = 'returnToBattleMenu';
    } else {
        game.state = 'dialogue';
    }
}

function updateInventory() {
    // Navigation with keyboard
    if (game.keys['ArrowUp'] && !game.prevKeys['ArrowUp']) {
        if (game.inventory.selectedItem >= 4) {
            game.inventory.selectedItem -= 4;
        }
    }
    if (game.keys['ArrowDown'] && !game.prevKeys['ArrowDown']) {
        if (game.inventory.selectedItem < 8) {
            game.inventory.selectedItem += 4;
        }
    }
    if (game.keys['ArrowLeft'] && !game.prevKeys['ArrowLeft']) {
        if (game.inventory.selectedItem % 4 > 0) {
            game.inventory.selectedItem--;
        }
    }
    if (game.keys['ArrowRight'] && !game.prevKeys['ArrowRight']) {
        if (game.inventory.selectedItem % 4 < 3) {
            game.inventory.selectedItem++;
        }
    }

    // Joystick navigation
    if (game.joystick.active && game.joystick.distance > 15) {
        if (!game.joystickMenuCooldown) {
            const angle = game.joystick.angle;
            if (angle < -0.785 && angle > -2.356) { // Up
                if (game.inventory.selectedItem >= 4) {
                    game.inventory.selectedItem -= 4;
                    game.joystickMenuCooldown = true;
                }
            } else if (angle > 0.785 && angle < 2.356) { // Down
                if (game.inventory.selectedItem < 8) {
                    game.inventory.selectedItem += 4;
                    game.joystickMenuCooldown = true;
                }
            } else if (angle > 2.356 || angle < -2.356) { // Left
                if (game.inventory.selectedItem % 4 > 0) {
                    game.inventory.selectedItem--;
                    game.joystickMenuCooldown = true;
                }
            } else if (angle < 0.785 && angle > -0.785) { // Right
                if (game.inventory.selectedItem % 4 < 3) {
                    game.inventory.selectedItem++;
                    game.joystickMenuCooldown = true;
                }
            }
        }
    } else {
        game.joystickMenuCooldown = false;
    }
}

// Interaction checking (NPCs and save points)
function checkInteraction() {
    checkNPCInteraction();
    checkSavePointInteraction();
}

// Game loop
let lastTime = 0;
let dialogueTimer = 0;
game.prevKeys = {};
game.joystickMenuCooldown = false;

function gameLoop(currentTime) {
    const deltaTime = currentTime - lastTime;
    lastTime = currentTime;

    if (game.state === 'overworld') {
        updatePlayer();
    } else if (game.state === 'menu') {
        updateMenu();
    } else if (game.state === 'escMenu') {
        updateEscMenu();
    } else if (game.state === 'settings') {
        updateSettings();
    } else if (game.state === 'inventory') {
        updateInventory();
    } else if (game.state === 'battleMenu') {
        updateBattleMenu();
    } else if (game.state === 'battleActMenu') {
        updateBattleActMenu();
    } else if (game.state === 'battleDodge') {
        updateBattleDodge(deltaTime);
    } else if (game.state === 'battleAttack') {
        updateBattleAttack();
    }

    // Update dialogue typing effect
    dialogueTimer += deltaTime;
    if (dialogueTimer > game.dialogue.speed) {
        updateDialogue();
        dialogueTimer = 0;
    }

    render();

    // Store previous key states
    game.prevKeys = {
        ...game.keys
    };

    requestAnimationFrame(gameLoop);
}

// Resolution display functionality
function updateResolutionDisplay() {
    const resolutionDisplay = document.getElementById('resolutionDisplay');
    if (resolutionDisplay) {
        const scale = game.settings.scale;
        resolutionDisplay.textContent = `${320 * scale}x${240 * scale}`;
    }
}

// Update resolution display on window resize
window.addEventListener('resize', updateResolutionDisplay);

// Start the game
setupMobileControls();

// Load saved settings
loadSettings();

// Load dialogue data
loadDialogueData();

// Load enemy data
loadEnemyData();

// Load player sprite
loadPlayerSprite();

// Initialize map system
loadRoom(game.currentMap, game.currentRoom);

// Initialize resolution display
updateResolutionDisplay();

// Prevent scrolling on mobile
document.addEventListener('touchmove', (e) => {
    e.preventDefault();
}, {
    passive: false
});

gameLoop(0);