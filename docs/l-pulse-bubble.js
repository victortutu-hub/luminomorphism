<<<<<<< HEAD
// l-pulse-bubble.js - Versiune îmbunătățită

class LPulseBubble extends HTMLElement {
    constructor() {
        super();
        this.shadow = this.attachShadow({ mode: 'open' });
        this.render();
    }

    static get observedAttributes() {
        return ['count', 'color', 'speed', 'size', 'floating'];
    }

    attributeChangedCallback(name, oldVal, newVal) {
        if (oldVal !== newVal) this.render();
    }

    render() {
        const count = parseInt(this.getAttribute('count')) || 8;
        const color = this.getAttribute('color') || '#00ffff';
        const speed = this.getAttribute('speed') || 'medium';
        const size = parseInt(this.getAttribute('size')) || 20;
        const floating = this.getAttribute('floating') !== 'false'; // default true

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
        width: ${size}px;
        height: ${size}px;
        background: ${color};
        opacity: 0.3;
        border-radius: 50%;
        /* Înlocuit blur cu box-shadow pentru performanță */
        box-shadow: 0 0 15px ${color}, 0 0 30px ${color}40;
        animation: pulse infinite ease-in-out;
        ${floating ? 'animation: pulse-float infinite ease-in-out;' : 'animation: pulse infinite ease-in-out;'}
      }

      .slow    { animation-duration: 8s; }
      .medium  { animation-duration: 5s; }
      .fast    { animation-duration: 2.5s; }

      @keyframes pulse {
        0% { transform: scale(1); opacity: 0.3; }
        50% { transform: scale(2.5); opacity: 0.05; }
        100% { transform: scale(1); opacity: 0.3; }
      }

      /* Animație combinată: pulse + float */
      @keyframes pulse-float {
        0% { 
          transform: scale(1) translateY(0px); 
          opacity: 0.3; 
        }
        25% { 
          transform: scale(1.8) translateY(-10px); 
          opacity: 0.15; 
        }
        50% { 
          transform: scale(2.5) translateY(-15px); 
          opacity: 0.05; 
        }
        75% { 
          transform: scale(1.8) translateY(-10px); 
          opacity: 0.15; 
        }
        100% { 
          transform: scale(1) translateY(0px); 
          opacity: 0.3; 
        }
      }

