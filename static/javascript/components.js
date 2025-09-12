// Base Component Class
class Component {
    constructor(props = {}) {
        this.props = props;
        this.state = {};
    }

    setState(newState) {
        this.state = { ...this.state, ...newState };
        this.update();
    }

    update() {
        const newElement = this.render();
        if (this.element && this.element.parentNode) {
            this.element.parentNode.replaceChild(newElement, this.element);
            this.element = newElement;
        }
    }

    mount(container) {
        this.element = this.render();
        if (typeof container === 'string') {
            container = document.querySelector(container);
        }
        container.appendChild(this.element);
        this.onMount();
    }

    onMount() {}

    render() {
        throw new Error('Component must implement render method');
    }
}

// Particle Effects Component
class ParticleEffects extends Component {
    render() {
        const div = document.createElement('div');
        div.className = 'particle-container';
        div.id = 'particles';
        return div;
    }

    onMount() {
        // Initialize particle effects here
        this.initParticles();
    }

    initParticles() {
        // Add particle animation logic
        console.log('Initializing particles...');
    }
}

// Vector Decoration Component
class VectorDecoration extends Component {
    render() {
        const { position, color = '#00ffcc' } = this.props;
        
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('class', `vector-decor ${position} ${position}-vector`);
        svg.setAttribute('width', '100');
        svg.setAttribute('height', '100');
        svg.setAttribute('viewBox', '0 0 100 100');

        svg.innerHTML = `
            <path d="M 0 50 L 50 50 L 50 0" stroke="${color}" stroke-width="2" fill="none"/>
            <circle cx="50" cy="50" r="3" fill="${color}">
                <animate attributeName="r" values="3;5;3" dur="2s" repeatCount="indefinite"/>
            </circle>
        `;

        return svg;
    }
}

// HUD Element Component
class HUDElement extends Component {
    render() {
        const { position, text } = this.props;
        const div = document.createElement('div');
        div.className = `hud-element hud-${position}`;
        div.textContent = text;
        return div;
    }
}

// Logo Component
class Logo extends Component {
    render() {
        const div = document.createElement('div');
        div.className = 'logo';
        
        div.innerHTML = `
            <svg class="logo-icon" viewBox="0 0 40 40">
                <polygon points="20,2 38,14 38,26 20,38 2,26 2,14" stroke="#00ffcc" stroke-width="2" fill="none"/>
                <polygon points="20,10 30,16 30,24 20,30 10,24 10,16" stroke="#00ffcc" stroke-width="1" fill="rgba(0,255,204,0.2)">
                    <animate attributeName="fill" values="rgba(0,255,204,0.2);rgba(0,255,204,0.4);rgba(0,255,204,0.2)" dur="3s" repeatCount="indefinite"/>
                </polygon>
                <circle cx="20" cy="20" r="3" fill="#00ffcc">
                    <animate attributeName="r" values="3;5;3" dur="2s" repeatCount="indefinite"/>
                </circle>
            </svg>
            AJDC SYSTEMS
        `;
        
        return div;
    }
}

// Navigation Component
class Navigation extends Component {
    render() {
        const { items = [] } = this.props;
        const nav = document.createElement('nav');
        nav.className = 'nav';
        
        items.forEach(item => {
            const link = document.createElement('a');
            link.href = item.href;
            link.className = 'nav-item';
            link.textContent = item.text;
            if (item.external) {
                link.target = '_blank';
            }
            nav.appendChild(link);
        });
        
        return nav;
    }
}

// User Info Component
class UserInfo extends Component {
    render() {
        const { username = 'guest@system' } = this.props;
        const div = document.createElement('div');
        div.className = 'user-info';
        
        div.innerHTML = `
            <div class="user-status"></div>
            <span id="username">${username}</span>
        `;
        
        return div;
    }
}

// Header Component
class Header extends Component {
    render() {
        const header = document.createElement('header');
        header.className = 'header';
        
        const headerContent = document.createElement('div');
        headerContent.className = 'header-content';
        
        // Add logo
        const logo = new Logo();
        headerContent.appendChild(logo.render());
        
        // Add navigation
        const nav = new Navigation({
            items: [
                { href: '/', text: '/home/' },
                { href: '/about-me/', text: '/about-me/' },
                { href: '/projects/', text: '/project/' },
                { href: '/blog/', text: '/blog/' },
                { href: 'https://linktr.ee/alexanderconn', text: 'linktr.ee', external: true }
            ]
        });
        headerContent.appendChild(nav.render());
        
        // Add user info
        const userInfo = new UserInfo({ username: 'alexc@mentalreaper' });
        headerContent.appendChild(userInfo.render());
        
        header.appendChild(headerContent);
        return header;
    }
}

// Content Section Component
class ContentSection extends Component {
    render() {
        const { title, subtitle, content, className = '' } = this.props;
        const section = document.createElement('div');
        section.className = `content-section ${className}`;
        
        if (title) {
            const h2 = document.createElement('h2');
            h2.className = 'panel-title';
            if (subtitle) {
                h2.setAttribute('data-subtitle', subtitle);
            }
            h2.textContent = title;
            section.appendChild(h2);
        }
        
        if (content) {
            const contentDiv = document.createElement('div');
            contentDiv.innerHTML = content;
            section.appendChild(contentDiv);
        }
        
        return section;
    }
}

// Carousel Component
class Carousel extends Component {
    constructor(props) {
        super(props);
        this.state = {
            currentSlide: 0
        };
    }

