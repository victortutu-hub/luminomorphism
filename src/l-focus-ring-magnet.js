// Componentă luminomorfică: l-focus-ring-magnet
// Se atașează automat pe elemente interactive apropiate (buton, input, etc.)
class LFocusRingMagnet extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.radius = parseInt(this.getAttribute('radius')) || 30;
        this.color = this.getAttribute('color') || '#00ffff';
        this.range = parseInt(this.getAttribute('magnet-range')) || 80;
        this.pulseOnFocus = this.hasAttribute('pulse-on-focus');
        this.currentTarget = null;
    }

    connectedCallback() {
        this.render();
        document.addEventListener('mousemove', this.track.bind(this));
        document.addEventListener('focusin', this.focus.bind(this));
        document.addEventListener('focusout', this.unfocus.bind(this));
    }

    disconnectedCallback() {
        document.removeEventListener('mousemove', this.track);
        document.removeEventListener('focusin', this.focus);
        document.removeEventListener('focusout', this.unfocus);
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
        box-shadow: 0 0 12px ${this.color};
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
        if (this.shadowRoot) {
            while (this.shadowRoot.firstChild) this.shadowRoot.removeChild(this.shadowRoot.firstChild);
        }
        this.shadowRoot.appendChild(style);
        this.shadowRoot.appendChild(ring);
        this.ring = ring;
    }

    track(e) {
        const targets = [...document.querySelectorAll('button, input, textarea, [tabindex]')];
        const near = targets.find(el => {
            const rect = el.getBoundingClientRect();
            const dx = e.clientX - (rect.left + rect.width / 2);
            const dy = e.clientY - (rect.top + rect.height / 2);
            const dist = Math.sqrt(dx * dx + dy * dy);
            return dist < this.range;
        });

        if (near && near !== this.currentTarget) {
            const rect = near.getBoundingClientRect();
            if (!this.ring) return;
            this.ring.style.left = `${rect.left + rect.width / 2}px`;
            this.ring.style.top = `${rect.top + rect.height / 2}px`;
            this.ring.style.opacity = '1';
            this.ring.classList.remove('pulse');
            this.currentTarget = near;
        }

        if (!near) {
            if (!this.ring) return;
            this.ring.style.opacity = '0';
            this.currentTarget = null;
        }
    }

    focus(e) {
        if (!this.pulseOnFocus || !this.ring) return;
        const rect = e.target.getBoundingClientRect();
        this.ring.style.left = `${rect.left + rect.width / 2}px`;
        this.ring.style.top = `${rect.top + rect.height / 2}px`;
        this.ring.style.opacity = '1';
        this.ring.classList.add('pulse');
    }

    unfocus() {
        if (!this.ring) return;
        this.ring.classList.remove('pulse');
        this.ring.style.opacity = '0';
    }
}

customElements.define('l-focus-ring-magnet', LFocusRingMagnet);
