## Pacman MVP

`Pacman MVP` is a small, browser-based Pac-Man-inspired game built with **HTML5 Canvas** and vanilla **JavaScript**. It features a tile-based arena, a controllable Pac-Man, and roaming ghosts with simple intersection-based decision making.

### What the game does

- Renders a map from a simple `MAP` grid (walls vs. empty space).
- Moves Pac-Man using frame-rate-independent updates (`requestAnimationFrame` + `dt`).
- Prevents Pac-Man and ghosts from clipping through walls using a tile collision check.
- Detects circle-to-circle collisions between Pac-Man and ghosts.
- Implements a capture/game-over rule:
  - If Pac-Man collides with a ghost while he is moving *toward* the ghost, the ghost is captured.
  - Otherwise, the game ends.
- Tracks progress on-screen:
  - `Ghosts captured: N`
  - `Speed: Xx` (difficulty ramps up as you capture ghosts)

### How to play

- Controls: `Arrow Keys` or `WASD`
- Restart: `R`

### Try it locally

1. Open `pacman/index.html` in your browser.
2. Use the keyboard controls to move and press `R` to restart.

### Key implementation ideas (high level)

- **Tile map movement:** The game checks movement by sampling the entity’s corners and only allowing movement through `MAP` cells marked as empty.
- **Game loop:** Updates positions every frame using delta time (`dt`) so movement stays consistent across different refresh rates.
- **Ghost behavior:** Ghosts choose a random valid direction at intersections while avoiding immediate backtracking, with a short cooldown to keep motion believable.
- **Collision detection:** Entities are treated as circles and collisions are detected via distance checks.

### Skills & competencies demonstrated

This project showcases practical skills across real-time front-end development and game logic, including:

- Building a real-time loop and responsive controls in vanilla JavaScript.
- Using Canvas for custom rendering (walls, entities, and a directional Pac-Man shape).
- Implementing collision detection and movement constraints in a grid-based environment.
- Designing simple enemy AI using intersection checks, direction filtering, and cooldown timing.
- Managing game state (running/reset/game over) and updating a HUD via DOM elements.
- Organizing code into small, testable functions (movement, drawing, collisions, AI decisions, and rendering).

### Files

- `pacman/index.html` - page structure and HUD/canvas layout
- `pacman/styles.css` - styling (layout, canvas border, background)
- `pacman/game.js` - game logic, rendering, input handling
