import React from "react";
import { Link } from "react-router-dom";
import Layout from "@/components/Layout";

const GamesMenu = () => {
  return (
    <Layout>
      <div className="flex flex-col items-center justify-center min-h-screen gap-10 px-6">
        <h1 className="text-5xl font-extrabold text-white drop-shadow-md">
          🎮 Games
        </h1>
        <div className="flex flex-col gap-6 w-full max-w-md">
          <Link
            to="/CrossyRoad"
            className="bg-yellow-500 hover:bg-yellow-400 text-black px-8 py-5 rounded-2xl text-xl font-bold text-center shadow-2xl transition-all duration-200"
          >
            🐥 Play Crossy Road
          </Link>
          <Link
            to="/pacmangame"
            className="bg-blue-500 hover:bg-blue-400 text-black px-8 py-5 rounded-2xl text-xl font-bold text-center shadow-2xl transition-all duration-200"
          >
            👻 Play Pacman
          </Link>
        </div>
      </div>
    </Layout>
  );
};

export default GamesMenu;
