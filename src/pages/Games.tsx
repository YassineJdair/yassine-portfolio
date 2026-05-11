import React from "react";
import { Link } from "react-router-dom";
import Layout from "@/components/Layout";

const games = [
    {
        to: "/crossyroad",
        label: "🐥 Play Crossy Road",
        bg: "bg-yellow-500 hover:bg-yellow-400",
        text: "text-black",
        desc: "Cross the road without getting squashed!",
    },
    {
        to: "/pacmangame",
        label: "👻 Play Pacman",
        bg: "bg-blue-500 hover:bg-blue-400",
        text: "text-black",
        desc: "Eat the dots, dodge the ghosts.",
    },
    {
        to: "/snake",
        label: "🐍 Play Snake",
        bg: "bg-green-600 hover:bg-green-500",
        text: "text-white",
        desc: "Classic Nokia Snake — with enemies & levels.",
    },
    {
        to: "/carroadgame",
        label: "🚗 Play Car Road Game",
        bg: "bg-orange-500 hover:bg-orange-400",
        text: "text-black",
        desc: "Dodge traffic and survive as long as you can.",
    },
];

const GamesMenu = () => {
    return (
        <Layout>
            <div className="flex flex-col items-center justify-center min-h-screen gap-8 px-6 py-12">
                <div className="text-center">
                    <h1 className="text-5xl font-extrabold text-white drop-shadow-md mb-2">
                        🎮 Games
                    </h1>
                    <p className="text-muted-foreground">{games.length} games — all built from scratch</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 w-full max-w-2xl">
                    {games.map(game => (
                        <Link
                            key={game.to}
                            to={game.to}
                            className={`${game.bg} ${game.text} px-8 py-5 rounded-2xl shadow-2xl transition-all duration-200 hover:scale-105 active:scale-95 flex flex-col gap-1`}
                        >
                            <span className="text-xl font-bold">{game.label}</span>
                            <span className="text-sm opacity-75">{game.desc}</span>
                        </Link>
                    ))}
                </div>
            </div>
        </Layout>
    );
};

export default GamesMenu;