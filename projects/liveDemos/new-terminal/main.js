class BasicTerminal {
    constructor() {
        this.screen = document.getElementById('screen');
        this.currentLine = null;
        this.variables = {};
        this.programLines = {};
        this.isRunning = false;
        this.executionIndex = 0;
        this.typingSpeed = 30;
        this.normalSpeed = 30;
        this.fastSpeed = 5;
        this.waitingForInput = false;
        this.inputCallback = null;
        this.loopStack = [];
        this.shiftPressed = false;
        this.ctrlPressed = false;
        this.ctrlCPressed = false; // Track if CTRL+C was pressed
        this.breakLineElement = null; // Reference to the ^C line element for toggling
        this.currentInput = null;
        this.callStack = [];
        this.imagePosition = null; // 'left', 'right', or null
        this.preloadedPrograms = {}; // Will be populated from JSON
        this.breakRequested = false; // Flag to break program execution

        // Applesoft BASIC enhancements
        this.lastKeyPress = ''; // For GET command
        this.cursorRow = 1; // For VTAB (1-24)
        this.cursorCol = 1; // For HTAB (1-40)
        this.memory = new Uint8Array(65536); // For PEEK/POKE
        this.arrays = {}; // For DIM arrays
        this.dataList = []; // For DATA/READ/RESTORE
        this.dataPointer = 0; // Current position in dataList

        // Low-resolution graphics mode
        this.graphicsMode = false;
        this.currentColor = 13; // Default yellow
        this.graphicsBuffer = null; // Will be 40x48 array
        this.graphicsContainer = null; // DOM element
        this.graphicsPixels = null; // 2D array of pixel DOM elements
        this.graphicsOpCount = 0; // Counter for yielding control

        // Apple II Low-Res Color Palette (16 colors)
        this.colorPalette = [
            '#000000', // 0: Black
            '#901740', // 1: Magenta
            '#402CA5', // 2: Dark Blue
            '#D043E5', // 3: Purple
            '#006940', // 4: Dark Green
            '#808080', // 5: Gray 1
            '#2F95E5', // 6: Medium Blue
            '#BFCCFF', // 7: Light Blue
            '#402800', // 8: Brown
            '#FF6A3C', // 9: Orange
            '#808080', // 10: Gray 2
            '#FF96BF', // 11: Pink
            '#2FBC1A', // 12: Light Green
            '#D0DD00', // 13: Yellow
            '#72FECF', // 14: Aqua
            '#FFFFFF'  // 15: White
        ];

        // Add shift and ctrl key listeners
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Shift') {
                this.shiftPressed = true;
                this.typingSpeed = this.fastSpeed;
            }
            if (e.key === 'Control') {
                this.ctrlPressed = true;
                this.typingSpeed = 0;
            }

            // Check for CTRL+C to break program execution
            // Note: Some browsers intercept CTRL+C, so we also support ESC as an alternative
            if ((e.key.toLowerCase() === 'c' && e.ctrlKey) || (e.key === 'Escape' && this.isRunning)) {
                if (this.isRunning) {
                    e.preventDefault();
                    e.stopPropagation();

                    // Toggle ^C on/off
                    if (this.ctrlCPressed) {
                        // Already pressed - remove the ^C indicator
                        if (this.breakLineElement) {
                            this.breakLineElement.remove();
                            this.breakLineElement = null;
                        }
                        this.ctrlCPressed = false;
                    } else {
                        // First press - show ^C
                        this.ctrlCPressed = true;
                        const breakLine = document.createElement('div');
                        breakLine.className = 'terminal-line';
                        breakLine.textContent = '^C';
                        this.screen.appendChild(breakLine);
                        this.scrollToBottom();
                        this.breakLineElement = breakLine;
                    }
                }
            }

            // If break was pressed and now Enter is pressed, break the program
            if (e.key === 'Enter' && this.ctrlCPressed) {
                if (this.isRunning) {
                    e.preventDefault();
                    e.stopPropagation();
                    this.breakRequested = true;
                    this.ctrlCPressed = false;
                    this.breakLineElement = null; // Clear reference since program will handle the break
                }
            }

            // Capture key for GET command (when program is running)
            if (this.isRunning && !this.waitingForInput) {
                if (e.key === 'Escape') {
                    this.lastKeyPress = String.fromCharCode(27); // ESC
                } else if (e.key.length === 1) {
                    this.lastKeyPress = e.key.toUpperCase();
                } else if (e.key === 'ArrowUp') {
                    this.lastKeyPress = 'W';
                } else if (e.key === 'ArrowDown') {
                    this.lastKeyPress = 'S';
                } else if (e.key === 'ArrowLeft') {
                    this.lastKeyPress = 'A';
                } else if (e.key === 'ArrowRight') {
                    this.lastKeyPress = 'D';
                }
            }
        });

        document.addEventListener('keyup', (e) => {
            if (e.key === 'Shift') {
                this.shiftPressed = false;
                this.typingSpeed = this.normalSpeed;
            }
            if (e.key === 'Control') {
                this.ctrlPressed = false;
                this.typingSpeed = this.shiftPressed ? this.fastSpeed : this.normalSpeed;
            }
        });

        // Click anywhere to focus input
        document.addEventListener('click', () => {
            if (this.currentInput) {
                this.currentInput.focus();
            }
        });
    }

    async typeCharacter(char, element) {
        return new Promise(resolve => {
            element.textContent += char;
            this.scrollToBottom();
            setTimeout(resolve, this.typingSpeed);
        });
    }

    async typeLine(text, prefix = '') {
        const line = document.createElement('div');
        line.className = 'terminal-line';
        this.screen.appendChild(line);
        this.currentLine = line;

        if (prefix) {
            line.textContent = prefix;
        }

        for (const char of text) {
            await this.typeCharacter(char, line);
        }

        return line;
    }

    async typeOutput(text, allowHTML = false) {
        const line = document.createElement('div');
        line.className = 'terminal-line output-text';
        this.screen.appendChild(line);

        if (allowHTML) {
            // For HTML content, we need to type visible characters while preserving HTML tags
            let displayIndex = 0;

            while (displayIndex < text.length) {
                // If we hit a tag, add it completely without animation
                if (text[displayIndex] === '<') {
                    const tagEnd = text.indexOf('>', displayIndex);
                    if (tagEnd !== -1) {
                        line.innerHTML = text.substring(0, tagEnd + 1);
                        displayIndex = tagEnd + 1;
                        continue;
                    }
                }

                // Add one more character
                line.innerHTML = text.substring(0, displayIndex + 1);
                displayIndex++;

                this.scrollToBottom();
                await new Promise(resolve => setTimeout(resolve, this.typingSpeed));
            }
        } else {
            // Regular text typing
            for (const char of text) {
                await this.typeCharacter(char, line);
            }
        }
    }

    async printAt(row, col, text) {
        // Positioned printing for VTAB/HTAB commands
        // Find or create the line at the specified row
        const lines = this.screen.querySelectorAll('.terminal-line');
        let targetLine;

        // Ensure we have enough lines
        while (lines.length < row) {
            const newLine = document.createElement('div');
            newLine.className = 'terminal-line positioned-line';
            newLine.innerHTML = '&nbsp;';
            this.screen.appendChild(newLine);
        }

        // Get the target line (0-indexed array, but row is 1-indexed)
        targetLine = this.screen.querySelectorAll('.terminal-line')[row - 1];

        if (!targetLine) {
            targetLine = document.createElement('div');
            targetLine.className = 'terminal-line positioned-line';
            this.screen.appendChild(targetLine);
        }

        // Get current content or initialize
        let lineContent = targetLine.textContent || '';

        // Pad line to column position if needed
        while (lineContent.length < col - 1) {
            lineContent += ' ';
        }

        // Insert text at column position
        lineContent = lineContent.substring(0, col - 1) + text + lineContent.substring(col - 1 + text.length);

        // Update line content (instantly, no typing animation for positioned text)
        targetLine.textContent = lineContent;

        this.scrollToBottom();
    }

    splitByColon(command) {
        // Split command by : but respect quoted strings, IF...THEN statements, and h: highlight syntax
        // Colons inside THEN clauses should NOT split the command
        // Colons followed by quotes (h:"text") should NOT split the command
        const parts = [];
        let current = '';
        let inString = false;

        // Check if this is an IF...THEN statement
        const upperCommand = command.toUpperCase();
        if (upperCommand.startsWith('IF ') && upperCommand.includes(' THEN ')) {
            // Don't split IF...THEN at all - let IF handler deal with colons in THEN clause
            return [command];
        }

        for (let i = 0; i < command.length; i++) {
            const char = command[i];

            if (char === '"') {
                inString = !inString;
                current += char;
            } else if (char === ':' && !inString) {
                // Check if this colon is followed by a quote (h:"text" pattern)
                const nextChar = i + 1 < command.length ? command[i + 1] : '';
                if (nextChar === '"') {
                    // This is part of h: or similar syntax, don't split
                    current += char;
                } else {
                    // Found a colon outside of strings that's not part of h: pattern
                    if (current.trim()) {
                        parts.push(current.trim());
                    }
                    current = '';
                }
            } else {
                current += char;
            }
        }

        // Add remaining content
        if (current.trim()) {
            parts.push(current.trim());
        }

        return parts.length > 0 ? parts : [command];
    }

    parsePrintStatement(content) {
        // Parse a PRINT statement into parts separated by commas and semicolons
        // Returns array of { type: 'expression'|'comma'|'semicolon', value: string }
        const parts = [];
        let current = '';
        let inString = false;
        let parenDepth = 0;

        for (let i = 0; i < content.length; i++) {
            const char = content[i];

            if (char === '"') {
                inString = !inString;
                current += char;
            } else if (char === '(' && !inString) {
                parenDepth++;
                current += char;
            } else if (char === ')' && !inString) {
                parenDepth--;
                current += char;
            } else if ((char === ',' || char === ';') && !inString && parenDepth === 0) {
                // Found a separator outside of strings and parentheses
                if (current.trim()) {
                    parts.push({ type: 'expression', value: current.trim() });
                }
                parts.push({ type: char === ',' ? 'comma' : 'semicolon' });
                current = '';
            } else {
                current += char;
            }
        }

        // Add remaining content
        if (current.trim()) {
            parts.push({ type: 'expression', value: current.trim() });
        }

        return parts;
    }

    parseHighlightedText(expr) {
        // Parse h:"text" or h:VAR$ syntax and convert to HTML
        let result = '';
        let remaining = expr.trim();

        while (remaining.length > 0) {
            // Skip leading whitespace and semicolons
            if (remaining.match(/^[\s;]+/)) {
                remaining = remaining.replace(/^[\s;]+/, '');
                continue;
            }

            // Look for h:"..." pattern (highlighted string)
            const highlightStringMatch = remaining.match(/^h:"([^"]*)"/);
            if (highlightStringMatch) {
                result += `<span class="highlight-text">${highlightStringMatch[1]}</span>`;
                remaining = remaining.substring(highlightStringMatch[0].length);
                continue;
            }

            // Look for h:VAR$ or h:VAR% pattern (highlighted variable)
            const highlightVarMatch = remaining.match(/^h:(\w+[\$%]?)/);
            if (highlightVarMatch) {
                const varName = highlightVarMatch[1];
                if (this.variables[varName] !== undefined) {
                    result += `<span class="highlight-text">${this.variables[varName]}</span>`;
                }
                remaining = remaining.substring(highlightVarMatch[0].length);
                continue;
            }

            // Look for regular "..." pattern
            const stringMatch = remaining.match(/^"([^"]*)"/);
            if (stringMatch) {
                result += stringMatch[1];
                remaining = remaining.substring(stringMatch[0].length);
                continue;
            }

            // Look for variable
            const varMatch = remaining.match(/^(\w+[\$%]?)/);
            if (varMatch) {
                const varName = varMatch[1];
                if (this.variables[varName] !== undefined) {
                    result += this.variables[varName];
                }
                remaining = remaining.substring(varMatch[0].length);
                continue;
            }

            // If we can't parse it, just move forward one character
            result += remaining[0];
            remaining = remaining.substring(1);
        }

        return result;
    }

    showCursor() {
        if (this.cursorElement) {
            this.cursorElement.remove();
        }
        const cursorLine = document.createElement('div');
        cursorLine.className = 'terminal-line';
        cursorLine.innerHTML = '<span class="prompt">]</span><span class="cursor"></span>';
        this.screen.appendChild(cursorLine);
        this.cursorElement = cursorLine;
        this.scrollToBottom();
    }

    hideCursor() {
        if (this.cursorElement) {
            this.cursorElement.remove();
            this.cursorElement = null;
        }
    }

    scrollToBottom() {
        this.screen.scrollTop = this.screen.scrollHeight;
    }

    async loadPreloadedPrograms() {
        try {
            const response = await fetch('preloaded-programs.json');
            this.preloadedPrograms = await response.json();
        } catch (e) {
            console.error('Failed to load preloaded programs:', e);
            this.preloadedPrograms = {};
        }
    }

    async loadTestingPrograms() {
        try {
            const response = await fetch('testing-programs.json');
            const testingPrograms = await response.json();
            // Merge testing programs into preloaded programs
            this.preloadedPrograms = { ...this.preloadedPrograms, ...testingPrograms };
        } catch (e) {
            console.error('Failed to load testing programs:', e);
        }
    }

    async showChunkedSVG(svgSrc, maxWidth = 200, linesPerChunk = null, position = null) {
        return new Promise(async (resolve) => {
            try {
                // Fetch the SVG content
                const response = await fetch(svgSrc);
                const svgText = await response.text();

                // Parse SVG to get dimensions
                const parser = new DOMParser();
                const svgDoc = parser.parseFromString(svgText, 'image/svg+xml');
                const svgElement = svgDoc.querySelector('svg');

                if (!svgElement) {
                    throw new Error('Invalid SVG');
                }

                // Get viewBox or width/height
                const viewBox = svgElement.getAttribute('viewBox');
                let width, height;

                if (viewBox) {
                    const parts = viewBox.split(/\s+/);
                    width = parseFloat(parts[2]);
                    height = parseFloat(parts[3]);
                } else {
                    width = parseFloat(svgElement.getAttribute('width')) || 100;
                    height = parseFloat(svgElement.getAttribute('height')) || 100;
                }

                // Calculate scaled dimensions
                const scale = maxWidth / width;
                const scaledHeight = height * scale;

                // Calculate actual terminal line height from CSS
                // Create a temporary element to measure
                const tempLine = document.createElement('div');
                tempLine.className = 'terminal-line';
                tempLine.style.visibility = 'hidden';
                tempLine.textContent = 'M'; // Use a character to get line height
                this.screen.appendChild(tempLine);
                const actualLineHeight = tempLine.offsetHeight;
                tempLine.remove();

                // Determine gap and chunk height
                const gapSize = Math.max(2, Math.floor(actualLineHeight * 0.15)); // 15% gap
                const chunkThickness = gapSize; // Make chunks same thickness as gaps
                const chunkSpacing = chunkThickness + gapSize; // Total space per chunk

                // Create container
                const container = document.createElement('div');
                container.className = 'terminal-line';
                this.screen.appendChild(container);

                const svgWrapper = document.createElement('div');
                svgWrapper.className = 'terminal-svg-chunked';
                svgWrapper.style.width = maxWidth + 'px';
                svgWrapper.style.height = scaledHeight + 'px';
                svgWrapper.style.position = 'relative';
                svgWrapper.style.display = 'inline-block';
                svgWrapper.style.verticalAlign = 'top';

                // Apply positioning
                if (position === 'left' || this.imagePosition === 'left') {
                    svgWrapper.style.float = 'left';
                    svgWrapper.style.marginRight = '20px';
                } else if (position === 'right' || this.imagePosition === 'right') {
                    svgWrapper.style.float = 'right';
                    svgWrapper.style.marginLeft = '20px';
                }

                container.appendChild(svgWrapper);

                // Create horizontal line mask slices
                const numChunks = Math.ceil(scaledHeight / chunkSpacing);

                for (let i = 0; i < numChunks; i++) {
                    const lineDiv = document.createElement('div');
                    lineDiv.style.position = 'absolute';
                    lineDiv.style.left = '0';
                    lineDiv.style.width = '100%';
                    lineDiv.style.top = (i * chunkSpacing) + 'px';
                    lineDiv.style.height = Math.min(chunkThickness, scaledHeight - (i * chunkSpacing)) + 'px';
                    lineDiv.style.overflow = 'hidden';

                    // Clone and style the SVG for each line
                    const svgClone = svgElement.cloneNode(true);
                    svgClone.setAttribute('width', maxWidth);
                    svgClone.setAttribute('height', scaledHeight);
                    svgClone.style.position = 'absolute';
                    svgClone.style.top = (-i * chunkSpacing) + 'px';
                    svgClone.style.left = '0';

                    // Force all SVG elements to green color
                    svgClone.setAttribute('fill', '#00FF00');
                    svgClone.setAttribute('stroke', '#00FF00');

                    // Apply green to all child elements
                    const allElements = svgClone.querySelectorAll('*');
                    allElements.forEach(el => {
                        el.setAttribute('fill', '#00FF00');
                        if (el.getAttribute('stroke') && el.getAttribute('stroke') !== 'none') {
                            el.setAttribute('stroke', '#00FF00');
                        }
                    });

                    lineDiv.appendChild(svgClone);
                    svgWrapper.appendChild(lineDiv);

                    // Animate line appearance
                    lineDiv.style.opacity = '0';
                    await new Promise(r => setTimeout(r, this.ctrlPressed ? 0 : (this.shiftPressed ? 10 : 30)));
                    lineDiv.style.opacity = '1';
                    this.scrollToBottom();
                }

                resolve();
            } catch (e) {
                const errorLine = document.createElement('div');
                errorLine.className = 'terminal-line';
                errorLine.textContent = `?ERROR LOADING SVG: ${svgSrc}`;
                this.screen.appendChild(errorLine);
                resolve();
            }
        });
    }

    async showImage(imageSrc, maxWidth = 400, revealSpeed = 20, position = null) {
        return new Promise((resolve) => {
            // Create container
            const container = document.createElement('div');
            container.className = 'terminal-line';
            this.screen.appendChild(container);

            const imageWrapper = document.createElement('div');
            imageWrapper.className = 'terminal-image-container';

            // Apply positioning if set
            if (position === 'left' || this.imagePosition === 'left') {
                imageWrapper.classList.add('float-left');
            } else if (position === 'right' || this.imagePosition === 'right') {
                imageWrapper.classList.add('float-right');
            }

            imageWrapper.style.maxWidth = maxWidth + 'px';
            container.appendChild(imageWrapper);

            // Create image
            const img = new Image();
            img.className = 'terminal-image';
            img.style.visibility = 'hidden'; // Hide until loaded

            img.onload = () => {
                // Add to wrapper to measure
                imageWrapper.appendChild(img);
                const fullHeight = img.offsetHeight;

                // Create reveal overlay
                const revealDiv = document.createElement('div');
                revealDiv.className = 'terminal-image-reveal';
                revealDiv.style.height = '0px';

                const revealImg = img.cloneNode();
                revealImg.style.visibility = 'visible';
                revealDiv.appendChild(revealImg);
                imageWrapper.appendChild(revealDiv);

                // Animate reveal from top to bottom
                let currentHeight = 0;
                const increment = 2; // pixels per frame

                const animate = () => {
                    if (currentHeight < fullHeight) {
                        // Instant reveal if Ctrl pressed, faster with Shift
                        if (this.ctrlPressed) {
                            currentHeight = fullHeight;
                        } else {
                            const currentIncrement = this.shiftPressed ? increment * 6 : increment;
                            currentHeight += currentIncrement;
                        }
                        revealDiv.style.height = Math.min(currentHeight, fullHeight) + 'px';
                        this.scrollToBottom();
                        setTimeout(animate, revealSpeed);
                    } else {
                        // Clean up - replace with final image
                        img.style.visibility = 'visible';
                        revealDiv.remove();
                        this.scrollToBottom();
                        resolve();
                    }
                };

                animate();
            };

            img.onerror = () => {
                container.textContent = `?ERROR LOADING IMAGE: ${imageSrc}`;
                resolve();
            };

            img.src = imageSrc;
        });
    }

    initGraphics() {
        // Initialize graphics mode - create 40x48 pixel grid

        // Initialize buffer (40 cols x 48 rows, all black)
        this.graphicsBuffer = Array(48).fill(null).map(() => Array(40).fill(0));

        // Check if graphics container exists AND is still in the DOM
        const containerInDOM = this.graphicsContainer && this.screen.contains(this.graphicsContainer);

        // Create graphics container if it doesn't exist or was removed
        if (!containerInDOM) {
            this.graphicsContainer = document.createElement('div');
            this.graphicsContainer.className = 'graphics-container';
            this.graphicsContainer.id = 'graphics-display';

            // Create 40x48 grid of pixel divs
            this.graphicsPixels = [];
            for (let y = 0; y < 48; y++) {
                this.graphicsPixels[y] = [];
                for (let x = 0; x < 40; x++) {
                    const pixel = document.createElement('div');
                    pixel.className = 'graphics-pixel';
                    pixel.style.backgroundColor = this.colorPalette[0]; // Black
                    this.graphicsContainer.appendChild(pixel);
                    this.graphicsPixels[y][x] = pixel;
                }
            }

            // Insert at beginning of screen
            this.screen.insertBefore(this.graphicsContainer, this.screen.firstChild);
        } else {
            // Reset existing graphics to black
            for (let y = 0; y < 48; y++) {
                for (let x = 0; x < 40; x++) {
                    this.graphicsBuffer[y][x] = 0;
                    this.graphicsPixels[y][x].style.backgroundColor = this.colorPalette[0];
                }
            }
        }

        this.graphicsContainer.style.display = 'grid';
        this.graphicsMode = true;
    }

    hideGraphics() {
        // Hide graphics display and return to text mode
        if (this.graphicsContainer) {
            this.graphicsContainer.style.display = 'none';
        }
        this.graphicsMode = false;
    }

    setPixel(x, y, color) {
        // Set a single pixel to the specified color
        // Validate bounds
        if (x < 0 || x >= 40 || y < 0 || y >= 48) {
            return; // Out of bounds, ignore
        }

        // Clamp color to valid range
        color = Math.max(0, Math.min(15, Math.floor(color)));

        // Update buffer and display
        this.graphicsBuffer[y][x] = color;
        if (this.graphicsPixels && this.graphicsPixels[y] && this.graphicsPixels[y][x]) {
            this.graphicsPixels[y][x].style.backgroundColor = this.colorPalette[color];
        }
    }

    renderGraphics() {
        // Full render of graphics buffer (used for batch updates)
        if (!this.graphicsMode || !this.graphicsPixels) return;

        for (let y = 0; y < 48; y++) {
            for (let x = 0; x < 40; x++) {
                const color = this.graphicsBuffer[y][x];
                this.graphicsPixels[y][x].style.backgroundColor = this.colorPalette[color];
            }
        }
    }

    getAutocompleteOptions(partialCommand) {
        const commands = ['HELP', 'SNAKE', 'GUESS', 'ABOUT', 'CLEAR', 'NEW', 'LIST', 'RUN', 'EDIT',
                         'SAVE', 'LOAD', 'EXEC', 'DIR', 'DELETE', 'IMAGE', 'SETCOL', 'CLEARCOL',
                         'PRINT', 'INPUT', 'LET', 'GOTO', 'IF', 'THEN', 'FOR', 'NEXT', 'GOSUB', 'RETURN', 'REM', 'END',
                         'GR', 'TEXT', 'COLOR', 'PLOT', 'HLIN', 'VLIN'];

        const upper = partialCommand.toUpperCase();

        // Get saved program names from localStorage
        const savedFiles = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key.startsWith('basic_program_')) {
                savedFiles.push(key.replace('basic_program_', '').toUpperCase());
            }
        }

        // Get preloaded program names
        const preloadedFiles = Object.keys(this.preloadedPrograms).map(k => k.toUpperCase());

        // Combine all possible completions
        const allOptions = [...commands, ...savedFiles, ...preloadedFiles];

        // Filter matches
        const matches = allOptions.filter(opt => opt.startsWith(upper));

        return [...new Set(matches)].sort(); // Remove duplicates and sort
    }

    async getInput(prompt) {
        return new Promise(resolve => {
            const inputLine = document.createElement('div');
            inputLine.className = 'terminal-line';
            this.screen.appendChild(inputLine);

            // If prompt is provided, add it before the input field
            if (prompt) {
                const promptSpan = document.createElement('span');
                promptSpan.textContent = prompt;
                inputLine.appendChild(promptSpan);
            }

            const input = document.createElement('div');
            input.contentEditable = true;
            input.className = 'input-field';
            input.spellcheck = false;
            inputLine.appendChild(input);
            input.focus();

            // Set as current input
            this.currentInput = input;

            // Update cursor position
            const updateCursorPosition = () => {
                const selection = window.getSelection();
                if (selection.rangeCount > 0) {
                    const range = selection.getRangeAt(0);
                    const preCaretRange = range.cloneRange();
                    preCaretRange.selectNodeContents(input);
                    preCaretRange.setEnd(range.endContainer, range.endOffset);
                    const textBeforeCursor = preCaretRange.toString();
                    const cursorPos = textBeforeCursor.length * 0.6; // approximate character width
                    input.style.setProperty('--cursor-pos', `${cursorPos}em`);
                }
            };

            input.addEventListener('keyup', updateCursorPosition);
            input.addEventListener('mouseup', updateCursorPosition);
            input.addEventListener('input', updateCursorPosition);

            input.addEventListener('keydown', (e) => {
                // Check for CTRL+C or ESC during input - only when program is running
                if (((e.key.toLowerCase() === 'c' && e.ctrlKey) || (e.key === 'Escape')) && this.isRunning) {
                    e.preventDefault();
                    e.stopPropagation();

                    // Toggle ^C on/off
                    if (this.ctrlCPressed) {
                        // Already pressed - remove the ^C indicator
                        if (this.breakLineElement) {
                            this.breakLineElement.remove();
                            this.breakLineElement = null;
                        }
                        this.ctrlCPressed = false;
                    } else {
                        // First press - show ^C
                        this.ctrlCPressed = true;
                        const breakSpan = document.createElement('span');
                        breakSpan.textContent = '^C';
                        inputLine.appendChild(breakSpan);
                        this.breakLineElement = breakSpan;
                    }
                    return;
                }

                // Check for Enter after break key - trigger break (only during program execution)
                if (e.key === 'Enter' && this.ctrlCPressed && this.isRunning) {
                    e.preventDefault();
                    e.stopPropagation();
                    input.remove();
                    this.currentInput = null;
                    this.breakRequested = true;
                    this.ctrlCPressed = false;
                    this.breakLineElement = null;
                    resolve(null); // Return null to indicate break
                    return;
                }

                if (e.key === 'Enter') {
                    e.preventDefault();
                    let value = input.textContent;
                    // Convert to uppercase for consistency
                    value = value.toUpperCase();
                    input.remove();
                    // Preserve the prompt and append the user's input
                    if (prompt) {
                        inputLine.textContent = prompt + value;
                    } else {
                        inputLine.textContent = value;
                    }
                    this.currentInput = null;
                    resolve(value);
                }

                if (e.key === 'Tab') {
                    e.preventDefault();
                    const currentText = input.textContent.trim();

                    // Get the last word (for multi-word commands like "EXEC SYS_BOOT")
                    const words = currentText.split(/\s+/);
                    const lastWord = words[words.length - 1] || '';

                    if (lastWord.length > 0) {
                        const matches = this.getAutocompleteOptions(lastWord);

                        if (matches.length === 1) {
                            // Single match - autocomplete it
                            words[words.length - 1] = matches[0];
                            input.textContent = words.join(' ');

                            // Move cursor to end
                            const range = document.createRange();
                            const sel = window.getSelection();
                            range.selectNodeContents(input);
                            range.collapse(false);
                            sel.removeAllRanges();
                            sel.addRange(range);

                            updateCursorPosition();
                        } else if (matches.length > 1) {
                            // Multiple matches - find common prefix
                            let commonPrefix = matches[0];
                            for (let i = 1; i < matches.length; i++) {
                                let j = 0;
                                while (j < commonPrefix.length && j < matches[i].length &&
                                       commonPrefix[j] === matches[i][j]) {
                                    j++;
                                }
                                commonPrefix = commonPrefix.substring(0, j);
                            }

                            // If there's a longer common prefix, use it
                            if (commonPrefix.length > lastWord.length) {
                                words[words.length - 1] = commonPrefix;
                                input.textContent = words.join(' ');

                                // Move cursor to end
                                const range = document.createRange();
                                const sel = window.getSelection();
                                range.selectNodeContents(input);
                                range.collapse(false);
                                sel.removeAllRanges();
                                sel.addRange(range);

                                updateCursorPosition();
                            }
                        }
                    }
                }
            });

            // Initial cursor position
            updateCursorPosition();
            this.scrollToBottom();
        });
    }

    async executeProgram(program) {
        this.hideCursor();

        for (const line of program) {
            if (line.trim() === '') {
                await this.typeOutput('');
                continue;
            }

            const match = line.match(/^(\d+)\s+(.+)$/);
            if (match) {
                const lineNum = match[1];
                const command = match[2];
                await this.typeLine(command, `]${lineNum} `);
                this.programLines[lineNum] = command;
            }
        }

        await new Promise(resolve => setTimeout(resolve, 500));
        await this.typeLine('RUN', ']');
        await this.runProgram();
        this.enableInteractiveMode();
    }

    enableInteractiveMode() {
        this.showCursor();
        this.waitForCommand();
    }

    async waitForCommand() {
        this.hideCursor();
        const command = await this.getInput();
        await this.processCommand(command.trim());
        this.waitForCommand();
    }

    async processCommand(command) {
        const upperCommand = command.toUpperCase();

        // Check if this is a line number (BASIC code entry)
        const lineMatch = command.match(/^(\d+)\s+(.+)$/);
        if (lineMatch) {
            const lineNum = lineMatch[1];
            const code = lineMatch[2];
            this.programLines[lineNum] = code;
            return;
        }

        // Check if this is deleting a line number
        if (/^\d+$/.test(command)) {
            const lineNum = command;
            if (this.programLines[lineNum]) {
                delete this.programLines[lineNum];
            }
            return;
        }

        // Check if this is EDIT command
        const editMatch = upperCommand.match(/^EDIT\s+(\d+)$/);
        if (editMatch) {
            await this.editLine(editMatch[1]);
            return;
        }

        await this.typeOutput('');

        if (upperCommand === 'HELP') {
            await this.execProgram('SYS_HELP');
        } else if (upperCommand === 'NEW') {
            this.programLines = {};
            this.variables = {};
            await this.typeOutput('NEW PROGRAM');
            await this.typeOutput('');
        } else if (upperCommand === 'LIST') {
            await this.listProgram();
        } else if (upperCommand === 'RUN') {
            await this.runProgram();
            await this.typeOutput('');
        } else if (upperCommand.startsWith('SAVE ')) {
            await this.saveProgram(upperCommand.substring(5).trim());
        } else if (upperCommand.startsWith('LOAD ')) {
            await this.loadProgram(upperCommand.substring(5).trim());
        } else if (upperCommand === 'DIR' || upperCommand === 'CATALOG') {
            await this.listSavedPrograms();
        } else if (upperCommand.startsWith('EXEC ')) {
            await this.execProgram(upperCommand.substring(5).trim());
        } else if (upperCommand.startsWith('DELETE ') || upperCommand.startsWith('DEL ')) {
            const filename = upperCommand.startsWith('DELETE ') ?
                upperCommand.substring(7).trim() : upperCommand.substring(4).trim();
            await this.deleteProgram(filename);
        } else if (upperCommand === 'COLOURTEST') {
            await this.execProgram('TEST_GR');
        } else if (upperCommand === 'GRTEST') {
            await this.execProgram('TEST_GR_S');
        } else if (upperCommand === 'BALL') {
            await this.execProgram('TEST_GR_2');
        } else if (upperCommand === 'CLEAR' || upperCommand === 'CLS') {
            this.clearScreen();
        } else if (upperCommand === 'ABOUT') {
            await this.execProgram('SYS_ABOUT');
        } else if (upperCommand === 'GUESS') {
            await this.execProgram('SYS_GUESS');
        } else if (upperCommand === '') {
            // Do nothing for empty command
        } else {
            // Try to execute as immediate mode BASIC command
            const executed = await this.executeImmediateCommand(command);
            if (!executed) {
                await this.typeOutput(`?SYNTAX ERROR: UNKNOWN COMMAND "${command}"`);
                await this.typeOutput('TYPE "HELP" FOR AVAILABLE COMMANDS');
            }
        }
    }

    async executeImmediateCommand(command) {
        // Execute a BASIC command in immediate mode (without line number)
        // Returns true if command was recognized and executed, false otherwise

        // Handle ? as shorthand for PRINT
        if (command.trim().startsWith('?')) {
            command = 'PRINT' + command.substring(1);
        }

        const upperCommand = command.toUpperCase().trim();

        // Check if command contains colons (command chaining)
        if (command.includes(':')) {
            // Just execute it - executeCommand will handle the splitting
            try {
                await this.executeCommand(command, [], 0);
                return true;
            } catch (e) {
                console.error('Error executing chained command:', e);
                return false;
            }
        }

        // Check if it's a recognized BASIC command
        const basicCommands = ['PRINT', 'LET', 'INPUT', 'GET', 'HOME', 'VTAB', 'HTAB',
                               'DIM', 'WAIT', 'POKE', 'PEEK', 'FOR', 'NEXT', 'GOTO',
                               'GOSUB', 'RETURN', 'IF', 'THEN', 'END', 'REM',
                               'GR', 'TEXT', 'COLOR', 'PLOT', 'HLIN', 'VLIN'];

        // Check if command starts with any BASIC keyword
        let isBasicCommand = false;
        for (const cmd of basicCommands) {
            if (upperCommand.startsWith(cmd + ' ') || upperCommand === cmd) {
                isBasicCommand = true;
                break;
            }
        }

        // Also check for assignment (LET can be implicit)
        if (command.match(/^\w+[\$%]?\s*=/)) {
            isBasicCommand = true;
        }

        // Also check for array assignment
        if (command.match(/^\w+[\$%]?\s*\(/)) {
            isBasicCommand = true;
        }

        // If it's already a recognized BASIC command, execute it normally
        if (isBasicCommand) {
            // Execute the command
            try {
                await this.executeCommand(command, [], 0);

                // For certain commands, output a blank line after
                if (upperCommand.startsWith('LET ') || command.match(/^\w+[\$%]?\s*=/) ||
                    upperCommand === 'HOME' || upperCommand.startsWith('DIM ')) {
                    // These commands don't output anything, so add a blank line
                    await this.typeOutput('');
                }

                return true;
            } catch (e) {
                console.error('Error executing immediate command:', e);
                return false;
            }
        }

        // Check if it's a bare arithmetic expression (not a command)
        // This handles cases like: +1, -1, 1+2, (3*4), etc.
        if (command.match(/^[\+\-0-9\.\*\/\(\)\^\s]+$/) || // Pure arithmetic with signs
            command.match(/^\w+\s*[\+\-\*\/\^]/)) {         // Variable arithmetic
            // Evaluate and print the result
            try {
                const result = this.evaluateExpression(command);
                await this.typeOutput(result);
                await this.typeOutput('');
                return true;
            } catch (e) {
                return false;
            }
        }

        return false;
    }

    async saveProgram(filename) {
        if (!filename) {
            await this.typeOutput('?SYNTAX ERROR: SAVE <FILENAME>');
            await this.typeOutput('');
            return;
        }

        const lineNumbers = Object.keys(this.programLines);
        if (lineNumbers.length === 0) {
            await this.typeOutput('?NO PROGRAM TO SAVE');
            await this.typeOutput('');
            return;
        }

        try {
            const savedPrograms = JSON.parse(localStorage.getItem('basicPrograms') || '{}');
            savedPrograms[filename] = this.programLines;
            localStorage.setItem('basicPrograms', JSON.stringify(savedPrograms));
            await this.typeOutput(`SAVED: ${filename}`);
            await this.typeOutput('');
        } catch (e) {
            await this.typeOutput('?ERROR SAVING PROGRAM');
            await this.typeOutput('');
        }
    }

    async loadProgram(filename) {
        if (!filename) {
            await this.typeOutput('?SYNTAX ERROR: LOAD <FILENAME>');
            await this.typeOutput('');
            return;
        }

        try {
            const savedPrograms = JSON.parse(localStorage.getItem('basicPrograms') || '{}');
            if (savedPrograms[filename]) {
                this.programLines = savedPrograms[filename];
                this.variables = {};
                await this.typeOutput(`LOADED: ${filename}`);
                await this.typeOutput('');
            } else {
                await this.typeOutput(`?FILE NOT FOUND: ${filename}`);
                await this.typeOutput('');
            }
        } catch (e) {
            await this.typeOutput('?ERROR LOADING PROGRAM');
            await this.typeOutput('');
        }
    }

    async listSavedPrograms() {
        try {
            const savedPrograms = JSON.parse(localStorage.getItem('basicPrograms') || '{}');
            const savedFilenames = Object.keys(savedPrograms);
            const preloadedFilenames = Object.keys(this.preloadedPrograms);

            if (savedFilenames.length === 0 && preloadedFilenames.length === 0) {
                await this.typeOutput('NO SAVED PROGRAMS');
                await this.typeOutput('');
                return;
            }

            // Show preloaded programs
            if (preloadedFilenames.length > 0) {
                await this.typeOutput('SYSTEM PROGRAMS:');
                for (const filename of preloadedFilenames.sort()) {
                    const lineCount = Object.keys(this.preloadedPrograms[filename]).length;
                    await this.typeOutput(`  ${filename} (${lineCount} LINES)`);
                }
                await this.typeOutput('');
            }

            // Show user saved programs
            if (savedFilenames.length > 0) {
                await this.typeOutput('USER PROGRAMS:');
                for (const filename of savedFilenames.sort()) {
                    const lineCount = Object.keys(savedPrograms[filename]).length;
                    await this.typeOutput(`  ${filename} (${lineCount} LINES)`);
                }
                await this.typeOutput('');
            }
        } catch (e) {
            await this.typeOutput('?ERROR READING DIRECTORY');
            await this.typeOutput('');
        }
    }

    async execProgram(filename, enableInteractive = false) {
        if (!filename) {
            await this.typeOutput('?SYNTAX ERROR: EXEC <FILENAME>');
            await this.typeOutput('');
            return;
        }

        try {
            // Check preloaded programs first
            if (this.preloadedPrograms[filename]) {
                this.programLines = this.preloadedPrograms[filename];
                this.variables = {};
                await this.typeOutput(`EXECUTING: ${filename}`);
                await this.typeOutput('');
                await this.runProgram();
                await this.typeOutput('');

                if (enableInteractive) {
                    this.enableInteractiveMode();
                }
                return;
            }

            // Then check localStorage
            const savedPrograms = JSON.parse(localStorage.getItem('basicPrograms') || '{}');
            if (savedPrograms[filename]) {
                this.programLines = savedPrograms[filename];
                this.variables = {};
                await this.typeOutput(`EXECUTING: ${filename}`);
                await this.typeOutput('');
                await this.runProgram();
                await this.typeOutput('');

                if (enableInteractive) {
                    this.enableInteractiveMode();
                }
            } else {
                await this.typeOutput(`?FILE NOT FOUND: ${filename}`);
                await this.typeOutput('');
            }
        } catch (e) {
            await this.typeOutput('?ERROR EXECUTING PROGRAM');
            await this.typeOutput('');
        }
    }

    async deleteProgram(filename) {
        if (!filename) {
            await this.typeOutput('?SYNTAX ERROR: DELETE <FILENAME>');
            await this.typeOutput('');
            return;
        }

        try {
            const savedPrograms = JSON.parse(localStorage.getItem('basicPrograms') || '{}');
            if (savedPrograms[filename]) {
                delete savedPrograms[filename];
                localStorage.setItem('basicPrograms', JSON.stringify(savedPrograms));
                await this.typeOutput(`DELETED: ${filename}`);
                await this.typeOutput('');
            } else {
                await this.typeOutput(`?FILE NOT FOUND: ${filename}`);
                await this.typeOutput('');
            }
        } catch (e) {
            await this.typeOutput('?ERROR DELETING PROGRAM');
            await this.typeOutput('');
        }
    }

    async editLine(lineNum) {
        if (!this.programLines[lineNum]) {
            await this.typeOutput('');
            await this.typeOutput(`?LINE ${lineNum} NOT FOUND`);
            await this.typeOutput('');
            return;
        }

        await this.typeOutput('');
        await this.typeOutput(`EDITING LINE ${lineNum}:`);
        await this.typeOutput(`${lineNum} ${this.programLines[lineNum]}`);
        await this.typeOutput('');
        await this.typeOutput('ENTER NEW CODE (OR BLANK TO CANCEL):');

        const inputLine = document.createElement('div');
        inputLine.className = 'terminal-line';
        this.screen.appendChild(inputLine);

        const input = document.createElement('input');
        input.type = 'text';
        input.className = 'input-field';
        input.value = this.programLines[lineNum];
        inputLine.appendChild(input);
        input.focus();

        // Select all text for easy replacement
        input.select();

        return new Promise(resolve => {
            input.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    const newValue = input.value.trim();
                    input.remove();
                    inputLine.textContent = newValue;

                    if (newValue === '') {
                        this.typeOutput('').then(() => {
                            this.typeOutput('EDIT CANCELLED');
                            this.typeOutput('');
                            resolve();
                        });
                    } else {
                        this.programLines[lineNum] = newValue;
                        this.typeOutput('').then(() => {
                            this.typeOutput('LINE UPDATED');
                            this.typeOutput('');
                            resolve();
                        });
                    }
                }
            });

            this.scrollToBottom();
        });
    }

    async listProgram() {
        const lineNumbers = Object.keys(this.programLines).map(Number).sort((a, b) => a - b);

        if (lineNumbers.length === 0) {
            await this.typeOutput('NO PROGRAM IN MEMORY');
            await this.typeOutput('');
            return;
        }

        for (const lineNum of lineNumbers) {
            await this.typeOutput(`${lineNum} ${this.programLines[lineNum]}`);
        }
        await this.typeOutput('');
    }

    // showHelp() and showAbout() removed - now implemented as BASIC programs (SYS_HELP, SYS_ABOUT)

    clearScreen() {
        // Clear screen but preserve graphics container if it exists
        if (this.graphicsContainer && this.graphicsMode) {
            // Remove all children except graphics container
            const children = Array.from(this.screen.children);
            children.forEach(child => {
                if (child !== this.graphicsContainer) {
                    child.remove();
                }
            });
        } else {
            this.screen.innerHTML = '';
        }
    }

    // startSnakeGame(), startCalculator(), and startGuessingGame() removed
    // These are now implemented as BASIC programs (SYS_SNAKE, SYS_CALC, SYS_GUESS)

    buildDataList() {
        // Build a list of all DATA items from the program
        this.dataList = [];
        const lineNumbers = Object.keys(this.programLines).map(Number).sort((a, b) => a - b);

        for (const lineNum of lineNumbers) {
            const command = this.programLines[lineNum];
            const upperCommand = command.toUpperCase().trim();

            // Check for DATA statement
            if (upperCommand.startsWith('DATA ')) {
                const dataContent = command.substring(5).trim();
                // Split by commas, but respect quoted strings
                const items = this.parseDataStatement(dataContent);
                this.dataList.push(...items);
            }
        }

        this.dataPointer = 0; // Reset pointer to beginning
    }

    parseDataStatement(content) {
        // Parse DATA statement, splitting by commas but respecting quotes
        const items = [];
        let current = '';
        let inString = false;

        for (let i = 0; i < content.length; i++) {
            const char = content[i];

            if (char === '"') {
                inString = !inString;
                current += char;
            } else if (char === ',' && !inString) {
                items.push(current.trim());
                current = '';
            } else {
                current += char;
            }
        }

        // Add remaining content
        if (current.trim()) {
            items.push(current.trim());
        }

        return items;
    }

    async runProgram() {
        const lineNumbers = Object.keys(this.programLines).map(Number).sort((a, b) => a - b);
        let i = 0;
        this.callStack = [];
        this.isRunning = true; // Enable GET command key capture
        this.breakRequested = false; // Reset break flag
        this.buildDataList(); // Build DATA list before running

        try {
            while (i < lineNumbers.length) {
                // Check if break was requested (CTRL+C then Enter)
                if (this.breakRequested) {
                    await this.typeOutput('');
                    await this.typeOutput('BREAK');
                    await this.typeOutput('');
                    this.breakRequested = false;
                    break;
                }

                const lineNum = lineNumbers[i];
                const command = this.programLines[lineNum];

                const result = await this.executeCommand(command, lineNumbers, i);

                if (result && result.type === 'BREAK') {
                    await this.typeOutput('');
                    await this.typeOutput('BREAK');
                    await this.typeOutput('');
                    this.breakRequested = false;
                    break;
                }

                if (result && result.type === 'GOTO') {
                    const gotoIndex = lineNumbers.indexOf(result.lineNumber);
                    if (gotoIndex !== -1) {
                        i = gotoIndex;
                        continue;
                    }
                }

                if (result && result.type === 'RETURN') {
                    if (this.callStack.length > 0) {
                        i = this.callStack.pop();
                        i++;
                        continue;
                    }
                }

                if (result && result.type === 'END') {
                    break;
                }

                i++;
            }
        } finally {
            this.isRunning = false; // Disable GET command key capture
        }
    }

    async executeCommand(command, lineNumbers, currentIndex) {
        command = command.trim();

        // Handle command chaining with : (colon)
        // Split by : but respect strings (don't split inside quotes)
        const commands = this.splitByColon(command);
        if (commands.length > 1) {
            // Check if this is a FOR...NEXT loop in immediate mode (no lineNumbers)
            const hasFor = commands.some(cmd => cmd.trim().toUpperCase().startsWith('FOR '));
            const hasNext = commands.some(cmd => cmd.trim().toUpperCase().startsWith('NEXT') || cmd.trim().toUpperCase() === 'NEXT');

            if (hasFor && hasNext && lineNumbers.length === 0) {
                // Handle FOR...NEXT in immediate mode
                // Extract FOR, body, and NEXT
                let forCmd = null;
                let bodyCommands = [];
                let nextCmd = null;

                for (let i = 0; i < commands.length; i++) {
                    const cmd = commands[i].trim();
                    const upper = cmd.toUpperCase();

                    if (upper.startsWith('FOR ')) {
                        forCmd = cmd;
                    } else if (upper.startsWith('NEXT') || upper === 'NEXT') {
                        nextCmd = cmd;
                    } else if (forCmd && !nextCmd) {
                        bodyCommands.push(cmd);
                    }
                }

                if (forCmd && nextCmd) {
                    // Parse FOR statement
                    const forMatch = forCmd.match(/FOR\s+(\w+[\$%]?)\s*=\s*(.+)\s+TO\s+(.+)(?:\s+STEP\s+(.+))?/i);
                    if (forMatch) {
                        const varName = forMatch[1];
                        const startVal = parseFloat(this.evaluateExpression(forMatch[2]));
                        const endVal = parseFloat(this.evaluateExpression(forMatch[3]));
                        const stepVal = forMatch[4] ? parseFloat(this.evaluateExpression(forMatch[4])) : 1;

                        // Execute the loop
                        for (let val = startVal;
                             stepVal > 0 ? val <= endVal : val >= endVal;
                             val += stepVal) {
                            this.variables[varName] = val;

                            // Execute body commands
                            for (const bodyCmd of bodyCommands) {
                                await this.executeCommand(bodyCmd, lineNumbers, currentIndex);
                            }

                            // Yield to prevent blocking
                            await new Promise(resolve => setTimeout(resolve, 0));
                        }
                    }
                    return null;
                }
            }

            // Normal chained command execution
            for (const cmd of commands) {
                const result = await this.executeCommand(cmd.trim(), lineNumbers, currentIndex);
                if (result) {
                    return result; // Return GOTO, END, BREAK, etc. if encountered
                }
            }
            return null;
        }

        // Normalize command to uppercase for command matching, but preserve original for expressions
        const upperCommand = command.toUpperCase();

        // GET command - non-blocking keyboard input
        if (upperCommand.startsWith('GET ')) {
            const varName = command.substring(4).trim();
            this.variables[varName] = this.lastKeyPress;
            this.lastKeyPress = ''; // Clear after reading
            return null;
        }

        // HOME command - clear screen
        if (upperCommand === 'HOME') {
            this.clearScreen();
            this.cursorRow = 1;
            this.cursorCol = 1;
            return null;
        }

        // GR command - enter low-resolution graphics mode
        if (upperCommand === 'GR') {
            this.initGraphics();
            return null;
        }

        // TEXT command - exit graphics mode, return to text
        if (upperCommand === 'TEXT') {
            this.hideGraphics();
            return null;
        }

        // COLOR command - set drawing color
        if (upperCommand.startsWith('COLOR ') || upperCommand.includes('COLOR=') || upperCommand.includes('COLOR =')) {
            // Parse COLOR = n syntax
            const colorMatch = command.match(/COLOR\s*=\s*(.+)/i);
            if (colorMatch) {
                const colorValue = parseInt(this.evaluateExpression(colorMatch[1]));
                this.currentColor = Math.max(0, Math.min(15, colorValue));
            }
            // Yield for consistency
            await new Promise(resolve => setTimeout(resolve, 0));
            return null;
        }

        // PLOT command - plot a pixel at x, y
        if (upperCommand.startsWith('PLOT ')) {
            const plotMatch = command.match(/PLOT\s+(.+?)\s*,\s*(.+)/i);
            if (plotMatch && this.graphicsMode) {
                const x = parseInt(this.evaluateExpression(plotMatch[1]));
                const y = parseInt(this.evaluateExpression(plotMatch[2]));
                this.setPixel(x, y, this.currentColor);
            }
            // Add small delay for animation visibility
            // Respect shift/ctrl for speed control: ctrl=instant, shift=fast, normal=animated
            const delay = this.ctrlPressed ? 0 : (this.shiftPressed ? 5 : 20);
            await new Promise(resolve => setTimeout(resolve, delay));
            return null;
        }

        // HLIN command - horizontal line
        if (upperCommand.startsWith('HLIN ')) {
            const hlinMatch = command.match(/HLIN\s+(.+?)\s*,\s*(.+?)\s+AT\s+(.+)/i);
            if (hlinMatch && this.graphicsMode) {
                let x1 = parseInt(this.evaluateExpression(hlinMatch[1]));
                let x2 = parseInt(this.evaluateExpression(hlinMatch[2]));
                const y = parseInt(this.evaluateExpression(hlinMatch[3]));

                // Swap if x1 > x2
                if (x1 > x2) [x1, x2] = [x2, x1];

                // Draw line
                for (let x = x1; x <= x2; x++) {
                    this.setPixel(x, y, this.currentColor);
                }

                // Yield control every 50 graphics operations
                this.graphicsOpCount++;
                if (this.graphicsOpCount >= 50) {
                    this.graphicsOpCount = 0;
                    await new Promise(resolve => setTimeout(resolve, 0));
                }
            }
            return null;
        }

        // VLIN command - vertical line
        if (upperCommand.startsWith('VLIN ')) {
            const vlinMatch = command.match(/VLIN\s+(.+?)\s*,\s*(.+?)\s+AT\s+(.+)/i);
            if (vlinMatch && this.graphicsMode) {
                try {
                    let y1 = parseInt(this.evaluateExpression(vlinMatch[1]));
                    let y2 = parseInt(this.evaluateExpression(vlinMatch[2]));
                    const x = parseInt(this.evaluateExpression(vlinMatch[3]));

                    // Check for NaN
                    if (isNaN(y1) || isNaN(y2) || isNaN(x)) {
                        console.error('VLIN: Invalid coordinates', {y1, y2, x, expr: vlinMatch[3]});
                        return null;
                    }

                    // Swap if y1 > y2
                    if (y1 > y2) [y1, y2] = [y2, y1];

                    // Draw line
                    for (let y = y1; y <= y2; y++) {
                        this.setPixel(x, y, this.currentColor);
                    }

                    // Yield control every 50 graphics operations
                    this.graphicsOpCount++;
                    if (this.graphicsOpCount >= 50) {
                        this.graphicsOpCount = 0;
                        await new Promise(resolve => setTimeout(resolve, 0));
                    }
                } catch (e) {
                    console.error('VLIN error:', e, 'command:', command);
                }
            }
            return null;
        }

        // VTAB command - position cursor vertically
        if (upperCommand.startsWith('VTAB ')) {
            const row = parseInt(this.evaluateExpression(command.substring(5)));
            this.cursorRow = Math.max(1, Math.min(24, row));
            return null;
        }

        // HTAB command - position cursor horizontally
        if (upperCommand.startsWith('HTAB ')) {
            const col = parseInt(this.evaluateExpression(command.substring(5)));
            this.cursorCol = Math.max(1, Math.min(40, col));
            return null;
        }

        // DIM command - declare arrays
        if (upperCommand.startsWith('DIM ')) {
            const declList = command.substring(4).split(',');
            for (const decl of declList) {
                // Match: ARRAYNAME(size) or ARRAYNAME(size1, size2) or ARRAYNAME$(size) or ARRAYNAME%(size)
                const match = decl.trim().match(/^(\w+[\$%]?)\(([^)]+)\)$/);
                if (match) {
                    const arrayName = match[1];
                    const dimensions = match[2].split(',').map(d => d.trim());

                    // Evaluate each dimension (could be a variable or expression)
                    const sizes = dimensions.map(dim => {
                        const evaluated = this.evaluateExpression(dim);
                        return parseInt(evaluated);
                    });

                    // Create the array based on dimensionality
                    if (sizes.length === 1) {
                        // 1D array: DIM A(10) creates array with indices 0-10 (11 elements)
                        const size = sizes[0];
                        const defaultValue = arrayName.endsWith('$') ? '' : 0;
                        this.arrays[arrayName] = new Array(size + 1).fill(defaultValue);
                    } else if (sizes.length === 2) {
                        // 2D array: DIM A(20, 3) creates (21 x 4) array
                        const rows = sizes[0] + 1;
                        const cols = sizes[1] + 1;
                        const defaultValue = arrayName.endsWith('$') ? '' : 0;
                        this.arrays[arrayName] = Array(rows).fill(null).map(() =>
                            new Array(cols).fill(defaultValue)
                        );
                        // Store dimension info for access
                        this.arrays[arrayName]._dimensions = [rows, cols];
                    } else {
                        // 3D or higher - not commonly used but we can support it
                        // For now, just create a flat array
                        let totalSize = 1;
                        for (const size of sizes) {
                            totalSize *= (size + 1);
                        }
                        const defaultValue = arrayName.endsWith('$') ? '' : 0;
                        this.arrays[arrayName] = new Array(totalSize).fill(defaultValue);
                        this.arrays[arrayName]._dimensions = sizes.map(s => s + 1);
                    }
                }
            }
            return null;
        }

        // WAIT command - pause execution
        if (upperCommand.startsWith('WAIT ')) {
            const ms = parseInt(this.evaluateExpression(command.substring(5)));
            await new Promise(resolve => setTimeout(resolve, ms));
            return null;
        }

        // POKE command - write to memory
        if (upperCommand.startsWith('POKE ')) {
            const parts = command.substring(5).split(',');
            if (parts.length === 2) {
                const addr = parseInt(this.evaluateExpression(parts[0].trim()));
                const val = parseInt(this.evaluateExpression(parts[1].trim()));
                this.memory[addr] = val & 0xFF;
            }
            return null;
        }

        // PRINT command
        if (upperCommand.startsWith('PRINT ')) {
            const content = command.substring(6);

            // Check if we should use positioned printing (VTAB/HTAB was used)
            const usePositioning = this.cursorRow !== 1 || this.cursorCol !== 1;

            // Check if PRINT ends with semicolon or comma (suppresses newline)
            const suppressNewline = content.trim().endsWith(';') || content.trim().endsWith(',');
            const actualContent = suppressNewline ? content.trim().slice(0, -1) : content;

            // Parse the print statement into parts (handling commas and semicolons)
            const parts = this.parsePrintStatement(actualContent);

            let output = '';
            let currentCol = 0;

            for (let i = 0; i < parts.length; i++) {
                const part = parts[i];

                if (part.type === 'comma') {
                    // Comma: tab to next column (columns at 0, 16, 32, 48, etc.)
                    const nextCol = Math.floor(currentCol / 16) * 16 + 16;
                    const spaces = nextCol - currentCol;
                    output += ' '.repeat(spaces);
                    currentCol = nextCol;
                } else if (part.type === 'semicolon') {
                    // Semicolon: no space, just continue
                } else if (part.type === 'expression') {
                    // Evaluate and add the expression
                    let value;
                    if (part.value.includes('h:')) {
                        value = this.parseHighlightedText(part.value);
                    } else {
                        value = this.evaluateExpression(part.value);
                    }
                    output += value;
                    currentCol += value.toString().length;
                }
            }

            if (usePositioning) {
                // Use positioned printing for game graphics
                await this.printAt(this.cursorRow, this.cursorCol, output);
                if (!suppressNewline) {
                    this.cursorRow = 1;
                    this.cursorCol = 1;
                }
            } else {
                // Normal PRINT behavior
                await this.typeOutput(output, actualContent.includes('h:'));
            }
            return null;
        }

        // INPUT command
        if (upperCommand.startsWith('INPUT ')) {
            // Match INPUT with optional prompt and comma-separated variable list
            const promptMatch = command.match(/INPUT\s+"([^"]+)";\s*(.+)/i);
            const noPromptMatch = command.match(/INPUT\s+(.+)/i);

            let prompt = '?';
            let varList = '';

            if (promptMatch) {
                prompt = promptMatch[1];
                varList = promptMatch[2];
            } else if (noPromptMatch) {
                varList = noPromptMatch[1];
            }

            // Split variable list by commas
            const varNames = varList.split(',').map(v => v.trim());

            // Get input from user
            let value = await this.getInput(prompt);

            // Check if break was requested (value will be null)
            if (value === null && this.breakRequested) {
                return { type: 'BREAK' };
            }

            // Split the input by commas to get values for each variable
            const values = value.split(',').map(v => v.trim());

            // Assign values to variables or array elements
            for (let i = 0; i < varNames.length; i++) {
                const varName = varNames[i];
                const val = values[i] || ''; // Use empty string if not enough values provided

                // Check if this is an array access (e.g., A(I))
                const arrayMatch = varName.match(/^(\w+[\$%]?)\(([^)]+)\)$/);
                if (arrayMatch) {
                    const arrayName = arrayMatch[1];
                    const indexExpr = arrayMatch[2];

                    // Auto-dimension array if not yet declared
                    if (!this.arrays[arrayName]) {
                        const defaultValue = arrayName.endsWith('$') ? '' : 0;
                        this.arrays[arrayName] = new Array(11).fill(defaultValue); // 0-10
                    }

                    // Evaluate the index
                    const idx = parseInt(this.evaluateExpression(indexExpr));

                    // Convert value based on array type
                    if (arrayName.endsWith('$')) {
                        this.arrays[arrayName][idx] = val.toString();
                    } else if (arrayName.endsWith('%')) {
                        const numValue = parseFloat(val);
                        this.arrays[arrayName][idx] = Math.floor(numValue);
                    } else {
                        this.arrays[arrayName][idx] = !isNaN(val) && val !== '' ? parseFloat(val) : 0;
                    }
                } else {
                    // Regular variable assignment
                    if (varName.endsWith('$')) {
                        this.variables[varName] = val.toString();
                    } else if (varName.endsWith('%')) {
                        const numValue = parseFloat(val);
                        this.variables[varName] = Math.floor(numValue);
                    } else {
                        this.variables[varName] = !isNaN(val) && val !== '' ? parseFloat(val) : 0;
                    }
                }
            }

            return null;
        }

        // LET command (or implicit assignment)
        if (upperCommand.startsWith('LET ') || command.match(/^\w+[\$%]?\s*=/) || command.match(/^\w+[\$%]?\s*\(/)) {
            // Check for array assignment: A(I) = value
            const arrayAssignMatch = command.match(/(?:LET\s+)?(\w+[\$%]?)\s*\(\s*([^)]+)\s*\)\s*=\s*(.+)/i);
            if (arrayAssignMatch) {
                const arrayName = arrayAssignMatch[1];
                const indexExpr = arrayAssignMatch[2];
                const valueExpr = arrayAssignMatch[3];

                // Auto-dimension array if not yet declared
                if (!this.arrays[arrayName]) {
                    const defaultValue = arrayName.endsWith('$') ? '' : 0;
                    this.arrays[arrayName] = new Array(11).fill(defaultValue); // 0-10
                }

                const index = parseInt(this.evaluateExpression(indexExpr));
                let value = this.evaluateExpression(valueExpr);

                // Handle array types based on suffix
                if (arrayName.endsWith('$')) {
                    // String array - keep as string
                    this.arrays[arrayName][index] = value.toString();
                } else if (arrayName.endsWith('%')) {
                    // Integer array - truncate (round down toward negative infinity)
                    const numValue = parseFloat(value);
                    this.arrays[arrayName][index] = Math.floor(numValue);
                } else {
                    // Real precision array - convert to number
                    if (!isNaN(value) && value !== '') {
                        this.arrays[arrayName][index] = parseFloat(value);
                    } else {
                        this.arrays[arrayName][index] = 0;
                    }
                }

                return null;
            }

            // Regular variable assignment
            const assignMatch = command.match(/(?:LET\s+)?(\w+[\$%]?)\s*=\s*(.+)/i);
            if (assignMatch) {
                const varName = assignMatch[1];
                let value = this.evaluateExpression(assignMatch[2]);

                // Handle variable types based on suffix
                if (varName.endsWith('$')) {
                    // String variable - keep as string
                    this.variables[varName] = value.toString();
                } else if (varName.endsWith('%')) {
                    // Integer variable - truncate (round down toward negative infinity)
                    const numValue = parseFloat(value);
                    this.variables[varName] = Math.floor(numValue);
                } else {
                    // Real precision variable - convert to number
                    if (!isNaN(value) && value !== '') {
                        this.variables[varName] = parseFloat(value);
                    } else {
                        this.variables[varName] = parseFloat(value) || 0;
                    }
                }

                // Yield if we're in a tight loop (check graphics mode or running state)
                if (this.isRunning) {
                    this.graphicsOpCount++;
                    if (this.graphicsOpCount >= 100) {
                        this.graphicsOpCount = 0;
                        await new Promise(resolve => setTimeout(resolve, 0));
                    }
                }
            }
            return null;
        }

        // FOR...NEXT loop
        if (upperCommand.startsWith('FOR ')) {
            const forMatch = command.match(/FOR\s+(\w+[\$%]?)\s*=\s*(.+)\s+TO\s+(.+)(?:\s+STEP\s+(.+))?/i);
            if (forMatch) {
                const varName = forMatch[1];

                // Integer variables are not allowed in FOR statements
                if (varName.endsWith('%')) {
                    await this.typeOutput(`?SYNTAX ERROR: INTEGER VARIABLES NOT ALLOWED IN FOR LOOPS`);
                    return { type: 'END' };
                }

                // evaluateExpression returns strings, so convert to numbers for FOR loops
                const startVal = parseFloat(this.evaluateExpression(forMatch[2]));
                const endVal = parseFloat(this.evaluateExpression(forMatch[3]));
                const stepVal = forMatch[4] ? parseFloat(this.evaluateExpression(forMatch[4])) : 1;

                this.variables[varName] = startVal;
                this.loopStack.push({
                    varName,
                    endVal,
                    stepVal,
                    startIndex: currentIndex + 1  // Point to NEXT line after FOR, not FOR itself!
                });
            }
            return null;
        }

        if (upperCommand === 'NEXT' || upperCommand.startsWith('NEXT ')) {
            if (this.loopStack.length > 0) {
                const loop = this.loopStack[this.loopStack.length - 1];
                this.variables[loop.varName] = parseFloat(this.variables[loop.varName]) + loop.stepVal;

                const current = parseFloat(this.variables[loop.varName]);
                const shouldContinue = loop.stepVal > 0 ? current <= loop.endVal : current >= loop.endVal;

                // Yield control to prevent timeout in tight loops
                await new Promise(resolve => setTimeout(resolve, 0));

                if (shouldContinue) {
                    return { type: 'GOTO', lineNumber: lineNumbers[loop.startIndex] };
                } else {
                    this.loopStack.pop();
                }
            }
            return null;
        }

        // GOSUB command
        if (upperCommand.startsWith('GOSUB ')) {
            const lineNumber = parseInt(command.substring(6));
            this.callStack.push(currentIndex);
            return { type: 'GOTO', lineNumber };
        }

        // RETURN command
        if (upperCommand === 'RETURN') {
            return { type: 'RETURN' };
        }

        // IF...THEN command
        if (upperCommand.startsWith('IF ')) {
            const ifMatch = command.match(/IF\s+(.+)\s+THEN\s+(.+)/i);
            if (ifMatch) {
                const condition = ifMatch[1];
                const thenPart = ifMatch[2];

                if (this.evaluateCondition(condition)) {
                    if (thenPart.match(/^\d+$/)) {
                        return { type: 'GOTO', lineNumber: parseInt(thenPart) };
                    } else {
                        // Handle multiple statements separated by colons
                        const statements = thenPart.split(':');
                        for (const statement of statements) {
                            const result = await this.executeCommand(statement.trim(), lineNumbers, currentIndex);
                            if (result) {
                                return result; // Return GOTO, END, etc. if encountered
                            }
                        }
                    }
                }
            }
            return null;
        }

        // GOTO command
        if (upperCommand.startsWith('GOTO ')) {
            const lineNumber = parseInt(command.substring(5));
            return { type: 'GOTO', lineNumber };
        }

        // END command
        if (upperCommand === 'END') {
            return { type: 'END' };
        }

        // ICON command - Display chunked green SVG icon
        if (upperCommand.startsWith('ICON ')) {
            const iconMatch = command.match(/ICON\s+"([^"]+)"(?:\s+(\d+))?(?:\s+(\d+))?(?:\s+(LEFT|RIGHT))?/i);
            if (iconMatch) {
                const svgSrc = iconMatch[1];
                const maxWidth = iconMatch[2] ? parseInt(iconMatch[2]) : 200;
                const linesPerChunk = iconMatch[3] ? parseInt(iconMatch[3]) : null; // null = 1 line per chunk (auto)
                const position = iconMatch[4] ? iconMatch[4].toLowerCase() : null;
                await this.showChunkedSVG(svgSrc, maxWidth, linesPerChunk, position);
            }
            return null;
        }

        // IMAGE command
        if (upperCommand.startsWith('IMAGE ')) {
            const imageMatch = command.match(/IMAGE\s+"([^"]+)"(?:\s+(\d+))?(?:\s+(\d+))?(?:\s+(LEFT|RIGHT))?/i);
            if (imageMatch) {
                const imageSrc = imageMatch[1];
                const maxWidth = imageMatch[2] ? parseInt(imageMatch[2]) : 400;
                const revealSpeed = imageMatch[3] ? parseInt(imageMatch[3]) : 20;
                const position = imageMatch[4] ? imageMatch[4].toLowerCase() : null;
                await this.showImage(imageSrc, maxWidth, revealSpeed, position);
            }
            return null;
        }

        // SETCOL command - Set column position for subsequent images
        if (upperCommand.startsWith('SETCOL ')) {
            const colMatch = command.match(/SETCOL\s+(LEFT|RIGHT|NONE)/i);
            if (colMatch) {
                const position = colMatch[1].toUpperCase();
                if (position === 'NONE') {
                    this.imagePosition = null;
                } else {
                    this.imagePosition = position.toLowerCase();
                }
            }
            return null;
        }

        // CLEARCOL command - Clear column positioning and move below floated content
        if (upperCommand === 'CLEARCOL') {
            this.imagePosition = null;
            // Add a clearing element
            const clearLine = document.createElement('div');
            clearLine.className = 'terminal-line clearfix';
            clearLine.style.clear = 'both';
            clearLine.innerHTML = '&nbsp;';
            this.screen.appendChild(clearLine);
            return null;
        }

        // REM command (comment)
        if (upperCommand.startsWith('REM ')) {
            return null;
        }

        // DATA command (just skip it during execution - data is pre-loaded)
        if (upperCommand.startsWith('DATA ')) {
            return null;
        }

        // READ command - read from DATA list into variables
        if (upperCommand.startsWith('READ ')) {
            const varList = command.substring(5).trim();
            const varNames = varList.split(',').map(v => v.trim());

            for (const varName of varNames) {
                // Check if we've run out of data
                if (this.dataPointer >= this.dataList.length) {
                    await this.typeOutput('?OUT OF DATA ERROR');
                    return { type: 'END' };
                }

                // Get the data value
                let value = this.dataList[this.dataPointer++];

                // Remove quotes if it's a quoted string
                if (value.startsWith('"') && value.endsWith('"')) {
                    value = value.slice(1, -1);
                }

                // Handle variable types based on suffix
                if (varName.endsWith('$')) {
                    // String variable - keep as string
                    this.variables[varName] = value.toString();
                } else if (varName.endsWith('%')) {
                    // Integer variable - truncate (round down toward negative infinity)
                    const numValue = parseFloat(value);
                    this.variables[varName] = Math.floor(numValue);
                } else {
                    // Real precision variable - convert to number
                    this.variables[varName] = !isNaN(value) && value !== '' ? parseFloat(value) : 0;
                }
            }
            return null;
        }

        // RESTORE command - reset DATA pointer to beginning
        if (upperCommand === 'RESTORE') {
            this.dataPointer = 0;
            return null;
        }

        return null;
    }

    formatAppleNumber(value) {
        // Format a number according to Apple II BASIC rules
        // - No leading + for positive numbers
        // - Negative sign always shown
        // - Trailing zeros truncated on decimals
        // - 9 character limit for mantissa (excluding sign and exponent)
        // - Scientific notation when needed

        const num = parseFloat(value);

        // Handle special cases
        if (isNaN(num)) return value.toString();
        if (num === 0) return '0';

        const isNegative = num < 0;
        const absNum = Math.abs(num);

        // Determine if we need scientific notation
        // Apple II uses scientific notation for numbers >= 1E9 or with >9 significant digits
        const numStr = absNum.toString();

        // Check if number already in scientific notation from JavaScript
        if (numStr.includes('e')) {
            // Parse scientific notation
            const [mantissa, exponent] = numStr.split('e');
            const exp = parseInt(exponent);

            // Format mantissa to max 9 significant digits
            let formattedMantissa = parseFloat(mantissa);

            // Round to 9 significant digits
            const mantissaStr = formattedMantissa.toString();
            if (mantissaStr.replace('.', '').replace('-', '').length > 9) {
                const magnitude = Math.floor(Math.log10(Math.abs(formattedMantissa)));
                const scale = Math.pow(10, magnitude - 8);
                formattedMantissa = Math.round(formattedMantissa / scale) * scale;
            }

            // Format exponent with sign and leading zero if needed
            const expStr = exp >= 0 ? `+${exp.toString().padStart(2, '0')}` : exp.toString().padStart(3, '0');

            return (isNegative ? '-' : '') + formattedMantissa + 'E' + expStr;
        }

        // Count significant digits (excluding decimal point)
        const withoutDecimal = numStr.replace('.', '');

        // If number is >= 1E9, use scientific notation
        if (absNum >= 1000000000) {
            const exponent = Math.floor(Math.log10(absNum));
            let mantissa = absNum / Math.pow(10, exponent);

            // Round mantissa to 9 significant digits
            mantissa = parseFloat(mantissa.toPrecision(9));

            // Remove trailing zeros after decimal
            let mantissaStr = mantissa.toString();
            if (mantissaStr.includes('.')) {
                mantissaStr = mantissaStr.replace(/\.?0+$/, '');
            }

            const expStr = exponent >= 0 ? `+${exponent.toString().padStart(2, '0')}` : exponent.toString().padStart(3, '0');

            return (isNegative ? '-' : '') + mantissaStr + 'E' + expStr;
        }

        // If we have more than 9 significant digits, use scientific notation
        if (withoutDecimal.length > 9) {
            const exponent = Math.floor(Math.log10(absNum));
            let mantissa = absNum / Math.pow(10, exponent);

            // Round to 9 significant digits
            mantissa = parseFloat(mantissa.toPrecision(9));

            // Remove trailing zeros
            let mantissaStr = mantissa.toString();
            if (mantissaStr.includes('.')) {
                mantissaStr = mantissaStr.replace(/\.?0+$/, '');
            }

            const expStr = exponent >= 0 ? `+${exponent.toString().padStart(2, '0')}` : exponent.toString().padStart(3, '0');

            return (isNegative ? '-' : '') + mantissaStr + 'E' + expStr;
        }

        // Regular number formatting - remove trailing zeros
        let result = num.toString();

        // Remove trailing zeros after decimal point
        if (result.includes('.')) {
            result = result.replace(/\.?0+$/, '');
        }

        return result;
    }

    evaluateExpression(expr) {
        expr = expr.trim();

        // Handle string literals
        const stringMatch = expr.match(/^"([^"]*)"$/);
        if (stringMatch) {
            return stringMatch[1];
        }

        // Handle unary minus before variables to ensure proper negation
        // Convert -VAR% to (-1)*VAR% to avoid double-negative issues
        expr = expr.replace(/(?:^|[^A-Z0-9_])(-\s*)([A-Z_][A-Z0-9_]*[%$]?)(?![A-Z0-9_])/gi, (match, _minus, varName) => {
            const prefix = match[0] === '-' ? '' : match[0];
            return prefix + '(-1)*' + varName;
        });

        // Handle functions and array access (non-recursively)
        expr = this.expandExpression(expr);

        // Handle concatenation
        const parts = expr.split(/;\s*/);
        let result = '';

        for (const part of parts) {
            const trimmed = part.trim();

            if (trimmed.startsWith('"') && trimmed.endsWith('"')) {
                result += trimmed.slice(1, -1);
            } else if (!isNaN(trimmed)) {
                // Format numeric literals according to Apple II BASIC rules
                result += this.formatAppleNumber(parseFloat(trimmed));
            } else {
                // Replace ^ with ** for exponentiation (Apple II BASIC uses ^)
                let evalExpr = trimmed.replace(/\^/g, '**');

                // Try to evaluate as arithmetic expression
                try {
                    // Simple eval for arithmetic (safe since we control the input)
                    const evalResult = Function('"use strict"; return (' + evalExpr + ')')();

                    // Format numbers according to Apple II BASIC rules
                    if (typeof evalResult === 'number') {
                        result += this.formatAppleNumber(evalResult);
                    } else {
                        result += evalResult;
                    }
                } catch (e) {
                    result += trimmed;
                }
            }
        }

        return result;
    }

    expandExpression(expr) {
        // Non-recursive expansion of variables, functions, and arrays
        let result = expr;
        let changed = true;
        let iterations = 0;
        const maxIterations = 20; // Prevent infinite loops

        while (changed && iterations < maxIterations) {
            changed = false;
            iterations++;

            // First pass: Replace simple variable references (not inside parentheses or quotes)
            // We need to match variables carefully - try string vars first (with $), then integer (with %), then real
            // This ensures we match the longest possible variable name

            // Helper function to skip matches inside quoted strings
            const replaceOutsideQuotes = (text, pattern, replacer) => {
                let newText = '';
                let inQuotes = false;
                let i = 0;

                while (i < text.length) {
                    if (text[i] === '"') {
                        inQuotes = !inQuotes;
                        newText += text[i];
                        i++;
                    } else if (!inQuotes) {
                        // Try to match the pattern at this position
                        const remaining = text.substring(i);
                        const match = remaining.match(pattern);

                        if (match && match.index === 0) {
                            // Pattern matches at current position
                            const replacement = replacer(match);
                            newText += replacement;
                            i += match[0].length;
                            if (replacement !== match[0]) {
                                changed = true;
                            }
                        } else {
                            newText += text[i];
                            i++;
                        }
                    } else {
                        // Inside quotes, just copy
                        newText += text[i];
                        i++;
                    }
                }

                return newText;
            };

            // Replace variables outside of quoted strings using a smarter approach
            // Split by quotes, process non-quoted parts, then rejoin
            const parts = result.split('"');
            for (let i = 0; i < parts.length; i += 2) {
                // Only process non-quoted parts (even indices)
                if (i < parts.length) {
                    let part = parts[i];

                    // Replace string variables (ending with $)
                    part = part.replace(/([A-Z_][A-Z0-9_]*)\$(?!\s*\()/gi, (match, varBase) => {
                        const varName = varBase + '$';
                        if (this.variables[varName] !== undefined) {
                            const value = this.variables[varName];
                            changed = true;
                            return '"' + value + '"';
                        } else {
                            return '""';
                        }
                    });

                    // Replace integer variables (ending with %)
                    part = part.replace(/([A-Z_][A-Z0-9_]*)%(?!\s*\()/gi, (match, varBase) => {
                        const varName = varBase + '%';
                        if (this.variables[varName] !== undefined) {
                            changed = true;
                            return this.variables[varName].toString();
                        } else {
                            return '0';
                        }
                    });

                    // Replace real variables (no suffix)
                    part = part.replace(/\b([A-Z_][A-Z0-9_]*)(?![A-Z0-9_$%])(?!\s*\()/gi, (match, varBase) => {
                        const varName = varBase;
                        if (this.variables[varName] !== undefined) {
                            changed = true;
                            return this.variables[varName].toString();
                        } else {
                            return '0';
                        }
                    });

                    parts[i] = part;
                }
            }
            result = parts.join('"');

            // Handle array access - match both numeric and arithmetic expressions
            // This regex now captures expressions like (5), (I), or (I+1) after variables have been expanded
            result = result.replace(/(\w+)(\$|%)?(\s*\(([^)]+)\))/g, (fullMatch, varBase, suffix, parenPart, indexExpr) => {
                const varName = varBase + (suffix || '');

                // Skip known functions
                if (['RND', 'INT', 'ABS', 'SQR', 'CHR$', 'ASC', 'LEN', 'STR$', 'VAL', 'PEEK', 'LEFT$', 'RIGHT$', 'MID$'].includes(varName.toUpperCase())) {
                    return fullMatch;
                }

                // Auto-dimension array if not yet declared
                if (!this.arrays[varName]) {
                    const defaultValue = suffix === '$' ? '' : 0;
                    this.arrays[varName] = new Array(11).fill(defaultValue); // 0-10
                }

                // Try to evaluate the index expression as arithmetic
                try {
                    // Replace ^ with ** for JavaScript evaluation
                    const evalExpr = indexExpr.replace(/\^/g, '**');
                    const idx = parseInt(Function('"use strict"; return (' + evalExpr + ')')());
                    changed = true;
                    const value = this.arrays[varName][idx];
                    return (value !== undefined) ? value : (suffix === '$' ? '""' : 0);
                } catch (e) {
                    // If evaluation fails, return original match
                    return fullMatch;
                }
            });

            // RND(n) with numeric argument - Applesoft BASIC behavior
            // RND(1) or any positive = random float 0 to 1
            // RND(0) = repeat last (not implemented, just return new random)
            // RND(negative) = reseed (not implemented, just return new random)
            result = result.replace(/RND\s*\(\s*(-?[\d.]+)\s*\)/gi, (match, arg) => {
                changed = true;
                return Math.random(); // Returns 0 to 1 like Applesoft BASIC
            });

            // INT(n) with any expression argument
            result = result.replace(/INT\s*\(([^)]+)\)/gi, (match, arg) => {
                changed = true;
                try {
                    const evalExpr = arg.replace(/\^/g, '**');
                    const val = Function('"use strict"; return (' + evalExpr + ')')();
                    return Math.floor(parseFloat(val));
                } catch (e) {
                    return match; // Keep original if can't evaluate
                }
            });

            // ABS(n) with any expression argument
            result = result.replace(/ABS\s*\(([^)]+)\)/gi, (match, arg) => {
                changed = true;
                try {
                    const evalExpr = arg.replace(/\^/g, '**');
                    const val = Function('"use strict"; return (' + evalExpr + ')')();
                    return Math.abs(parseFloat(val));
                } catch (e) {
                    return match; // Keep original if can't evaluate
                }
            });

            // SQR(n) with any expression argument - square root
            result = result.replace(/SQR\s*\(([^)]+)\)/gi, (match, arg) => {
                changed = true;
                try {
                    const evalExpr = arg.replace(/\^/g, '**');
                    const val = Function('"use strict"; return (' + evalExpr + ')')();
                    return Math.sqrt(parseFloat(val));
                } catch (e) {
                    return match; // Keep original if can't evaluate
                }
            });

            // CHR$(n) with numeric argument
            result = result.replace(/CHR\$\s*\(\s*(-?\d+)\s*\)/gi, (match, arg) => {
                changed = true;
                const code = parseInt(arg);
                return '"' + String.fromCharCode(code) + '"';
            });

            // ASC(s$) with string argument
            result = result.replace(/ASC\s*\(\s*"([^"]*)"\s*\)/gi, (match, str) => {
                changed = true;
                return str.length > 0 ? str.charCodeAt(0) : 0;
            });

            // ASC with empty string variable (after variable substitution resulted in "")
            result = result.replace(/ASC\s*\(\s*""\s*\)/gi, (match) => {
                changed = true;
                return 0;
            });

            // LEN(s$) with string argument
            result = result.replace(/LEN\s*\(\s*"([^"]*)"\s*\)/gi, (match, str) => {
                changed = true;
                return str.length;
            });

            // STR$(n) with numeric argument
            result = result.replace(/STR\$\s*\(\s*(-?[\d.]+)\s*\)/gi, (match, arg) => {
                changed = true;
                return '"' + arg + '"';
            });

            // VAL(s$) with string argument
            result = result.replace(/VAL\s*\(\s*"([^"]*)"\s*\)/gi, (match, str) => {
                changed = true;
                return parseFloat(str) || 0;
            });

            // PEEK(addr) with numeric argument
            result = result.replace(/PEEK\s*\(\s*(-?\d+)\s*\)/gi, (match, arg) => {
                changed = true;
                const addr = parseInt(arg);
                return this.memory[addr] || 0;
            });

            // LEFT$(string, n) - get leftmost n characters
            result = result.replace(/LEFT\$\s*\(\s*"([^"]*)"\s*,\s*([^)]+)\s*\)/gi, (match, str, num) => {
                changed = true;
                const n = parseInt(num);
                if (isNaN(n)) return match; // Can't evaluate yet, keep original
                return '"' + str.substring(0, n) + '"';
            });

            // RIGHT$(string, n) - get rightmost n characters
            result = result.replace(/RIGHT\$\s*\(\s*"([^"]*)"\s*,\s*([^)]+)\s*\)/gi, (match, str, num) => {
                changed = true;
                const n = parseInt(num);
                if (isNaN(n)) return match; // Can't evaluate yet, keep original
                return '"' + str.substring(str.length - n) + '"';
            });

            // MID$(string, start, length) - get substring starting at position start (1-indexed)
            result = result.replace(/MID\$\s*\(\s*"([^"]*)"\s*,\s*([^,)]+)\s*,\s*([^)]+)\s*\)/gi, (match, str, start, len) => {
                changed = true;
                const startPos = parseInt(start) - 1; // Convert to 0-indexed
                const length = parseInt(len);
                if (isNaN(startPos) || isNaN(length)) return match; // Can't evaluate yet, keep original
                return '"' + str.substring(startPos, startPos + length) + '"';
            });

            // MID$(string, start) - get substring from start to end (1-indexed)
            result = result.replace(/MID\$\s*\(\s*"([^"]*)"\s*,\s*([^)]+)\s*\)/gi, (match, str, start) => {
                changed = true;
                const startPos = parseInt(start) - 1; // Convert to 0-indexed
                if (isNaN(startPos)) return match; // Can't evaluate yet, keep original
                return '"' + str.substring(startPos) + '"';
            });
        }

        return result;
    }

    evaluateCondition(condition) {
        // Handle OR conditions
        if (condition.includes(' OR ')) {
            const parts = condition.split(' OR ');
            for (const part of parts) {
                if (this.evaluateCondition(part.trim())) {
                    return true;
                }
            }
            return false;
        }

        // Handle AND conditions
        if (condition.includes(' AND ')) {
            const parts = condition.split(' AND ');
            for (const part of parts) {
                if (!this.evaluateCondition(part.trim())) {
                    return false;
                }
            }
            return true;
        }

        // Simple comparison evaluation
        const match = condition.match(/(.+?)(=|<>|<=|>=|<|>)(.+)/);
        if (match) {
            const left = this.evaluateExpression(match[1].trim());
            const operator = match[2];
            const right = this.evaluateExpression(match[3].trim());

            switch (operator) {
                case '=': return left == right;
                case '<>': return left != right;
                case '<': return parseFloat(left) < parseFloat(right);
                case '>': return parseFloat(left) > parseFloat(right);
                case '<=': return parseFloat(left) <= parseFloat(right);
                case '>=': return parseFloat(left) >= parseFloat(right);
            }
        }
        return false;
    }
}

// Initialize and run
const terminal = new BasicTerminal();

// Load preloaded programs and execute SYS_BOOT
(async () => {
    await terminal.loadPreloadedPrograms();
    await terminal.loadTestingPrograms();
    await terminal.execProgram('SYS_BOOT', true);
})();