let board = ['', '', '', '', '', '', '', '', ''];
let currentPlayer = '';
let playerSymbol = '';
let aiSymbol = '';
let difficulty = 'easy';
let isGameActive = false;
let isProcessingClick = false;

let playerScore = parseInt(localStorage.getItem('playerScore')) || 0;
let aiScore = parseInt(localStorage.getItem('aiScore')) || 0;

const winningConditions = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6],
];

document.getElementById('player-score').textContent = playerScore;
document.getElementById('ai-score').textContent = aiScore;

document.getElementById('start-game').addEventListener('click', startGame);
document.getElementById('restart-game').addEventListener('click', () => showDialog('restart', 'Deseja realmente reiniciar o jogo?'));
document.getElementById('reset-score').addEventListener('click', () => showDialog('reset', 'Deseja zerar o placar?'));

const themeDots = document.querySelectorAll('.theme-dot');
themeDots.forEach(dot => {
  dot.addEventListener('click', () => {
    const theme = dot.getAttribute('data-theme');
    document.body.setAttribute('data-theme', theme);
    themeDots.forEach(d => d.classList.remove('active'));
    dot.classList.add('active');
    localStorage.setItem('selectedTheme', theme);
  });
});

const savedTheme = localStorage.getItem('selectedTheme') || 'default';
document.body.setAttribute('data-theme', savedTheme);
themeDots.forEach(dot => {
  if (dot.getAttribute('data-theme') === savedTheme) dot.classList.add('active');
});

function startGame() {
  difficulty = document.getElementById('difficulty').value;
  playerSymbol = document.getElementById('player-symbol').value;
  aiSymbol = playerSymbol === 'X' ? 'O' : 'X';
  resetGame();
  currentPlayer = Math.random() < 0.5 ? 'player' : 'ai';
  isGameActive = true;
  renderBoard();
  updateTurnMessage();
  if (currentPlayer === 'ai') {
    setTimeout(() => aiMoveWithDelay(), 1000);
  }
}

function renderBoard() {
  const cells = document.querySelectorAll('.cell');
  cells.forEach((cell, index) => {
    cell.textContent = board[index];
  });
}

function addEventListeners() {
  const cells = document.querySelectorAll('.cell');
  cells.forEach((cell, index) => {
    cell.addEventListener('click', () => handleCellClick(index));
    cell.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') handleCellClick(index);
    });
  });
}

function removeEventListeners() {
  const cells = document.querySelectorAll('.cell');
  cells.forEach(cell => {
    cell.replaceWith(cell.cloneNode(true));
  });
}

function handleCellClick(index) {
  if (!isGameActive || currentPlayer !== 'player' || board[index] !== '' || isProcessingClick) {
    if (board[index] !== '') {
      const cell = document.querySelector(`.cell[data-index="${index}"]`);
      cell.classList.add('invalid');
      setTimeout(() => cell.classList.remove('invalid'), 300);
    }
    return;
  }
  isProcessingClick = true;
  board[index] = playerSymbol;
  renderBoard();
  if (checkWinner(playerSymbol)) {
    updateScore('player');
    endGame('Você venceu!');
  } else if (isDraw()) {
    endGame('Empate!');
  } else {
    currentPlayer = 'ai';
    updateTurnMessage();
    setTimeout(() => {
      aiMoveWithDelay();
      isProcessingClick = false;
    }, 1000);
  }
}

function aiMoveWithDelay() {
  let move;
  if (difficulty === 'easy') {
    move = getRandomMove();
  } else if (difficulty === 'medium') {
    move = getMediumMove();
  } else {
    move = getBestMove();
  }
  board[move] = aiSymbol;
  renderBoard();
  if (checkWinner(aiSymbol)) {
    updateScore('ai');
    endGame('Você perdeu!');
  } else if (isDraw()) {
    endGame('Empate!');
  } else {
    currentPlayer = 'player';
    updateTurnMessage();
    isProcessingClick = false;
  }
}

function updateTurnMessage() {
  const turnMessage = document.getElementById('turn-message');
  const currentTurn = document.getElementById('current-turn');
  if (isGameActive) {
    turnMessage.classList.remove('hidden');
    currentTurn.textContent = currentPlayer === 'player' ? 'Você' : 'IA';
  } else {
    turnMessage.classList.add('hidden');
  }
}

function updateScore(winner) {
  if (winner === 'player') {
    playerScore++;
    localStorage.setItem('playerScore', playerScore);
    const playerScoreElement = document.getElementById('player-score');
    playerScoreElement.textContent = playerScore;
    playerScoreElement.classList.add('score-animation');
    setTimeout(() => playerScoreElement.classList.remove('score-animation'), 500);
  } else if (winner === 'ai') {
    aiScore++;
    localStorage.setItem('aiScore', aiScore);
    const aiScoreElement = document.getElementById('ai-score');
    aiScoreElement.textContent = aiScore;
    aiScoreElement.classList.add('score-animation');
    setTimeout(() => aiScoreElement.classList.remove('score-animation'), 500);
  }
}

