class LEchoPress extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });

    const wrapper = document.createElement("div");
    wrapper.classList.add("echo-wrapper");
    wrapper.innerHTML = `<slot></slot>`;

    const style = document.createElement("style");
    style.textContent = `
      .echo-wrapper {
        position: relative;
        display: inline-block;
        overflow: hidden;
      }

      .echo-effect {
        position: absolute;
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background: radial-gradient(circle, #00ffffcc 0%, transparent 70%);
        pointer-events: none;
        transform: scale(0);
        opacity: 0.8;
        animation: echo-expand 0.8s ease-out forwards;
        z-index: 100;
      }

      @keyframes echo-expand {
        to {
          transform: scale(12);
          opacity: 0;
        }
      }
    `;

    this.shadowRoot.append(style, wrapper);

    wrapper.addEventListener("click", (e) => this.spawnEcho(e));
  }

  spawnEcho(e) {
    const echo = document.createElement("span");
    echo.classList.add("echo-effect");

    const rect = this.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    echo.style.left = `${x - 20}px`;
    echo.style.top = `${y - 20}px`;

    this.shadowRoot.querySelector(".echo-wrapper").appendChild(echo);

    echo.addEventListener("animationend", () => {
      echo.remove();
    });
  }
}

customElements.define("l-echo-press", LEchoPress);
