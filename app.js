# File app.js con la logica della dama (mosse semplici e catture obbligatorie)
app_js_dama = """const board = document.getElementById('board');
const status = document.getElementById('status');
let selected = null;
let turn = 'red'; // "red" = utente, "black" = computer
let gameState = [];

// Inizializza il gameState con il posizionamento iniziale
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

// Crea la scacchiera HTML e aggiunge il listener per il clic
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

// Aggiorna la grafica della scacchiera
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

// Aggiorna il messaggio di stato
function updateStatus() {
  status.innerText = (turn === 'red') ? 'Turno: Utente (Rosso)' : 'Turno: Computer (Nero)';
}

// Gestisce il clic sulla pedina (utente)
function onPieceClick(r, c) {
  if (turn === 'red' && gameState[r][c] === 'red') {
    selected = { r, c };
  }
}

// Gestisce il clic sulla casella e verifica la mossa valida
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

// Restituisce le mosse valide per una pedina, incluse le catture obbligatorie
function getValidMovesForPiece(r, c, color) {
  let valid = [];
  let dr = (color === 'red') ? -1 : 1; // rosso si muove verso l'alto, nero verso il basso
  let deltas = [-1, 1];

  // Controlla per possibili catture
  for (let dc of deltas) {
    let midR = r + dr;
    let midC = c + dc;
    let landingR = r + 2 * dr;
    let landingC = c + 2 * dc;
    if (landingR >= 0 && landingR < 8 && landingC >= 0 && landingC < 8) {
      if (gameState[midR][midC] && gameState[midR][midC] !== color && gameState[landingR][landingC] === null) {
        valid.push({ from: { r, c }, to: { r: landingR, c: landingC }, capture: { r: midR, c: midC } });
      }
    }
  }
  // Se esistono catture, queste sono obbligatorie
  if (valid.length > 0) return valid;

  // Altrimenti, controlla le mosse semplici
  for (let dc of deltas) {
    let newR = r + dr;
    let newC = c + dc;
    if (newR >= 0 && newR < 8 && newC >= 0 && newC < 8 && gameState[newR][newC] === null) {
      valid.push({ from: { r, c }, to: { r: newR, c: newC } });
    }
  }
  return valid;
}

// Restituisce tutte le mosse valide per un dato colore
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

// Logica dell'IA per il computer (mosse casuali tra quelle valide)
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
"""

# Funzione per generare icone in memoria
def create_icon_bytes(size, text):
    img = Image.new("RGBA", (size, size), (0, 0, 0, 255))
    draw = ImageDraw.Draw(img)
    font_size = int(size * 0.25)
    try:
        font = ImageFont.truetype("DejaVuSans-Bold.ttf", font_size)
    except Exception:
        font = ImageFont.load_default()
    # Uso textbbox per calcolare le dimensioni del testo
    bbox = draw.textbbox((0, 0), text, font=font)
    text_width = bbox[2] - bbox[0]
    text_height = bbox[3] - bbox[1]
    position = ((size - text_width) // 2, (size - text_height) // 2)
    draw.text(position, text, fill=(255, 255, 255, 255), font=font)
    output = BytesIO()
    img.save(output, format="PNG")
    return output.getvalue()
