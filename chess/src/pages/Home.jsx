import React from "react";
import { Link } from "react-router-dom";

const Home = () => {
  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center text-white">
      <h1 className="text-5xl font-bold mb-8">Chess-like Game</h1>
      <p className="text-xl mb-8 max-w-md text-center">
        Welcome to our unique chess-like game! Challenge your strategic thinking
        in this exciting 5x5 grid battle.
      </p>
      <Link
        to="/game-setup"
        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition duration-300"
      >
        Start Game
      </Link>
    </div>
  );
};

export default Home;
