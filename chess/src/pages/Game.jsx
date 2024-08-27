import React, { useState, useEffect } from "react";
import useWebSocket from "react-use-websocket";
import { Dialog, Transition } from "@headlessui/react";
import { Fragment } from "react";

const WEBSOCKET_URL = "ws://localhost:3001"; // Update this with your server URL

const Game = () => {
//   const [gameState, setGameState] = useState(
//     Array(5)
//       .fill()
//       .map(() => Array(5).fill(null))
//   );
  //const [selectedPiece, setSelectedPiece] = useState(null);
  const [validMoves, setValidMoves] = useState([]);
  const [playerTurn, setPlayerTurn] = useState("A");
  const [moveHistory, setMoveHistory] = useState([]);
  const [gameOver, setGameOver] = useState(false);
  const [winner, setWinner] = useState(null);

 const [gameState, setGameState] = useState(null);
 const [player, setPlayer] = useState(null);
 const [selectedPiece, setSelectedPiece] = useState(null);

 const { sendMessage, lastMessage } = useWebSocket(WEBSOCKET_URL, {
   onOpen: () => {
     console.log("WebSocket connection established.");
     sendMessage(JSON.stringify({ type: "join" }));
   },
 });
  useEffect(() => {
    if (lastMessage !== null) {
      const data = JSON.parse(lastMessage.data);
      handleServerMessage(data);
    }
  }, [lastMessage]);

 const handleServerMessage = (data) => {
   switch (data.type) {
     case "joined":
       setPlayer(data.player);
       break;
     case "gameStart":
     case "gameState":
       setGameState(data.gameState);
       break;
     case "invalidMove":
       alert(data.message);
       break;
     case "opponentLeft":
       alert("Your opponent has left the game.");
       break;
   }
 };
 const handleCellClick = (row, col) => {
   if (!gameState || gameState.currentPlayer !== player) return;

   const piece = gameState.board[row][col];
   if (piece && piece.startsWith(player)) {
     setSelectedPiece({ piece, row, col });
   } else if (selectedPiece) {
     sendMove(selectedPiece.piece, row, col);
     setSelectedPiece(null);
   }
 };

 const sendMove = (piece, toRow, toCol) => {
   const moveCommand = `${piece.split("-")[1]}:${toRow},${toCol}`;
   sendMessage(JSON.stringify({ type: "move", move: moveCommand }));
 };

  const getValidMoves = (row, col, piece) => {
    // This is a simplified version. You'll need to implement the actual logic based on piece type and game rules.
    const moves = [];
    const directions = piece.includes("H2")
      ? ["FL", "FR", "BL", "BR"]
      : ["L", "R", "F", "B"];
    directions.forEach((dir) => {
      moves.push({ row: row, col: col, command: dir });
    });
    return moves;
  };

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center text-white p-4">
      <h2 className="text-3xl font-bold mb-8">Chess-like Game</h2>
      <div className="mb-4">Current Player: {playerTurn}</div>
      <div className="grid grid-cols-5 gap-1 mb-8">
        {gameState.map((row, rowIndex) =>
          row.map((cell, colIndex) => (
            <div
              key={`${rowIndex}-${colIndex}`}
              className={`w-16 h-16 flex items-center justify-center cursor-pointer border border-gray-700
                ${cell ? "bg-gray-800" : "bg-gray-700"}
                ${
                  selectedPiece &&
                  selectedPiece.row === rowIndex &&
                  selectedPiece.col === colIndex
                    ? "bg-blue-600"
                    : ""
                }
                ${
                  validMoves.some(
                    (m) => m.row === rowIndex && m.col === colIndex
                  )
                    ? "bg-green-600"
                    : ""
                }`}
              onClick={() => handleCellClick(rowIndex, colIndex)}
            >
              {cell}
            </div>
          ))
        )}
      </div>
      <div className="mb-8">
        <h3 className="text-xl font-bold mb-2">Valid Moves</h3>
        <div className="flex space-x-2">
          {validMoves.map((move, index) => (
            <button
              key={index}
              onClick={() => sendMove(selectedPiece, move)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              {move.command}
            </button>
          ))}
        </div>
      </div>
      <div>
        <h3 className="text-xl font-bold mb-2">Move History</h3>
        <ul className="list-disc list-inside">
          {moveHistory.map((move, index) => (
            <li key={index}>{move}</li>
          ))}
        </ul>
      </div>

      <Transition show={gameOver} as={Fragment}>
        <Dialog
          as="div"
          className="fixed inset-0 z-10 overflow-y-auto"
          onClose={() => {}}
        >
          <div className="min-h-screen px-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <Dialog.Overlay className="fixed inset-0 bg-black opacity-30" />
            </Transition.Child>

            <span
              className="inline-block h-screen align-middle"
              aria-hidden="true"
            >
              &#8203;
            </span>

            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <div className="inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-gray-800 shadow-xl rounded-2xl">
                <Dialog.Title
                  as="h3"
                  className="text-2xl font-medium leading-6 text-white mb-4"
                >
                  Game Over
                </Dialog.Title>
                <div className="mt-2">
                  <p className="text-xl text-gray-300">
                    {winner === playerTurn ? "You won!" : "You lost!"}
                  </p>
                </div>
                <div className="mt-4">
                  <button
                    type="button"
                    className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500"
                    onClick={() => window.location.reload()}
                  >
                    Play Again
                  </button>
                </div>
              </div>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
};

export default Game;
