import React, { useEffect, useRef, useState } from "react";
import Layout from "./Layout";

const TILE_SIZE = 40;
const PLAYER_COLOR = "#facc15";
const OBSTACLE_COLOR = "#dc2626";
const ROAD_COLOR = "#1f2937";
const LANE_COUNT = 10;
const OBSTACLE_SPEED = 1.5;

const CrossyRoad = () => {
  const canvasRef = useRef(null);
  const [player, setPlayer] = useState({ x: 5, y: LANE_COUNT - 1 });
  const [obstacles, setObstacles] = useState(generateObstacles());
  const [gameFinished, setGameFinished] = useState(false);

  function generateObstacles() {
    const obs = [];
    for (let y = 0; y < LANE_COUNT; y++) {
      const count = Math.floor(Math.random() * 3);
      for (let i = 0; i < count; i++) {
        obs.push({
          x: Math.random() * 10,
          y,
          direction: Math.random() > 0.5 ? 1 : -1,
        });
      }
    }
    return obs;
  }

  function draw(ctx) {
    ctx.fillStyle = "#0f172a";
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    for (let y = 0; y < LANE_COUNT; y++) {
      ctx.fillStyle = ROAD_COLOR;
      ctx.fillRect(0, y * TILE_SIZE, ctx.canvas.width, TILE_SIZE);
    }

    ctx.fillStyle = PLAYER_COLOR;
    ctx.fillRect(
      player.x * TILE_SIZE,
      player.y * TILE_SIZE,
      TILE_SIZE,
      TILE_SIZE
    );

    ctx.fillStyle = OBSTACLE_COLOR;
    for (const obs of obstacles) {
      ctx.fillRect(
        obs.x * TILE_SIZE,
        obs.y * TILE_SIZE + 5,
        TILE_SIZE * 0.8,
        TILE_SIZE - 10
      );
    }
  }

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    canvas.width = TILE_SIZE * 10;
    canvas.height = TILE_SIZE * LANE_COUNT;

    let animationFrameId;

    const update = () => {
      setObstacles((prev) =>
        prev
          .map((obs) => ({
            ...obs,
            x: obs.x + obs.direction * OBSTACLE_SPEED * 0.02,
          }))
          .map((obs) => {
            if (obs.x < -1 || obs.x > 11) {
              return { ...obs, x: obs.direction > 0 ? -1 : 11 };
            }
            return obs;
          })
      );

      for (const obs of obstacles) {
        if (Math.floor(obs.x) === player.x && obs.y === player.y) {
          setPlayer({ x: 5, y: LANE_COUNT - 1 });
        }
      }

      if (player.y === 0) {
        setGameFinished(true);
      }

      draw(ctx);
      animationFrameId = requestAnimationFrame(update);
    };

    animationFrameId = requestAnimationFrame(update);
    return () => cancelAnimationFrame(animationFrameId);
  }, [player, obstacles]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      setPlayer((prev) => {
        if (e.key === "ArrowUp") return { ...prev, y: Math.max(prev.y - 1, 0) };
        if (e.key === "ArrowDown")
          return { ...prev, y: Math.min(prev.y + 1, LANE_COUNT - 1) };
        if (e.key === "ArrowLeft")
          return { ...prev, x: Math.max(prev.x - 1, 0) };
        if (e.key === "ArrowRight")
          return { ...prev, x: Math.min(prev.x + 1, 9) };
        return prev;
      });
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <Layout>
      <div className="flex justify-center items-center min-h-[80vh]">
        <div className="relative">
          <canvas
            ref={canvasRef}
            className="rounded-xl shadow-lg border border-gray-700"
          />
          {gameFinished && (
            <div className="absolute inset-0 bg-black bg-opacity-80 flex flex-col items-center justify-center rounded-xl">
              <h1 className="text-4xl text-white font-bold mb-4">
                🎉 Game Finished!
              </h1>
              <button
                className="bg-white text-black px-6 py-2 rounded-lg font-semibold hover:bg-gray-200 transition"
                onClick={() => {
                  setPlayer({ x: 5, y: LANE_COUNT - 1 });
                  setObstacles(generateObstacles());
                  setGameFinished(false);
                }}
              >
                Play Again
              </button>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default CrossyRoad;
