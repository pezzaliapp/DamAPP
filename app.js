
const board = document.getElementById('board');
const status = document.getElementById('status');
let selected = null;
let turn = 'red';

let gameState = [];

function resetGameState() {
  gameState = Array(8).fill(null).map(() => Array(8).fill(null));
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      if ((r + c) % 2 === 1) {
        if (r < 3) gameState[r][c] = 'black';
        if (r > 4) gameState[r][c] = 'red';
      }
    }
  }
}

function createBoard() {
  board.innerHTML = '';
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const square = document.createElement('div');
      square.className = 'square ' + ((r + c) % 2 === 0 ? 'light' : 'dark');
      square.dataset.row = r;
      square.dataset.col = c;
      square.addEventListener('click', () => onSquareClick(r, c));
      board.appendChild(square);
    }
  }
  renderBoard();
}

function renderBoard() {
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const square = board.children[r * 8 + c];
      square.innerHTML = '';
      const piece = gameState[r][c];
      if (piece) {
        const div = document.createElement('div');
        div.className = 'piece ' + piece;
        div.addEventListener('click', (e) => {
          e.stopPropagation();
          onPieceClick(r, c);
        });
        square.appendChild(div);
      }
    }
  }
}

function onPieceClick(r, c) {
  if (turn === gameState[r][c]) {
    selected = { r, c };
  }
}

function onSquareClick(r, c) {
  if (!selected) return;
  const sr = selected.r;
  const sc = selected.c;

  if (isValidMove(sr, sc, r, c)) {
    gameState[r][c] = gameState[sr][sc];
    gameState[sr][sc] = null;
    selected = null;
    turn = 'black';
    renderBoard();
    status.innerText = 'Turno: Computer (Nero)';
    setTimeout(aiMove, 500);
  }
}

function isValidMove(sr, sc, r, c) {
  if (gameState[r][c] !== null) return false;
  const dr = r - sr;
  const dc = Math.abs(c - sc);
  return dr === -1 && dc === 1 && gameState[sr][sc] === 'red';
}

function aiMove() {
  const moves = getAllSimpleMoves('black');
  if (moves.length > 0) {
    const move = moves[Math.floor(Math.random() * moves.length)];
    gameState[move.to.r][move.to.c] = gameState[move.from.r][move.from.c];
    gameState[move.from.r][move.from.c] = null;
  }
  turn = 'red';
  status.innerText = 'Turno: Utente (Rosso)';
  renderBoard();
}

function getAllSimpleMoves(color) {
  const result = [];
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      if (gameState[r][c] === color) {
        const dr = color === 'black' ? 1 : -1;
        for (let dc of [-1, 1]) {
          const nr = r + dr;
          const nc = c + dc;
          if (nr >= 0 && nr < 8 && nc >= 0 && nc < 8 && gameState[nr][nc] === null) {
            result.push({ from: { r, c }, to: { r: nr, c: nc } });
          }
        }
      }
    }
  }
  return result;
}

resetGameState();
createBoard();
renderBoard();