    render() {
        const { slides = [] } = this.props;
        const { currentSlide } = this.state;
        
        const carousel = document.createElement('div');
        carousel.className = 'carousel-section';
        
        carousel.innerHTML = `
            <div id="carousel">
                ${slides.map((slide, index) => `
                    <div class="carousel-slide ${index === currentSlide ? 'active' : ''}">
                        <img src="${slide.image}">
                        <div id="carousel-overlay"></div>
                        <div class="carousel-caption">
                            <a href="${slide.link}">
                                <h2>${slide.title}</h2>
                                <p>${slide.description}</p>
                            </a>
                        </div>
                    </div>
                `).join('')}
                <div class="arrow arrow-left"></div>
                <div class="arrow arrow-right"></div>
            </div>
        `;
        
        return carousel;
    }

    onMount() {
        const leftArrow = this.element.querySelector('.arrow-left');
        const rightArrow = this.element.querySelector('.arrow-right');
        
        leftArrow.addEventListener('click', () => this.previousSlide());
        rightArrow.addEventListener('click', () => this.nextSlide());
    }

    previousSlide() {
        const { slides = [] } = this.props;
        this.setState({
            currentSlide: (this.state.currentSlide - 1 + slides.length) % slides.length
        });
    }

    nextSlide() {
        const { slides = [] } = this.props;
        this.setState({
            currentSlide: (this.state.currentSlide + 1) % slides.length
        });
    }
}

// Terminal Component
class Terminal extends Component {
    constructor(props) {
        super(props);
        this.state = {
            output: [],
            minimized: false,
            maximized: false
        };
    }

    render() {
        const { minimized, maximized } = this.state;
        
        const terminal = document.createElement('main');
        terminal.className = `terminal ${minimized ? 'minimized' : ''} ${maximized ? 'maximized' : ''}`;
        
        terminal.innerHTML = `
            <div class="terminal-header">
                <div class="terminal-title">//TERMINAL_v0.1.09</div>
                <div class="terminal-controls">
                    <div class="terminal-control control-close"></div>
                    <div class="terminal-control control-minimize"></div>
                    <div class="terminal-control control-maximize"></div>
                </div>
            </div>
            
            <div class="terminal-content" id="terminal-output">
                ${this.state.output.join('<br>')}
            </div>
            
            <div class="terminal-prompt">
                <span class="prompt-symbol">></span>
                <input type="text" class="terminal-input" id="terminal-input" placeholder="█" autocomplete="on" />
            </div>
        `;
        
        return terminal;
    }

    onMount() {
        const closeBtn = this.element.querySelector('.control-close');
        const minimizeBtn = this.element.querySelector('.control-minimize');
        const maximizeBtn = this.element.querySelector('.control-maximize');
        const input = this.element.querySelector('#terminal-input');
        
        closeBtn.addEventListener('click', () => this.clearTerminal());
        minimizeBtn.addEventListener('click', () => this.minimizeTerminal());
        maximizeBtn.addEventListener('click', () => this.maximizeTerminal());
        
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.executeCommand(e.target.value);
                e.target.value = '';
            }
        });
        
        // Initialize with welcome message
        this.addOutput('AJDC SYSTEMS TERMINAL v0.1.09');
        this.addOutput('Type "help" for available commands');
    }

    addOutput(text) {
        this.setState({
            output: [...this.state.output, text]
        });
    }

    executeCommand(command) {
        this.addOutput(`> ${command}`);
        
        // Add command processing logic here
        switch(command.toLowerCase()) {
            case 'help':
                this.addOutput('Available commands: help, clear, about, projects, contact');
                break;
            case 'clear':
                this.clearTerminal();
                break;
            case 'about':
                this.addOutput('Alexander Conn - Game Developer');
                break;
            default:
                this.addOutput(`Command not found: ${command}`);
        }
    }

    clearTerminal() {
        this.setState({ output: [] });
    }

    minimizeTerminal() {
        this.setState({ minimized: !this.state.minimized });
    }

    maximizeTerminal() {
        this.setState({ maximized: !this.state.maximized });
    }
}

// Contact Section Component
class ContactSection extends Component {
    render() {
        const { contacts = [] } = this.props;
        
        const section = document.createElement('div');
        section.className = 'contact-me-section';
        
        section.innerHTML = `
            <h2 class="panel-title" data-subtitle="v0.1.09">// CONTACT</h2>
            ${contacts.map(contact => `
                <strong>${contact.label}: </strong>
                <a href="${contact.href}" ${contact.external ? 'target="_blank"' : ''}>${contact.text}</a><br>
            `).join('')}
        `;
        
        return section;
    }
}

// Footer Component
class Footer extends Component {
    render() {
        const { stats = {} } = this.props;
        
        const footer = document.createElement('footer');
        footer.className = 'footer';
        
        footer.innerHTML = `
            <div class="footer-text">
                WEBSITE STATUS: ${stats.status || 'OPERATIONAL'} // 
                GAMES RELEASED: ${stats.gamesReleased || 0} // 
                CURRENT_PROJECTS: ${stats.currentProjects || 'X'} // 
                CURRENT_BLOG_POSTS: ${stats.blogPosts || 'Y'} // 
                COPYRIGHT: © Alexander JD Conn 2024~2025 | All rights reserved
            </div>
        `;
        
        return footer;
    }
}

// Export components
export {
    Component,
    ParticleEffects,
    VectorDecoration,
    HUDElement,
    Header,
    Logo,
    Navigation,
    UserInfo,
    ContentSection,
    Carousel,
    Terminal,
    ContactSection,
    Footer
};