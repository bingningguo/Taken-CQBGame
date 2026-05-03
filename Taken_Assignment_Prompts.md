# Prompt Log for Assignment Submission  
## Project: Hostage Protocol — HTML + Three.js CQB Hostage Rescue FPS Prototype

This document records the staged prompts used to generate and iterate on the project. The workflow shows a multi-step development process, starting from a simple HTML Canvas raycasting FPS prototype and gradually evolving into an HTML + Three.js CQB hostage rescue FPS game.

---

## Prompt 1: Initial Project Goal

```text
I want to design an HTML game with a style similar to the first Doom. Please help me create a runnable browser FPS prototype.

Requirements:
1. Use HTML, CSS, and JavaScript.
2. Use Canvas to implement pseudo-3D raycasting.
3. The player can move with WASD.
4. Support mouse or arrow-key turning.
5. Include wall collision.
6. Include enemy rendering.
7. Include shooting hit detection.
8. Include a HUD with health, ammo, kills, and score.
9. Include a start menu, pause state, victory state, and failure state.
10. The code should run directly in the browser.

Please generate a basic version first. It does not need to be very complex; the main goal is to make the core gameplay work.
```

---

## Prompt 2: Enhance the Doom-like Core Gameplay

```text
Please continue improving the current HTML Canvas raycasting FPS prototype.

Add the following:
1. A mouse sensitivity slider.
2. Frame-rate-independent movement using deltaTime.
3. Normalized diagonal movement so diagonal movement is not faster than straight movement.
4. Player radius collision to avoid clipping through walls.
5. Three weapons:
   - Pistol
   - Assault rifle
   - Melee axe
6. Support weapon cooldown, automatic fire, and fallback melee when out of ammo.
7. Add recoil, muzzle flash, and screen shake.
8. Enemy AI:
   - Patrol
   - Chase
   - Attack
9. Enemies should use line-of-sight detection and should not attack through walls.
10. Show a danger warning when the player is threatened by enemies.
11. Add level mechanics:
   - Key
   - Locked door
   - Ammo
   - Health pack
   - Exit
12. Place the exit behind a locked door.
13. Update game.js, style.css, index.html, and README.md.

Requirements:
Do not break existing features. Keep the project as a pure HTML/CSS/JavaScript frontend game.
```

---

## Prompt 3: Visual and Feedback Improvements

```text
Please continue improving the visual presentation and feedback of the current Doom-like FPS project.

Implement:
1. Different wall colors based on direction and area.
2. Simple brick texture and door texture effects.
3. Distance fog so far objects appear darker.
4. Convert pickups into pixel-art-style sprites:
   - Key
   - Ammo
   - Health pack
5. Replace the red square enemy with a monster sprite:
   - Body
   - Eyes
   - Horns
   - Different colors based on enemy state
6. Change the first-person weapon display to a lower-right angled weapon view, similar to a modern FPS weapon HUD.
7. Visually distinguish the pistol, assault rifle, and axe.
8. Add a red radial screen flash when the player is hurt.
9. Keep muzzle flash, screen shake, and recoil.
10. Improve the victory/failure screens with:
    - State title
    - Different color themes
    - Completion statistics
    - Kills
    - Score

Requirements:
Continue using HTML Canvas. Do not switch engines.
```

---

## Prompt 4: Configuration-driven Level and Enemy Systems

```text
Please convert the main game values and level content into a configuration-driven structure.

Make the following configurable:
1. Weapon configuration.
2. Enemy configuration.
3. Pickup configuration.
4. Level configuration.
5. Player configuration.

Add:
1. Design 3 official levels.
2. Each level should contain:
   - Safe spawn area
   - First enemy encounter
   - Supply point
   - Key area
   - Locked door area
   - Exit
3. Add 3 enemy types:
   - Melee enemy
   - Ranged enemy
   - Heavy enemy
4. Each enemy type should have different:
   - Health
   - Speed
   - Attack range
   - Attack frequency
   - Score value
   - Visual appearance
5. Enemies should have an attack wind-up.
6. Show a warning and play a warning sound before enemy attacks.
7. Ranged enemies must require line of sight to shoot.
8. Improve feedback:
   - Hit flash
   - No ammo prompt
   - Need Key
   - KEY ACQUIRED
   - Exit Unlocked
   - Door prompt
9. Use Web Audio to procedurally generate sounds:
   - Shooting
   - Weapon switch
   - Player hurt
   - Enemy death
   - Pickup
   - Door opening
   - No ammo
   - Warning sound

Requirements:
Keep the game pure frontend. Do not use a backend or database.
```

