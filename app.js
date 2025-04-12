const board = document.getElementById('board');
const status = document.getElementById('status');
let selected = null;
let turn = 'red'; // "red" = utente, "black" = computer

let gameState = [];

// Inizializza la scacchiera: dispone le pedine in base alle regole della dama italiana
function resetGameState() {
  gameState = Array(8)
    .fill(null)
    .map(() => Array(8).fill(null));
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      // Si piazzano solo sulle caselle scure ((r+c) % 2 == 1)
      if ((r + c) % 2 === 1) {
        if (r < 3) gameState[r][c] = 'black';
        else if (r > 4) gameState[r][c] = 'red';
      }
    }
  }
}

// Crea la scacchiera HTML
function createBoard() {
  board.innerHTML = '';
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const square = document.createElement('div');
      square.className = 'square ' + (((r + c) % 2 === 0) ? 'light' : 'dark');
      square.dataset.row = r;
      square.dataset.col = c;
      square.addEventListener('click', () => onSquareClick(r, c));
      board.appendChild(square);
    }
  }
  renderBoard();
}

// Aggiorna la grafica della scacchiera in base a gameState
function renderBoard() {
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const index = r * 8 + c;
      const square = board.children[index];
      square.innerHTML = '';
      const piece = gameState[r][c];
      if (piece) {
        const pieceDiv = document.createElement('div');
        pieceDiv.className = 'piece ' + piece;
        pieceDiv.addEventListener('click', (e) => {
          e.stopPropagation();
          onPieceClick(r, c);
        });
        square.appendChild(pieceDiv);
      }
    }
  }
}

// Aggiorna il messaggio di stato in base al turno
function updateStatus() {
  status.innerText = (turn === 'red') ? 'Turno: Utente (Rosso)' : 'Turno: Computer (Nero)';
}

// Seleziona la pedina in base al clic
function onPieceClick(r, c) {
  if (turn === 'red' && gameState[r][c] === 'red') {
    selected = { r, c };
  }
}

// Gestisce il clic sulla casella e verifica se la mossa selezionata è valida
function onSquareClick(r, c) {
  if (!selected) return;
  const sr = selected.r, sc = selected.c;
  const validMoves = getValidMovesForPiece(sr, sc, 'red');
  // Verifica se la casella cliccata corrisponde a una mossa valida
  let move = validMoves.find(m => m.to.r === r && m.to.c === c);
  if (move) {
    // Se la mossa è una cattura, rimuove la pedina nemica
    if (move.capture) {
      const cap = move.capture;
      gameState[cap.r][cap.c] = null;
    }
    // Esegue la mossa spostando la pedina
    gameState[r][c] = 'red';
    gameState[sr][sc] = null;
    selected = null;
    turn = 'black';
    updateStatus();
    renderBoard();
    // La mossa del computer parte dopo 500ms
    setTimeout(aiMove, 500);
  }
}

// Restituisce le mosse valide per una pedina data (incluse le catture obbligatorie)
function getValidMovesForPiece(r, c, color) {
  let valid = [];
  // Direzione: per il rosso (utente) si muove verso l'alto, per il nero verso il basso
  let dr = (color === 'red') ? -1 : 1;
  let deltas = [-1, 1];

  // PROVA: controlla se esistono mosse di cattura
  for (let dc of deltas) {
    let midR = r + dr;
    let midC = c + dc;
    let landingR = r + 2 * dr;
    let landingC = c + 2 * dc;
    if (landingR >= 0 && landingR < 8 && landingC >= 0 && landingC < 8) {
      // Se c'è una pedina nemica nel mezzo ed il quadrato di atterraggio è vuoto
      if (gameState[midR][midC] && gameState[midR][midC] !== color && gameState[landingR][landingC] === null) {
        valid.push({ from: { r, c }, to: { r: landingR, c: landingC }, capture: { r: midR, c: midC } });
      }
    }
  }
  // Se esistono catture, queste sono obbligatorie (ritorna solo queste)
  if (valid.length > 0) return valid;

  // Altrimenti, controlla le mosse semplici
  for (let dc of deltas) {
    let newR = r + dr;
    let newC = c + dc;
    if (newR >= 0 && newR < 8 && newC >= 0 && newC < 8) {
      if (gameState[newR][newC] === null) {
        valid.push({ from: { r, c }, to: { r: newR, c: newC } });
      }
    }
  }
  return valid;
}

// Restituisce tutte le mosse valide per tutte le pedine di un dato colore.
// Se esistono catture anche solo per una pedina, si considerano solo quelle (obbligatorie).
function getAllValidMoves(color) {
  let moves = [];
  let capturing = [];
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      if (gameState[r][c] === color) {
        let m = getValidMovesForPiece(r, c, color);
        m.forEach(move => {
          moves.push(move);
          if (move.capture) capturing.push(move);
        });
      }
    }
  }
  return capturing.length > 0 ? capturing : moves;
}

// Logica dell'IA per il computer (nero)
// Sceglie, ad esempio, una mossa casuale tra quelle valide.
function aiMove() {
  const moves = getAllValidMoves('black');
  if (moves.length > 0) {
    const move = moves[Math.floor(Math.random() * moves.length)];
    const sr = move.from.r, sc = move.from.c;
    const dr = move.to.r, dc = move.to.c;
    if (move.capture) {
      const cap = move.capture;
      gameState[cap.r][cap.c] = null;
    }
    gameState[dr][dc] = 'black';
    gameState[sr][sc] = null;
  }
  turn = 'red';
  updateStatus();
  renderBoard();
}

// Inizializzazione della partita
resetGameState();
createBoard();
updateStatus();
renderBoard();
