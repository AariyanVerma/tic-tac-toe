let board = Array(9).fill(null);
let currentPlayer = 'X';
let gameOver = false;
let winner = null;
let winningLine = null;
let vsBot = false;

const scores = { X: 0, O: 0, D: 0 };

const DISPLAY = { X: '❌', O: '⭕' };

document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.getElementById('vsBotToggle');
  toggle.addEventListener('change', () => {
    vsBot = toggle.checked;
    initializeGame();
  });
  initializeGame();
});

function initializeGame() {
  board = Array(9).fill(null);
  currentPlayer = 'X';
  gameOver = false;
  winner = null;
  winningLine = null;

  for (let i = 0; i < 9; i++) {
    const cell = getCell(i);
    cell.textContent = '';
    cell.classList.remove('filled', 'win');
  }
  updateStatus();
}

function updateStatus() {
  const statusEl = document.getElementById('statusText');
  if (gameOver) {
    if (winner === 'D') {
      statusEl.textContent = 'Draw!';
    } else {
      statusEl.textContent = `Winner: ${winner}`;
    }
  } else {
    statusEl.textContent = `Current turn: ${currentPlayer}`;
  }

  document.getElementById('scoreX').textContent = scores.X;
  document.getElementById('scoreO').textContent = scores.O;
  document.getElementById('scoreD').textContent = scores.D;
}

function renderBoard() {
  for (let i = 0; i < 9; i++) {
    const cell = getCell(i);
    const val = board[i];
    cell.textContent = val ? DISPLAY[val] : '';
    cell.classList.toggle('filled', Boolean(val));
    cell.classList.toggle('win', winningLine?.includes(i));
  }
  updateStatus();
}

function getCell(index) {
  return document.querySelector(`.cell[data-index="${index}"]`);
}

function checkWinner() {
  const lines = [
    [0,1,2], [3,4,5], [6,7,8],
    [0,3,6], [1,4,7], [2,5,8],
    [0,4,8], [2,4,6]
  ];

  for (const [a,b,c] of lines) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      winner = board[a];
      gameOver = true;
      winningLine = [a,b,c];
      return winner;
    }
  }

  if (board.every(v => v !== null)) {
    winner = 'D';
    gameOver = true;
    winningLine = null;
    return 'D';
  }
  return null;
}

function cellClicked(index) {
  if (gameOver || board[index]) return;

  board[index] = currentPlayer;
  const result = checkWinner();
  if (result) finalizeGame(result);
  else {
    currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
    renderBoard();

    if (!gameOver && vsBot && currentPlayer === 'O') {
      setTimeout(botMove, 180);
    }
  }
  renderBoard();
}

function finalizeGame(result) {
  if (result === 'D') scores.D++;
  else scores[result]++;

  if (winningLine) {
    winningLine.forEach(i => getCell(i).classList.add('win'));
  }
  renderBoard();
}

function botMove() {
  const move = findWinningMove('O') ?? findWinningMove('X') ??
               pickPreferred([4]) ?? pickPreferred([0,2,6,8]) ??
               pickPreferred([1,3,5,7]);
  if (move != null) {
    board[move] = 'O';
    const result = checkWinner();
    if (result) finalizeGame(result);
    else {
      currentPlayer = 'X';
      renderBoard();
    }
  }
}

function findWinningMove(player) {
  const lines = [
    [0,1,2], [3,4,5], [6,7,8],
    [0,3,6], [1,4,7], [2,5,8],
    [0,4,8], [2,4,6]
  ];
  for (const [a,b,c] of lines) {
    const trio = [a,b,c];
    const vals = trio.map(i => board[i]);
    const countP = vals.filter(v => v === player).length;
    const countEmpty = vals.filter(v => v === null).length;
    if (countP === 2 && countEmpty === 1) {
      return trio.find(i => board[i] === null);
    }
  }
  return null;
}

function pickPreferred(indices) {
  const available = indices.filter(i => board[i] === null);
  if (available.length === 0) return null;
  return available[Math.floor(Math.random() * available.length)];
}

window.initializeGame = initializeGame;
window.cellClicked = cellClicked;