function checkWinner(symbol) {
  for (let condition of winningConditions) {
    if (condition.every(index => board[index] === symbol)) {
      highlightWinningCells(condition);
      return true;
    }
  }
  return false;
}

function highlightWinningCells(condition) {
  condition.forEach(index => {
    const cell = document.querySelector(`.cell[data-index="${index}"]`);
    cell.classList.add('winning');
    setTimeout(() => cell.classList.remove('winning'), 3000);
  });
}

function isDraw() {
  return board.every(cell => cell !== '');
}

function endGame(message) {
  isGameActive = false;
  document.getElementById('status-message').textContent = message;
  document.getElementById('status-message').classList.remove('hidden');
  document.getElementById('restart-game').classList.remove('hidden');
  document.getElementById('reset-score').classList.remove('hidden');
  updateTurnMessage();
}

function resetGame() {
  board = ['', '', '', '', '', '', '', '', ''];
  removeEventListeners();
  addEventListeners();
  const cells = document.querySelectorAll('.cell');
  cells.forEach(cell => cell.classList.remove('winning'));
  document.getElementById('game-board').classList.add('hidden');
  document.getElementById('restart-game').classList.add('hidden');
  document.getElementById('reset-score').classList.add('hidden');
  document.getElementById('status-message').classList.add('hidden');
  currentPlayer = '';
  isGameActive = false;
  isProcessingClick = false;
}

function showDialog(action, message) {
  const dialogBox = document.getElementById('dialog-box');
  const dialogMessage = document.getElementById('dialog-message');
  const dialogYes = document.getElementById('dialog-yes');
  const dialogNo = document.getElementById('dialog-no');

  dialogMessage.textContent = message;
  dialogBox.classList.remove('hidden');

  dialogYes.onclick = null;
  dialogNo.onclick = null;

  dialogYes.onclick = () => {
    dialogBox.classList.add('hidden');
    if (action === 'restart') {
      resetGame();
      startGame();
    } else if (action === 'reset') {
      playerScore = 0;
      aiScore = 0;
      localStorage.setItem('playerScore', 0);
      localStorage.setItem('aiScore', 0);
      document.getElementById('player-score').textContent = 0;
      document.getElementById('ai-score').textContent = 0;
    }
  };

  dialogNo.onclick = () => {
    dialogBox.classList.add('hidden');
  };
}

function getRandomMove() {
  let emptyCells = board.map((cell, index) => (cell === '' ? index : null)).filter(index => index !== null);
  return emptyCells[Math.floor(Math.random() * emptyCells.length)];
}

function getMediumMove() {
  for (let condition of winningConditions) {
    const [a, b, c] = condition;
    if (board[a] === aiSymbol && board[b] === aiSymbol && board[c] === '') return c;
    if (board[a] === aiSymbol && board[c] === aiSymbol && board[b] === '') return b;
    if (board[b] === aiSymbol && board[c] === aiSymbol && board[a] === '') return a;
  }
  for (let condition of winningConditions) {
    const [a, b, c] = condition;
    if (board[a] === playerSymbol && board[b] === playerSymbol && board[c] === '') return c;
    if (board[a] === playerSymbol && board[c] === playerSymbol && board[b] === '') return b;
    if (board[b] === playerSymbol && board[c] === playerSymbol && board[a] === '') return a;
  }
  return getRandomMove();
}

function getBestMove() {
  let bestScore = -Infinity;
  let move = null;
  for (let i = 0; i < board.length; i++) {
    if (board[i] === '') {
      board[i] = aiSymbol;
      let score = minimax(board, 0, false);
      board[i] = '';
      if (score > bestScore) {
        bestScore = score;
        move = i;
      }
    }
  }
  return move;
}

function minimax(board, depth, isMaximizing) {
  if (checkWinner(aiSymbol)) return 10 - depth;
  if (checkWinner(playerSymbol)) return -10 + depth;
  if (isDraw()) return 0;

  if (isMaximizing) {
    let bestScore = -Infinity;
    for (let i = 0; i < board.length; i++) {
      if (board[i] === '') {
        board[i] = aiSymbol;
        let score = minimax(board, depth + 1, false);
        board[i] = '';
        bestScore = Math.max(score, bestScore);
      }
    }
    return bestScore;
  } else {
    let bestScore = Infinity;
    for (let i = 0; i < board.length; i++) {
      if (board[i] === '') {
        board[i] = playerSymbol;
        let score = minimax(board, depth + 1, true);
        board[i] = '';
        bestScore = Math.min(score, bestScore);
      }
    }
    return bestScore;
  }
}