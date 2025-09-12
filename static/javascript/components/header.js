class Header extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.innerHTML =
    `
        <Style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            cursor: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20"><polygon points="10,2 18,10 10,18 2,10" fill="none" stroke="%2300ffcc" stroke-width="2"/></svg>') 10 10, auto;
        }
        :root {
            --primary-cyan: #00ffcc;
            --primary-green: #00ff00;
            --primary-blue: #00ccff;
            --primary-magenta: #ff00cc;
            --bg-dark: #0a0e27;
            --bg-darker: #151931;
            --bg-panel: rgba(0, 20, 40, 0.9);
        }
        html, body {
            height: 100%;
        }
        body {
            font-family: 'Share Tech Mono', monospace;
            background: linear-gradient(180deg, var(--bg-dark) 0%, var(--bg-darker) 100%);
            color: var(--primary-cyan);
            min-height: 100vh;
            overflow-x: hidden;
            position: relative;
        }

        .logo {
            font-family: 'Orbitron', sans-serif;
            font-size: 28px;
            font-weight: 900;
            letter-spacing: 3px;
            color: var(--primary-cyan);
            text-shadow: 
                0 0 20px rgba(0, 255, 204, 0.8),
                0 0 40px rgba(0, 255, 204, 0.4);
            display: flex;
            align-items: center;
            gap: 15px;
            animation: subtle-glitch 8s infinite;
            position: relative;
        }
        .logo::before {
            content: 'AJDC SYSTEMS';
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
            opacity: 0;
            color: var(--primary-green);
            animation: glitch-1 0.5s infinite;
            animation-delay: 8s;
        }
        .logo-icon {
            width: 40px;
            height: 40px;
            position: relative;
            animation: rotate 10s linear infinite;
        }

        .nav {
            display: flex;
            gap: 30px;
            flex-wrap: wrap;
        }

        .nav-item {
            color: var(--primary-cyan);
            text-decoration: none;
            padding: 10px 18px;
            border: 1px solid rgba(0, 255, 204, 0.2);
            position: relative;
            transition: all 0.3s;
            background: linear-gradient(135deg, rgba(0, 30, 40, 0.6) 0%, rgba(0, 20, 30, 0.4) 100%);
            clip-path: polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px));
            overflow: hidden;
            text-transform: uppercase;
            font-size: 12px;
            letter-spacing: 2px;
        }

        .nav-item::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            width: 0;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(0, 255, 204, 0.1), transparent);
            transition: width 0.3s;
        }

        .nav-item::after {
            content: '';
            position: absolute;
            bottom: 0;
            left: 0;
            width: 100%;
            height: 1px;
            background: var(--primary-cyan);
            transform: scaleX(0);
            transform-origin: left;
            transition: transform 0.3s;
        }

        .nav-item:hover::before {
            width: 100%;
        }

        .nav-item:hover::after {
            transform: scaleX(1);
        }

        .nav-item:hover {
            background: linear-gradient(135deg, rgba(0, 255, 204, 0.1) 0%, rgba(0, 255, 204, 0.05) 100%);
            border-color: rgba(0, 255, 204, 0.5);
            color: var(--primary-green);
            text-shadow: 0 0 8px rgba(0, 255, 0, 0.5);
            transform: translateY(-1px);
            box-shadow: 
                0 2px 10px rgba(0, 255, 204, 0.2),
                inset 0 0 10px rgba(0, 255, 204, 0.05);
        }

        .header {
            flex-shrink: 0;
            background: linear-gradient(135deg, rgba(0, 20, 30, 0.9) 0%, rgba(0, 30, 40, 0.8) 100%);
            border: 1px solid var(--primary-cyan);
            padding: 20px;
            margin-bottom: 30px;
            position: relative;
            clip-path: polygon(0 0, calc(100% - 20px) 0, 100% 20px, 100% 100%, 20px 100%, 0 calc(100% - 20px));
            box-shadow: 
                0 0 20px rgba(0, 255, 204, 0.2),
                inset 0 0 20px rgba(0, 255, 204, 0.05);
            overflow: hidden;
        }

        .header::before {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 1px;
            background: linear-gradient(90deg, transparent, var(--primary-cyan), transparent);
            animation: scan-line 4s linear infinite;
        }
        .header::after {
            content: '';
            position: absolute;
            bottom: 0;
            right: -100%;
            width: 100%;
            height: 1px;
            background: linear-gradient(90deg, transparent, var(--primary-green), transparent);
            animation: scan-line-reverse 4s linear infinite;
        }
        .header-content {
            display: flex;
            justify-content: space-between;
            align-items: center;
            flex-wrap: wrap;
            gap: 20px;
            position: relative;
        }
        .header-content::before,
        .header-content::after {
            content: '';
            position: absolute;
            width: 20px;
            height: 20px;
            border: 1px solid rgba(0, 255, 204, 0.3);
            pointer-events: none;
        }
        .header-content::before {
            top: -10px;
            left: -10px;
            border-right: none;
            border-bottom: none;
        }
        .header-content::after {
            bottom: -10px;
            right: -10px;
            border-left: none;
            border-top: none;
        }
        .header {
            position: fixed;
            top: 7.5vh; 
            right: 7.5vh; 
            bottom: 81.5%; 
            left: 7.5vh;
        }

        .user-info {
            display: flex;
            align-items: center;
            gap: 15px;
            padding: 10px 18px;
            border: 1px solid rgba(0, 255, 204, 0.2);
            background: linear-gradient(135deg, rgba(0, 30, 40, 0.6) 0%, rgba(0, 20, 30, 0.4) 100%);
            position: relative;
            overflow: hidden;
            font-size: 12px;
            letter-spacing: 1px;
            text-transform: uppercase;
        }

        .user-info::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            width: 3px;
            height: 100%;
            background: var(--primary-green);
            animation: blink 2s infinite;
        }

        .user-info::after {
            content: 'AUTHENTICATED';
            position: absolute;
            top: -18px;
            right: 0;
            font-size: 8px;
            color: var(--primary-green);
            opacity: 0.5;
            letter-spacing: 2px;
        }

        .user-status {
            width: 10px;
            height: 10px;
            background: var(--primary-green);
            border-radius: 50%;
            animation: pulse 2s infinite;
            box-shadow: 0 0 10px var(--primary-green);
        }

        @keyframes pulse {
            0%, 100% { box-shadow: 0 0 0 0 rgba(0, 255, 0, 0.7), 0 0 10px var(--primary-green); }
            50% { box-shadow: 0 0 0 10px rgba(0, 255, 0, 0), 0 0 20px var(--primary-green); }
        }

        <--  -->
        @media (max-width: 768px) {
            .header-content {
                flex-direction: column;
                text-align: center;
            }
            .nav {
                justify-content: center;
            }
        }
        </Style>
        <header class="header">
            <div class="header-content">
                <div class="logo">
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
                </div>
                
                <nav class="nav">
                    <a href="/" class="nav-item">/home/</a>
                    <a href="/about-me/" class="nav-item">/about-me/</a>
                    <a href="/projects/" class="nav-item">/project/</a>
                    <a href="/blog/" class="nav-item">/blog/</a>
                    <a href="https://linktr.ee/alexanderconn" class="nav-item">linktr.ee</a>
                </nav>
                
                <div class="user-info">
                    <div class="user-status"></div>
                    <span id="username">alexc@mentalreaper</span>
                </div>
            </div>
        </header>
    `;
  }
}

customElements.define('header-component', Header);