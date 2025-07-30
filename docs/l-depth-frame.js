<<<<<<< HEAD
// l-depth-frame.js

class LDepthFrame extends HTMLElement {
    constructor() {
        super();
        this.shadow = this.attachShadow({ mode: 'open' });
        this.depth = parseFloat(this.getAttribute('depth')) || 15;
        this.tilt = this.hasAttribute('tilt');
        this.wrapper = null;
        this.tiltEnabled = false;
    }

    static get observedAttributes() {
        return ['depth', 'tilt'];
    }

    connectedCallback() {
        this.render();
        if (this.tilt) this.enableTilt();
    }

    attributeChangedCallback(name, oldVal, newVal) {
        if (name === 'depth') {
            this.depth = parseFloat(newVal);
        } else if (name === 'tilt') {
            this.tilt = this.hasAttribute('tilt');
            if (this.tilt) {
                this.enableTilt();
            } else {
                this.disableTilt();
            }
        }
    }

    render() {
        this.shadow.innerHTML = '';
        const style = document.createElement('style');
        style.textContent = `
      .depth-wrapper {
        width: 100%;
        height: 100%;
        perspective: 1000px;
        transform-style: preserve-3d;
        will-change: transform;
        transition: transform 0.3s ease;
      }

      .l-card {
        width: 100%;
        height: 100%;
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
        transition: box-shadow 0.4s ease;
        color: white;
      }
    `;

        const wrapper = document.createElement('div');
        wrapper.className = 'depth-wrapper';
        this.wrapper = wrapper;

        while (this.childNodes.length > 0) {
            wrapper.appendChild(this.childNodes[0]);
        }

        this.shadow.appendChild(style);
        this.shadow.appendChild(wrapper);
    }

    enableTilt() {
        if (this.tiltEnabled || !this.wrapper) return;
        this.tiltEnabled = true;

        this._onMouseMove = (e) => {
            const rect = this.getBoundingClientRect();
            const x = (e.clientX - rect.left) / rect.width - 0.5;
            const y = (e.clientY - rect.top) / rect.height - 0.5;
            const rotateY = x * this.depth;
            const rotateX = -y * this.depth;
            this.wrapper.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
        };

        this._onMouseLeave = () => {
            this.wrapper.style.transform = 'rotateX(0deg) rotateY(0deg)';
        };

        this.addEventListener('mousemove', this._onMouseMove);
        this.addEventListener('mouseleave', this._onMouseLeave);
    }

    disableTilt() {
        if (!this.tiltEnabled || !this.wrapper) return;
        this.removeEventListener('mousemove', this._onMouseMove);
        this.removeEventListener('mouseleave', this._onMouseLeave);
        this.wrapper.style.transform = 'rotateX(0deg) rotateY(0deg)';
        this.tiltEnabled = false;
    }
}

customElements.define('l-depth-frame', LDepthFrame);
=======
// l-depth-frame.js

class LDepthFrame extends HTMLElement {
    constructor() {
        super();
        this.shadow = this.attachShadow({ mode: 'open' });
        this.depth = parseFloat(this.getAttribute('depth')) || 15;
        this.tilt = this.hasAttribute('tilt');
        this.wrapper = null;
        this.tiltEnabled = false;
    }

    static get observedAttributes() {
        return ['depth', 'tilt'];
    }

    connectedCallback() {
        this.render();
        if (this.tilt) this.enableTilt();
    }

    attributeChangedCallback(name, oldVal, newVal) {
        if (name === 'depth') {
            this.depth = parseFloat(newVal);
        } else if (name === 'tilt') {
            this.tilt = this.hasAttribute('tilt');
            if (this.tilt) {
                this.enableTilt();
            } else {
                this.disableTilt();
            }
        }
    }

    render() {
        this.shadow.innerHTML = '';
        const style = document.createElement('style');
        style.textContent = `
      .depth-wrapper {
        width: 100%;
        height: 100%;
        perspective: 1000px;
        transform-style: preserve-3d;
        will-change: transform;
        transition: transform 0.3s ease;
      }

      .l-card {
        width: 100%;
        height: 100%;
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
        transition: box-shadow 0.4s ease;
        color: white;
      }
    `;

        const wrapper = document.createElement('div');
        wrapper.className = 'depth-wrapper';
        this.wrapper = wrapper;

        while (this.childNodes.length > 0) {
            wrapper.appendChild(this.childNodes[0]);
        }

        this.shadow.appendChild(style);
        this.shadow.appendChild(wrapper);
    }

    enableTilt() {
        if (this.tiltEnabled || !this.wrapper) return;
        this.tiltEnabled = true;

        this._onMouseMove = (e) => {
            const rect = this.getBoundingClientRect();
            const x = (e.clientX - rect.left) / rect.width - 0.5;
            const y = (e.clientY - rect.top) / rect.height - 0.5;
            const rotateY = x * this.depth;
            const rotateX = -y * this.depth;
            this.wrapper.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
        };

        this._onMouseLeave = () => {
            this.wrapper.style.transform = 'rotateX(0deg) rotateY(0deg)';
        };

        this.addEventListener('mousemove', this._onMouseMove);
        this.addEventListener('mouseleave', this._onMouseLeave);
    }

    disableTilt() {
        if (!this.tiltEnabled || !this.wrapper) return;
        this.removeEventListener('mousemove', this._onMouseMove);
        this.removeEventListener('mouseleave', this._onMouseLeave);
        this.wrapper.style.transform = 'rotateX(0deg) rotateY(0deg)';
        this.tiltEnabled = false;
    }
}

customElements.define('l-depth-frame', LDepthFrame);
>>>>>>> c92d80a (Update README and docs)
