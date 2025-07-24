// l-pulse-bubble.js

class LPulseBubble extends HTMLElement {
  constructor() {
    super();
    this.shadow = this.attachShadow({ mode: 'open' });
    this.render();
  }

  static get observedAttributes() {
    return ['count', 'color', 'speed'];
  }

  attributeChangedCallback(name, oldVal, newVal) {
    if (oldVal !== newVal) this.render();
  }

  render() {
    const count = parseInt(this.getAttribute('count')) || 8;
    const color = this.getAttribute('color') || '#00ffff';
    const speed = this.getAttribute('speed') || 'medium';

    this.shadow.innerHTML = '';

    const container = document.createElement('div');
    container.className = 'bubble-container';

    const style = document.createElement('style');
    style.textContent = `
      .bubble-container {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        overflow: hidden;
        pointer-events: none;
        z-index: 1;
      }

      .bubble {
        position: absolute;
        width: 20px;
        height: 20px;
        background: ${color};
        opacity: 0.3;
        border-radius: 50%;
        filter: blur(6px);
        animation: pulse infinite ease-in-out;
      }

      .slow    { animation-duration: 8s; }
      .medium  { animation-duration: 5s; }
      .fast    { animation-duration: 2.5s; }

      @keyframes pulse {
        0% { transform: scale(1); opacity: 0.3; }
        50% { transform: scale(2.5); opacity: 0.05; }
        100% { transform: scale(1); opacity: 0.3; }
      }
    `;

    for (let i = 0; i < count; i++) {
      const bubble = document.createElement('div');
      bubble.className = `bubble ${speed}`;
      bubble.style.top = Math.random() * 100 + '%';
      bubble.style.left = Math.random() * 100 + '%';
      container.appendChild(bubble);
    }

    this.shadow.appendChild(style);
    this.shadow.appendChild(container);
  }
}

customElements.define('l-pulse-bubble', LPulseBubble);
