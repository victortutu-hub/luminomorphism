# 🌟 Luminomorphism

**Luminomorphism** is a UI design system focused on visual interaction with light, blur, movement, and presence.

> Refined. Fluid. Luminous. Interactive.

---

## 🔮 Key Features

- 3D interactive cards with tilt effects (mouse + gyroscope)
- Animated reflections and orbital light elements
- Glowing particle trails and ripple-style illumination
- Modular Web Components with no dependencies
- Fully responsive layout: mobile, tablet, and HD screens

---

## 📁 File Structure

```
luminomorphism/
├── dist/                     # Core components (JS & CSS)
│   └── l-particle-net.js     # 🔥 Particle network component
│
├── docs/
│   └── labs/                 # Interactive demos for each component
│       └── l-particle-net.html
│
├── luminomorph.css           # Core visual styles
├── luminomorph.button.css    # Button glow styles
├── luminomorph-hdpatch.css   # HD screen enhancements
├── luminomorph-responsive.css # Mobile/tablet/TV scaling
```

---

## 🧩 Custom Components

### 🔘 `<l-orbital>`

Creates orbiting light dots around a central label.

**Attributes:**
- `count` – number of orbiters
- `color` – glow color
- `radius` – orbit radius in px

🔗 [Live Demo on GitHub Pages](https://victortutu-hub.github.io/luminomorphism/labs/l-orbital.html)

---

### 💫 `<l-particle-net>` — Interactive Luminomorphic Network

A one-of-a-kind glowing particle net with smooth animated connections. Nodes float, glow, and interact with the user's cursor in real time.

**Attributes:**
- `nodes` — number of particles (default: 32)
- `speed` — movement speed (default: 0.4)
- `color` — particle glow color (default: `#00ffff`)

🔗 [Live Demo on GitHub Pages](https://victortutu-hub.github.io/luminomorphism/labs/l-particle-net.html)

---

### 🌌 `<l-glass-shape>`

Floating luminous shapes that create atmospheric background depth.

**Attributes:**
- `glow` — color of the shape
- `speed` — `slow`, `medium`, `fast`

---

## ⚙️ Initialization

Include the main script:

```html
<script src="luminomorph.js"></script>
<script>
  Luminomorph.init({ tilt: true, sound: false });
</script>
```

---

## 🧪 Example: Button with Glow

```html
<button class="luminomorph-button">Click Me</button>
<script src="luminomorph.button.js"></script>
```

---

## 🌐 Responsive Support

This library includes:
- Smart scaling via `luminomorph-responsive.css`
- Blur/text clarity patches for HD and low-DPI displays

---

## 🚀 Local Demo

1. Clone or download this repo
2. Run `start_server.bat` or open `index.html` directly
3. Explore `docs/labs/` for interactive previews

---

## 💡 Philosophy

**Luminomorphism** is not just a look — it’s a living interface style.  
Every element responds to light, motion, and presence.

> It’s an experience. Not a decoration.

---

## 🌍 Translations

🇷🇴 [Romanian version](./README.RO.md)

---

## 🧠 Author

Made with light by [Victor Mihai (victortutu-hub)](https://github.com/victortutu-hub)

---

## 📄 License

MIT — Free to use, adapt, and build upon.
