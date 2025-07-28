class LPrismLayer extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });

    this.wrapper = document.createElement("div");
    this.wrapper.classList.add("prism-layer");
    this.wrapper.innerHTML = `<slot></slot>`;

    this.styleEl = document.createElement("style");
    this.shadowRoot.append(this.styleEl, this.wrapper);

    this.intensity = this.getAttribute("intensity") || "medium";
    this.interaction = this.getAttribute("interaction") || "hover";

    this.mouse = { x: 0, y: 0 };
    this.animate = this.animate.bind(this);
  }

  connectedCallback() {
    this.updateStyle();
    if (this.interaction === "cursor") {
      this.addEventListener("pointermove", this.trackMouse.bind(this));
    }
    requestAnimationFrame(this.animate);
  }

  static get observedAttributes() {
    return ["intensity", "interaction"];
  }

  attributeChangedCallback(name, oldVal, newVal) {
    if (oldVal !== newVal) {
      this[name] = newVal;
      this.updateStyle();
    }
  }

  trackMouse(e) {
    const rect = this.getBoundingClientRect();
    this.mouse.x = e.clientX - rect.left;
    this.mouse.y = e.clientY - rect.top;
  }

  animate() {
    const layer = this.wrapper;
    if (this.interaction === "cursor") {
      const x = this.mouse.x;
      const y = this.mouse.y;
      const centerX = this.offsetWidth / 2;
      const centerY = this.offsetHeight / 2;
      const dx = x - centerX;
      const dy = y - centerY;
      const angle = Math.atan2(dy, dx) * (180 / Math.PI);
      layer.style.setProperty("--prism-angle", `${angle}deg`);
    }
    requestAnimationFrame(this.animate);
  }

  updateStyle() {
    const intensityMap = {
      low: "0.15",
      medium: "0.3",
      high: "0.5"
    };
    const opacity = intensityMap[this.intensity] || "0.3";

    const interactionCSS = {
      hover: `
        .prism-layer::before {
          opacity: 0;
          transform: rotate(0deg);
        }
        .prism-layer:hover::before {
          opacity: ${opacity};
          transform: rotate(25deg);
        }
      `,
      always: `
        .prism-layer::before {
          opacity: ${opacity};
          transform: rotate(0deg);
        }
      `,
      cursor: `
        .prism-layer::before {
          opacity: ${opacity};
          transform: rotate(var(--prism-angle, 0deg));
        }
      `
    };

    const extra = interactionCSS[this.interaction] || interactionCSS["hover"];

    this.styleEl.textContent = `
      .prism-layer {
        position: relative;
        display: inline-block;
        overflow: hidden;
        background: inherit;
        border-radius: 12px;
      }
      .prism-layer::before {
        content: "";
        position: absolute;
        inset: 0;
        background: conic-gradient(from 0deg, red, orange, yellow, green, blue, indigo, violet, red);
        mix-blend-mode: screen;
        filter: blur(20px) hue-rotate(0deg);
        pointer-events: none;
        transition: opacity 0.4s ease, transform 0.4s ease;
        z-index: 1;
      }
      ${extra}
    `;
  }
}

customElements.define("l-prism-layer", LPrismLayer);
