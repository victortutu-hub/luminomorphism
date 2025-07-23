class LOrbital extends HTMLElement {
    static get observedAttributes() {
        return ['count', 'color', 'radius'];
    }

    constructor() {
        super();
        this.shadow = this.attachShadow({ mode: 'open' });
        this.render();
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue !== newValue) {
            this.render();
        }
    }

    render() {
        const count = parseInt(this.getAttribute('count')) || 5;
        const color = this.getAttribute('color') || '#00ffff';
        const radius = parseInt(this.getAttribute('radius')) || 40;

        this.shadow.innerHTML = ''; // Clear everything

        const wrapper = document.createElement('div');
        wrapper.className = 'orbital-wrapper';

        const rotator = document.createElement('div');
        rotator.className = 'rotator';

        const style = document.createElement('style');
        style.textContent = `
    .orbital-wrapper {
      position: absolute;
      top: 0; left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 2;
    }

    .rotator {
      width: 100%;
      height: 100%;
      position: absolute;
      top: 0; left: 0;
      animation: rotateOrbit 6s linear infinite;
      transform-origin: center center;
    }

    .orb {
      position: absolute;
      top: 50%;
      left: 50%;
      width: 6px;
      height: 6px;
      margin-left: -3px;
      margin-top: -3px;
      border-radius: 50%;
      background: ${color};
      box-shadow: 0 0 6px ${color};
    }

    @keyframes rotateOrbit {
      from { transform: rotate(0deg); }
      to   { transform: rotate(360deg); }   
    }
  `;

        // 🔁 Creează orbitele și le poziționează pe cerc
        for (let i = 0; i < count; i++) {
            const orb = document.createElement('div');
            orb.className = 'orb';
            const angle = (360 / count) * i;
            const rad = angle * Math.PI / 180;
            const x = Math.sin(rad) * radius;
            const y = -Math.cos(rad) * radius;
            orb.style.transform = `translate(${x}px, ${y}px)`;
            rotator.appendChild(orb);
        }

        wrapper.appendChild(rotator);
        this.shadow.appendChild(style);
        this.shadow.appendChild(wrapper);
    }

}

customElements.define('l-orbital', LOrbital);