---

## Prompt 5: Change from Maze Design to Linear Open Level Design

```text
The current map still feels like a maze or grid-based room layout. Please do not simply modify the map array. Instead, change the map design philosophy.

Goal:
Change the level from maze exploration into a linear progression level.

Map structure:
Spawn Area
→ Small Encounter Zone
→ Open Arena 1
→ Supply Area
→ Open Arena 2
→ Boss Arena
→ Exit

Requirements:
1. Do not generate dense mazes.
2. Do not generate many narrow corridors.
3. Do not repeat grid-like box rooms.
4. Each area should feel like a clearly different space.
5. Arena areas must be open enough for sideways movement and circling.
6. Use large structural shapes instead of many thin walls.
7. Add pillars, L-shaped cover, wide corridors, and open rooms.
8. Add multiple locked arena zones.
9. When the player enters a locked arena, the entrance should close.
10. After all enemies are cleared, the exit door should open.
11. The boss area should be the largest area and should be placed before the final exit.
12. Do not create a maze. Create arena-based level design.

Output:
1. Redesign the entire map.
2. Label the purpose of each area.
3. Ensure the layout visually reads as open rooms and combat spaces, not a maze.
```

---

## Prompt 6: Technical Migration Evaluation

```text
I want to migrate the current HTML Canvas raycasting FPS project to HTML + Three.js.

Please only perform a technical evaluation first. Do not write code and do not modify files.

The current project already has:
- HUD
- Health, ammo, kills, and score
- Mouse turning
- Player movement and collision
- Raycasting wall rendering
- Enemy AI: patrol, chase, attack, line-of-sight detection
- Weapon system: pistol, assault rifle, shotgun
- Reloading, cooldown, automatic fire, recoil, muzzle flash, screen shake
- Items: key, ammo, health pack, exit
- Level mechanics: locked arenas, boss area, victory/failure state
- Audio and README

Goal:
Migrate to HTML + Three.js and make it a browser-based 3D FPS.

Please output:
1. Which modules can be preserved.
2. Which modules must be rewritten.
3. Recommended new file structure.
4. Recommended migration order.
5. Major risks.
6. First-stage minimum runnable target.
```

---

## Prompt 7: Build the Three.js FPS Base Framework

```text
Please start migrating the project to HTML + Three.js.

First-stage goal:
Only build the minimum runnable 3D FPS framework. Do not migrate all gameplay systems yet.

Requirements:
1. Keep the game runnable directly in the browser.
2. Use HTML + CSS + JavaScript + Three.js.
3. Import Three.js through a CDN.
4. Do not use a backend.
5. Do not use a build tool.

Implement:
1. Basic Three.js scene:
   - scene
   - perspective camera
   - WebGLRenderer
   - resize handling
   - ambient light
   - directional light
   - ground plane
   - sky/background color
2. First-person controls:
   - Click the screen to enter pointer lock
   - Mouse controls yaw and pitch
   - Clamp pitch so the camera cannot flip
   - WASD movement
   - Shift movement mode
   - Space jump
   - gravity
   - player height
   - player radius collision
3. Test map:
   - An open test area
   - Outer boundary walls
   - Several cover blocks
   - Several pillars
   - No maze
4. HUD:
   - HP
   - Ammo
   - Weapon
   - Score
   - Crosshair
   - CLICK TO LOCK MOUSE prompt
5. Game loop:
   - requestAnimationFrame
   - Use deltaTime
   - Separate update and render

Do not implement yet:
- Enemy AI
- Boss
- Backpack
- Drops
- Multiple weapons
- Arena lock system
- Full level

Acceptance criteria:
After opening index.html, the player can move in a 3D scene, look around with the mouse, jump, and cannot walk through walls.
```

---

## Prompt 8: Change the Direction to CQB Indoor Shooter

