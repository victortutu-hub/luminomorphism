class LGlintFocus extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });

    const wrapper = document.createElement("div");
    wrapper.classList.add("glint-wrapper");
    wrapper.innerHTML = `
      <slot></slot>
      <span class="glint-line"></span>
    `;

    const style = document.createElement("style");
    style.textContent = `
      .glint-wrapper {
        position: relative;
        display: inline-block;
      }

      .glint-line {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 2px;
        background: linear-gradient(to right, transparent, #00ffffaa, transparent);
        pointer-events: none;
        transform: translateY(-4px);
        opacity: 0;
      }

      :host(:focus-within) .glint-line {
        animation: glint-sweep 1.2s ease-out forwards;
        opacity: 1;
      }

      @keyframes glint-sweep {
        0% {
          left: -100%;
          opacity: 0;
        }
        30% {
          opacity: 1;
        }
        100% {
          left: 100%;
          opacity: 0;
        }
      }
    `;

    this.shadowRoot.append(style, wrapper);
  }
}

customElements.define("l-glint-focus", LGlintFocus);
