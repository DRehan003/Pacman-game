const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

// Tile and board setup
const TILE_SIZE = 32;
const COLS = canvas.width / TILE_SIZE; // 19
const ROWS = canvas.height / TILE_SIZE; // 21

// 0 = empty, 1 = wall
// Simple rectangular arena with a few inner walls
const MAP = [
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 1, 1, 0, 0, 0, 1, 1, 0, 1, 1, 0, 0, 0, 1, 1, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1],
  [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1],
  [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1],
  [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 1, 1, 0, 0, 0, 1, 1, 0, 1, 1, 0, 0, 0, 1, 1, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
];

const BASE_SPEED = 4; // tiles per second
let gameSpeedMultiplier = 1.0;
let capturedCount = 0;

const capturesEl = document.getElementById("captures");
const speedEl = document.getElementById("speed");

const DIRS = {
  none: { x: 0, y: 0 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
};

function createPacman() {
  return {
    x: 9 * TILE_SIZE + TILE_SIZE / 2,
    y: 15 * TILE_SIZE + TILE_SIZE / 2,
    radius: TILE_SIZE * 0.4,
    dir: DIRS.left,
    pendingDir: DIRS.left,
    speed: BASE_SPEED,
  };
}

function createGhost(xTile, yTile, color) {
  return {
    x: xTile * TILE_SIZE + TILE_SIZE / 2,
    y: yTile * TILE_SIZE + TILE_SIZE / 2,
    radius: TILE_SIZE * 0.4,
    dir: DIRS.left,
    speed: BASE_SPEED * 0.9,
    color,
    decisionCooldown: 0,
    spawnTile: { x: xTile, y: yTile },
  };
}

let pacman = createPacman();

let ghosts = [
  createGhost(9, 9, "#ff4b4b"),
  createGhost(8, 10, "#4bffff"),
  createGhost(10, 10, "#ffb84b"),
  createGhost(9, 11, "#ff4bff"),
];

let running = true;

function resetGame() {
  gameSpeedMultiplier = 1.0;
  capturedCount = 0;
  pacman = createPacman();
  ghosts = [
    createGhost(9, 9, "#ff4b4b"),
    createGhost(8, 10, "#4bffff"),
    createGhost(10, 10, "#ffb84b"),
    createGhost(9, 11, "#ff4bff"),
  ];
  running = true;
  updateHud();
}

function updateHud() {
  capturesEl.textContent = `Ghosts captured: ${capturedCount}`;
  speedEl.textContent = `Speed: ${gameSpeedMultiplier.toFixed(1)}x`;
}

function tileAt(xPixel, yPixel) {
  const col = Math.floor(xPixel / TILE_SIZE);
  const row = Math.floor(yPixel / TILE_SIZE);
  if (row < 0 || row >= ROWS || col < 0 || col >= COLS) return 1;
  return MAP[row][col];
}

function canMove(entity, dir) {
  if (dir === DIRS.none) return true;
  const speed = entity.speed * gameSpeedMultiplier;
  const nextX = entity.x + dir.x * speed;
  const nextY = entity.y + dir.y * speed;
  const half = entity.radius * 0.9;
  const corners = [
    { x: nextX - half, y: nextY - half },
    { x: nextX + half, y: nextY - half },
    { x: nextX - half, y: nextY + half },
    { x: nextX + half, y: nextY + half },
  ];
  return corners.every((c) => tileAt(c.x, c.y) === 0);
}

function updatePacman(dt) {
  if (!running) return;
  if (pacman.pendingDir && canMove(pacman, pacman.pendingDir)) {
    pacman.dir = pacman.pendingDir;
  }
  if (!canMove(pacman, pacman.dir)) return;
  const distance = pacman.speed * gameSpeedMultiplier * dt * TILE_SIZE;
  pacman.x += pacman.dir.x * distance;
  pacman.y += pacman.dir.y * distance;
}

function randomChoice(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function oppositeDir(dir) {
  if (dir === DIRS.left) return DIRS.right;
  if (dir === DIRS.right) return DIRS.left;
  if (dir === DIRS.up) return DIRS.down;
  if (dir === DIRS.down) return DIRS.up;
  return DIRS.none;
}

function updateGhosts(dt) {
  if (!running) return;
  ghosts.forEach((ghost) => {
    ghost.decisionCooldown -= dt;

    const centerX = ghost.spawnTile.x * TILE_SIZE + TILE_SIZE / 2;
    const centerY = ghost.spawnTile.y * TILE_SIZE + TILE_SIZE / 2;
    const atIntersection =
      Math.abs(ghost.x - Math.round(ghost.x / TILE_SIZE) * TILE_SIZE) < 1 &&
      Math.abs(ghost.y - Math.round(ghost.y / TILE_SIZE) * TILE_SIZE) < 1;

    if (ghost.decisionCooldown <= 0 && atIntersection) {
      const options = [DIRS.left, DIRS.right, DIRS.up, DIRS.down].filter(
        (d) => d !== oppositeDir(ghost.dir) && canMove(ghost, d),
      );
      if (options.length > 0) {
        ghost.dir = randomChoice(options);
      } else if (!canMove(ghost, ghost.dir)) {
        const fallback = [DIRS.left, DIRS.right, DIRS.up, DIRS.down].filter((d) =>
          canMove(ghost, d),
        );
        if (fallback.length > 0) ghost.dir = randomChoice(fallback);
      }
      ghost.decisionCooldown = 0.2 + Math.random() * 0.6;
    }

    if (!canMove(ghost, ghost.dir)) {
      const fallback = [DIRS.left, DIRS.right, DIRS.up, DIRS.down].filter((d) =>
        canMove(ghost, d),
      );
      if (fallback.length > 0) ghost.dir = randomChoice(fallback);
    }

    const distance = ghost.speed * gameSpeedMultiplier * dt * TILE_SIZE;
    ghost.x += ghost.dir.x * distance;
    ghost.y += ghost.dir.y * distance;
  });
}

function entitiesCollide(a, b) {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  const r = a.radius + b.radius * 0.8;
  return dx * dx + dy * dy <= r * r;
}

function handleCollisions() {
  if (!running) return;
  ghosts.forEach((ghost) => {
    if (!entitiesCollide(pacman, ghost)) return;
    // Pac-Man "captures" ghost if he's moving toward the ghost; otherwise ghost got him -> game over
    const dx = ghost.x - pacman.x;
    const dy = ghost.y - pacman.y;
    const movingTowardGhost = pacman.dir.x * dx + pacman.dir.y * dy > 0;
    if (movingTowardGhost) {
      capturedCount += 1;
      gameSpeedMultiplier = Math.min(gameSpeedMultiplier + 0.1, 3.0);
      ghost.x = ghost.spawnTile.x * TILE_SIZE + TILE_SIZE / 2;
      ghost.y = ghost.spawnTile.y * TILE_SIZE + TILE_SIZE / 2;
      ghost.dir = DIRS.left;
      updateHud();
    } else {
      running = false;
      updateHud();
    }
  });
}

function drawMap() {
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      if (MAP[row][col] === 1) {
        ctx.fillStyle = "#0033cc";
        ctx.fillRect(col * TILE_SIZE, row * TILE_SIZE, TILE_SIZE, TILE_SIZE);
      }
    }
  }
}