```text
The current linear map still does not work well and looks like a 3D version of grid rooms. Change the design direction. Do not continue with a Doom-style open linear map. Instead, convert the project into a CQB indoor shooter prototype.

Goal:
Create an indoor close-quarters combat map with height differences, similar to a training house, small villa, or office building clearance scenario.

Core requirements:
1. Use HTML + Three.js.
2. Keep first-person FPS controls.
3. Support mouse look both horizontally and vertically.
4. Show a crosshair in the center of the screen.
5. The map must not look like regular grid rooms.
6. The map should feel like a tactical CQB indoor space.

Map structure:
- Outdoor spawn point
- First-floor entrance
- Entry hall
- Living room
- Kitchen
- Basement
- Second-floor hallway
- Left and right bedrooms
- Window overlook point
- Stairs from first floor to second floor
- Stairs from first floor to basement

Required height differences:
- Exterior
- First floor
- Second floor
- Basement
- Stairs
- Second-floor platform
- The player should be able to see part of the first floor from the second floor

Map design requirements:
1. Rooms should not all have the same size.
2. Rooms should not be aligned in a perfect grid.
3. Walls should include openings, door frames, corners, and semi-open connections.
4. Corridors should not be too narrow.
5. Rooms should include cover such as tables, boxes, pillars, and shelves.
6. Add semi-open elements such as windows, railings, and second-floor overlook points.
7. The route can still be somewhat linear, but the building should feel realistic.

View and shooting:
1. Mouse controls yaw and pitch.
2. Clamp pitch between -80 and 80 degrees.
3. Bullets should be fired based on the current camera direction.
4. Use camera raycast for shooting hit detection.
5. The player can aim and shoot upward/downward at enemies.

Collision and movement:
1. The player has height and collision radius.
2. The player cannot walk through walls or cover.
3. The player can climb stairs.
4. The player can stand on the second-floor platform.
5. Add gravity.
6. Ground height should update based on the player’s position.

Do not implement yet:
- Boss
- Backpack
- Drops
- Large open map
```

---

## Prompt 9: Convert to Rainbow Six Siege-inspired Hostage Rescue Gameplay

```text
Please convert the current CQB FPS project into a Rainbow Six Siege-inspired Hostage Rescue Prototype.

The project should not be Doom-like and should not be a wave-based shooter. The core experience should be indoor tactical movement, room entry, enemy alertness, accurate shooting, hostage rescue, and extraction.

Core flow:
Spawn / Exterior Entry
→ Breach Entry / Entrance Hall
→ Corridor CQB
→ Side Rooms
→ Stairwell / Optional Second Floor
→ Hostage Room
→ Secure Hostage
→ Return to Extraction Zone
→ Mission Success

Victory conditions:
1. Locate the hostage.
2. Interact with the hostage and enter the carrying state.
3. Bring the hostage to the designated extraction zone outside the building.

Failure conditions:
1. Player death.
2. Hostage death.
3. Optional: time limit expires.

Remove or postpone:
- No backpack system.
- No drop system.
- No boss.
- No large-scale enemy waves.
- No locked arena wave system.
- No enemy ammo drops.
- No Doom-style arena combat.

Enemy AI:
1. Enemies should be defensive indoor AI, not fast-moving Doom enemies.
2. Enemy states:
   - idle: unaware
   - alert: hears or senses the player nearby
   - activated: confirms player presence
   - attack: shoots the player
   - dead
3. Enemies become alert when the player enters alertRadius.
4. Enemies attack when the player enters activationRadius or enters their line of sight.
5. Player gunshots alert nearby enemies.
6. Enemies require line of sight to shoot.
7. Enemies do not need to chase the player aggressively; they mainly hold doors, corners, and cover.
8. Enemies should be placed in rooms as small squads.

Hostage system:
1. The hostage is located in the Hostage Room.
2. When the player gets close, show: Press E to secure hostage.
3. Pressing E enters carrying hostage state.
4. While carrying the hostage, the player can only use the pistol.
5. While carrying the hostage, player movement speed is reduced.
6. Bringing the hostage to the outdoor extraction zone completes the mission.
7. If the hostage is shot by the player or enemies, the mission fails.

Weapon system:
1. The player has a primary weapon and a secondary weapon.
2. No backpack is needed.
3. Press 1 to switch to primary weapon.
4. Press 2 to switch to pistol.
5. While carrying the hostage, only the pistol can be used.
6. Support reload, magazine ammo, reserve ammo, recoil, and muzzle flash.

Mission objective text:
- ENTER THE BUILDING
- LOCATE THE HOSTAGE
- CLEAR HOSTAGE ROOM
- SECURE THE HOSTAGE
- EXTRACT THE HOSTAGE
- MISSION SUCCESS
- MISSION FAILED
```

