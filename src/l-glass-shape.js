
// l-glass-shape-visible.js

class LGlassShape extends HTMLElement {
  constructor() {
    super();
    const shadow = this.attachShadow({ mode: 'open' });

    const glowColor = this.getAttribute('glow') || '#00ffff';
    const speed = this.getAttribute('speed') || 'medium';
    const delay = Math.floor(Math.random() * 10);

    const wrapper = document.createElement('div');
    wrapper.className = `glass-shape ${speed}`;
    wrapper.innerHTML = `
      <svg viewBox="0 0 200 200" width="100%" height="100%" style="animation-delay: ${delay}s;">
        <defs>
          <radialGradient id="glowGradient" r="70%" cx="50%" cy="50%">
            <stop offset="0%" stop-color="${glowColor}" stop-opacity="0.4"/>
            <stop offset="100%" stop-color="${glowColor}" stop-opacity="0"/>
          </radialGradient>
        </defs>
        <circle cx="100" cy="100" r="80" fill="url(#glowGradient)" />
      </svg>
    `;

    const style = document.createElement('style');
    style.textContent = `
      .glass-shape {
        position: absolute;
        pointer-events: none;
        z-index: 1;
        animation: float 14s ease-in-out infinite alternate;
        opacity: 0.6;
        mix-blend-mode: screen;
      }

      .slow { animation-duration: 20s; }
      .medium { animation-duration: 10s; }
      .fast { animation-duration: 5s; }

      @keyframes float {
        0% { transform: translate(0px, 0px) scale(1); }
        50% { transform: translate(-30px, 20px) scale(1.3); }
        100% { transform: translate(20px, -25px) scale(1); }
      }

      svg {
        width: 100%;
        height: 100%;
        display: block;
      }
    `;

    shadow.appendChild(style);
    shadow.appendChild(wrapper);
  }
}

customElements.define('l-glass-shape', LGlassShape);
