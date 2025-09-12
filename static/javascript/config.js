// Site Configuration
const siteConfig = {
    // Meta information
    meta: {
        title: 'Alexander Conn - Home | Game Development Blog',
        author: 'Alexander JD Conn',
        description: 'A game development blog. Indie stuff by an Idiot (an Indiot).',
        type: 'website',
        themeColor: 'Canvas'
    },

    // User settings
    user: {
        username: 'alexc@mentalreaper',
        displayName: 'Alexander Conn',
        status: 'online'
    },

    // Navigation items
    navigation: [
        { href: '/', text: '/home/', active: true },
        { href: '/about-me/', text: '/about-me/' },
        { href: '/projects/', text: '/project/' },
        { href: '/blog/', text: '/blog/' },
        { href: 'https://linktr.ee/alexanderconn', text: 'linktr.ee', external: true }
    ],

    // Terminal configuration
    terminal: {
        version: 'v0.1.09',
        welcomeMessages: [
            'AJDC SYSTEMS TERMINAL v0.1.09',
            'Type "help" for available commands',
            'System initialized successfully'
        ],
        commands: {
            help: {
                description: 'Show available commands',
                output: 'Available commands: help, clear, about, projects, contact, ls, whoami, date'
            },
            clear: {
                description: 'Clear terminal output',
                action: 'clear'
            },
            about: {
                description: 'Show information about the developer',
                output: [
                    'Alexander JD Conn',
                    'Game Developer & Creative',
                    'Specializing in RPGs and Card Games',
                    'Currently working on micro projects'
                ]
            },
            projects: {
                description: 'List current projects',
                output: [
                    'Current Projects:',
                    '1. Battlerots - Multiplayer Unity game',
                    '2. Bear Grills - VR cooking game',
                    '3. Morrowind-like RPG (in planning)'
                ]
            },
            contact: {
                description: 'Show contact information',
                output: [
                    'Contact Information:',
                    'Email: work@alexanderconn.com',
                    'Twitter: @MentalReaper_GD',
                    'GitHub: Mentalreaper',
                    'YouTube: @alex-conn'
                ]
            },
            ls: {
                description: 'List directory contents',
                output: 'projects/  blog/  about/  contact/  README.md'
            },
            whoami: {
                description: 'Display current user',
                output: 'alexc@mentalreaper'
            },
            date: {
                description: 'Display current date',
                action: 'date'
            }
        }
    },

    // Projects data
    projects: [
        {
            id: 'battlerots',
            title: 'Battlerots',
            description: 'A university group project for a multiplayer game. Made in Unity',
            image: '/static/gif/medabots-fan-game.gif',
            link: '/projects/games/battlerots/',
            tags: ['Unity', 'Multiplayer', 'University'],
            status: 'completed'
        },
        {
            id: 'bear-grills',
            title: 'Bear Grills',
            description: 'VR Group project at University, a bear chef grills for his robo customers',
            image: '/static/gif/bear-grills-wip.gif',
            link: '/projects/games/bearGrills/',
            tags: ['VR', 'Unity', 'University'],
            status: 'in-progress'
        },
        {
            id: 'blade-of-roland',
            title: 'Blade of Roland',
            description: 'An action RPG project (currently suspended)',
            link: '404#BladeOfRoland',
            tags: ['RPG', 'Action'],
            status: 'suspended'
        },
        {
            id: 'morrowind-like',
            title: 'Untitled Morrowind-like',
            description: 'An open-world RPG in early planning stages',
            tags: ['RPG', 'Open-World'],
            status: 'planning'
        }
    ],

    // Social links
    social: {
        email: {
            label: 'Email',
            href: 'mailto:work@alexanderconn.com',
            text: 'work@alexanderconn.com',
            icon: 'email'
        },
        twitter: {
            label: 'Twitter',
            href: 'https://twitter.com/MentalReaper_GD',
            text: '@MentalReaper_GD',
            icon: 'twitter',
            external: true
        },
        github: {
            label: 'GitHub',
            href: 'https://github.com/Mentalreaper',
            text: 'Mentalreaper',
            icon: 'github',
            external: true
        },
        youtube: {
            label: 'YouTube',
            href: 'https://www.youtube.com/@alex-conn',
            text: '@alex-conn',
            icon: 'youtube',
            external: true
        }
    },

    // Footer statistics
    stats: {
        status: 'OPERATIONAL',
        gamesReleased: 0,
        currentProjects: 4,
        blogPosts: 12,
        lastUpdated: '2025-01-20'
    },

    // Theme configuration
    theme: {
        primaryColor: '#00ffcc',
        secondaryColor: '#00ccff',
        accentColor: '#ff00cc',
        backgroundColor: '#0a0a0a',
        textColor: '#00ffcc',
        fontFamily: 'monospace',
        animationDuration: '2s'
    },

    // HUD Messages
    hudMessages: {
        top: '[ SYSTEM ONLINE ]',
        bottom: '[ ACE (AC ENCRYPTION) ACTIVE ]'
    },

    // About content (can be loaded from markdown or CMS)
    aboutContent: {
        intro: `Hey there, and welcome to my website!`,
        
        main: `I enjoy RPGs, Card Games, and making those types of games! I'm usually working on some small
        project and writing way too much world building for the few characters there!`,
        
        current: `I'm currently working on a few "micro" projects, and will update this page as I go. I was working on a
        project called Blade of Roland, though after a few getting somewhat
        bored on the project (and realising my lack of animation skill) I have decided to suspend it. Right now
        I'm working on a "morrowind"-like game, though it's very early into just planning.`,
        
        callToAction: `Below are some example projects for you to look at and/or play, feel free to take a look! If you want
        to see other examples of work, then feel free to look at the projects button
        in the NavBar.`
    },

    // Feature flags
    features: {
        particleEffects: true,
        vectorAnimations: true,
        terminalEnabled: true,
        hudEnabled: true,
        darkMode: true,
        soundEffects: false,
        analytics: false
    },

    // API endpoints (if needed)
    api: {
        baseUrl: 'https://api.alexanderconn.com',
        endpoints: {
            projects: '/api/projects',
            blog: '/api/blog',
            contact: '/api/contact'
        }
    }
};

// Export configuration
export default siteConfig;