---

## Prompt 10: Continue Development Based on the Current Project State

```text
The current project has already been migrated from the original HTML Canvas raycasting prototype into an HTML + Three.js CQB indoor FPS prototype.

Current features:
- Three.js 3D scene, camera, and WebGLRenderer
- First-person mouse view with horizontal and vertical looking
- WASD movement
- Space jump
- Q / E lean left and right
- Gravity
- Player radius collision
- Multi-floor height handling: exterior, first floor, second floor, basement, stairs
- Central crosshair
- HUD: HP, Ammo, Weapon, Score, Status
- Small villa CQB map:
  - Outdoor spawn point
  - First-floor entry hall, living room, kitchen
  - Basement
  - Second-floor hallway, left and right bedrooms, window overlook point
  - Stairs from first floor to second floor
  - Stairs from first floor to basement
- Basic door system, currently using O to toggle nearby doors
- Simple indoor enemy placeholders
- Camera raycast shooting with vertical aim support

Current file structure:
Game/
├── index.html
├── style.css
├── README.md
└── src/
    ├── main.js
    ├── core/
    │   └── input.js
    ├── three/
    │   └── scene.js
    ├── render/
    │   └── levelBuilder.js
    └── systems/
        ├── collisionSystem.js
        └── playerSystem.js

The project is currently pure frontend:
- No backend
- No build tool
- Three.js is loaded through a CDN

Please continue development based on this current state. Do not rewrite the entire project.
```

---

## Prompt 11: Structure Cleanup and Modularization

```text
Please perform a structure cleanup first. Do not add complex gameplay yet.

Goals:
1. Keep the project runnable directly in the browser.
2. Do not add a backend.
3. Do not add a build tool.
4. Do not break the current movement, view, collision, multi-floor, door, and shooting features.
5. Prepare modules for future weapon, enemy, hostage, and mission systems.

Please add or organize the following files:
- src/core/state.js
- src/core/audio.js
- src/systems/weaponSystem.js
- src/systems/enemySystem.js
- src/systems/hostageSystem.js
- src/systems/missionSystem.js
- src/systems/uiSystem.js
- src/render/weaponView.js
- src/render/enemyView.js
- src/render/effectsView.js
- src/config/gameConfig.js
- src/config/weaponConfig.js
- src/config/enemyConfig.js
- src/config/missionConfig.js

For this stage, only create empty modules or minimal placeholder implementations:
- No full enemy AI yet
- No hostage logic yet
- No complex weapon animation yet
- No full mission flow yet

Requirements:
1. main.js should handle initialization, module imports, and starting the game loop.
2. state.js should manage unified player, weapon, enemy, mission, and UI state.
3. uiSystem.js should update the HUD.
4. weaponSystem.js should temporarily wrap the current shooting logic.
5. enemySystem.js should temporarily manage the existing enemy placeholders.
6. All modules should include clear comments.
7. After cleanup, the project must still run.
```

---

## Prompt 12: Formal Weapon System

```text
Now implement the formal weapon system for the Rainbow Six Siege-inspired CQB prototype.

The project already has camera raycast shooting. Please migrate it into weaponSystem.js and make it a configurable weapon system.

The player always carries:
1. Primary weapon
2. Secondary weapon

Not needed for now:
- Backpack
- Drops
- Weapon pickups
- Melee

Weapon functions:
1. Press 1 to switch to primary weapon.
2. Press 2 to switch to secondary weapon.
3. Left mouse button to fire.
4. R to reload.
5. Primary weapon has magazine ammo and reserve ammo.
6. Secondary weapon has magazine ammo and reserve ammo.
7. When out of ammo, HUD shows RELOAD or NO AMMO.
8. The player cannot shoot while reloading.
9. The player cannot shoot while switching weapons.
10. Automatic weapons can fire continuously while holding left mouse button.
11. Semi-automatic weapons require one click per shot.

Define in weaponConfig.js:
- id
- name
- category
- damage
- fireRateRPM
- shotCooldown
- range
- magSize
- reserveAmmo
- reloadTime
- recoil
- spread
- automatic
- burst
- burstCount
- burstDelay
- burstCooldown

Shooting detection:
1. Use THREE.Raycaster.
2. Fire from the center direction of the camera.
3. Must be able to hit enemies at different heights.
4. When hitting an enemy, call enemySystem.applyDamage.
5. When hitting a wall or object, create a simple hit spark or bullet impact.

HUD updates:
1. Current weapon name.
2. Current magazine ammo / reserve ammo.
3. Reload state.
4. No ammo prompt.

Acceptance criteria:
1. Pressing 1 / 2 switches between primary and secondary weapons.
2. Left mouse button fires.
3. Automatic weapons support continuous fire.
4. Semi-automatic weapons require clicking.
5. R reloads.
6. Ammo decreases correctly.
7. Bullets go where the camera points.
8. HUD correctly displays weapon and ammo.
```

