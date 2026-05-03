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

Workflow: `.github/workflows/pages.yml`.

### One-time setup (do this first)

1. On GitHub: **Settings → Pages**.
2. Under **Build and deployment → Source**, select **GitHub Actions** (not “Deploy from a branch”).
3. Push to `main`, or **Actions → Deploy to GitHub Pages → Run workflow**.

If step 2 is skipped, the job can fail with **Get Pages site failed** / **Not Found** — Pages is not enabled yet, and the default Actions token cannot create it for you.

Live URL after a successful run: `https://<user>.github.io/<repo>/`

**Private repos:** free GitHub Pages for private repositories may be disabled; use a **public** repo or check your account/org rules.

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
