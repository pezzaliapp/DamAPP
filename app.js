
const board = document.getElementById('board');
const status = document.getElementById('status');
let selected = null;
let turn = 'red';
let gameState = [];
let showHints = false;

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
}

function renderBoard() {
  let hints = [];
  if (showHints && selected) {
    let { r, c } = selected;
    hints = getValidMovesForPiece(r, c, 'red').map(m => m.to.r * 8 + m.to.c);
  }

  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const square = board.children[r * 8 + c];
      square.innerHTML = '';
      if (hints.includes(r * 8 + c)) square.classList.add('hint');
      else square.classList.remove('hint');

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
    renderBoard();
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

    const nextCaptures = getValidMovesForPiece(r, c, 'red').filter(m => m.capture);
    if (move.capture && nextCaptures.length > 0) {
      selected = { r, c };
      renderBoard();
      return;
    }

    turn = 'black';
    updateStatus();
    renderBoard();
    setTimeout(aiMove, 300);
  }
}

function toggleHints() {
  showHints = !showHints;
  renderBoard();
}

function newGame() {
  resetGameState();
  selected = null;
  turn = 'red';
  updateStatus();
  renderBoard();
}

function aiMove() {
  const depth = 3;
  let current = gameState;
  let move = getBestMove(current, depth, true);
  while (move) {
    const { from, to, capture } = move;
    if (capture) gameState[capture.r][capture.c] = null;
    gameState[to.r][to.c] = 'black';
    gameState[from.r][from.c] = null;

    const more = getValidMovesForPiece(to.r, to.c, 'black', gameState).filter(m => m.capture);
    if (capture && more.length > 0) {
      move = more[0];
      move.from = { r: to.r, c: to.c };
    } else {
      move = null;
    }
  }
  turn = 'red';
  updateStatus();
  renderBoard();
}

function getBestMove(state, depth, isMaximizing) {
  let moves = getAllValidMoves('black', state);
  let bestScore = -Infinity;
  let bestMove = null;

  for (let move of moves) {
    let newState = cloneState(state);
    applyMove(newState, move, 'black');
    let score = minimax(newState, depth - 1, false);
    if (score > bestScore) {
      bestScore = score;
      bestMove = move;
    }
  }
  return bestMove;
}

function minimax(state, depth, isMaximizing) {
  if (depth === 0) return evaluateBoard(state);
  let color = isMaximizing ? 'black' : 'red';
  let moves = getAllValidMoves(color, state);
  if (moves.length === 0) return isMaximizing ? -1000 : 1000;

  if (isMaximizing) {
    let maxEval = -Infinity;
    for (let move of moves) {
      let newState = cloneState(state);
      applyMove(newState, move, color);
      let eval = minimax(newState, depth - 1, false);
      maxEval = Math.max(maxEval, eval);
    }
    return maxEval;
  } else {
    let minEval = Infinity;
    for (let move of moves) {
      let newState = cloneState(state);
      applyMove(newState, move, color);
      let eval = minimax(newState, depth - 1, true);
      minEval = Math.min(minEval, eval);
    }
    return minEval;
  }
}

function cloneState(state) {
  return state.map(row => row.slice());
}

function applyMove(state, move, color) {
  const { from, to, capture } = move;
  if (capture) state[capture.r][capture.c] = null;
  state[to.r][to.c] = color;
  state[from.r][from.c] = null;
}

function evaluateBoard(state) {
  let score = 0;
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      if (state[r][c] === 'black') score += 1;
      else if (state[r][c] === 'red') score -= 1;
    }
  }
  return score;
}

function getAllValidMoves(color, stateOverride) {
  let state = stateOverride || gameState;
  let moves = [], captures = [];
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      if (state[r][c] === color) {
        let m = getValidMovesForPiece(r, c, color, state);
        m.forEach(move => {
          moves.push(move);
          if (move.capture) captures.push(move);
        });
      }
    }
  }
  return captures.length > 0 ? captures : moves;
}

function getValidMovesForPiece(r, c, color, stateOverride) {
  let state = stateOverride || gameState;
  let valid = [];
  let dr = color === 'red' ? -1 : 1;
  let deltas = [-1, 1];

  for (let dc of deltas) {
    let midR = r + dr, midC = c + dc;
    let landR = r + 2 * dr, landC = c + 2 * dc;
    if (landR >= 0 && landR < 8 && landC >= 0 && landC < 8) {
      if (state[midR][midC] && state[midR][midC] !== color && !state[landR][landC]) {
        valid.push({ from: { r, c }, to: { r: landR, c: landC }, capture: { r: midR, c: midC } });
      }
    }
  }

  if (valid.length > 0) return valid;

  for (let dc of deltas) {
    let newR = r + dr, newC = c + dc;
    if (newR >= 0 && newR < 8 && newC >= 0 && newC < 8 && !state[newR][newC]) {
      valid.push({ from: { r, c }, to: { r: newR, c: newC } });
    }
  }
  return valid;
}

resetGameState();
createBoard();
updateStatus();
renderBoard();
