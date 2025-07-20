// Terminal emulation class
class Terminal
{
    constructor()
    {
        this.fileSystem = new FileSystem();
        this.commandHistory = [];
        this.historyIndex = -1;
        this.currentInput = '';
        
        // DOM elements
        this.terminalOutput = document.getElementById('terminal-output');
        this.terminalInput = document.getElementById('terminal-input');
        this.terminalPrompt = document.getElementById('terminal-prompt');
        
        // Initialize
        this.init();
    }

    init()
    {
        // Set up event listeners
        this.terminalInput.addEventListener('keydown', (e) => this.handleKeyDown(e));
        this.terminalInput.addEventListener('input', (e) => this.handleInput(e));
        
        // Focus input on click anywhere in terminal
        document.getElementById('terminal').addEventListener
        ('click', () =>
            {
                this.terminalInput.focus();
            }
        );

        // Update prompt
        this.updatePrompt();
        
        // Auto-focus input
        this.terminalInput.focus();

        // Add welcome commands to history
        this.addToHistory('Welcome to Alexander Conn\'s Portfolio Terminal!');
        this.addToHistory('Type "help" for available commands or "cat README.md" to get started.');
    }

    handleKeyDown(e)
    {
        switch (e.key)
        {
            case 'Enter':
                e.preventDefault();
                this.executeCommand();
                break;
            case 'ArrowUp':
                e.preventDefault();
                this.navigateHistory(-1);
                break;
            case 'ArrowDown':
                e.preventDefault();
                this.navigateHistory(1);
                break;
            case 'Tab':
                e.preventDefault();
                this.handleTabCompletion();
                break;
            case 'l':
                if (e.ctrlKey)
                {
                    e.preventDefault();
                    this.clearTerminal();
                }
                break;
        }
    }

    handleInput(e)
    {
        this.currentInput = e.target.value;
    }

    executeCommand()
    {
        const command = this.terminalInput.value.trim();

        if (!command)
        {
            return;
        }

        // Add command to history
        this.commandHistory.push(command);
        this.historyIndex = this.commandHistory.length;

        // Display command in output
        this.addCommandLine(command);

        // Parse and execute command
        const result = this.parseCommand(command);
        if (result)
        {
            this.addOutput(result.output, result.type);
        }

        // Clear input and update prompt
        this.terminalInput.value = '';
        this.currentInput = '';
        this.updatePrompt();
        
        // Scroll to bottom
        this.scrollToBottom();
    }

    parseCommand(commandString)
    {
        const parts = commandString.trim().split(/\s+/);
        const command = parts[0].toLowerCase();
        const args = parts.slice(1);

        switch (command)
        {
            case 'help':
                return this.helpCommand();
            case 'ls':
                return this.lsCommand(args);
            case 'cd':
                return this.cdCommand(args);
            case 'cat':
                return this.catCommand(args);
            case 'pwd':
                return this.pwdCommand();
            case 'clear':
                return this.clearCommand();
            case 'whoami':
                return this.whoamiCommand();
            case 'date':
                return this.dateCommand();
            case 'echo':
                return this.echoCommand(args);
            case 'tree':
                return this.treeCommand();
            case 'matrix':
                return this.matrixCommand();
            case 'sudo':
                return this.sudoCommand(args);
            case 'exit':
                return this.exitCommand();
            case 'neofetch':
                return this.neofetchCommand();
            default:
                return{
                    output: `bash: ${command}: command not found\n\nDid you mean one of these?\n  help, ls, cd, cat, pwd, clear, whoami, date, echo, tree\n\nType 'help' for a full list of available commands.`,
                    type: 'error'
                };
        }
    }

    // Command implementations
    helpCommand()
    {
        return{
            output:
`Available Commands:

Navigation:
  ls [path]          List directory contents
  cd [path]          Change directory (use .. for parent, ~ for home)
  pwd                Show current directory path
  tree               Display directory tree structure

File Operations:
  cat <file>         Display file contents

System:
  whoami             Display current user
  date               Show current date and time
  clear              Clear terminal screen
  echo <text>        Display text

Information:
  help               Show this help message
  neofetch           Display system information

Special:
  matrix             Enter the matrix... 
  sudo [command]     Execute command with elevated privileges
  exit               Close terminal

Navigation Tips:
  - Use 'cd projects' to explore my work
  - Try 'cat about.txt' to learn more about me
  - Use Tab for auto-completion
  - Use ↑/↓ arrows for command history
  - Use Ctrl+L to clear screen

Easter Eggs:
  Try exploring hidden files with 'ls -a' 🕵️`,
            type: 'info'
        };
    }

