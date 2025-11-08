const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Basic game state
let playerTowers = [
  {x: 120, y: 250, hp: 1000},
  {x: 120, y: 350, hp: 1000},
];
let enemyTowers = [
  {x: 780, y: 250, hp: 1000},
  {x: 780, y: 350, hp: 1000},
];
let playerTroops = [];
let enemyTroops = [];

let elixir = 5;
let lastTime = 0;
let gameOver = false;
let winner = null;

// Handle troop deployment
canvas.addEventListener("click", (e) => {
  if (gameOver) return;
  if (elixir >= 3) {
    const y = e.offsetY;
    playerTroops.push({
      x: 150,
      y,
      hp: 100,
      speed: 0.8,
      dmg: 8,
      range: 10,
      color: "blue",
    });
    elixir -= 3;
  }
});

// Spawn enemy troops periodically
let enemySpawnTimer = 0;

// Game logic
function update(dt) {
  if (gameOver) return;

  // Elixir regen
  elixir = Math.min(10, elixir + dt * 0.001);

  // Enemy spawns
  enemySpawnTimer += dt;
  if (enemySpawnTimer > 2000) { // every 2 seconds
    enemySpawnTimer = 0;
    enemyTroops.push({
      x: 750,
      y: 250 + Math.random() * 100,
      hp: 100,
      speed: -0.8,
      dmg: 8,
      range: 10,
      color: "red",
    });
  }

  // Update troop positions & attacks
  function handleTroops(troops, targets) {
    for (let t of troops) {
      let target = targets.find(
        (tw) => Math.abs(t.x - tw.x) < t.range && Math.abs(t.y - tw.y) < 40
      );
      if (target) {
        target.hp -= t.dmg * dt * 0.01;
      } else {
        t.x += t.speed;
      }
    }
  }

  handleTroops(playerTroops, enemyTowers);
  handleTroops(enemyTroops, playerTowers);

  // Filter dead troops
  playerTroops = playerTroops.filter((t) => t.hp > 0);
  enemyTroops = enemyTroops.filter((t) => t.hp > 0);

  // Check tower health
  for (let t of playerTowers.concat(enemyTowers)) {
    if (t.hp <= 0) t.hp = 0;
  }

  const allPlayerDown = playerTowers.every((t) => t.hp <= 0);
  const allEnemyDown = enemyTowers.every((t) => t.hp <= 0);

  if (allPlayerDown || allEnemyDown) {
    gameOver = true;
    winner = allEnemyDown ? "Player" : "Enemy";
  }
}

// Draw visuals
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Mid river
  ctx.fillStyle = "#3b803b";
  ctx.fillRect(440, 0, 20, canvas.height);

  // Draw towers
  function drawTower(tower, color) {
    ctx.fillStyle = color;
    ctx.fillRect(tower.x - 15, tower.y - 30, 30, 60);
    ctx.fillStyle = "black";
    ctx.fillRect(tower.x - 20, tower.y - 50, 40, 5);
    ctx.fillStyle = "lime";
    ctx.fillRect(tower.x - 20, tower.y - 50, 40 * (tower.hp / 1000), 5);
  }

  playerTowers.forEach((t) => drawTower(t, "gray"));
  enemyTowers.forEach((t) => drawTower(t, "darkred"));

  // Troops
  [...playerTroops, ...enemyTroops].forEach((t) => {
    ctx.fillStyle = t.color;
    ctx.beginPath();
    ctx.arc(t.x, t.y, 10, 0, Math.PI * 2);
    ctx.fill();
  });

  // Elixir bar
  ctx.fillStyle = "purple";
  ctx.fillRect(150, 560, elixir * 60, 20);
  ctx.strokeStyle = "white";
  ctx.strokeRect(150, 560, 600, 20);

  // Text
  ctx.fillStyle = "white";
  ctx.font = "20px Arial";
  ctx.fillText(`Elixir: ${elixir.toFixed(1)}`, 370, 550);

  // Game over text
  if (gameOver) {
    ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "white";
    ctx.font = "40px Arial";
    ctx.fillText(`${winner} Wins!`, 350, 300);
  }
}

// Game loop
function loop(ts) {
  const dt = ts - lastTime;
  lastTime = ts;
  update(dt);
  draw();
  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);

