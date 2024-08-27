import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const GameSetup = () => {
  const [playerBCode, setPlayerBCode] = useState("");
  const navigate = useNavigate();

  const handleStartGame = () => {
    // Here you would typically send a request to set up the game
    // For now, we'll just navigate to the game page
    navigate("/game");
  };

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center text-white p-4">
      <h2 className="text-3xl font-bold mb-8">Game Setup</h2>
      <div className="bg-gray-800 p-6 rounded-lg shadow-lg max-w-md w-full">
        <input
          type="text"
          placeholder="Enter Player B Code"
          value={playerBCode}
          onChange={(e) => setPlayerBCode(e.target.value)}
          className="w-full p-2 mb-4 bg-gray-700 rounded text-white"
        />
        <button
          onClick={handleStartGame}
          className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded transition duration-300"
        >
          Start Game
        </button>
      </div>
      <div className="mt-8 bg-gray-800 p-6 rounded-lg shadow-lg max-w-md w-full">
        <h3 className="text-xl font-bold mb-4">Game Rules</h3>
        <ul className="list-disc list-inside space-y-2">
          <li>The game is played on a 5x5 grid.</li>
          <li>
            Each player controls 5 pieces: 3 Pawns (P), 1 Hero1 (H1), and 1
            Hero2 (H2).
          </li>
          <li>Pawns move one space in any direction.</li>
          <li>Hero1 moves two spaces straight in any direction.</li>
          <li>Hero2 moves two spaces diagonally in any direction.</li>
          <li>Capture opponent's pieces by landing on their space.</li>
          <li>The game ends when all of one player's pieces are captured.</li>
        </ul>
      </div>
    </div>
  );
};

export default GameSetup;