    lsCommand(args)
    {
        const showHidden = args.includes('-a') || args.includes('-la');
        const path = args.find(arg => !arg.startsWith('-')) || '';
        
        const result = this.fileSystem.ls(path, showHidden);
        
        if (!result.success)
        {
            return { output: result.message, type: 'error' };
        }

        if (result.files.length === 0)
        {
            return { output: '', type: 'success' };
        }

        // Format file listing
        let output = '';
        result.files.forEach
        (file =>
            {
                let className = '';
                let icon = '';
                
                if (file.type === 'directory')
                {
                    className = 'directory';
                    icon = '📁 ';
                }
                else if (file.executable)
                {
                    className = 'executable';
                    icon = '⚡ ';
                }
                else if (file.hidden)
                {
                    className = 'hidden';
                    icon = '👻 ';
                }
                else
                {
                    icon = '📄 ';
                }
                
                output += `${icon}${file.name}\n`;
            }
        );

        return { output: output.trim(), type: 'success' };
    }

    cdCommand(args)
    {
        const path = args[0] || '';
        const result = this.fileSystem.cd(path);
        
        if (!result.success)
        {
            return { output: result.message, type: 'error' };
        }

        this.updatePrompt();
        return null; // No output for successful cd
    }

    catCommand(args)
    {
        if (args.length === 0)
        {
            return { output: 'cat: missing file operand\nTry \'cat --help\' for more information.', type: 'error' };
        }

        const result = this.fileSystem.cat(args[0]);
        
        if (!result.success)
        {
            return { output: result.message, type: 'error' };
        }

        return { output: result.content, type: 'success' };
    }

    pwdCommand()
    {
        const result = this.fileSystem.pwd();
        return { output: result.path, type: 'success' };
    }

    clearCommand()
    {
        this.clearTerminal();
        return null;
    }

    whoamiCommand()
    {
        return { output: 'alex', type: 'success' };
    }

    dateCommand()
    {
        const now = new Date();
        return{
            output:
now.toString(), 
            type: 'info' 
        };
    }

    echoCommand(args)
    {
        return{
            output:
args.join(' '), 
            type: 'success' 
        };
    }

    treeCommand()
    {
        const tree = this.fileSystem.generateTree();
        return{
            output:
this.fileSystem.currentPath + '/\n' + tree, 
            type: 'info' 
        };
    }

    matrixCommand()
    {
        this.createMatrixEffect();
        return{
            output:
'The Matrix has you... 🔴💊\nFollow the white rabbit.\n\n> Wake up, Neo...', 
            type: 'success' 
        };
    }

    sudoCommand(args)
    {
        if (args.length === 0)
        {
            return{
                output:
`sudo: a command is required
Try 'sudo help' for more information.

[sudo] password for alex: `,
                type: 'warning'
            };
        }

        const command = args.join(' ');
        return{
            output: 
`[sudo] password for alex: ********

Permission granted! Executing: ${command}
Just kidding! This is a simulated terminal. 😄
All commands here run with 'user' privileges only.

But hey, nice try! 🕵️`,
            type: 'warning'
        };
    }

    exitCommand()
    {
        return{
            output:
`Goodbye! 👋

Thanks for exploring my portfolio terminal!

To continue browsing:
• Visit my main website: https://alexanderconn.com
• Check out my projects: https://alexanderconn.com/projects
• Contact me: work@alexanderconn.com

Connection to portfolio-terminal closed.`,
            type: 'info'
        };
    }

    neofetchCommand()
    {
        return {
            output: 
`                    ╭─────────────────────────────╮
     ██████╗        │ alex@portfolio-terminal     │
   ██╔═════██╗      │ ─────────────────────────── │
  ██╔═══════██║     │ OS: Portfolio Linux v1.0   │
 ██╔═════════██║    │ Kernel: JavaScript-Engine  │
 ██╔═════════██║    │ Uptime: Running since 2024 │
 ██╔═════════██║    │ Shell: portfolio-bash       │
  ██╔═══════██╔╝    │ Terminal: web-terminal      │
   ██╔═════██╔╝     │ CPU: Creativity Processor   │
     ██████╔╝       │ Memory: ∞ GB (imagination)  │
                     │ Resolution: Any x Anything  │
                     │ Theme: Matrix Green         │
                     ╰─────────────────────────────╯

System Information:
• Developer: Alexander JD Conn
• Specialization: Game Development & Web Apps
• Current Project: D&D Character Creator
• Coffee Consumption: High ☕
• Passion Level: Maximum 🚀`,
            type: 'info'
        };
    }

