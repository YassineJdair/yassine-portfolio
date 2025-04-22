import React, { useEffect, useRef, useState } from "react";
import Layout from "./Layout";

const TILE_SIZE = 32;
const MAZE_WIDTH = 19;
const MAZE_HEIGHT = 21;

const WALL = 1;
const EMPTY = 0;
const PELLET = 2;

const PLAYER_COLOR = "#facc15";
const ENEMY_COLOR = "#ef4444";
const WALL_COLOR = "#1e293b";
const PELLET_COLOR = "#f9fafb";

const initialMaze = [
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  [1,2,2,2,2,2,2,1,2,2,2,1,2,2,2,2,2,2,1],
  [1,2,1,1,1,1,2,1,2,1,2,1,2,1,1,1,1,2,1],
  [1,2,2,2,2,2,2,2,2,1,2,2,2,2,2,2,2,2,1],
  [1,2,1,1,1,2,1,1,2,1,2,1,1,2,1,1,1,2,1],
  [1,2,2,2,1,2,2,2,2,2,2,2,2,2,1,2,2,2,1],
  [1,1,1,2,1,2,1,1,1,0,1,1,1,2,1,2,1,1,1],
  [0,0,1,2,2,2,1,0,0,0,0,0,1,2,2,2,1,0,0],
  [1,1,1,2,1,2,1,0,1,1,1,0,1,2,1,2,1,1,1],
  [0,0,0,2,1,2,0,0,1,0,1,0,0,2,1,2,0,0,0],
  [1,1,1,2,1,2,1,1,1,1,1,1,1,2,1,2,1,1,1],
  [0,0,1,2,2,2,1,0,0,0,0,0,1,2,2,2,1,0,0],
  [1,1,1,2,1,2,1,0,1,1,1,0,1,2,1,2,1,1,1],
  [1,2,2,2,1,2,2,2,2,2,2,2,2,2,1,2,2,2,1],
  [1,2,1,1,1,2,1,1,2,1,2,1,1,2,1,1,1,2,1],
  [1,2,2,2,2,2,2,1,2,2,2,1,2,2,2,2,2,2,1],
  [1,2,1,1,1,1,2,1,2,1,2,1,2,1,1,1,1,2,1],
  [1,2,2,2,2,2,2,2,2,1,2,2,2,2,2,2,2,2,1],
  [1,2,1,1,1,1,1,1,2,1,2,1,1,1,1,1,1,2,1],
  [1,2,2,2,2,2,2,2,2,1,2,2,2,2,2,2,2,2,1],
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
];

const PacmanGame = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [player, setPlayer] = useState({ x: 9, y: 15 });
  const [enemies, setEnemies] = useState([
    { x: 9, y: 8 },
    { x: 1, y: 1 },
    { x: 17, y: 1 },
  ]);
  const [maze, setMaze] = useState(initialMaze.map(row => [...row]));
  const [score, setScore] = useState(0);

  const draw = () => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let y = 0; y < MAZE_HEIGHT; y++) {
      for (let x = 0; x < MAZE_WIDTH; x++) {
        const tile = maze[y][x];
        ctx.fillStyle = tile === WALL ? WALL_COLOR : "black";
        ctx.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);

        if (tile === PELLET) {
          ctx.fillStyle = PELLET_COLOR;
          ctx.beginPath();
          ctx.arc(
            x * TILE_SIZE + TILE_SIZE / 2,
            y * TILE_SIZE + TILE_SIZE / 2,
            4,
            0,
            Math.PI * 2
          );
          ctx.fill();
        }
      }
    }

    // Draw player
    ctx.fillStyle = PLAYER_COLOR;
    ctx.beginPath();
    ctx.arc(
      player.x * TILE_SIZE + TILE_SIZE / 2,
      player.y * TILE_SIZE + TILE_SIZE / 2,
      TILE_SIZE / 2 - 2,
      0,
      Math.PI * 2
    );
    ctx.fill();

    // Draw enemies
    ctx.fillStyle = ENEMY_COLOR;
    enemies.forEach(enemy => {
      ctx.beginPath();
      ctx.arc(
        enemy.x * TILE_SIZE + TILE_SIZE / 2,
        enemy.y * TILE_SIZE + TILE_SIZE / 2,
        TILE_SIZE / 2 - 2,
        0,
        Math.PI * 2
      );
      ctx.fill();
    });

    // Draw score
    ctx.fillStyle = "white";
    ctx.font = "20px sans-serif";
    ctx.fillText(`Score: ${score}`, 10, 25);
  };

  useEffect(() => {
    const canvas = canvasRef.current!;
    canvas.width = MAZE_WIDTH * TILE_SIZE;
    canvas.height = MAZE_HEIGHT * TILE_SIZE;
    draw();
  }, [player, enemies, maze, score]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
        e.preventDefault();
      }

      const dir = { x: 0, y: 0 };
      if (e.key === "ArrowUp") dir.y = -1;
      if (e.key === "ArrowDown") dir.y = 1;
      if (e.key === "ArrowLeft") dir.x = -1;
      if (e.key === "ArrowRight") dir.x = 1;

      const newX = player.x + dir.x;
      const newY = player.y + dir.y;

      if (
        newX >= 0 &&
        newX < MAZE_WIDTH &&
        newY >= 0 &&
        newY < MAZE_HEIGHT &&
        maze[newY][newX] !== WALL
      ) {
        setPlayer({ x: newX, y: newY });

        if (maze[newY][newX] === PELLET) {
          const newMaze = maze.map(row => [...row]);
          newMaze[newY][newX] = EMPTY;
          setMaze(newMaze);
          setScore(score + 10);
        }
      }
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [player, maze]);

  useEffect(() => {
    const interval = setInterval(() => {
      setEnemies(prev =>
        prev.map(enemy => {
          const moves = [
            { x: 0, y: -1 },
            { x: 0, y: 1 },
            { x: -1, y: 0 },
            { x: 1, y: 0 },
          ].filter(dir => {
            const nx = enemy.x + dir.x;
            const ny = enemy.y + dir.y;
            return (
              nx >= 0 &&
              nx < MAZE_WIDTH &&
              ny >= 0 &&
              ny < MAZE_HEIGHT &&
              maze[ny][nx] !== WALL
            );
          });

          const move = moves[Math.floor(Math.random() * moves.length)];
          return { x: enemy.x + move.x, y: enemy.y + move.y };
        })
      );
    }, 300);

    return () => clearInterval(interval);
  }, [maze]);

  useEffect(() => {
    for (let enemy of enemies) {
      if (enemy.x === player.x && enemy.y === player.y) {
        alert(`💀 Game Over! Final Score: ${score}`);
        window.location.reload();
      }
    }
  }, [enemies, player]);

  return (
    <Layout>
      <div className="flex justify-center items-center min-h-screen bg-black">
        <canvas
          ref={canvasRef}
          className="rounded-xl border border-gray-800 shadow-lg"
        />
      </div>
    </Layout>
  );
};

export default PacmanGame;