---

## Prompt 13: Weapon Balance Configuration

```text
Please update weaponConfig.js according to the following balance table.

Enemy base health is 100.

Primary weapons:

HK416
- type: primary
- damage: 26
- magSize: 30
- reserveAmmo: 180
- reloadTime: 1.90
- fireRateRPM: 750
- automatic: true
- recoil: medium-low
- spread: low
- range: medium
- role: stable CQB rifle

AK-74
- type: primary
- damage: 34
- magSize: 30
- reserveAmmo: 150
- reloadTime: 2.35
- fireRateRPM: 600
- automatic: true
- recoil: medium-high
- spread: medium
- range: medium
- role: high damage rifle

AWM
- type: primary
- damage: 90
- magSize: 1
- reserveAmmo: 18
- reloadTime: 1.80
- fireRateRPM: 45
- automatic: false
- recoil: very-high
- spread: very-low
- range: long
- role: precision high-damage weapon
- note: body shot should not always one-shot 100HP enemies; headshot multiplier can one-shot

MP7
- type: primary
- damage: 19
- magSize: 40
- reserveAmmo: 200
- reloadTime: 1.75
- fireRateRPM: 950
- automatic: true
- recoil: medium-low
- spread: medium
- range: short-medium
- role: high fire-rate CQB SMG

Secondary weapons:

Beretta 92F
- type: secondary
- damage: 28
- magSize: 15
- reserveAmmo: 75
- reloadTime: 1.35
- fireRateRPM: 420
- automatic: false
- recoil: low
- spread: low
- role: stable pistol

Desert Eagle
- type: secondary
- damage: 55
- magSize: 7
- reserveAmmo: 35
- reloadTime: 1.65
- fireRateRPM: 240
- automatic: false
- recoil: high
- spread: medium-low
- role: high damage pistol

Glock 18
- type: secondary
- damage: 18
- magSize: 21
- reserveAmmo: 84
- reloadTime: 1.45
- fireRateRPM: 900
- automatic: false
- burst: true
- burstCount: 3
- burstDelay: 0.08
- burstCooldown: 0.22
- recoil: medium
- spread: medium
- role: close-range burst pistol

Requirements:
1. fireRateRPM should be converted into shotCooldown, for example shotCooldown = 60 / fireRateRPM.
2. Automatic weapons can continuously fire while holding the left mouse button.
3. Semi-automatic weapons require one click per shot.
4. Glock 18 fires a three-round burst per click and is not fully automatic.
5. AWM enters shooting cooldown after every shot and has a magazine size of 1.
6. HUD displays current magazine ammo / reserve ammo.
7. reloadTime is measured in seconds.
8. Suggested default loadout is HK416 + Beretta 92F.
```

---

## Prompt 14: Modern FPS Weapon View

```text
Now implement the modern FPS weapon view.

Goal:
Display the weapon at the lower-right side of the screen, similar to a modern first-person shooter.

Implementation location:
- src/render/weaponView.js

Requirements:
1. Attach the weapon model under the camera so it follows the camera’s movement and rotation.
2. Do not use external 3D models. Use basic Three.js geometry to build low-poly weapons first.
3. Primary and pistol weapons should look different:
   - HK416: longer body, barrel, grip, magazine
   - AK-74: longer body and clearly visible magazine
   - MP7: short body, large magazine, compact appearance
   - AWM: long barrel, sniper rifle silhouette
   - Beretta 92F: standard pistol silhouette
   - Desert Eagle: larger pistol silhouette
   - Glock 18: compact pistol silhouette
4. When switching weapons, weaponView should switch the visible model.
5. Add basic animations:
   - idle sway
   - walk bob
   - lean offset
   - fire recoil
   - reload animation
   - switch animation
6. Add muzzle flash:
   - briefly show a glowing plane or point light at the muzzle when firing
   - reuse meshes as much as possible; do not create unlimited objects every frame

Requirements:
1. Animations must not affect the real shooting direction; shooting still uses camera raycast.
2. The weapon must not cover the crosshair.
3. Performance should remain stable on low-end machines.
4. The project must still run directly by opening index.html through the local server.
```

