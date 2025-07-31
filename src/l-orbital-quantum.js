// Componentă luminomorfică originală: l-orbital-quantum
// Simulează orbitare rotativă cu salturi cuantice și entanglement optic
// Parte din suita experimentală Luminomorphism, cu efecte unice de interacțiune luminoasă
class LOrbitalQuantum extends HTMLElement {
    static get observedAttributes() {
        return ['count', 'color', 'radius', 'mode', 'quantum-delay', 'quantum-entropy'];
    }

    constructor() {
        super();
        this.shadow = this.attachShadow({ mode: 'open' });
        this._quantumInterval = null;
        this._orbs = [];
        this._rotator = null;
    }

    connectedCallback() {
        this.render();
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue !== newValue) {
            this.render();
        }
    }

    clearQuantumInterval() {
        if (this._quantumInterval) {
            clearInterval(this._quantumInterval);
            this._quantumInterval = null;
        }
    }

    render() {
        const count = Math.max(1, parseInt(this.getAttribute('count')) || 5);
        const color = this.getAttribute('color') || '#00ffff';
        const radius = parseInt(this.getAttribute('radius')) || 40;
        const mode = this.getAttribute('mode');
        const quantumDelay = parseInt(this.getAttribute('quantum-delay')) || 3000;
        const entropy = parseFloat(this.getAttribute('quantum-entropy')) || 1.5;

        this.clearQuantumInterval();
        this.shadow.innerHTML = '';
        this._orbs = [];

        const wrapper = document.createElement('div');
        wrapper.className = 'orbital-wrapper';

        const center = document.createElement('div');
        center.className = 'orbital-center';

        const rotator = document.createElement('div');
        rotator.className = 'rotator';
        this._rotator = rotator;

        const style = document.createElement('style');
        style.textContent = `
      .orbital-wrapper {
        position: relative;
        width: 100%; height: 100%;
        min-height: 200px;
        display: flex;
        align-items: center;
        justify-content: center;
        pointer-events: none;
        z-index: 2;
      }
      .orbital-center {
        position: relative;
        width: 200px; height: 200px;
      }
      .rotator {
        width: 100%; height: 100%;
        position: absolute;
        top: 0; left: 0;
        animation: rotateOrbit 6s linear infinite;
        transform-origin: center center;
      }
      .orb {
        position: absolute;
        left: 50%; top: 50%;
        transform: translate(0px, 0px);
      }
      .orb-inner {
        width: 6px; height: 6px;
        margin-left: -3px; margin-top: -3px;
        border-radius: 50%;
        background: ${color};
        box-shadow: 0 0 6px ${color};
        animation: pulseOrb 2s infinite ease-in-out;
      }
      @keyframes rotateOrbit {
        from { transform: rotate(0deg); }
        to   { transform: rotate(360deg); }
      }
      @keyframes pulseOrb {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.3); }
      }
    `;

        for (let i = 0; i < count; i++) {
            const orb = document.createElement('div');
            orb.className = 'orb';

            const inner = document.createElement('div');
            inner.className = 'orb-inner';
            orb.appendChild(inner);

            this._orbs.push(orb);

            const angle = (360 / count) * i;
            const rad = angle * Math.PI / 180;
            const x = Math.sin(rad) * radius;
            const y = -Math.cos(rad) * radius;
            orb.style.transform = `translate(${x}px, ${y}px)`;
            orb.dataset.baseAngle = angle;
            rotator.appendChild(orb);
        }

        center.appendChild(rotator);
        wrapper.appendChild(center);
        this.shadow.appendChild(style);
        this.shadow.appendChild(wrapper);

        if (mode === 'quantum') {
            this._quantumInterval = setInterval(() => {
                if (!this._orbs.length) return;
                const orbA = this._orbs[Math.floor(Math.random() * this._orbs.length)];
                const orbB = this._orbs[Math.floor(Math.random() * this._orbs.length)];
                const innerA = orbA.querySelector('.orb-inner');
                const innerB = orbB.querySelector('.orb-inner');

                orbA.style.transition = 'opacity 0.3s, transform 0.3s';
                orbA.style.opacity = '0';

                setTimeout(() => {
                    const newAngle = Math.random() * 360 * entropy;
                    const rad = newAngle * Math.PI / 180;
                    const x = Math.sin(rad) * radius;
                    const y = -Math.cos(rad) * radius;
                    orbA.style.transform = `translate(${x}px, ${y}px)`;
                    orbA.dataset.baseAngle = newAngle;
                    orbA.style.opacity = '1';
                    innerA.style.boxShadow = `0 0 15px ${color}`;
                    setTimeout(() => {
                        innerA.style.boxShadow = `0 0 6px ${color}`;
                    }, 500);
                }, 300);

                innerB.style.transition = 'filter 0.3s';
                innerB.style.filter = 'brightness(1.8)';
                setTimeout(() => innerB.style.filter = 'brightness(1)', 500);
            }, quantumDelay);
        }
    }

    disconnectedCallback() {
        this.clearQuantumInterval();
    }
}

customElements.define('l-orbital-quantum', LOrbitalQuantum);
