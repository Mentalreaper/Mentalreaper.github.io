// Virtual filesystem for the terminal emulation
class FileSystem 
{
    constructor()
    {
        this.currentPath = '/home/alex';
        this.fileSystem =
        {
            '/':
            {
                type: 'directory',
                contents:
                {
                    'home':
                    {
                        type: 'directory',
                        contents:
                        {
                            'alex':
                            {
                                type: 'directory',
                                contents:
                                {
                                    'README.md':
                                    {
                                        type: 'file',
                                        content:
`# Welcome to Alexander Conn's Portfolio Terminal

This is an interactive terminal emulation.

## Available Commands:
- ls: List directory contents
- cd: Change directory
- cat: Display file contents
- pwd: Show current directory
- help: Show available commands
- clear: Clear terminal
- whoami: Display current user
- date: Show current date/time
- echo: Display text
- tree: Show directory tree

## Navigation:
Use 'cd projects' to explore my work!

Visit my website: https://alexanderconn.com
Contact: work@alexanderconn.com`
                                    },
                                    'about.txt':
                                    {
                                        type: 'file',
                                        content:
`Alexander JD Conn - Game Developer & Software Engineer

I enjoy RPGs, Card Games, and making those types of games.
I'm usually working on some small project and writing wayyy too much 
world building for the few characters there!

Current Focus:
- Unity/Godot Game Development
- Digital Art
- Making fun little projects on my ArchLinux laptop

Skills: C, C++, C#, Unity, HTML/CSS/JavaScript, Git, Linux
Education: Computer Games Programming at Kingston University

"Built with too much time on my hands"`
                                    },
                                    'contact.txt':
                                    {
                                        type: 'file',
                                        content:
`Contact Information:

Email: work@alexanderconn.com
Twitter: @MentalReaper_GD
GitHub: Mentalreaper
YouTube: @alex-conn
Website: https://alexanderconn.com
LinkTree: https://linktr.ee/alexanderconn

Available for:
- Game development projects
- Web application development
- Freelance programming
- Collaboration opportunities

Response time: Usually within 24-48 hours`
                                    },
                                    'projects':
                                    {
                                        type: 'directory',
                                        contents:
                                        {
                                            'games':
                                            {
                                                type: 'directory',
                                                contents:
                                                {
                                                    'battlerots.md':
                                                    {
                                                        type: 'file',
                                                        content:
`# Battlerots
A University group project for a multiplayer game made in Unity.

## Description:
Inspired by Medabots, this is a real-time third-person shooter game featuring robots battling in an arena. Though we planned for a customisation feature, it was never implemented in time for the deadline of the project.

## Features:
- Third-person shooter gameplay
- Limb-based damage system
- Multiplayer gameplay
- Unity networking implementation

## Role:
We split the responsibilities quite evenly, but I programmed a lot of the netcode, and shooting / synchronisation

## Status: Completed (University Project)
## Technologies: Unity, C#, Networking`
                                                    },
                                                    'bear-grills.md':
                                                    {
                                                        type: 'file',
                                                        content:
`# Bear Grills
VR Group project at University - A bear chef grills for his robo customers.

## Description:
A quirky VR cooking game where you play as a bear chef running a grill restaurant for robot customers.

## Features:
- VR cooking mechanics
- Customer service simulation
- Time management gameplay
- Humorous character interactions

## Role:
VR interaction programmer
Implemented cooking mechanics and customer AI

## Status: Completed (University Project)
## Technologies: Unity, C#, VR (Oculus)`
                                                    },
                                                    'blade-of-roland.md':
                                                    {
                                                        type: 'file',
                                                        content:
`# Blade of Roland
Personal RPG project (Currently Suspended)

## Description:
An ambitious RPG project featuring deep character customization
and narrative-driven gameplay.

## Planned Features:
- Extensive character creation
- Branching storylines
- Combat system with strategic elements
- Rich world-building

## Status: Suspended
Reason: Focusing on smaller projects to build skills

## Technologies: Unity, C#
## Lessons Learned: Scope management is crucial!`
                                                    }
                                                }
                                            },
                                            'web-apps':
                                            {
                                                type: 'directory',
                                                contents:
                                                {
                                                    'dnd5e-character-creator.md':
                                                    {
                                                        type: 'file',
                                                        content:
`# D&D 5e Character Creator
Web-based character creation tool for Dungeons & Dragons 5th Edition.

## Features:
- Complete character creation wizard
- Race, class, and background selection
- Ability score generation (multiple methods)
- Skill proficiency calculation
- Equipment selection
- Character sheet export (PDF/Print)
- Local storage for character management

## Technologies:
- Vanilla JavaScript
- HTML5/CSS3
- JSON data management
- Local Storage API
- Print CSS for character sheets

## Live Demo: Available on my portfolio site
## Status: Active Development

This project showcases my ability to create complex,
data-driven web applications without frameworks.`
                                                    },
                                                    'pathfinder-tools.md':
                                                    {
                                                        type: 'file',
                                                        content:
`# Pathfinder Character Tools
Collection of character creation tools for Pathfinder RPG systems.

## Tools Include:
- Pathfinder 1e Character Creator
- Pathfinder 2e Character Creator
- Equipment calculators
- Spell reference tools

## Features:
- Rule-accurate character generation
- Complex calculation handling
- Responsive design
- Data export capabilities

## Status: In Development
## Technologies: JavaScript, HTML/CSS, JSON`
                                                    },
                                                    'card-collection-apps.md':
                                                    {
                                                        type: 'file',
                                                        content:
`# Trading Card Collection Apps
Web applications for managing trading card collections.

## Applications:
- Magic: The Gathering Collection Tracker
- Yu-Gi-Oh! Collection Manager

## Features:
- Card database integration
- Collection tracking
- Value estimation
- Deck building tools
- Import/Export functionality

## Technologies:
- RESTful API integration
- JavaScript ES6+
- Local Storage
- Responsive design

## Status: Prototype Phase
## Goal: Help players organize their collections efficiently`
                                                    }
                                                }
                                            },
                                            'university':
                                            {
                                                type: 'directory',
                                                contents:
                                                {
                                                    'year1-projects.txt':
                                                    {
                                                        type: 'file',
                                                        content:
`University Year 1 Projects:

1. Programming Fundamentals
   - Basic C++ console applications
   - Algorithm implementations
   - Data structure exercises

2. Game Design Principles
   - Paper prototype designs
   - Game analysis documents
   - Mechanic design workshops

3. Mathematics for Games
   - Vector calculations
   - Matrix transformations
   - Physics simulations

Key Learning: Foundation programming concepts
Grade: First Class Honours`
                                                    },
                                                    'year2-projects.txt':
                                                    {
                                                        type: 'file',
                                                        content:
`University Year 2 Projects:

1. Object-Oriented Programming
   - C++ class design
   - Design pattern implementations
   - Memory management

2. Game Engine Architecture
   - Custom 2D engine development
   - Component-based systems
   - Resource management

3. Graphics Programming
   - OpenGL basics
   - Shader programming
   - 3D mathematics

Key Learning: Advanced programming and engine concepts
Grade: First Class Honours`
                                                    },
                                                    'year3-projects.txt':
                                                    {
                                                        type: 'file',
                                                        content:
`University Year 3 Projects:

1. Final Year Project: Battlerots
   - Team leadership
   - Agile development
   - Unity networking
   - Project management

2. Advanced Graphics
   - Physically-based rendering
   - Advanced shader techniques
   - Performance optimization

3. AI for Games
   - Pathfinding algorithms
   - Behavior trees
   - Machine learning basics

Key Learning: Industry-standard practices and teamwork
Expected Grade: First Class Honours`
                                                    }
                                                }
                                            }
                                        }
                                    },
                                    'skills':
                                    {
                                        type: 'directory',
                                        contents:
                                        {
                                            'programming.txt':
                                            {
                                                type: 'file',
                                                content:
`Programming Skills:

Languages:
★★★★★ C# (Unity, .NET)
★★★★☆ JavaScript (ES6+, Node.js)
★★★★☆ HTML5 & CSS3
★★★☆☆ C++ (Game Engine Development)
★★★☆☆ Python (Scripting, Tools)
★★☆☆☆ SQL (Database Management)

Frameworks & Tools:
- Unity 3D/2D Game Engine
- Git Version Control
- Visual Studio / VS Code
- Blender (Basic Modeling)
- Photoshop (UI Design)

Development Practices:
- Object-Oriented Programming
- Design Patterns (Singleton, Observer, MVC)
- Agile Development
- Code Review
- Documentation`
                                            },
                                            'game-dev.txt':
                                            {
                                                type: 'file',
                                                content:
`Game Development Skills:

Core Areas:
- Gameplay Programming
- UI/UX Design for Games
- Game Architecture
- Performance Optimization
- Networking (Multiplayer)

Specialized Knowledge:
- RPG Systems Design
- Character Creation Systems
- Turn-based Combat
- Inventory Management
- Save/Load Systems

Tools & Engines:
- Unity (Primary)
- Git for Version Control
- JSON for Data Management
- RESTful APIs

Game Design:
- Mechanics Design
- Balance Testing
- User Experience
- Paper Prototyping`
                                            },
                                            'web-dev.txt':
                                            {
                                                type: 'file',
                                                content:
`Web Development Skills:

Frontend:
- Vanilla JavaScript (Preferred)
- HTML5 Semantic Markup
- CSS3 (Grid, Flexbox, Animations)
- Responsive Design
- Progressive Web Apps

Backend Basics:
- Node.js fundamentals
- API consumption
- Database basics
- Server deployment

Specialized:
- Single Page Applications
- Local Storage Management
- File I/O in Browsers
- Print Stylesheets
- CSS Custom Properties
- Mobile-First Design

Philosophy:
"Keep it simple, make it work, then make it better"`
                                            }
                                        }
                                    },
                                    '.profile':
                                    {
                                        type: 'file',
                                        hidden: true,
                                        content:
`# Alex's Terminal Profile
export USER="alex"
export HOME="/home/alex"
export PATH="/usr/bin:/bin:/usr/local/bin"

# Aliases
alias ll='ls -la'
alias la='ls -la'
alias ..='cd ..'
alias ...='cd ../..'
alias code='echo "Opening VS Code... (not really, this is just a simulation!)"'
alias unity='echo "Starting Unity... (this terminal doesnt actually have Unity installed)"'

# Welcome message
echo "Welcome back, Alex! Ready to build something awesome?"
echo "Current projects: D&D Character Creator, Terminal Emulation"
echo ""

# Fun fact of the day
echo "💡 Did you know? This terminal is built with vanilla JavaScript!"
`
                                    },
                                    '.bashrc':
                                    {
                                        type: 'file',
                                        hidden: true,
                                        content: 
`# Alex's Bash Configuration
# This file is sourced for interactive bash sessions

# History settings
HISTSIZE=1000
HISTFILESIZE=2000

# Terminal colors
export CLICOLOR=1
export LSCOLORS=GxFxCxDxBxegedabagaced

# Prompt customization
PS1='\\[\\033[01;32m\\]alex@portfolio\\[\\033[00m\\]:\\[\\033[01;34m\\]\\w\\[\\033[00m\\]\\$ '

# Useful functions
function mkcd() {
    mkdir -p "$1" && cd "$1"
}

function gitlog() {
    git log --oneline --graph --decorate --all
}

# Portfolio shortcuts
alias portfolio='cd /home/alex && cat README.md'
alias projects='cd /home/alex/projects && ls'
alias contact='cat /home/alex/contact.txt'

echo "Bash configuration loaded! ✅"
`
                                    },
                                    'todo.txt':
                                    {
                                        type: 'file',
                                        content:
`Alex's TODO List:

🎮 Game Development:
[ ] Finish D&D 5e Character Creator
[ ] Add spell selection to character creator
[ ] Research new RPG mechanics for next project
[ ] Study Unity networking for multiplayer features

💻 Web Development:
[ ] Improve terminal emulation (add more commands)
[ ] Add dark/light theme support to all projects
[ ] Optimize character creator performance
[ ] Build portfolio API for dynamic content

📚 Learning:
[ ] Complete Advanced Unity course
[ ] Study design patterns in game development
[ ] Learn more about web accessibility
[ ] Practice algorithm challenges

🎯 Career:
[ ] Update LinkedIn profile
[ ] Apply to game development positions
[ ] Prepare portfolio presentation
[ ] Network with other developers

💡 Ideas:
[ ] Card game mechanics simulator
[ ] Procedural dungeon generator
[ ] Weather-based game mechanics
[ ] AI-driven NPC conversation system

Last updated: $(date)`
                                    }
                                }
                            }
                        }
                    },
                    'etc':
                    {
                        type: 'directory',
                        contents:
                        {
                            'passwd':
                            {
                                type: 'file',
                                content:
`root:x:0:0:root:/root:/bin/bash
alex:x:1000:1000:Alexander Conn,,,:/home/alex:/bin/bash
guest:x:1001:1001:Guest User,,,:/home/guest:/bin/bash`
                            },
                            'hostname':
                            {
                                type: 'file',
                                content: 'portfolio-terminal'
                            }
                        }
                    },
                    'usr': {
                        type: 'directory',
                        contents:
                        {
                            'bin':
                            {
                                type: 'directory',
                                contents:
                                {
                                    'ls': { type: 'executable' },
                                    'cd': { type: 'executable' },
                                    'cat': { type: 'executable' },
                                    'pwd': { type: 'executable' },
                                    'echo': { type: 'executable' },
                                    'clear': { type: 'executable' },
                                    'help': { type: 'executable' },
                                    'whoami': { type: 'executable' },
                                    'date': { type: 'executable' },
                                    'tree': { type: 'executable' }
                                }
                            }
                        }
                    }
                }
            }
        };
    }

