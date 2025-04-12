const board = document.getElementById('board');
const status = document.getElementById('status');
let selected = null;
let turn = 'red';

const gameState = Array(8).fill(null).map(() => Array(8).fill(null));

function createBoard() {
  board.innerHTML = '';
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const square = document.createElement('div');
      square.className = 'square ' + ((row + col) % 2 === 0 ? 'light' : 'dark');
      square.dataset.row = row;
      square.dataset.col = col;
      square.addEventListener('click', () => onSquareClick(row, col));
      board.appendChild(square);
    }
  }
}

function initializeGame() {
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      gameState[row][col] = null;
      if ((row + col) % 2 === 1) {
        if (row < 3) gameState[row][col] = 'black';
        else if (row > 4) gameState[row][col] = 'red';
      }
    }
  }
  renderBoard();
}

function renderBoard() {
  for (let i = 0; i < 64; i++) {
    const square = board.children[i];
    const row = parseInt(square.dataset.row);
    const col = parseInt(square.dataset.col);
    square.innerHTML = '';
    const piece = gameState[row][col];
    if (piece) {
      const pieceDiv = document.createElement('div');
      pieceDiv.className = 'piece ' + piece;
      pieceDiv.addEventListener('click', (e) => {
        e.stopPropagation();
        onPieceClick(row, col);
      });
      square.appendChild(pieceDiv);
    }
  }
}

function onPieceClick(row, col) {
  if (turn !== gameState[row][col]) return;
  selected = { row, col };
}

function onSquareClick(row, col) {
  if (!selected) return;
  const dr = row - selected.row;
  const dc = col - selected.col;

  if (Math.abs(dr) === 1 && Math.abs(dc) === 1 && !gameState[row][col]) {
    gameState[row][col] = gameState[selected.row][selected.col];
    gameState[selected.row][selected.col] = null;
    selected = null;
    turn = 'black';
    renderBoard();
    status.innerText = 'Turno: Computer (Nero)';
    setTimeout(() => aiMove(), 500);
  }
}

function aiMove() {
  const best = findBestMove(gameState, 0, true, -Infinity, Infinity);
  if (best && best.move) {
    const { from, to } = best.move;
    gameState[to.row][to.col] = gameState[from.row][from.col];
    gameState[from.row][from.col] = null;
  }
  turn = 'red';
  status.innerText = 'Turno: Utente (Rosso)';
  renderBoard();
}

function getAllMoves(state, isAI) {
  const moves = [];
  const captures = [];
  const color = isAI ? 'black' : 'red';
  const direction = isAI ? 1 : -1;

  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      if (state[r][c] === color) {
        const dirs = [[direction, -1], [direction, 1]];
        for (const [dr, dc] of dirs) {
          const nr = r + dr;
          const nc = c + dc;
          if (nr >= 0 && nr < 8 && nc >= 0 && nc < 8) {
            if (!state[nr][nc]) {
              moves.push({ from: { row: r, col: c }, to: { row: nr, col: nc } });
            } else {
              const enemy = state[nr][nc];
              if (enemy && enemy !== color) {
                const jumpR = r + 2 * dr;
                const jumpC = c + 2 * dc;
                if (jumpR >= 0 && jumpR < 8 && jumpC >= 0 && jumpC < 8 && !state[jumpR][jumpC]) {
                  captures.push({ from: { row: r, col: c }, to: { row: jumpR, col: jumpC }, capture: { row: nr, col: nc } });
                }
              }
            }
          }
        }
      }
    }
  }

  return captures.length > 0 ? captures : moves;
}
  const moves = [];
  const color = isAI ? 'black' : 'red';
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      if (state[r][c] === color) {
        const dirs = [[1, -1], [1, 1], [-1, -1], [-1, 1]];
        for (const [dr, dc] of dirs) {
          const nr = r + dr;
          const nc = c + dc;
          if (nr >= 0 && nr < 8 && nc >= 0 && nc < 8 && !state[nr][nc]) {
            moves.push({ from: { row: r, col: c }, to: { row: nr, col: nc } });
          }
        }
      }
    }
  }
  return moves;
}

function applyMove(state, move) {
  const newState = state.map(row => row.slice());
  newState[move.to.row][move.to.col] = newState[move.from.row][move.from.col];
  newState[move.from.row][move.from.col] = null;
  return newState;
}

function evaluateBoard(state) {
  let score = 0;
  for (let row of state) {
    for (let cell of row) {
      if (cell === 'black') score += 1;
      else if (cell === 'red') score -= 1;
    }
  }
  return score;
}

function findBestMove(state, depth, isAI, alpha, beta) {
  const maxDepth = window.navigator.hardwareConcurrency >= 4 ? 5 : 3;
  if (depth >= maxDepth) {
    return { score: evaluateBoard(state) };
  }
  const moves = getAllMoves(state, isAI);
  if (moves.length === 0) return { score: evaluateBoard(state) };

  let best = isAI ? { score: -Infinity } : { score: Infinity };
  for (const move of moves) {
    const newState = applyMove(state, move);
    const result = findBestMove(newState, depth + 1, !isAI, alpha, beta);
    if (isAI) {
      if (result.score > best.score) {
        best = { score: result.score, move };
      }
      alpha = Math.max(alpha, best.score);
    } else {
      if (result.score < best.score) {
        best = { score: result.score, move };
      }
      beta = Math.min(beta, best.score);
    }
    if (beta <= alpha) break;
  }
  return best;
}

createBoard();
initializeGame();
