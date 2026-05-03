# Taken — CQB browser game

First-person Three.js prototype: clear a villa, rescue the hostage, extract. Optional shooting range for loadout practice.

**Requirements:** a modern browser and network access (Three.js and other dependencies load from CDNs).

## Run locally

Serve the folder over HTTP (recommended) or open `index.html` directly.

```bash
python -m http.server 8080
```

Then open `http://localhost:8080`.

## Controls

| Input | Action |
|--------|--------|
| Click canvas | Pointer lock / mouse look |
| `W` `A` `S` `D` | Move |
| `Shift` | Sprint |
| `Space` | Jump |
| `Q` / `E` | Lean |
| `O` | Toggle nearest door |
| `LMB` | Fire |
| `R` | Reload |
| `1` / `2` | Primary / secondary |
| `RMB` | AWM scope (scroll wheel zoom) |

`E` interacts with the hostage when prompted.

## GitHub Pages

Repository includes `.github/workflows/pages.yml`. In GitHub: **Settings → Pages → Source: GitHub Actions**. After a successful deployment the site is at `https://<user>.github.io/<repo>/`.

## Layout

```
├── index.html
├── style.css
├── src/
│   ├── main.js
│   ├── config/
│   ├── core/
│   ├── systems/
│   ├── three/
│   └── render/
└── assets/maps/
```