---

## Prompt 15: Defensive Enemy AI

```text
Now implement CQB defensive enemy AI.

The project currently has simple indoor enemy placeholders. Upgrade them into a formal enemy system managed by enemySystem.js.

Enemy design direction:
Enemies should behave like Rainbow Six Siege-style indoor defenders, not Doom-style chasing monsters.

Enemy health:
- All standard enemies have 100 base HP.

Enemy states:
- idle: unaware
- alert: hears or senses the player nearby and becomes suspicious
- activated: confirms player presence and prepares to shoot
- attack: shoots when line of sight is available
- dead

Activation logic:
1. When the player is far away, the enemy stays idle.
2. When the player enters alertRadius, the enemy enters alert.
3. When the player enters activationRadius or the enemy has line of sight to the player, the enemy becomes activated.
4. When the player fires a weapon, nearby enemies enter alert or activated.
5. Enemies require line of sight to shoot.
6. Enemies do not need to move aggressively; they mainly hold doors, corners, and cover.
7. Enemies can rotate slightly toward the player.
8. Enemies cannot walk through walls, and complex pathfinding is not required.

enemyConfig.js should include:
- id
- type
- hp
- damage
- fireRate
- accuracy
- alertRadius
- activationRadius
- attackRange
- reactionTime
- score
- color
- size

Enemy placement:
Configure enemy positions in levelBuilder or missionConfig:
- Entry hall: 1 enemy
- Living room: 2 enemies
- Kitchen: 1 enemy
- Basement: 1-2 enemies
- Second-floor hallway: 1 enemy
- Hostage room: 2 guards

Enemy visuals:
1. Use simple low-poly geometry for enemies.
2. Include at least body and head.
3. Use different colors for idle / alert / activated states.
4. On death, the enemy should fall down or become darker.

Enemy shooting:
1. Enemy requires line of sight.
2. Enemy shoots based on fireRate.
3. Use accuracy to determine whether the shot hits the player.
4. If the shot hits, reduce player HP.
5. When the player is hurt, show HUD feedback or red screen flash.

Acceptance criteria:
1. When the player approaches an enemy, the enemy changes from idle to alert.
2. When the player gets closer or enters line of sight, the enemy starts shooting.
3. Enemies do not aggressively chase the player.
4. The player can kill enemies.
5. Enemy death adds score.
6. Hostage room guards defend correctly.
```

---

## Prompt 16: Room Zone and Mission Objective System

```text
Now implement the room zone / mission zone system.

Goal:
Give the small villa CQB map clear room regions and mission progression prompts.

Define zones in missionConfig.js or levelConfig.js:

- exterior
- entryHall
- livingRoom
- kitchen
- basement
- stairsToSecondFloor
- secondFloorHall
- leftBedroom
- rightBedroom
- hostageRoom
- extractionZone

Each zone should contain:
- id
- name
- bounds
- floor
- type
- enemyIds or squadIds
- isCleared
- objectiveText

Functional requirements:
1. Detect the current zone based on player position.
2. HUD displays current zone name.
3. Before entering the building, objective displays ENTER THE BUILDING.
4. After entering the building, objective displays LOCATE THE HOSTAGE.
5. Near the hostage room, objective displays CLEAR HOSTAGE ROOM.
6. After clearing the hostage room enemies, objective displays SECURE THE HOSTAGE.
7. After carrying the hostage, objective displays EXTRACT THE HOSTAGE.
8. Reaching the extraction zone completes the mission.

Room cleared logic:
1. If all enemies in a zone are dead, mark the zone as cleared.
2. HUD may briefly display ROOM CLEARED.
3. The hostage room must be cleared before the player can safely secure the hostage, or the player can secure the hostage early with additional risk.

Requirements:
1. Do not add complex UI; only update the existing HUD and status prompts.
2. Zone detection must support multiple floors.
3. Basement, second-floor, and first-floor zones must not be confused.
```

---

## Prompt 17: Hostage Rescue System

