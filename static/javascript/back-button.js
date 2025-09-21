class BackButton extends HTMLElement {
    static get observedAttributes() {
        return ["disabled","href","delta","longdelta","confirm","hotkey","title","aria-label","tooltip","variant","size","hrefonly"];
    }

    constructor() {
        super();
        this.attachShadow({ mode: "open" });
        this._pressTimer = null;
        this._pressedAt = 0;
        this._onKeydown = this._onKeydown.bind(this);
        this._onClick = this._onClick.bind(this);
        this._onPointerDown = this._onPointerDown.bind(this);
        this._onPointerUp = this._onPointerUp.bind(this);
        this._onPointerLeave = this._onPointerLeave.bind(this);

        const t = document.createElement("template");
        t.innerHTML = `
            <style>
            :host {
                --bb-size: var(--back-button-size, 36px);
                --bb-color: var(--back-button-color, currentColor);
                --bb-bg: var(--back-button-bg, transparent);
                --bb-bg-hover: var(--back-button-bg-hover, color-mix(in oklab, currentColor 10%, transparent));
                --bb-bg-active: var(--back-button-bg-active, color-mix(in oklab, currentColor 18%, transparent));
                --bb-radius: var(--back-button-radius, 8px);
                --bb-focus: var(--back-button-focus, 2px solid currentColor);
                --bb-tip-bg: var(--back-button-tip-bg, #111);
                --bb-tip-fg: var(--back-button-tip-fg, #fff);
                display: inline-block;
                inline-size: var(--bb-size);
                block-size: var(--bb-size);
            }
            button {
                all: unset;
                box-sizing: border-box;
                cursor: pointer;
                display: inline-grid;
                place-items: center;
                inline-size: 100%;
                block-size: 100%;
                color: var(--bb-color);
                background: var(--bb-bg);
                border-radius: var(--bb-radius);
                transition: transform 80ms ease, background 120ms ease, opacity 120ms ease;
                position: relative;
            }
            button:hover { background: var(--bb-bg-hover); }
            button:active { background: var(--bb-bg-active); transform: translateY(1px); }
            button:focus-visible { outline: var(--bb-focus); outline-offset: 2px; }
            button[disabled] { opacity: 0.5; cursor: not-allowed; }
            svg {
                inline-size: calc(var(--bb-size) * 0.58);
                block-size: calc(var(--bb-size) * 0.58);
                fill: none;
                stroke: currentColor;
                stroke-width: 2.2;
                vector-effect: non-scaling-stroke;
            }
            :host([variant="minimal"]) button { background: transparent; }
            :host([variant="ghost"]) button { background: transparent; }
            :host([size="sm"]) { --bb-size: 28px; }
            :host([size="lg"]) { --bb-size: 44px; }
            :host([flip-rtl]) :dir(rtl) svg { transform: scaleX(-1); }
            /* Tooltip */
            .tip {
                position: absolute;
                left: 50%;
                bottom: calc(100% + 8px);
                transform: translateX(-50%);
                background: var(--bb-tip-bg);
                color: var(--bb-tip-fg);
                font: 12px/1.2 system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, "Helvetica Neue", Arial;
                padding: 6px 8px;
                border-radius: 6px;
                white-space: nowrap;
                opacity: 0;
                pointer-events: none;
                transition: opacity 120ms ease;
            }
            button:hover .tip { opacity: 1; }
            @media (prefers-reduced-motion: reduce) {
                button { transition: none; }
            }
            ::slotted(*) { margin-left: 6px; font-size: 0.9rem; }
            .wrap { display: inline-flex; align-items: center; gap: 6px; }
            </style>
            <button part="button" type="button" aria-label="Back">
            <span class="wrap">
            <!-- Monochrome SVG uses currentColor -->
            <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M10 19l-7-7 7-7"/>
            <path d="M3 12h18"/>
            </svg>
            <slot name="label"></slot>
            </span>
            <span class="tip" part="tooltip"></span>
            </button>
        `;
        this.shadowRoot.append(t.content.cloneNode(true));
        this.$btn = this.shadowRoot.querySelector("button");
        this.$tip = this.shadowRoot.querySelector(".tip");
    }

    connectedCallback() {
        this._upgrade("disabled"); this._upgrade("href"); this._upgrade("delta");
        this._upgrade("longdelta"); this._upgrade("confirm"); this._upgrade("hotkey");
        this._syncButtonState();
        this.$btn.addEventListener("click", this._onClick);
        this.$btn.addEventListener("pointerdown", this._onPointerDown);
        this.$btn.addEventListener("pointerup", this._onPointerUp);
        this.$btn.addEventListener("pointerleave", this._onPointerLeave);
        document.addEventListener("keydown", this._onKeydown);
        if (!this.hasAttribute("role")) this.setAttribute("role", "button");
        if (!this.hasAttribute("tabindex")) this.setAttribute("tabindex", "0");
    this._updateTooltip();
    }
    disconnectedCallback() {
        this.$btn.removeEventListener("click", this._onClick);
        this.$btn.removeEventListener("pointerdown", this._onPointerDown);
        this.$btn.removeEventListener("pointerup", this._onPointerUp);
        this.$btn.removeEventListener("pointerleave", this._onPointerLeave);
        document.removeEventListener("keydown", this._onKeydown);
        this._clearTimer();
    }
    attributeChangedCallback() {
        this._syncButtonState();
        this._updateTooltip();
    }
    _upgrade(name) {
        if (this.hasOwnProperty(name)) {
            const v = this[name];
            delete this[name];
            this.setAttribute(name, v === true ? "" : String(v));
        }
    }

    // Public API
    go(delta = this.delta, href = this.href) { return this._navigate(delta, href); }

    // Getters/Setters
    get disabled() { return this.hasAttribute("disabled"); }
    set disabled(v) { v ? this.setAttribute("disabled","") : this.removeAttribute("disabled"); }

    get hrefonly() { return this.hasAttribute("hrefonly"); }
    set hrefonly(v) { v ? this.setAttribute("hrefonly","") : this.removeAttribute("hrefonly"); }

    get href() { return this.getAttribute("href") || ""; }
    set href(v) { v ? this.setAttribute("href", v) : this.removeAttribute("href"); }

    get delta() { return Number(this.getAttribute("delta") ?? -1) || -1; }
    set delta(v) { this.setAttribute("delta", String(v)); }

    get longdelta() { return Number(this.getAttribute("longdelta") ?? -2) || -2; }
    set longdelta(v) { this.setAttribute("longdelta", String(v)); }

    get confirm() { return this.getAttribute("confirm") || ""; }
    set confirm(v) { v ? this.setAttribute("confirm", v) : this.removeAttribute("confirm"); }

    get hotkey() { return this.getAttribute("hotkey") || "Alt+ArrowLeft"; }
    set hotkey(v) { v ? this.setAttribute("hotkey", v) : this.removeAttribute("hotkey"); }

    get tooltip() { return this.getAttribute("tooltip") || "Back"; }
    set tooltip(v) { v ? this.setAttribute("tooltip", v) : this.removeAttribute("tooltip"); }

    // Internals
    _syncButtonState() {
        const disabled = this.disabled;
        this.$btn.toggleAttribute("disabled", disabled);
        const label = this.getAttribute("aria-label") || this.getAttribute("title") || this.tooltip || "Back";
        this.$btn.setAttribute("aria-label", label);
        if (this.getAttribute("title")) this.$btn.setAttribute("title", this.getAttribute("title"));
    }
    _updateTooltip() {
        const tip = this.tooltip;
        const hk = this.hotkey ? ` (${this.hotkey})` : "";
        if (this.$tip) this.$tip.textContent = tip + hk;
    }
    _onClick(e) {
        if (this.disabled) return;
        e.preventDefault();
        this._navigate(this.delta, this.href);
    }
    _onPointerDown(e) {
        if (this.disabled || e.button !== 0) return;
        this._pressedAt = performance.now();
        this._pressTimer = setTimeout(() => {
            // Long press triggers longdelta
            this._navigate(this.longdelta, this.href);
            this._pressTimer = null;
        }, 550);
    }
    _onPointerUp() { this._cancelLongPressIfShort(); }
    _onPointerLeave() { this._cancelLongPressIfShort(); }
    _cancelLongPressIfShort() { if (this._pressTimer) { clearTimeout(this._pressTimer); this._pressTimer = null; } }
    _clearTimer() { if (this._pressTimer) { clearTimeout(this._pressTimer); this._pressTimer = null; } }

    _onKeydown(e) {
        if (this.disabled) return;
        // Parse hotkey "Alt+ArrowLeft", "Ctrl+Backspace", etc.
        const hk = this.hotkey.trim();
        if (!hk) return;
        const needAlt = hk.includes("Alt+");
        const needCtrl = hk.includes("Ctrl+") || hk.includes("Control+");
        const needShift = hk.includes("Shift+");
        const keyPart = hk.split("+").pop();
        if ((needAlt ? e.altKey : !e.altKey && hk.includes("Alt+") === false) &&
            (needCtrl ? e.ctrlKey : !e.ctrlKey && (hk.includes("Ctrl+") || hk.includes("Control+")) === false) &&
            (needShift ? e.shiftKey : !e.shiftKey && hk.includes("Shift+") === false) &&
        e.key === keyPart) {
            e.preventDefault();
            this._navigate(this.delta, this.href);
        }
    }

    async _navigate(delta, href) {
    // Optional confirm
    if (this.confirm) {
        const ok = window.confirm(this.confirm);
        if (!ok) return false;
    }

    // Allow SPA/router interception
    const ce = new CustomEvent("back-button:navigate", {
        detail: { delta, href },
        bubbles: true,
        composed: true,
        cancelable: true
    });
    const notCancelled = this.dispatchEvent(ce);
    if (!notCancelled) return true;

    // If hrefonly, skip history and go straight to href (or '/')
    if (this.hrefonly) {
        if (href) { window.location.assign(href); return true; }
        window.location.assign("/"); return true;
    }

    // Prefer history if possible
    const canGoHistory = Number.isFinite(delta) && delta < 0 && window.history.length > Math.abs(delta);
    if (canGoHistory) {
        window.history.go(delta);
        return true;
    }
    // Fallback to href, then previous page if any, else '/'
    if (href) {
        window.location.assign(href);
        return true;
    }
    if (document.referrer && new URL(document.referrer, location.href).origin === location.origin) {
        window.history.back();
        return true;
    }
    window.location.assign("/");
        return true;
    }
}
customElements.define("back-button", BackButton);