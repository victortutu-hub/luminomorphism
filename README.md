# 🌟 Luminomorphism

**Luminomorphism** is a UI design system focused on visual interaction with light, blur, movement, and presence.

> Refined. Fluid. Luminous.

## 🔮 Key Features

- **3D interactive cards** with tilt effects (mouse + gyroscope)
- **Animated reflections** and **orbital light elements**
- **Ambient glow shapes** using `<l-glass-shape>`
- **Ripple-style buttons** with soft illumination
- **Fully responsive for mobile, tablet, and large screens (HD patches)**

## 📦 File Structure

```
luminomorphism/
├── index.html                 # Demo homepage
├── labs/
│   └── l-orbital.html         # Demo for <l-orbital> component
│
├── luminomorph.css            # Base UI styles
├── luminomorph.button.css     # Button styles
├── luminomorph-hdpatch.css    # HD screen enhancements
├── luminomorph-responsive.css # Mobile/tablet/TV scaling
│
├── luminomorph.js             # Tilt and motion control
├── luminomorph.button.js      # Ripple animation logic
├── l-orbital.js               # Custom element for orbiting particles
├── l-glass-shape.js           # Ambient glow bubble effect
```

## 🧪 Custom Components

### `<l-orbital>`
Creates orbiting light dots around a central label.

**Attributes:**
- `count` — number of orbits (e.g. 12)
- `color` — orbit color (e.g. `#00ffff`)
- `radius` — orbit radius in px (e.g. `40`)

🔗 [Demo in `labs/l-orbital.html`](labs/l-orbital.html)

---

### `<l-glass-shape>`
Floating luminous shapes used in the background.

**Attributes:**
- `glow` — color (e.g. `#ff00ff`)
- `speed` — `slow`, `medium`, `fast`

---

## 🧠 Initialization

Include the main script:

```html
<script src="luminomorph.js"></script>
<script>
  Luminomorph.init({ tilt: true, sound: false });
</script>
```

---

## 🧰 Button Example

```html
<button class="luminomorph-button">Click Me</button>
```

```html
<script src="luminomorph.button.js"></script>
```

---

## 🌐 Responsiveness & HD Support

Included CSS patches ensure:
- Smart scaling on small/medium/large devices
- Blur and text clarity on HD or low-DPI displays

---

## 🧪 Local Testing

1. Clone or download the repo
2. Open `index.html` in a modern browser
3. Explore `/labs/` for interactive demos

---

## 💡 Philosophy

**Luminomorphism** is not just a style — it's an aesthetic of digital fluidity and presence, reacting to movement and light.

> It’s an experience, not a decoration.

---

## 🌍 Translations

🇷🇴 [Versiunea în limba română](./README.RO.md)

---

## 🛠 Created by

[Victor Mihai (victortutu-hub)](https://github.com/victortutu-hub)

---

## 📄 License

MIT — free for use and modification.