```text
Now implement the core Hostage Rescue gameplay: the hostage system.

Goal:
The player enters the building, locates the hostage, clears the room, secures the hostage, and brings the hostage back to the outdoor extraction zone.

Implementation locations:
- src/systems/hostageSystem.js
- src/systems/missionSystem.js
- Update uiSystem.js and weaponSystem.js if needed

Hostage states:
- waiting: waiting for rescue
- secured: controlled/carried by the player
- extracted: successfully extracted
- dead: dead, mission failed

Hostage position:
- Place the hostage in the hostage room.
- Use simple geometry such as a seated capsule / cylinder + head.
- The hostage color must be clearly different from enemies.

Interaction logic:
1. When the player is near the hostage, HUD displays: Press E to secure hostage.
2. When the player presses E, if the hostage is not dead, enter secured state.
3. After secured, HUD displays HOSTAGE SECURED.
4. The mission objective becomes EXTRACT THE HOSTAGE.
5. After secured, use simplified logic:
   - Initial version can hide the hostage model and display Carrying Hostage in the HUD
   - Or use a simple model following behind the player
6. While carrying the hostage, player movement speed is reduced.
7. While carrying the hostage, the player can only use the pistol.
8. If the player presses 1 while carrying the hostage, do not allow switching to primary weapon; show PISTOL ONLY WHILE CARRYING HOSTAGE.
9. If the player enters extractionZone while carrying the hostage, mission succeeds.

Failure logic:
1. Player HP <= 0: mission failed or respawn triggered.
2. Hostage shot by player: mission failed.
3. Hostage shot by enemy: mission failed.

Acceptance criteria:
1. The hostage is visible in the specified room.
2. The player can press E to interact when close.
3. After carrying the hostage, only the pistol can be used.
4. After carrying the hostage, movement is slower.
5. Bringing the hostage to the outdoor extraction zone succeeds.
6. Hostage death causes mission failure.
```

---

## Prompt 18: Doors, Interaction, and Alert Propagation

```text
Now improve the door system, interaction system, and enemy alert propagation.

Goal:
Enhance the Rainbow Six Siege-inspired CQB feeling.

Door system:
1. The current project uses O to toggle nearby doors. Change this to E interaction.
2. When the player is near a door, HUD displays Press E to open / close door.
3. Doors should have a simple rotation or sliding animation when opening/closing.
4. Opening a door should make a sound that causes nearby enemies to enter alert state.
5. If there are enemies behind the door, they may become alert because of the door sound.
6. Hostage interaction also uses E, so handle interaction priority based on the nearest interactable:
   - Hostage first
   - Door second

Sound / alert propagation:
1. When the player fires a weapon, nearby enemies within a certain radius enter alert or activated.
2. Normal player movement alerts nearby enemies at close range.
3. Slow walking reduces enemy alert radius.
4. Door opening sound alerts nearby enemies.
5. When enemies become alert, HUD may display CONTACT or ENEMY ALERTED.

Input requirements:
1. Shift can remain sprint, or can be changed to slow walk.
2. If Shift currently means sprint, add Ctrl as slow walk.
3. Slow walk should reduce the enemy alert distance.

Acceptance criteria:
1. E can open and close doors.
2. Doors have animation and sound.
3. Shooting alerts nearby enemies.
4. Slow walking is less likely to alert enemies than normal movement.
5. E secures the hostage when near the hostage, and opens doors when near a door.
```

---

## Prompt 19: Death Message and Respawn Mechanic

```text
The current game is somewhat difficult. Please change the death logic so player death does not immediately end the game. Instead, show a humorous death message and respawn the player at the latest checkpoint.

Requirements:
1. When player HP <= 0, do not immediately trigger Mission Failed.
2. Show a large message near the upper center of the screen:
   "You’re down. Nobody called cut."
3. After 2 seconds, respawn the player from the latest checkpoint.
4. After respawn, restore partial HP, for example 60.
5. Preserve mission progress after respawn.
6. Increase death count by 1.
7. Show deaths in the HUD or final statistics.
8. If the hostage dies, the mission still fails and the player cannot respawn from that.
9. If the player shoots the hostage, the mission still fails.
10. The death message should not stay on screen too long or interrupt the whole flow.

Requirements:
- Keep the current CQB Hostage Rescue gameplay.
- Do not delete the existing victory/failure screen.
- Player death and hostage death must be handled separately.
```

---

## Prompt 20: HUD, Victory/Failure Screen, and Experience Polish

