class Footer extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    this.innerHTML =
    `
        <footer class="footer">
            <div class="footer-text">
                WEBSITE STATUS: OPERATIONAL // GAMES RELEASED: 0 // CURRENT_PROJECTS: X // CURRENT_BLOG_POSTS: Y // COPYRIGHT: © Alexander JD Conn 2024~2025 | All rights reserved
            </div>
        </footer>
    `;
  }
}

customElements.define('footer-component', Footer);