    // Navigate to a path
    cd(path)
    {
        if (!path || path === '')
        {
            this.currentPath = '/home/alex';
            return { success: true, message: '' };
        }

        // Handle special cases
        if (path === '~')
        {
            this.currentPath = '/home/alex';
            return { success: true, message: '' };
        }

        if (path === '..')
        {
            if (this.currentPath === '/')
            {
                return { success: true, message: '' };
            }
            const parts = this.currentPath.split('/').filter(p => p);
            parts.pop();
            this.currentPath = '/' + parts.join('/');

            if (this.currentPath === '/')
            {
                this.currentPath = '/';
            }

            return { success: true, message: '' };
        }

        if (path === '.')
        {
            return { success: true, message: '' };
        }

        // Handle absolute paths
        if (path.startsWith('/'))
        {
            const targetPath = this.resolvePath(path);
            if (this.pathExists(targetPath) && this.isDirectory(targetPath))
            {
                this.currentPath = targetPath;
                return { success: true, message: '' };
            } 
            else
            {
                return { success: false, message: `cd: ${path}: No such file or directory` };
            }
        }

        // Handle relative paths
        const targetPath = this.resolvePath(this.currentPath + '/' + path);
        if (this.pathExists(targetPath) && this.isDirectory(targetPath))
        {
            this.currentPath = targetPath;
            return { success: true, message: '' };
        }
        else
        {
            return { success: false, message: `cd: ${path}: No such file or directory` };
        }
    }

