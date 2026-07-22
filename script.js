const navToggle = document.querySelector('.nav-toggle');
const siteNav = document.querySelector('#site-nav');
if (navToggle && siteNav) navToggle.addEventListener('click', () => { const open = navToggle.getAttribute('aria-expanded') === 'true'; navToggle.setAttribute('aria-expanded', String(!open)); siteNav.classList.toggle('is-open', !open); });

const board = document.querySelector('#game-board');
const scoreElement = document.querySelector('#score');
const highScoreElement = document.querySelector('#high-score');
const statusElement = document.querySelector('#game-status');
const startButton = document.querySelector('#start-game');
const pauseButton = document.querySelector('#pause-game');
const restartButton = document.querySelector('#restart-game');
const directionButtons = document.querySelectorAll('[data-direction]');

if (board && scoreElement && highScoreElement && statusElement) {
  const context = board.getContext('2d');
  const gridSize = 20;
  const cellSize = board.width / gridSize;
  const directions = { up: { x: 0, y: -1 }, down: { x: 0, y: 1 }, left: { x: -1, y: 0 }, right: { x: 1, y: 0 } };
  let snake = [];
  let food = { x: 0, y: 0 };
  let direction = directions.right;
  let nextDirection = direction;
  let score = 0;
  let highScore = Number.parseInt(localStorage.getItem('snake-high-score') || '0', 10) || 0;
  let gameState = 'ready';
  let animationFrame = null;
  let lastStep = 0;
  let flash = null;
  const stepDelay = 135;

  const sameCell = (a, b) => a.x === b.x && a.y === b.y;
  const updateStatus = (label) => { statusElement.textContent = label; scoreElement.textContent = String(score); highScoreElement.textContent = String(highScore); };
  const placeFood = () => { do { food = { x: Math.floor(Math.random() * gridSize), y: Math.floor(Math.random() * gridSize) }; } while (snake.some((segment) => sameCell(segment, food))); };
  const drawCell = (cell, color) => { context.fillStyle = color; context.fillRect(cell.x * cellSize + 1, cell.y * cellSize + 1, cellSize - 2, cellSize - 2); };
  const render = (timestamp = performance.now()) => {
    context.fillStyle = '#030604'; context.fillRect(0, 0, board.width, board.height); context.strokeStyle = 'rgba(73, 255, 138, .08)';
    for (let line = 0; line <= gridSize; line += 1) { context.beginPath(); context.moveTo(line * cellSize, 0); context.lineTo(line * cellSize, board.height); context.stroke(); context.beginPath(); context.moveTo(0, line * cellSize); context.lineTo(board.width, line * cellSize); context.stroke(); }
    drawCell(food, '#ffdf5d'); snake.forEach((segment, index) => drawCell(segment, index === 0 ? '#d8fbdc' : '#49ff8a'));
    if (flash && timestamp < flash.until) { const progress = (flash.until - timestamp) / 240; const size = cellSize * (1.2 + (1 - progress) * 0.9); const centerX = flash.cell.x * cellSize + cellSize / 2; const centerY = flash.cell.y * cellSize + cellSize / 2; context.fillStyle = `rgba(255, 255, 190, ${Math.max(progress, 0)})`; context.fillRect(centerX - size / 2, centerY - size / 2, size, size); context.strokeStyle = `rgba(73, 255, 138, ${Math.max(progress, 0)})`; context.lineWidth = 3; context.strokeRect(centerX - size, centerY - size, size * 2, size * 2); }
  };
  const resetGame = () => { if (animationFrame !== null) cancelAnimationFrame(animationFrame); animationFrame = null; snake = [{ x: 10, y: 10 }, { x: 9, y: 10 }, { x: 8, y: 10 }]; direction = directions.right; nextDirection = direction; score = 0; gameState = 'ready'; flash = null; placeFood(); updateStatus('준비'); render(); };
  const endGame = () => { gameState = 'over'; if (animationFrame !== null) cancelAnimationFrame(animationFrame); animationFrame = null; updateStatus('게임 오버'); };
  const step = () => { direction = nextDirection; const nextHead = { x: snake[0].x + direction.x, y: snake[0].y + direction.y }; const hitWall = nextHead.x < 0 || nextHead.x >= gridSize || nextHead.y < 0 || nextHead.y >= gridSize; if (hitWall || snake.some((segment) => sameCell(segment, nextHead))) return endGame(); snake.unshift(nextHead); if (sameCell(nextHead, food)) { score += 10; if (score > highScore) { highScore = score; localStorage.setItem('snake-high-score', String(highScore)); } flash = { cell: { ...food }, until: performance.now() + 240 }; placeFood(); } else snake.pop(); updateStatus('진행 중'); render(); };
  const gameLoop = (timestamp) => { if (gameState !== 'running') { animationFrame = null; return; } if (timestamp - lastStep >= stepDelay) { lastStep = timestamp; step(); } render(timestamp); animationFrame = requestAnimationFrame(gameLoop); };
  const startGame = () => { if (gameState === 'over') resetGame(); if (gameState === 'running') return; gameState = 'running'; updateStatus('진행 중'); lastStep = performance.now(); if (animationFrame === null) animationFrame = requestAnimationFrame(gameLoop); };
  const togglePause = () => { if (gameState === 'running') { gameState = 'paused'; if (animationFrame !== null) cancelAnimationFrame(animationFrame); animationFrame = null; updateStatus('일시정지'); } else if (gameState === 'paused') startGame(); };
  const setDirection = (name) => { const candidate = directions[name]; if (!candidate || (candidate.x + direction.x === 0 && candidate.y + direction.y === 0)) return; nextDirection = candidate; };
  startButton?.addEventListener('click', startGame); pauseButton?.addEventListener('click', togglePause); restartButton?.addEventListener('click', resetGame); directionButtons.forEach((button) => button.addEventListener('click', () => setDirection(button.dataset.direction)));
  document.addEventListener('keydown', (event) => { const keyMap = { ArrowUp: 'up', w: 'up', ArrowDown: 'down', s: 'down', ArrowLeft: 'left', a: 'left', ArrowRight: 'right', d: 'right' }; if (keyMap[event.key]) { event.preventDefault(); setDirection(keyMap[event.key]); if (gameState === 'ready') startGame(); } else if (event.code === 'Space') { event.preventDefault(); togglePause(); } else if (event.key.toLowerCase() === 'r') resetGame(); });
  resetGame();
}
