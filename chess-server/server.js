const WebSocket = require("ws");
const { v4: uuidv4 } = require("uuid");

const wss = new WebSocket.Server({ port: 3001 });

const games = new Map();

class Game {
  constructor(player1, player2) {
    this.id = uuidv4();
    this.players = [player1, player2];
    this.currentPlayerIndex = 0;
    this.board = this.initializeBoard();
    this.moveHistory = [];
  }

  initializeBoard() {
    const board = Array(5)
      .fill()
      .map(() => Array(5).fill(null));
    const playerAPieces = ["A-P1", "A-P2", "A-P3", "A-H1", "A-H2"];
    const playerBPieces = ["B-P1", "B-P2", "B-P3", "B-H1", "B-H2"];

    for (let i = 0; i < 5; i++) {
      board[0][i] = playerAPieces[i];
      board[4][i] = playerBPieces[i];
    }

    return board;
  }

  getCurrentPlayer() {
    return this.players[this.currentPlayerIndex];
  }

  switchTurn() {
    this.currentPlayerIndex = 1 - this.currentPlayerIndex;
  }

  isValidMove(piece, fromRow, fromCol, toRow, toCol) {
    const [player, type] = piece.split("-");
    const rowDiff = Math.abs(toRow - fromRow);
    const colDiff = Math.abs(toCol - fromCol);

    if (type === "P") {
      return (
        (rowDiff === 1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1)
      );
    } else if (type === "H1") {
      return (
        (rowDiff === 2 && colDiff === 0) || (rowDiff === 0 && colDiff === 2)
      );
    } else if (type === "H2") {
      return rowDiff === 2 && colDiff === 2;
    } else if (type === "H3") {
      return (
        (rowDiff === 2 && colDiff === 1) || (rowDiff === 1 && colDiff === 2)
      );
    }

    return false;
  }

  makeMove(player, piece, toRow, toCol) {
    if (player !== this.getCurrentPlayer()) {
      return { success: false, message: "It's not your turn" };
    }

    const [fromRow, fromCol] = this.findPiece(piece);
    if (fromRow === -1) {
      return { success: false, message: "Piece not found" };
    }

    if (!this.isValidMove(piece, fromRow, fromCol, toRow, toCol)) {
      return { success: false, message: "Invalid move" };
    }

    // Check for capture
    if (
      this.board[toRow][toCol] &&
      !this.board[toRow][toCol].startsWith(player)
    ) {
      // Capture the piece
      this.board[toRow][toCol] = null;
    }

    // Move the piece
    this.board[toRow][toCol] = this.board[fromRow][fromCol];
    this.board[fromRow][fromCol] = null;

    this.moveHistory.push(
      `${piece}: (${fromRow},${fromCol}) to (${toRow},${toCol})`
    );
    this.switchTurn();

    return { success: true };
  }

  findPiece(piece) {
    for (let row = 0; row < 5; row++) {
      for (let col = 0; col < 5; col++) {
        if (this.board[row][col] === piece) {
          return [row, col];
        }
      }
    }
    return [-1, -1];
  }

  isGameOver() {
    const playerAPieces = this.board
      .flat()
      .filter((piece) => piece && piece.startsWith("A"));
    const playerBPieces = this.board
      .flat()
      .filter((piece) => piece && piece.startsWith("B"));

    if (playerAPieces.length === 0) return "B";
    if (playerBPieces.length === 0) return "A";
    return null;
  }

  getGameState() {
    return {
      board: this.board,
      currentPlayer: this.getCurrentPlayer(),
      moveHistory: this.moveHistory,
    };
  }
}

wss.on("connection", (ws) => {
  ws.id = uuidv4();
  let game = null;

  ws.on("message", (message) => {
    const data = JSON.parse(message);

    switch (data.type) {
      case "join":
        handleJoin(ws);
        break;
      case "move":
        handleMove(ws, data.move);
        break;
    }
  });

  ws.on("close", () => {
    if (game) {
      const opponent = game.players.find((p) => p !== ws);
      if (opponent) {
        opponent.send(JSON.stringify({ type: "opponentLeft" }));
      }
      games.delete(game.id);
    }
  });
});

function handleJoin(ws) {
  let game = [...games.values()].find((g) => g.players.length < 2);

  if (!game) {
    game = new Game(ws);
    games.set(game.id, game);
  } else {
    game.players.push(ws);
    startGame(game);
  }

  ws.send(
    JSON.stringify({
      type: "joined",
      player: game.players.indexOf(ws) === 0 ? "A" : "B",
    })
  );
}

function startGame(game) {
  game.players.forEach((player, index) => {
    player.send(
      JSON.stringify({
        type: "gameStart",
        player: index === 0 ? "A" : "B",
        gameState: game.getGameState(),
      })
    );
  });
}

function handleMove(ws, move) {
  const game = [...games.values()].find((g) => g.players.includes(ws));
  if (!game) return;

  const player = game.players.indexOf(ws) === 0 ? "A" : "B";
  const [piece, to] = move.split(":");
  const [toRow, toCol] = to.split(",").map(Number);

  const result = game.makeMove(player, `${player}-${piece}`, toRow, toCol);

  if (result.success) {
    const gameState = game.getGameState();
    const winner = game.isGameOver();

    game.players.forEach((p) => {
      p.send(
        JSON.stringify({
          type: "gameState",
          gameState,
          winner,
        })
      );
    });

    if (winner) {
      games.delete(game.id);
    }
  } else {
    ws.send(
      JSON.stringify({
        type: "invalidMove",
        message: result.message,
      })
    );
  }
}

console.log("WebSocket server is running on port 3001");
