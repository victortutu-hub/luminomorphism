// l-light-ray.js

class LLightRay extends HTMLElement {
  constructor() {
    super();
    this.shadow = this.attachShadow({ mode: 'open' });
    this.render();
  }

  static get observedAttributes() {
    return ['count', 'color', 'spread', 'speed'];
  }

  attributeChangedCallback(name, oldVal, newVal) {
    if (oldVal !== newVal) this.render();
  }

  render() {
    const count = parseInt(this.getAttribute('count')) || 12;
    const color = this.getAttribute('color') || '#ffeeaa';
    const spread = parseInt(this.getAttribute('spread')) || 60;
    const speed = this.getAttribute('speed') || 'slow';

    this.shadow.innerHTML = '';

    const container = document.createElement('div');
    container.className = 'ray-container';

    const style = document.createElement('style');
    style.textContent = `
      .ray-container {
        position: absolute;
        top: 0; left: 0;
        width: 100%; height: 100%;
        pointer-events: none;
        z-index: 0;
        transform-origin: center center;
        animation: spin infinite linear;
      }

      .ray {
        position: absolute;
        top: 50%;
        left: 50%;
        width: 2px;
        height: 120%;
        background: ${color};
        opacity: 0.06;
        transform-origin: center top;
        filter: blur(2px);
      }

      .slow    { animation-duration: 40s; }
      .medium  { animation-duration: 20s; }
      .fast    { animation-duration: 8s; }

      @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }
    `;

    for (let i = 0; i < count; i++) {
      const ray = document.createElement('div');
      ray.className = 'ray';
      const angle = (-spread / 2) + (spread / (count - 1)) * i;
      ray.style.transform = `rotate(${angle}deg)`;
      container.appendChild(ray);
    }

    container.classList.add(speed);
    this.shadow.appendChild(style);
    this.shadow.appendChild(container);
  }
}

customElements.define('l-light-ray', LLightRay);