    // List directory contents
    ls(path = '', showHidden = false)
    {
        const targetPath = path ? this.resolvePath(path.startsWith('/') ? path : this.currentPath + '/' + path) : this.currentPath;
        
        if (!this.pathExists(targetPath))
        {
            return { success: false, message: `ls: ${path}: No such file or directory` };
        }

        if (!this.isDirectory(targetPath))
        {
            return { success: true, files: [path] };
        }

        const dir = this.getDirectory(targetPath);
        const files = Object.keys(dir.contents || {})
            .filter(name => showHidden || !name.startsWith('.'))
            .sort()
            .map
            (name =>
                {
                    const item = dir.contents[name];
                    return {
                        name,
                        type: item.type,
                        hidden: name.startsWith('.'),
                        executable: item.type === 'executable'
                    };
                }
            );

        return { success: true, files };
    }

    // Get file content
    cat(path)
    {
        const targetPath = this.resolvePath(path.startsWith('/') ? path : this.currentPath + '/' + path);
        
        if (!this.pathExists(targetPath))
        {
            return { success: false, message: `cat: ${path}: No such file or directory` };
        }

        const file = this.getFile(targetPath);

        if (file.type === 'directory')
        {
            return { success: false, message: `cat: ${path}: Is a directory` };
        }

        return { success: true, content: file.content || `cat: ${path}: File is empty or binary` };
    }

