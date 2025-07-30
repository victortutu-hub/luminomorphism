<<<<<<< HEAD
// l-ripple-hover.js

class LRippleHover extends HTMLElement {
    constructor() {
        super();
        this.color = this.getAttribute('color') || '#00ffff';
        this.duration = parseInt(this.getAttribute('duration')) || 600;
        this.selector = this.getAttribute('target') || '.l-button';
        this.activeElements = new Set();
    }

    static get observedAttributes() {
        return ['color', 'duration', 'target'];
    }

    attributeChangedCallback(name, oldVal, newVal) {
        if (oldVal !== newVal) {
            if (name === 'color') this.color = newVal;
            if (name === 'duration') this.duration = parseInt(newVal);
            if (name === 'target') this.selector = newVal;
            this.cleanup();
            this.attachRippleToTargets();
        }
    }

    connectedCallback() {
        const style = document.createElement('style');
        style.textContent = `
      .ripple-hover {
        position: absolute;
        border-radius: 50%;
        transform: scale(0);
        opacity: 0.4;
        pointer-events: none;
        filter: blur(8px);
        animation: ripple-spread ease-out;
        z-index: 2;
      }

      @keyframes ripple-spread {
        to {
          transform: scale(1);
          opacity: 0;
        }
      }
    `;
        document.head.appendChild(style);
        this.attachRippleToTargets();
    }

    attachRippleToTargets() {
        document.querySelectorAll(this.selector).forEach(el => {
            if (!this.activeElements.has(el)) {
                el.style.position = el.style.position || 'relative';
                el.style.overflow = 'hidden';
                const handler = e => this.createRipple(e, el);
                el.addEventListener('mouseenter', handler);
                this.activeElements.add(el);
                el._rippleHandler = handler;
            }
        });
    }

    cleanup() {
        this.activeElements.forEach(el => {
            el.removeEventListener('mouseenter', el._rippleHandler);
            delete el._rippleHandler;
        });
        this.activeElements.clear();
    }

    createRipple(e, el) {
        const ripple = document.createElement('span');
        ripple.className = 'ripple-hover';

        const rect = el.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        ripple.style.left = `${x}px`;
        ripple.style.top = `${y}px`;
        ripple.style.width = ripple.style.height = `${size * 2}px`;
        ripple.style.marginLeft = `-${size}px`;
        ripple.style.marginTop = `-${size}px`;
        ripple.style.background = this.color;
        ripple.style.animationDuration = `${this.duration}ms`;

        el.appendChild(ripple);
        setTimeout(() => ripple.remove(), this.duration);
    }
}

customElements.define('l-ripple-hover', LRippleHover);
=======
// l-ripple-hover.js

class LRippleHover extends HTMLElement {
    constructor() {
        super();
        this.color = this.getAttribute('color') || '#00ffff';
        this.duration = parseInt(this.getAttribute('duration')) || 600;
        this.selector = this.getAttribute('target') || '.l-button';
        this.activeElements = new Set();
    }

    static get observedAttributes() {
        return ['color', 'duration', 'target'];
    }

    attributeChangedCallback(name, oldVal, newVal) {
        if (oldVal !== newVal) {
            if (name === 'color') this.color = newVal;
            if (name === 'duration') this.duration = parseInt(newVal);
            if (name === 'target') this.selector = newVal;
            this.cleanup();
            this.attachRippleToTargets();
        }
    }

    connectedCallback() {
        const style = document.createElement('style');
        style.textContent = `
      .ripple-hover {
        position: absolute;
        border-radius: 50%;
        transform: scale(0);
        opacity: 0.4;
        pointer-events: none;
        filter: blur(8px);
        animation: ripple-spread ease-out;
        z-index: 2;
      }

      @keyframes ripple-spread {
        to {
          transform: scale(1);
          opacity: 0;
        }
      }
    `;
        document.head.appendChild(style);
        this.attachRippleToTargets();
    }

    attachRippleToTargets() {
        document.querySelectorAll(this.selector).forEach(el => {
            if (!this.activeElements.has(el)) {
                el.style.position = el.style.position || 'relative';
                el.style.overflow = 'hidden';
                const handler = e => this.createRipple(e, el);
                el.addEventListener('mouseenter', handler);
                this.activeElements.add(el);
                el._rippleHandler = handler;
            }
        });
    }

    cleanup() {
        this.activeElements.forEach(el => {
            el.removeEventListener('mouseenter', el._rippleHandler);
            delete el._rippleHandler;
        });
        this.activeElements.clear();
    }

    createRipple(e, el) {
        const ripple = document.createElement('span');
        ripple.className = 'ripple-hover';

        const rect = el.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        ripple.style.left = `${x}px`;
        ripple.style.top = `${y}px`;
        ripple.style.width = ripple.style.height = `${size * 2}px`;
        ripple.style.marginLeft = `-${size}px`;
        ripple.style.marginTop = `-${size}px`;
        ripple.style.background = this.color;
        ripple.style.animationDuration = `${this.duration}ms`;

        el.appendChild(ripple);
        setTimeout(() => ripple.remove(), this.duration);
    }
}

customElements.define('l-ripple-hover', LRippleHover);
>>>>>>> c92d80a (Update README and docs)
