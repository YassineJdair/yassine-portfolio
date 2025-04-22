import React, { useEffect, useRef, useState } from 'react';

const canvasWidth = 300;
const canvasHeight = 500;
const playerWidth = 40;
const playerHeight = 60;
const centerLaneX = canvasWidth / 2 - playerWidth / 2;

const CarGame: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [playerX, setPlayerX] = useState(centerLaneX);
  const [carY, setCarY] = useState(-playerHeight);
  const [isGameOver, setIsGameOver] = useState(false);

  const playerY = canvasHeight - playerHeight - 10;
  const carSpeed = 4;

  // Keyboard movement
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        setPlayerX((prev) => Math.max(0, prev - canvasWidth / 3));
      } else if (e.key === 'ArrowRight') {
        setPlayerX((prev) => Math.min(canvasWidth - playerWidth, prev + canvasWidth / 3));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Game loop
  useEffect(() => {
    const context = canvasRef.current?.getContext('2d');
    let animationFrameId: number;

    const draw = () => {
      if (!context || isGameOver) return;

      context.clearRect(0, 0, canvasWidth, canvasHeight);

      // Player car
      context.fillStyle = '#00f';
      context.fillRect(playerX, playerY, playerWidth, playerHeight);

      // Enemy car
      context.fillStyle = '#f00';
      context.fillRect(centerLaneX, carY, playerWidth, playerHeight);

      // Collision detection
      if (
        carY + playerHeight > playerY &&
        carY < playerY + playerHeight &&
        centerLaneX < playerX + playerWidth &&
        centerLaneX + playerWidth > playerX
      ) {
        setIsGameOver(true);
      }

      // Move enemy car
      setCarY((prev) => (prev > canvasHeight ? -playerHeight : prev + carSpeed));

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(animationFrameId);
  }, [playerX, carY, isGameOver]);

  return (
    <div>
      {/* Navigation Menu */}
      <nav style={{ backgroundColor: '#333', color: '#fff', padding: '10px', textAlign: 'center' }}>
        <span style={{ margin: '0 15px' }}>🏠 Home</span>
        <span style={{ margin: '0 15px' }}>🕹 Game</span>
        <span style={{ margin: '0 15px' }}>📊 Scores</span>
      </nav>

      <div style={{ textAlign: 'center', marginTop: '20px' }}>
        {isGameOver && <h2 style={{ color: 'red' }}>Game Over</h2>}
        <canvas
          ref={canvasRef}
          width={canvasWidth}
          height={canvasHeight}
          style={{ border: '2px solid #000', marginTop: '10px' }}
        />
        <p>Use ← and → arrows to move</p>
      </div>
    </div>
  );
};

export default CarGame;
