// ============================================================
//  LDS General Conference Bingo — app.js
// ============================================================

// Pool of Conference topics (based on official Church materials)
const SQUARE_POOL = [
  { label: "Jesus Christ",    emoji: "✝️"  },
  { label: "Love",            emoji: "❤️"  },
  { label: "Scriptures",      emoji: "📖"  },
  { label: "Baptism",         emoji: "💧"  },
  { label: "Temple",          emoji: "🏛️"  },
  { label: "Faith",           emoji: "⭐"  },
  { label: "Family",          emoji: "👨‍👩‍👧‍👦" },
  { label: "Service",         emoji: "🤝"  },
  { label: "Church",          emoji: "⛪"  },
  { label: "Forgiveness",     emoji: "🕊️"  },
  { label: "Missionaries",    emoji: "👔"  },
  { label: "Restoration",     emoji: "📜"  },
  { label: "Tithing",         emoji: "💰"  },
  { label: "Easter",          emoji: "🌷"  },
  { label: "Sacrament",       emoji: "🍞"  },
  { label: "Testimony",       emoji: "🕯️"  },
  { label: "Family History",  emoji: "🌳"  },
  { label: "Holy Ghost",      emoji: "🕊️"  },
  { label: "Peace",           emoji: "☮️"  },
  { label: "Prayer",          emoji: "🙏"  },
  { label: "Prophets",        emoji: "🎤"  },
  { label: "Kindness",        emoji: "💛"  },
  { label: "Book of Mormon",  emoji: "📕"  },
  { label: "Hope",            emoji: "🌈"  },
  { label: "Resurrection",    emoji: "🌅"  },
  { label: "Choir Sings",     emoji: "🎵"  },
  { label: "Heavenly Father", emoji: "☀️"  },
  { label: "Priesthood",      emoji: "🔑"  },
  { label: "Repentance",      emoji: "🔄"  },
  { label: "Covenant",        emoji: "📋"  },
  { label: "Commandments",    emoji: "📜"  },
  { label: "Eternal Life",    emoji: "♾️"  },
  { label: "Gratitude",       emoji: "😊"  },
  { label: "Obedience",       emoji: "✅"  },
  { label: "Sabbath Day",     emoji: "📅"  },
  { label: "Atonement",       emoji: "❤️‍🔥" },
  { label: "Angel Moroni",    emoji: "📯"  },
  { label: "Revelation",      emoji: "💡"  },
  { label: "Come Follow Me",  emoji: "👣"  },
  { label: "Second Coming",   emoji: "🌠"  },
];

const FREE_SPACE = { label: "FREE\nSPACE", emoji: "⭐", free: true };

// All winning lines on a 5×5 grid (indices 0–24)
const WINNING_LINES = (() => {
  const lines = [];
  for (let r = 0; r < 5; r++) {
    lines.push([0,1,2,3,4].map(c => r * 5 + c)); // rows
  }
  for (let c = 0; c < 5; c++) {
    lines.push([0,1,2,3,4].map(r => r * 5 + c)); // columns
  }
  lines.push([0, 6, 12, 18, 24]); // diagonal TL→BR
  lines.push([4, 8, 12, 16, 20]); // diagonal TR→BL
  return lines;
})();

// ── State ───────────────────────────────────────────────────
let board = [];       // array of 25 square objects
let marked = [];      // array of 25 booleans
let won = false;

// ── Helpers ─────────────────────────────────────────────────
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function newBoard() {
  const picked = shuffle(SQUARE_POOL).slice(0, 24);
  // Insert FREE SPACE at center (index 12)
  const squares = [...picked.slice(0, 12), FREE_SPACE, ...picked.slice(12)];
  return squares;
}

// ── Render ───────────────────────────────────────────────────
const grid = document.getElementById('bingoGrid');

function renderBoard() {
  grid.innerHTML = '';
  board.forEach((square, i) => {
    const cell = document.createElement('div');
    cell.className = 'cell' + (square.free ? ' free' : '') + (marked[i] ? ' marked' : '');
    cell.innerHTML = `
      <span class="cell-emoji">${square.emoji}</span>
      <span class="cell-label">${square.label}</span>
    `;
    cell.addEventListener('click', () => toggleCell(i));
    grid.appendChild(cell);
  });
}

