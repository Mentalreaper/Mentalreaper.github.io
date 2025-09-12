class VectorCornerBottomRight extends HTMLElement {
  constructor() {
    super();

    const shadow = this.attachShadow({ mode: 'open' });

    const div = document.createElement(`div`);


    div.innerHTML =
    `
    <style>
        /* Vector decorations */
        .vector-decor {
            position: fixed;
            pointer-events: none;
            opacity: 0.5;
            animation: vector-pulse 4s ease-in-out infinite;
        }
        @keyframes vector-pulse {
            0%, 100% { opacity: 0.3; transform: scale(1); }
            50% { opacity: 0.7; transform: scale(1.1); }
        }
        .vector-decor.bottom-right {
            bottom: 20px;
            right: 20px;
            transform: rotate(180deg);
        }
        .bottom-right-vector>path {
            transform: rotate(180deg);
            transform-origin: 50% 50%;
        }
    </style>
    <svg class="vector-decor bottom-right bottom-right-vector" width="100" height="100" viewBox="0 0 100 100">
        <path d="M 0 50 L 50 50 L 50 0" stroke="#00ffcc" stroke-width="2" fill="none"/>
        <circle cx="50" cy="50" r="3" fill="#00ffcc">
            <animate attributeName="r" values="3;5;3" dur="2s" repeatCount="indefinite"/>
        </circle>
    </svg>
    `;

    shadow.appendChild(div);
  }
}

customElements.define('vc-bottom-right', VectorCornerBottomRight);

