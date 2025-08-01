// Componentă luminomorfică: l-focus-flare
class LFocusFlare extends HTMLElement {
  static get observedAttributes() {
    return ['color', 'intensity', 'duration', 'radius'];
  }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.color = this.getAttribute('color') || '#00ffff';
    this.intensity = parseFloat(this.getAttribute('intensity')) || 0.6;
    this.duration = parseInt(this.getAttribute('duration')) || 600;
    this.radius = parseInt(this.getAttribute('radius')) || 60;
    this.flare = null;
  }

  connectedCallback() {
    this.render();
    const slot = this.shadowRoot.querySelector('slot');
    slot.addEventListener('slotchange', () => {
      const nodes = slot.assignedElements();
      nodes.forEach(node => {
        node.addEventListener('focus', this.showFlare.bind(this));
        node.addEventListener('blur', this.hideFlare.bind(this));
      });
    });
  }

  attributeChangedCallback(name, oldVal, newVal) {
    if (oldVal === newVal) return;
    if (name === 'color') this.color = newVal;
    if (name === 'intensity') this.intensity = parseFloat(newVal) || 0.6;
    if (name === 'duration') this.duration = parseInt(newVal) || 600;
    if (name === 'radius') this.radius = parseInt(newVal) || 60;
    this.render();
  }

  render() {
    const style = document.createElement('style');
    style.textContent = `
      :host {
        position: relative;
        display: inline-block;
      }
      .flare {
        content: '';
        position: absolute;
        top: 50%;
        left: 50%;
        width: ${this.radius * 2}px;
        height: ${this.radius * 2}px;
        margin-left: -${this.radius}px;
        margin-top: -${this.radius}px;
        background: radial-gradient(circle, ${this.color}${Math.floor(this.intensity * 255).toString(16)}, transparent);
        opacity: 0;
        border-radius: 50%;
        pointer-events: none;
        transform: scale(0.8);
        transition: opacity ${this.duration}ms ease, transform ${this.duration}ms ease;
        z-index: -1;
      }
      .flare.visible {
        opacity: ${this.intensity};
        transform: scale(1);
      }
    `;

    const wrapper = document.createElement('div');
    wrapper.style.position = 'relative';

    const flare = document.createElement('div');
    flare.classList.add('flare');

    const slot = document.createElement('slot');

    wrapper.appendChild(flare);
    wrapper.appendChild(slot);

    this.shadowRoot.innerHTML = '';
    this.shadowRoot.appendChild(style);
    this.shadowRoot.appendChild(wrapper);

    this.flare = flare;
  }

  showFlare() {
    if (this.flare) this.flare.classList.add('visible');
  }

  hideFlare() {
    if (this.flare) this.flare.classList.remove('visible');
  }
}

customElements.define('l-focus-flare', LFocusFlare);