    // Get current working directory
    pwd()
    {
        return { success: true, path: this.currentPath };
    }

    // Utility methods
    resolvePath(path)
    {
        const parts = path.split('/').filter(p => p);
        const resolved = [];
        
        for (const part of parts)
        {
            if (part === '..')
            {
                resolved.pop();
            }
            else if (part !== '.')
            {
                resolved.push(part);
            }
        }
        
        return '/' + resolved.join('/');
    }

    pathExists(path)
    {
        const parts = path === '/' ? [] : path.split('/').filter(p => p);
        let current = this.fileSystem['/'];
        
        for (const part of parts)
        {
            if (!current.contents || !current.contents[part])
            {
                return false;
            }

            current = current.contents[part];
        }
        
        return true;
    }

    isDirectory(path)
    {
        const file = this.getFile(path);
        return file && file.type === 'directory';
    }

    getFile(path) {
        const parts = path === '/' ? [] : path.split('/').filter(p => p);
        let current = this.fileSystem['/'];
        
        for (const part of parts)
        {
            if (!current.contents || !current.contents[part])
            {
                return null;
            }

            current = current.contents[part];
        }
        
        return current;
    }

    getDirectory(path)
    {
        const dir = this.getFile(path);
        return dir && dir.type === 'directory' ? dir : null;
    }

    // Generate tree structure
    generateTree(path = this.currentPath, prefix = '', isLast = true)
    {
        const dir = this.getDirectory(path);
        if (!dir) 
        {
            return '';
        }

        let result = '';
        const items = Object.keys(dir.contents || {})
            .filter(name => !name.startsWith('.'))
            .sort();

        items.forEach
        ((name, index) =>
            {
                const isLastItem = index === items.length - 1;
                const item = dir.contents[name];
                const connector = isLastItem ? '└── ' : '├── ';
                const nameDisplay = item.type === 'directory' ? `${name}/` : name;
                
                result += `${prefix}${connector}${nameDisplay}\n`;
                
                if (item.type === 'directory')
                {
                    const newPrefix = prefix + (isLastItem ? '    ' : '│   ');
                    result += this.generateTree(path + '/' + name, newPrefix, isLastItem);
                }
            }
        );

        return result;
    }
}

// Export for use in terminal.js
window.FileSystem = FileSystem;