function updateCells(winLines) {
  const cells = grid.querySelectorAll('.cell');
  cells.forEach((cell, i) => {
    cell.classList.toggle('marked', marked[i]);
  });

  if (winLines) {
    const winSet = new Set(winLines.flat());
    cells.forEach((cell, i) => {
      if (winSet.has(i)) cell.classList.add('winning');
    });
  }
}

// ── Game Logic ───────────────────────────────────────────────
function toggleCell(index) {
  if (board[index].free) return; // free space can't be toggled off
  marked[index] = !marked[index];

  const winLines = checkWin();
  updateCells(winLines);

  if (winLines && !won) {
    won = true;
    setTimeout(showWinModal, 400);
    launchConfetti();
  }
}

function checkWin() {
  for (const line of WINNING_LINES) {
    if (line.every(i => marked[i])) {
      return line; // return the winning line
    }
  }
  // Check for multiple winning lines to highlight all
  const winningLines = WINNING_LINES.filter(line => line.every(i => marked[i]));
  return winningLines.length > 0 ? winningLines : null;
}

function startNewCard() {
  won = false;
  board = newBoard();
  marked = board.map(sq => !!sq.free); // pre-mark FREE SPACE
  hideWinModal();
  stopConfetti();
  renderBoard();
}

function clearMarks() {
  won = false;
  marked = board.map(sq => !!sq.free);
  stopConfetti();
  hideWinModal();
  updateCells(null);
}

// ── Modal ────────────────────────────────────────────────────
const winModal = document.getElementById('winModal');

function showWinModal() {
  winModal.hidden = false;
}

function hideWinModal() {
  winModal.hidden = true;
}

// ── Confetti ─────────────────────────────────────────────────
const canvas = document.getElementById('confettiCanvas');
const ctx = canvas.getContext('2d');
let confettiPieces = [];
let animFrame = null;
let confettiActive = false;

const CONFETTI_COLORS = [
  '#f5a623', '#1a56a4', '#3aaa6e', '#e74c3c',
  '#9b59b6', '#3498db', '#f39c12', '#ffffff',
];

function resizeCanvas() {
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;
}

function spawnConfetti() {
  for (let i = 0; i < 120; i++) {
    confettiPieces.push({
      x:     Math.random() * canvas.width,
      y:     Math.random() * canvas.height - canvas.height,
      w:     Math.random() * 10 + 6,
      h:     Math.random() * 6 + 4,
      color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
      angle: Math.random() * Math.PI * 2,
      spin:  (Math.random() - 0.5) * 0.2,
      vx:    (Math.random() - 0.5) * 3,
      vy:    Math.random() * 3 + 2,
      alpha: 1,
    });
  }
}

function animateConfetti() {
  if (!confettiActive) return;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  confettiPieces = confettiPieces.filter(p => p.alpha > 0.05);

  confettiPieces.forEach(p => {
    p.x     += p.vx;
    p.y     += p.vy;
    p.angle += p.spin;
    if (p.y > canvas.height * 0.7) p.alpha -= 0.012;

    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.angle);
    ctx.globalAlpha = p.alpha;
    ctx.fillStyle = p.color;
    ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
    ctx.restore();
  });

  if (confettiPieces.length > 0) {
    animFrame = requestAnimationFrame(animateConfetti);
  } else {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    confettiActive = false;
  }
}

function launchConfetti() {
  resizeCanvas();
  confettiActive = true;
  confettiPieces = [];
  spawnConfetti();
  // Burst again for drama
  setTimeout(spawnConfetti, 400);
  if (animFrame) cancelAnimationFrame(animFrame);
  animateConfetti();
}

function stopConfetti() {
  confettiActive = false;
  confettiPieces = [];
  if (animFrame) cancelAnimationFrame(animFrame);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

// ── Event Listeners ──────────────────────────────────────────
document.getElementById('newCardBtn').addEventListener('click', startNewCard);
document.getElementById('clearBtn').addEventListener('click', clearMarks);
document.getElementById('modalNewCard').addEventListener('click', startNewCard);
document.getElementById('modalKeepPlaying').addEventListener('click', () => {
  hideWinModal();
  stopConfetti();
});

window.addEventListener('resize', resizeCanvas);

// ── Init ─────────────────────────────────────────────────────
resizeCanvas();
startNewCard();
