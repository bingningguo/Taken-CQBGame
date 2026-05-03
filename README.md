# Taken (browser FPS prototype)

Browser-based first-person shooter prototype. The current build is a Three.js CQB villa-clearing prototype.

## Run locally

Open `index.html` in a browser. Three.js is loaded from a CDN, so an internet connection is required.

## Standalone Git repository

This folder is meant to be the **root** of its own repo (not a subfolder inside another project).

```bash
cd Game   # or rename/copy the folder to your project name
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/<you>/<repo-name>.git
git push -u origin main
```

## GitHub Pages

1. Push `main` to GitHub (workflow is `.github/workflows/pages.yml`).
2. **Settings → Pages → Build and deployment → Source:** **GitHub Actions**.
3. After the workflow succeeds, open  
   `https://<your-username>.github.io/<repo-name>/`  
   (repo `<user>.github.io` → `https://<user>.github.io/`).

Relative `src/` paths work on project Pages without a `<base>` tag.

## Controls

- `WASD`: move
- Mouse or `Arrow Left` / `Arrow Right`: turn
- `Shift`: sprint
- `Space`: jump
- `Q` / `E`: lean left / right
- `O`: toggle nearest room door
- Left click: shoot
- Click the screen: lock mouse

## Goal

Start outside a small villa, breach into the first floor, clear rooms, move through the basement and second floor, and use windows/overlooks for vertical sightlines.

## Current Features

- Three.js scene, camera, WebGL renderer, resize handling, ambient light, directional light, ground, and sky color
- First-person pointer-lock mouse look with pitch clamp
- WASD movement, Shift sprint, Space jump, gravity, player height, Q/E leaning, and radius collision
- CQB villa map with an outdoor spawn, basement, first floor, second floor, stair routes, windows, and room-based enemy placement
- Increased floor spacing with open stair wells and an open living-room/second-floor atrium
- Height-aware floor handling for basement stairs, first floor, second floor, and second-floor platforms
- Room doors with basic open/close state for the front door, living room, kitchen, basement, and bedrooms
- Camera-direction raycast shooting, including vertical aiming
- Room-based encounter zones with configured enemy squads that activate when the player enters nearby spaces
- Indoor walls, floors, windows, balcony rails, room doors, clean structural layout, and point lights
- HTML HUD with HP, ammo, weapon, score, status text, and crosshair

## Configuration

This stage intentionally keeps enemies simple and stationary. It does not include full enemy AI, Boss AI, inventory, pickups, lockdown logic, or multi-level progression yet.

## Structure

```text
.
├── index.html
├── style.css
├── .nojekyll
├── .github/
│   └── workflows/
│       └── pages.yml
├── src/
│   ├── main.js
│   ├── core/
│   │   └── input.js
│   ├── systems/
│   │   ├── collisionSystem.js
│   │   └── playerSystem.js
│   ├── three/
│   │   └── scene.js
│   └── render/
│       └── levelBuilder.js
├── assets/
│   ├── textures/
│   ├── sprites/
│   └── sounds/
└── README.md
```
