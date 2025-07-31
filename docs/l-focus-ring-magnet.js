// l-focus-ring-magnet Web Component
class LFocusRingMagnet extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.radius = parseInt(this.getAttribute('radius')) || 30;
        this.color = this.getAttribute('color') || '#00ffff';
        this.range = parseInt(this.getAttribute('magnet-range')) || 80;
        this.pulseOnFocus = this.hasAttribute('pulse-on-focus');
        this.currentTarget = null;
        this.render();
    }

    connectedCallback() {
        this.trackHandler = this.track.bind(this);
        this.focusHandler = this.focus.bind(this);
        this.unfocusHandler = this.unfocus.bind(this);

        document.addEventListener('mousemove', this.trackHandler);
        document.addEventListener('focusin', this.focusHandler);
        document.addEventListener('focusout', this.unfocusHandler);
    }

    disconnectedCallback() {
        document.removeEventListener('mousemove', this.trackHandler);
        document.removeEventListener('focusin', this.focusHandler);
        document.removeEventListener('focusout', this.unfocusHandler);
    }

    updateAttributes() {
        this.radius = parseInt(this.getAttribute('radius')) || 30;
        this.color = this.getAttribute('color') || '#00ffff';
        this.range = parseInt(this.getAttribute('magnet-range')) || 80;
        this.pulseOnFocus = this.hasAttribute('pulse-on-focus');
        this.render();
    }

    render() {
        const style = document.createElement('style');
        style.textContent = `
          .ring {
            position: fixed;
            pointer-events: none;
            border-radius: 50%;
            width: ${this.radius * 2}px;
            height: ${this.radius * 2}px;
            margin-left: -${this.radius}px;
            margin-top: -${this.radius}px;
            background: radial-gradient(circle, ${this.color}55, transparent);
            box-shadow: 0 0 12px ${this.color}, 0 0 24px ${this.color}44;
            opacity: 0;
            transform: scale(1);
            transition: opacity 0.2s ease, transform 0.4s ease;
            z-index: 9999;
          }
          .ring.pulse {
            animation: pulse 1.5s ease-in-out infinite;
          }
          @keyframes pulse {
            0%, 100% { transform: scale(1); opacity: 0.6; }
            50% { transform: scale(1.2); opacity: 1; }
          }
        `;
        const ring = document.createElement('div');
        ring.className = 'ring';
        this.shadowRoot.innerHTML = '';
        this.shadowRoot.appendChild(style);
        this.shadowRoot.appendChild(ring);
        this.ring = ring;
    }

    track(e) {
        const targets = [...document.querySelectorAll('button, input, textarea, select, [tabindex]:not([tabindex="-1"])')];
        const near = targets.find(el => {
            const rect = el.getBoundingClientRect();
            const dx = e.clientX - (rect.left + rect.width / 2);
            const dy = e.clientY - (rect.top + rect.height / 2);
            const dist = Math.sqrt(dx * dx + dy * dy);
            return dist < this.range;
        });

        if (near && near !== this.currentTarget) {
            const rect = near.getBoundingClientRect();
            this.ring.style.left = `${rect.left + rect.width / 2}px`;
            this.ring.style.top = `${rect.top + rect.height / 2}px`;
            this.ring.style.opacity = '0.8';
            this.ring.classList.remove('pulse');
            this.currentTarget = near;
        }

        if (!near) {
            this.ring.style.opacity = '0';
            this.currentTarget = null;
        }
    }

    focus(e) {
        if (!this.pulseOnFocus) return;
        const rect = e.target.getBoundingClientRect();
        this.ring.style.left = `${rect.left + rect.width / 2}px`;
        this.ring.style.top = `${rect.top + rect.height / 2}px`;
        this.ring.style.opacity = '1';
        this.ring.classList.add('pulse');
    }

    unfocus() {
        this.ring.classList.remove('pulse');
        if (!this.currentTarget) {
            this.ring.style.opacity = '0';
        }
    }
}

customElements.define('l-focus-ring-magnet', LFocusRingMagnet);

// Control panel functionality
const magnet = document.getElementById('magnet');
const radiusInput = document.getElementById('radius');
const colorInput = document.getElementById('color');
const rangeInput = document.getElementById('range');
const pulseInput = document.getElementById('pulse');

function updateMagnet() {
    magnet.setAttribute('radius', radiusInput.value);
    magnet.setAttribute('color', colorInput.value);
    magnet.setAttribute('magnet-range', rangeInput.value);

    if (pulseInput.checked) {
        magnet.setAttribute('pulse-on-focus', '');
    } else {
        magnet.removeAttribute('pulse-on-focus');
    }

    magnet.updateAttributes();
}

radiusInput.addEventListener('input', updateMagnet);
colorInput.addEventListener('input', updateMagnet);
rangeInput.addEventListener('input', updateMagnet);
pulseInput.addEventListener('change', updateMagnet);