      /* Responsive adjustments */
      @media (max-width: 768px) {
        .bubble {
          box-shadow: 0 0 8px ${color}, 0 0 15px ${color}40;
        }
      }
    `;

        // Generează bule cu delay randomizat
        for (let i = 0; i < count; i++) {
            const bubble = document.createElement('div');
            bubble.className = `bubble ${speed}`;

            // Poziționare random
            bubble.style.top = (Math.random() * 90) + '%';
            bubble.style.left = (Math.random() * 90) + '%';

            // Delay random pentru animație
            const randomDelay = Math.random() * 3; // 0-3 secunde
            bubble.style.animationDelay = randomDelay + 's';

            // Variație ușoară în mărime pentru organic feel
            const sizeVariation = 0.7 + (Math.random() * 0.6); // 0.7x - 1.3x
            bubble.style.transform = `scale(${sizeVariation})`;

            container.appendChild(bubble);
        }

        this.shadow.appendChild(style);
        this.shadow.appendChild(container);
    }

    // Metodă pentru refresh dinamic
    refresh() {
        this.render();
    }

    // Metodă pentru pause/resume animații
    pause() {
        const bubbles = this.shadow.querySelectorAll('.bubble');
        bubbles.forEach(bubble => {
            bubble.style.animationPlayState = 'paused';
        });
    }

    resume() {
        const bubbles = this.shadow.querySelectorAll('.bubble');
        bubbles.forEach(bubble => {
            bubble.style.animationPlayState = 'running';
        });
    }
}

customElements.define('l-pulse-bubble', LPulseBubble);

// Export pentru module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = LPulseBubble;
=======
// l-pulse-bubble.js - Versiune îmbunătățită

class LPulseBubble extends HTMLElement {
    constructor() {
        super();
        this.shadow = this.attachShadow({ mode: 'open' });
        this.render();
    }

    static get observedAttributes() {
        return ['count', 'color', 'speed', 'size', 'floating'];
    }

    attributeChangedCallback(name, oldVal, newVal) {
        if (oldVal !== newVal) this.render();
    }

    render() {
        const count = parseInt(this.getAttribute('count')) || 8;
        const color = this.getAttribute('color') || '#00ffff';
        const speed = this.getAttribute('speed') || 'medium';
        const size = parseInt(this.getAttribute('size')) || 20;
        const floating = this.getAttribute('floating') !== 'false'; // default true

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
        width: ${size}px;
        height: ${size}px;
        background: ${color};
        opacity: 0.3;
        border-radius: 50%;
        /* Înlocuit blur cu box-shadow pentru performanță */
        box-shadow: 0 0 15px ${color}, 0 0 30px ${color}40;
        animation: pulse infinite ease-in-out;
        ${floating ? 'animation: pulse-float infinite ease-in-out;' : 'animation: pulse infinite ease-in-out;'}
      }

      .slow    { animation-duration: 8s; }
      .medium  { animation-duration: 5s; }
      .fast    { animation-duration: 2.5s; }

      @keyframes pulse {
        0% { transform: scale(1); opacity: 0.3; }
        50% { transform: scale(2.5); opacity: 0.05; }
        100% { transform: scale(1); opacity: 0.3; }
      }

      /* Animație combinată: pulse + float */
      @keyframes pulse-float {
        0% { 
          transform: scale(1) translateY(0px); 
          opacity: 0.3; 
        }
        25% { 
          transform: scale(1.8) translateY(-10px); 
          opacity: 0.15; 
        }
        50% { 
          transform: scale(2.5) translateY(-15px); 
          opacity: 0.05; 
        }
        75% { 
          transform: scale(1.8) translateY(-10px); 
          opacity: 0.15; 
        }
        100% { 
          transform: scale(1) translateY(0px); 
          opacity: 0.3; 
        }
      }

      /* Responsive adjustments */
      @media (max-width: 768px) {
        .bubble {
          box-shadow: 0 0 8px ${color}, 0 0 15px ${color}40;
        }
      }
    `;

        // Generează bule cu delay randomizat
        for (let i = 0; i < count; i++) {
            const bubble = document.createElement('div');
            bubble.className = `bubble ${speed}`;

            // Poziționare random
            bubble.style.top = (Math.random() * 90) + '%';
            bubble.style.left = (Math.random() * 90) + '%';

            // Delay random pentru animație
            const randomDelay = Math.random() * 3; // 0-3 secunde
            bubble.style.animationDelay = randomDelay + 's';

            // Variație ușoară în mărime pentru organic feel
            const sizeVariation = 0.7 + (Math.random() * 0.6); // 0.7x - 1.3x
            bubble.style.transform = `scale(${sizeVariation})`;

            container.appendChild(bubble);
        }

        this.shadow.appendChild(style);
        this.shadow.appendChild(container);
    }

    // Metodă pentru refresh dinamic
    refresh() {
        this.render();
    }

    // Metodă pentru pause/resume animații
    pause() {
        const bubbles = this.shadow.querySelectorAll('.bubble');
        bubbles.forEach(bubble => {
            bubble.style.animationPlayState = 'paused';
        });
    }

    resume() {
        const bubbles = this.shadow.querySelectorAll('.bubble');
        bubbles.forEach(bubble => {
            bubble.style.animationPlayState = 'running';
        });
    }
}

customElements.define('l-pulse-bubble', LPulseBubble);

// Export pentru module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = LPulseBubble;
>>>>>>> c92d80a (Update README and docs)
}