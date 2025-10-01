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
        this.currentInput = null;
        this.callStack = [];
        this.imagePosition = null; // 'left', 'right', or null
        this.preloadedPrograms = {}; // Will be populated from JSON

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

            // Look for h:VAR$ pattern (highlighted variable)
            const highlightVarMatch = remaining.match(/^h:(\w+\$?)/);
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
            const varMatch = remaining.match(/^(\w+\$?)/);
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

    getAutocompleteOptions(partialCommand) {
        const commands = ['HELP', 'SNAKE', 'CALC', 'GUESS', 'ABOUT', 'CLEAR', 'NEW', 'LIST', 'RUN', 'EDIT',
                         'SAVE', 'LOAD', 'EXEC', 'DIR', 'DELETE', 'IMAGE', 'SETCOL', 'CLEARCOL',
                         'PRINT', 'INPUT', 'LET', 'GOTO', 'IF', 'THEN', 'FOR', 'NEXT', 'GOSUB', 'RETURN', 'REM', 'END'];

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
                if (e.key === 'Enter') {
                    e.preventDefault();
                    const value = input.textContent;
                    input.remove();
                    inputLine.textContent = value;
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
            await this.showHelp();
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
        } else if (upperCommand === 'SNAKE') {
            await this.startSnakeGame();
        } else if (upperCommand === 'CLEAR' || upperCommand === 'CLS') {
            this.clearScreen();
        } else if (upperCommand === 'ABOUT') {
            await this.showAbout();
        } else if (upperCommand === 'CALC') {
            await this.startCalculator();
        } else if (upperCommand === 'GUESS') {
            await this.startGuessingGame();
        } else if (upperCommand === '') {
            // Do nothing for empty command
        } else {
            await this.typeOutput(`?SYNTAX ERROR: UNKNOWN COMMAND "${command}"`);
            await this.typeOutput('TYPE "HELP" FOR AVAILABLE COMMANDS');
        }
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

    async showHelp() {
        await this.typeOutput('AVAILABLE COMMANDS:');
        await this.typeOutput('');
        await this.typeOutput('BASIC PROGRAMMING:');
        await this.typeOutput('  NEW    - START NEW PROGRAM');
        await this.typeOutput('  LIST   - LIST CURRENT PROGRAM');
        await this.typeOutput('  RUN    - EXECUTE PROGRAM');
        await this.typeOutput('  EDIT [NUM] - EDIT EXISTING LINE');
        await this.typeOutput('  [NUM] [CODE] - ADD/EDIT LINE');
        await this.typeOutput('  [NUM]  - DELETE LINE');
        await this.typeOutput('');
        await this.typeOutput('FILE MANAGEMENT:');
        await this.typeOutput('  SAVE <NAME>   - SAVE PROGRAM');
        await this.typeOutput('  LOAD <NAME>   - LOAD PROGRAM');
        await this.typeOutput('  EXEC <NAME>   - RUN SAVED PROGRAM');
        await this.typeOutput('  DIR / CATALOG - LIST SAVED FILES');
        await this.typeOutput('  DELETE <NAME> - DELETE PROGRAM');
        await this.typeOutput('');
        await this.typeOutput('UTILITIES:');
        await this.typeOutput('  HELP   - SHOW THIS MESSAGE');
        await this.typeOutput('  SNAKE  - PLAY SNAKE GAME');
        await this.typeOutput('  CALC   - CALCULATOR');
        await this.typeOutput('  GUESS  - GUESSING GAME');
        await this.typeOutput('  ABOUT  - ABOUT TERMINAL');
        await this.typeOutput('  CLEAR  - CLEAR SCREEN');
        await this.typeOutput('');
        await this.typeOutput('BASIC COMMANDS:');
        await this.typeOutput('  PRINT, INPUT, LET, IF...THEN');
        await this.typeOutput('  FOR...NEXT, GOTO, GOSUB');
        await this.typeOutput('  RETURN, REM, END');
        await this.typeOutput('');
        await this.typeOutput('IMAGE COMMANDS:');
        await this.typeOutput('  IMAGE "PATH" [W] [SPD] [POS]');
        await this.typeOutput('  SETCOL LEFT/RIGHT/NONE');
        await this.typeOutput('  CLEARCOL - CLEAR FLOAT');
        await this.typeOutput('');
        await this.typeOutput('TIP: HOLD SHIFT TO SPEED UP');
        await this.typeOutput('     CLICK ANYWHERE TO FOCUS');
        await this.typeOutput('');
    }

    async showAbout() {
        await this.typeOutput('APPLESOFT BASIC SIMULATOR v1.0');
        await this.typeOutput('');
        await this.typeOutput('A NOSTALGIC RECREATION OF 1980s');
        await this.typeOutput('TERMINAL COMPUTING EXPERIENCE.');
        await this.typeOutput('');
        await this.typeOutput('FEATURING CRT AESTHETICS AND');
        await this.typeOutput('AUTHENTIC TYPING ANIMATIONS.');
        await this.typeOutput('');
    }

    clearScreen() {
        this.screen.innerHTML = '';
    }

    async startSnakeGame() {
        await this.typeOutput('STARTING SNAKE GAME...');
        await this.typeOutput('USE W/A/S/D TO MOVE');
        await this.typeOutput('PRESS ESC TO QUIT');
        await this.typeOutput('');

        const gameArea = document.createElement('div');
        gameArea.className = 'terminal-line';
        gameArea.style.fontFamily = 'monospace';
        this.screen.appendChild(gameArea);

        const width = 30;
        const height = 15;
        let snake = [{ x: 15, y: 7 }, { x: 14, y: 7 }, { x: 13, y: 7 }];
        let direction = { x: 1, y: 0 };
        let food = { x: 20, y: 7 };
        let score = 0;
        let gameRunning = true;
        let nextDirection = { x: 1, y: 0 };

        const drawGame = () => {
            let display = '';
            for (let y = 0; y < height; y++) {
                for (let x = 0; x < width; x++) {
                    if (x === 0 || x === width - 1 || y === 0 || y === height - 1) {
                        display += '#';
                    } else if (snake.some(seg => seg.x === x && seg.y === y)) {
                        display += snake[0].x === x && snake[0].y === y ? '@' : 'o';
                    } else if (food.x === x && food.y === y) {
                        display += '*';
                    } else {
                        display += ' ';
                    }
                }
                display += '\n';
            }
            display += `SCORE: ${score}`;
            gameArea.textContent = display;
            this.scrollToBottom();
        };

        const keyHandler = (e) => {
            if (e.key === 'Escape') {
                gameRunning = false;
                document.removeEventListener('keydown', keyHandler);
                return;
            }

            const key = e.key.toLowerCase();
            if (key === 'w' && direction.y === 0) nextDirection = { x: 0, y: -1 };
            else if (key === 's' && direction.y === 0) nextDirection = { x: 0, y: 1 };
            else if (key === 'a' && direction.x === 0) nextDirection = { x: -1, y: 0 };
            else if (key === 'd' && direction.x === 0) nextDirection = { x: 1, y: 0 };
        };

        document.addEventListener('keydown', keyHandler);

        const gameLoop = async () => {
            if (!gameRunning) {
                await this.typeOutput('');
                await this.typeOutput(`GAME OVER! FINAL SCORE: ${score}`);
                await this.typeOutput('');
                return;
            }

            direction = nextDirection;
            const head = { x: snake[0].x + direction.x, y: snake[0].y + direction.y };

            if (head.x <= 0 || head.x >= width - 1 ||
                head.y <= 0 || head.y >= height - 1 ||
                snake.some(seg => seg.x === head.x && seg.y === head.y)) {
                gameRunning = false;
                document.removeEventListener('keydown', keyHandler);
                await this.typeOutput('');
                await this.typeOutput(`GAME OVER! FINAL SCORE: ${score}`);
                await this.typeOutput('');
                return;
            }

            snake.unshift(head);

            if (head.x === food.x && head.y === food.y) {
                score += 10;
                food = {
                    x: Math.floor(Math.random() * (width - 2)) + 1,
                    y: Math.floor(Math.random() * (height - 2)) + 1
                };
            } else {
                snake.pop();
            }

            drawGame();
            setTimeout(gameLoop, 150);
        };

        drawGame();
        setTimeout(gameLoop, 150);
    }

    async startCalculator() {
        await this.typeOutput('SIMPLE CALCULATOR');
        await this.typeOutput('ENTER EXPRESSION (E.G., 5+3*2)');
        await this.typeOutput('OR TYPE "EXIT" TO QUIT');
        await this.typeOutput('');

        const calcLoop = async () => {
            const expr = await this.getInput();

            if (expr.trim().toUpperCase() === 'EXIT') {
                await this.typeOutput('');
                return;
            }

            try {
                // Simple safe evaluation - only allow numbers and basic operators
                if (!/^[\d+\-*/(). ]+$/.test(expr)) {
                    await this.typeOutput('?SYNTAX ERROR: INVALID EXPRESSION');
                } else {
                    const result = Function('"use strict"; return (' + expr + ')')();
                    await this.typeOutput(`= ${result}`);
                }
            } catch (e) {
                await this.typeOutput('?SYNTAX ERROR');
            }

            await this.typeOutput('');
            await calcLoop();
        };

        await calcLoop();
    }

    async startGuessingGame() {
        const target = Math.floor(Math.random() * 100) + 1;
        let attempts = 0;

        await this.typeOutput('NUMBER GUESSING GAME');
        await this.typeOutput("I'M THINKING OF A NUMBER");
        await this.typeOutput('BETWEEN 1 AND 100');
        await this.typeOutput('');

        const guessLoop = async () => {
            const guess = await this.getInput();
            const num = parseInt(guess);

            if (isNaN(num)) {
                await this.typeOutput('?INVALID NUMBER');
                await guessLoop();
                return;
            }

            attempts++;

            if (num === target) {
                await this.typeOutput('');
                await this.typeOutput(`CORRECT! YOU GOT IT IN ${attempts} TRIES!`);
                await this.typeOutput('');
                return;
            } else if (num < target) {
                await this.typeOutput('TOO LOW! TRY AGAIN.');
            } else {
                await this.typeOutput('TOO HIGH! TRY AGAIN.');
            }

            await guessLoop();
        };

        await guessLoop();
    }

    async runProgram() {
        const lineNumbers = Object.keys(this.programLines).map(Number).sort((a, b) => a - b);
        let i = 0;
        this.callStack = [];

        while (i < lineNumbers.length) {
            const lineNum = lineNumbers[i];
            const command = this.programLines[lineNum];

            const result = await this.executeCommand(command, lineNumbers, i);

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
    }

    async executeCommand(command, lineNumbers, currentIndex) {
        command = command.trim();

        // PRINT command
        if (command.startsWith('PRINT ')) {
            const content = command.substring(6);

            // Check if content contains h: syntax for highlighting
            if (content.includes('h:')) {
                const output = this.parseHighlightedText(content);
                await this.typeOutput(output, true);
            } else {
                const output = this.evaluateExpression(content);
                await this.typeOutput(output);
            }
            return null;
        }

        // INPUT command
        if (command.startsWith('INPUT ')) {
            const match = command.match(/INPUT\s+"([^"]+)";\s*(\w+\$?)/i) ||
                command.match(/INPUT\s+(\w+\$?)/i);

            if (match) {
                if (match.length === 3) {
                    await this.typeOutput(match[1]);
                    const value = await this.getInput();
                    this.variables[match[2]] = value;
                } else {
                    const value = await this.getInput();
                    this.variables[match[1]] = value;
                }
            }
            return null;
        }

        // LET command (or implicit assignment)
        if (command.startsWith('LET ') || command.match(/^\w+\$?\s*=/)) {
            const assignMatch = command.match(/(?:LET\s+)?(\w+\$?)\s*=\s*(.+)/i);
            if (assignMatch) {
                const varName = assignMatch[1];
                const value = this.evaluateExpression(assignMatch[2]);
                this.variables[varName] = value;
            }
            return null;
        }

        // FOR...NEXT loop
        if (command.startsWith('FOR ')) {
            const forMatch = command.match(/FOR\s+(\w+)\s*=\s*(.+)\s+TO\s+(.+)(?:\s+STEP\s+(.+))?/i);
            if (forMatch) {
                const varName = forMatch[1];
                const startVal = parseFloat(this.evaluateExpression(forMatch[2]));
                const endVal = parseFloat(this.evaluateExpression(forMatch[3]));
                const stepVal = forMatch[4] ? parseFloat(this.evaluateExpression(forMatch[4])) : 1;

                this.variables[varName] = startVal;
                this.loopStack.push({
                    varName,
                    endVal,
                    stepVal,
                    startIndex: currentIndex
                });
            }
            return null;
        }

        if (command === 'NEXT' || command.startsWith('NEXT ')) {
            if (this.loopStack.length > 0) {
                const loop = this.loopStack[this.loopStack.length - 1];
                this.variables[loop.varName] = parseFloat(this.variables[loop.varName]) + loop.stepVal;

                const current = parseFloat(this.variables[loop.varName]);
                const shouldContinue = loop.stepVal > 0 ? current <= loop.endVal : current >= loop.endVal;

                if (shouldContinue) {
                    return { type: 'GOTO', lineNumber: lineNumbers[loop.startIndex] };
                } else {
                    this.loopStack.pop();
                }
            }
            return null;
        }

        // GOSUB command
        if (command.startsWith('GOSUB ')) {
            const lineNumber = parseInt(command.substring(6));
            this.callStack.push(currentIndex);
            return { type: 'GOTO', lineNumber };
        }

        // RETURN command
        if (command === 'RETURN') {
            return { type: 'RETURN' };
        }

        // IF...THEN command
        if (command.startsWith('IF ')) {
            const ifMatch = command.match(/IF\s+(.+)\s+THEN\s+(.+)/i);
            if (ifMatch) {
                const condition = ifMatch[1];
                const thenPart = ifMatch[2];

                if (this.evaluateCondition(condition)) {
                    if (thenPart.match(/^\d+$/)) {
                        return { type: 'GOTO', lineNumber: parseInt(thenPart) };
                    } else {
                        return await this.executeCommand(thenPart, lineNumbers, currentIndex);
                    }
                }
            }
            return null;
        }

        // GOTO command
        if (command.startsWith('GOTO ')) {
            const lineNumber = parseInt(command.substring(5));
            return { type: 'GOTO', lineNumber };
        }

        // END command
        if (command === 'END') {
            return { type: 'END' };
        }

        // IMAGE command
        if (command.startsWith('IMAGE ')) {
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
        if (command.startsWith('SETCOL ')) {
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
        if (command === 'CLEARCOL') {
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
        if (command.startsWith('REM ')) {
            return null;
        }

        return null;
    }

    evaluateExpression(expr) {
        expr = expr.trim();

        // Handle string literals
        const stringMatch = expr.match(/^"([^"]*)"$/);
        if (stringMatch) {
            return stringMatch[1];
        }

        // Handle concatenation
        const parts = expr.split(/;\s*/);
        let result = '';

        for (const part of parts) {
            const trimmed = part.trim();

            if (trimmed.startsWith('"') && trimmed.endsWith('"')) {
                result += trimmed.slice(1, -1);
            } else if (this.variables[trimmed] !== undefined) {
                result += this.variables[trimmed];
            } else if (!isNaN(trimmed)) {
                result += trimmed;
            } else {
                result += trimmed;
            }
        }

        return result;
    }

    evaluateCondition(condition) {
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
    await terminal.execProgram('SYS_BOOT', true);
})();