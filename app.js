
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
        else if (r > 4) gameState[r][c] = 'red';
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

function updateStatus() {
  status.innerText = turn === 'red' ? 'Turno: Utente (Rosso)' : 'Turno: Computer (Nero)';
}

function onPieceClick(r, c) {
  if (turn === 'red' && gameState[r][c] === 'red') {
    selected = { r, c };
  }
}

function onSquareClick(r, c) {
  if (!selected) return;
  const sr = selected.r, sc = selected.c;
  const validMoves = getValidMovesForPiece(sr, sc, 'red');
  let move = validMoves.find(m => m.to.r === r && m.to.c === c);
  if (move) {
    if (move.capture) {
      const cap = move.capture;
      gameState[cap.r][cap.c] = null;
    }
    gameState[r][c] = 'red';
    gameState[sr][sc] = null;
    selected = null;
    turn = 'black';
    updateStatus();
    renderBoard();
    setTimeout(aiMove, 500);
  }
}

function getValidMovesForPiece(r, c, color) {
  let valid = [];
  let dr = color === 'red' ? -1 : 1;
  let deltas = [-1, 1];

  for (let dc of deltas) {
    let midR = r + dr, midC = c + dc;
    let landR = r + 2 * dr, landC = c + 2 * dc;
    if (landR >= 0 && landR < 8 && landC >= 0 && landC < 8) {
      if (gameState[midR][midC] && gameState[midR][midC] !== color && !gameState[landR][landC]) {
        valid.push({ from: { r, c }, to: { r: landR, c: landC }, capture: { r: midR, c: midC } });
      }
    }
  }

  if (valid.length > 0) return valid;

  for (let dc of deltas) {
    let newR = r + dr, newC = c + dc;
    if (newR >= 0 && newR < 8 && newC >= 0 && newC < 8 && !gameState[newR][newC]) {
      valid.push({ from: { r, c }, to: { r: newR, c: newC } });
    }
  }

  return valid;
}

function getAllValidMoves(color) {
  let moves = [], captures = [];
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      if (gameState[r][c] === color) {
        let m = getValidMovesForPiece(r, c, color);
        m.forEach(move => {
          moves.push(move);
          if (move.capture) captures.push(move);
        });
      }
    }
  }
  return captures.length > 0 ? captures : moves;
}

function aiMove() {
  const moves = getAllValidMoves('black');
  if (moves.length > 0) {
    const move = moves[Math.floor(Math.random() * moves.length)];
    const { from, to, capture } = move;
    if (capture) gameState[capture.r][capture.c] = null;
    gameState[to.r][to.c] = 'black';
    gameState[from.r][from.c] = null;
  }
  turn = 'red';
  updateStatus();
  renderBoard();
}

resetGameState();
createBoard();
updateStatus();
renderBoard();