    // Utility methods
    addCommandLine(command)
    {
        const commandLine = document.createElement('div');
        commandLine.className = 'command-line';
        
        const prompt = document.createElement('span');
        prompt.className = 'prompt';
        prompt.textContent = this.getCurrentPrompt();
        
        const commandSpan = document.createElement('span');
        commandSpan.className = 'command';
        commandSpan.textContent = ' ' + command;
        
        commandLine.appendChild(prompt);
        commandLine.appendChild(commandSpan);
        this.terminalOutput.appendChild(commandLine);
    }

    addOutput(content, type = 'success')
    {
        if (!content)
        {
            return;
        }
        
        const output = document.createElement('div');
        output.className = `output ${type}`;
        output.style.whiteSpace = 'pre-wrap';
        output.textContent = content;
        this.terminalOutput.appendChild(output);
    }

    addToHistory(message)
    {
        const historyItem = document.createElement('div');
        historyItem.className = 'output info';
        historyItem.textContent = message;
        this.terminalOutput.appendChild(historyItem);
    }

    navigateHistory(direction)
    {
        if (this.commandHistory.length === 0)
        {
            return;
        }

        this.historyIndex += direction;
        
        if (this.historyIndex < 0)
        {
            this.historyIndex = 0;
        }
        else if (this.historyIndex >= this.commandHistory.length)
        {
            this.historyIndex = this.commandHistory.length;
            this.terminalInput.value = this.currentInput;
            return;
        }

        this.terminalInput.value = this.commandHistory[this.historyIndex];
    }

    handleTabCompletion()
    {
        const input = this.terminalInput.value;
        const parts = input.split(' ');
        const lastPart = parts[parts.length - 1];

        // Command completion
        if (parts.length === 1)
        {
            const commands = 
            [
                'help',
                'ls',
                'cd',
                'cat',
                'pwd',
                'clear',
                'whoami',
                'date',
                'echo',
                'tree',
                'matrix',
                'sudo',
                'exit',
                'neofetch'
            ];

            const matches = commands.filter(cmd => cmd.startsWith(lastPart));
            
            if (matches.length === 1)
            {
                this.terminalInput.value = matches[0] + ' ';
            } 
            else if (matches.length > 1)
            {
                this.addOutput('Available completions:\n' + matches.join(', '), 'info');
                this.scrollToBottom();
            }
        }
        // File/directory completion could be added here
    }

    updatePrompt()
    {
        const path = this.fileSystem.currentPath;
        const shortPath = path === '/home/alex' ? '~' : path.replace('/home/alex', '~');
        this.terminalPrompt.textContent = `alex@portfolio:${shortPath}$`;
    }

    getCurrentPrompt()
    {
        return this.terminalPrompt.textContent;
    }

    clearTerminal()
    {
        this.terminalOutput.innerHTML = '';
    }

    scrollToBottom()
    {
        const terminalBody = document.getElementById('terminal');
        terminalBody.scrollTop = terminalBody.scrollHeight;
    }

    createMatrixEffect()
    {
        const chars = 'アカサタナハマヤラワガザダバパイキシチニヒミリウィクスツヌフムユルグズヅブプエケセテネヘメレヱゲゼデベペオコソトノホモヨロヲゴゾドボポ01';
        const container = document.getElementById('terminal');
        
        for (let i = 0; i < 50; i++)
            {
            setTimeout(() =>
            {
                const char = document.createElement('span');
                char.className = 'matrix-char';
                char.textContent = chars[Math.floor(Math.random() * chars.length)];
                char.style.left = Math.random() * 100 + '%';
                char.style.animationDelay = Math.random() * 2 + 's';
                container.appendChild(char);
                
                setTimeout(() => 
                {
                    if (char.parentNode) {
                        char.parentNode.removeChild(char);
                    }
                }, 3000);
            }, i * 100);
        }
    }
}

// Initialize terminal when DOM is loaded
document.addEventListener('DOMContentLoaded', () =>
{
    new Terminal();
});

// Prevent context menu on right click for immersion
document.addEventListener('contextmenu', (e) =>
{
    e.preventDefault();
});

// Add some fun keyboard shortcuts
document.addEventListener('keydown', (e) =>
{
    // Konami code easter egg
    if (e.code === 'KeyK' && e.ctrlKey && e.shiftKey)
    {
        console.log('🎮 Konami code detected! But this isn\'t a game... or is it? 😉');
    }
});
