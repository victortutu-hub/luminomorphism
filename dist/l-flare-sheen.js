// l-flare-sheen.js

class LFlareSheen extends HTMLElement {
    static get observedAttributes() {
        return ['color', 'duration'];
    }

    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
        this.render();
    }

    attributeChangedCallback() {
        this.render();
    }

    render() {
        const color = this.getAttribute('color') || 'rgba(255,255,255,0.2)';
        const duration = this.getAttribute('duration') || '3s';

        const wrapper = document.createElement('div');
        wrapper.className = 'sheen-wrapper';

        const slot = document.createElement('slot');
        wrapper.appendChild(slot);

        const style = document.createElement('style');
        style.textContent = `
      .sheen-wrapper {
        position: relative;
        display: inline-block;
        width: 100%;
        height: 100%;
        overflow: hidden;
      }

      .sheen-wrapper::before {
        content: "";
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(120deg, transparent, ${color}, transparent);
        transform: skewX(-20deg);
        animation: sheen-slide ${duration} infinite;
        pointer-events: none;
        z-index: 1;
        mix-blend-mode: screen;
        opacity: 0.6;
      }

      ::slotted(*) {
        position: relative;
        z-index: 0;
        display: block;
      }

      @keyframes sheen-slide {
        0%   { left: -100%; }
        100% { left: 100%; }
      }

      ::slotted(.l-card) {
        width: 260px;
        height: 260px;
        font-weight: bold;
        display: flex;
        justify-content: center;
        align-items: center;
        border-radius: 20px;
        background: rgba(255, 255, 255, 0.05);
        box-shadow:
          0 25px 50px rgba(0, 0, 0, 0.4),
          0 0 6px rgba(255, 255, 255, 0.07),
          inset 0 0 120px rgba(255, 255, 255, 0.015);
        backdrop-filter: blur(14px);
        -webkit-backdrop-filter: blur(14px);
        color: white;
      }
    `;

        this.shadowRoot.innerHTML = '';
        this.shadowRoot.appendChild(style);
        this.shadowRoot.appendChild(wrapper);
    }
}

customElements.define('l-flare-sheen', LFlareSheen);