function drawCircle(x, y, radius, color) {
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();
}

// Draw Pac-Man as a wedge (circle with mouth) facing current direction
function drawPacman(x, y, radius) {
  const mouthOpen = 0.35 * Math.PI;
  let startAngle, endAngle;
  if (pacman.dir === DIRS.right) {
    startAngle = mouthOpen;
    endAngle = Math.PI * 2 - mouthOpen;
  } else if (pacman.dir === DIRS.left) {
    startAngle = Math.PI + mouthOpen;
    endAngle = Math.PI - mouthOpen;
  } else if (pacman.dir === DIRS.down) {
    startAngle = Math.PI / 2 + mouthOpen;
    endAngle = Math.PI / 2 - mouthOpen;
  } else if (pacman.dir === DIRS.up) {
    startAngle = (3 * Math.PI) / 2 + mouthOpen;
    endAngle = (3 * Math.PI) / 2 - mouthOpen;
  } else {
    startAngle = mouthOpen;
    endAngle = Math.PI * 2 - mouthOpen;
  }
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.arc(x, y, radius, startAngle, endAngle);
  ctx.closePath();
  ctx.fillStyle = "#ffe400";
  ctx.fill();
  ctx.strokeStyle = "#000";
  ctx.lineWidth = 1;
  ctx.stroke();
}

function render() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#000000";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  drawMap();
  drawPacman(pacman.x, pacman.y, pacman.radius);
  ghosts.forEach((ghost) => {
    drawCircle(ghost.x, ghost.y, ghost.radius, ghost.color);
  });
  if (!running) {
    ctx.fillStyle = "rgba(0,0,0,0.6)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#fff";
    ctx.font = "bold 48px system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("Game Over", canvas.width / 2, canvas.height / 2 - 20);
    ctx.font = "24px system-ui, sans-serif";
    ctx.fillText("Press R to restart", canvas.width / 2, canvas.height / 2 + 20);
  }
}

let lastTime = performance.now();

function loop(timestamp) {
  const dt = (timestamp - lastTime) / 1000;
  lastTime = timestamp;

  updatePacman(dt);
  updateGhosts(dt);
  handleCollisions();
  render();

  requestAnimationFrame(loop);
}

window.addEventListener("keydown", (e) => {
  if (e.key === "ArrowLeft" || e.key === "a") {
    pacman.pendingDir = DIRS.left;
  } else if (e.key === "ArrowRight" || e.key === "d") {
    pacman.pendingDir = DIRS.right;
  } else if (e.key === "ArrowUp" || e.key === "w") {
    pacman.pendingDir = DIRS.up;
  } else if (e.key === "ArrowDown" || e.key === "s") {
    pacman.pendingDir = DIRS.down;
  } else if (e.key === "r" || e.key === "R") {
    resetGame();
  }
});

updateHud();
requestAnimationFrame(loop);