```text
Now polish the UI / HUD / victory and failure experience.

HUD should include:
1. HP
2. Current weapon
3. Current magazine ammo / reserve ammo
4. Current zone name
5. Current mission objective
6. Hostage status
7. Crosshair
8. Hit marker
9. Interaction prompt
10. Enemy alert prompt
11. Red damage flash
12. Death count

Mission objective text:
- ENTER THE BUILDING
- LOCATE THE HOSTAGE
- CLEAR HOSTAGE ROOM
- SECURE THE HOSTAGE
- EXTRACT THE HOSTAGE
- MISSION SUCCESS
- MISSION FAILED

Victory screen:
Display:
- Mission Success
- Completion time
- Kills
- Score
- Remaining HP
- Deaths
- Accuracy, if already tracked
- Restart button

Failure screen:
Display:
- Mission Failed
- Failure reason:
  - Hostage Killed
  - Hostage Friendly Fire
  - Time Expired
- Restart button

Visual feedback:
1. Red screen flash when the player is hurt.
2. Hit marker when hitting an enemy.
3. +score when killing an enemy.
4. ROOM CLEARED when clearing a room.
5. HOSTAGE SECURED when securing the hostage.
6. Green zone or beam for the extraction zone.
7. When the player dies and respawns, show:
   "You’re down. Nobody called cut."

Requirements:
- UI should be implemented with HTML/CSS.
- Do not block too much of the screen.
- Keep a clean tactical FPS style.
```

---

## Prompt 21: Final Testing, Balance, and README

```text
Now perform final balancing, testing, and README updates.

Check the full game flow:
1. The player spawns outside.
2. The player enters the building.
3. The player clears enemies in the entry hall, living room, kitchen, basement, or second floor.
4. The player finds the hostage room.
5. The player clears the hostage room enemies.
6. The player presses E to secure the hostage.
7. While carrying the hostage, the player can only use the pistol.
8. Movement speed is reduced.
9. The player returns to the outdoor extraction point.
10. Mission Success is triggered.

Balance requirements:
1. Do not add too many enemies; focus on room defense.
2. First version should have around 8-12 enemies total.
3. Hostage room should have only 2 guards.
4. Enemy damage should not be too high, to avoid instant player death.
5. Primary weapon ammo should be enough for most combat.
6. The pistol should be sufficient for the extraction stage.
7. Basement and second floor can be optional clearing routes; do not force the player into confusion.
8. Player death can trigger checkpoint respawn, but hostage death must still fail the mission.

Performance checks:
1. Do not create excessive geometry/material every frame.
2. Expired muzzle flash / bullet impact objects should be cleaned up.
3. enemy update should only update alive enemies.
4. Avoid unnecessary console spam.

README updates:
Please clearly describe:
- Project name: Hostage Protocol
- Project overview
- Tech stack: HTML / CSS / JavaScript / Three.js
- Game type: Rainbow Six Siege-inspired CQB Hostage Rescue Prototype
- Core features
- Controls
- File structure
- System design
- Weapon system
- Enemy AI
- Hostage rescue flow
- Death/respawn mechanic
- How to run
- How to start with localhost:8000
- Known limitations
- Future improvements

Acceptance criteria:
The project can complete one full hostage rescue mission, and README should explain why this is a complete CQB FPS prototype.
```

---

## Prompt 22: Local Run Instructions and Submission Cleanup

```text
Please help me prepare the final submission version.

Requirements:
1. The project is a pure frontend HTML/CSS/JavaScript/Three.js game.
2. Because it uses ES Modules and static asset loading, index.html should not be opened directly by double-clicking. It should be served through a local static server.
3. Add the following run instructions to README:

Run Locally:
python -m http.server 8000

Then open:
http://localhost:8000

4. Explain that the project does not require a backend, database, or build tool.
5. Explain that localhost:8000 is only a local static server and does not mean the project has a backend.
6. If deployed to GitHub Pages, the game can also be played directly through a web link.
7. Check whether the file structure is clean.
8. Remove unused testing code and console spam.
9. Ensure the final submission version runs correctly.
```

---

## Final Summary

```text
The prompts above document the full staged generation process of the project. The project started as an HTML Canvas raycasting FPS prototype, then evolved through multiple iterations into an HTML + Three.js CQB hostage rescue FPS prototype. The prompting process included technical evaluation, base framework construction, map redesign, weapon systems, enemy AI, hostage rescue mechanics, UI polish, and final submission preparation.
```
