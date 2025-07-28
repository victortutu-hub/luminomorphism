
// luminomorph-tiltfix.js

const Luminomorph = {
  init: function (options = {}) {
    const cards = document.querySelectorAll('.l-card');

    // 🖱️ Desktop tilt (mouse)
    document.addEventListener('mousemove', (e) => {
      const x = e.clientX / window.innerWidth - 0.5;
      const y = e.clientY / window.innerHeight - 0.5;
      const rotateX = y * 30;
      const rotateY = x * -30;
      cards.forEach(card => {
        card.style.setProperty('--card-transform', `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`);
      });
    });

    // 📱 Mobile tilt (gyroscope)
    function handleOrientation(e) {
      const rotateX = (e.beta - 45) / 3;
      const rotateY = -e.gamma / 3;
      cards.forEach(card => {
        card.style.setProperty('--card-transform', `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`);
      });
    }

    if (window.DeviceOrientationEvent && typeof DeviceOrientationEvent.requestPermission === 'function') {
      const askPermission = () => {
        DeviceOrientationEvent.requestPermission().then(permissionState => {
          if (permissionState === 'granted') {
            window.addEventListener('deviceorientation', handleOrientation);
          }
        }).catch(console.error);
      };

      const btn = document.createElement('button');
      btn.innerText = "Enable Motion";
      Object.assign(btn.style, {
        position: "fixed",
        top: "20px",
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: "9999",
        padding: "10px 20px",
        borderRadius: "10px",
        border: "none",
        background: "rgba(255,255,255,0.1)",
        color: "white",
        backdropFilter: "blur(10px)",
        cursor: "pointer",
        fontWeight: "bold"
      });
      btn.onclick = () => {
        askPermission();
        btn.remove();
      };
      document.body.appendChild(btn);

    } else if (window.DeviceOrientationEvent) {
      // Android (no permission required)
      window.addEventListener('deviceorientation', handleOrientation);
    }

    // 🔊 Sound on hover (desktop)
    if (options.sound) {
      const audio = new Audio(options.sound);
      cards.forEach(card => {
        card.addEventListener('mouseenter', () => {
          audio.currentTime = 0;
          audio.play();
        });
      });
    }
  }
};
