import React, { useState, useEffect, useCallback } from 'react';
import { Trophy, Undo2 } from 'lucide-react';

interface Block {
  width: number;
  left: number;
  bottom: number;
  color: string;
  id: number;
}

const INITIAL_WIDTH = 200;
const BASE_SPEED = 4;  // Increased speed for smoother movement
const SPEED_INCREMENT = 0.5;  // Blocks get slightly faster over time
const BLOCK_HEIGHT = 40;
const COLORS = [
  '#FF0000', // Bright Red  
  '#00FF00', // Neon Green  
  '#0000FF', // Electric Blue  
  '#FFFF00', // Bright Yellow  
  '#FF00FF', // Vivid Magenta  
  '#00FFFF', // Cyan  
  '#FF4500', // Neon Orange  
  '#8A2BE2', // Vivid Purple  
];


function App() {
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [currentBlock, setCurrentBlock] = useState<Block | null>(null);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [direction, setDirection] = useState(1);
  const [speed, setSpeed] = useState(BASE_SPEED);
  const [highScore, setHighScore] = useState(() => {
    const saved = localStorage.getItem('stackGameHighScore');
    return saved ? parseInt(saved) : 0;
  });

  const initializeGame = useCallback(() => {
    const baseBlock: Block = {
      width: INITIAL_WIDTH,
      left: window.innerWidth / 2 - INITIAL_WIDTH / 2,
      bottom: 0,
      color: COLORS[0],
      id: 0,
    };

    setBlocks([baseBlock]);
    setCurrentBlock({
      width: INITIAL_WIDTH,
      left: 0,
      bottom: BLOCK_HEIGHT,
      color: COLORS[1],
      id: 1,
    });

    setGameOver(false);
    setScore(0);
    setDirection(1);
    setSpeed(BASE_SPEED);
  }, []);

  useEffect(() => {
    initializeGame();
  }, [initializeGame]);

  useEffect(() => {
    if (gameOver || !currentBlock) return;

    const moveBlock = () => {
      setCurrentBlock((prev) => {
        if (!prev) return null;

        let newLeft = prev.left + speed * direction;
        if (newLeft + prev.width > window.innerWidth) {
          setDirection(-1);
          newLeft = window.innerWidth - prev.width;
        } else if (newLeft < 0) {
          setDirection(1);
          newLeft = 0;
        }

        return { ...prev, left: newLeft };
      });
    };

    const animationId = requestAnimationFrame(moveBlock);
    return () => cancelAnimationFrame(animationId);
  }, [currentBlock, direction, speed, gameOver]);

  // Spacebar key event listener
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.code === " ") {
        handleClick();
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => {
      window.removeEventListener("keydown", handleKeyPress);
    };
  }, []);

  const handleClick = () => {
    if (gameOver) {
      initializeGame();
      return;
    }

    if (!currentBlock) return;

    const previousBlock = blocks[blocks.length - 1];
    const overlapStart = Math.max(currentBlock.left, previousBlock.left);
    const overlapEnd = Math.min(
      currentBlock.left + currentBlock.width,
      previousBlock.left + previousBlock.width
    );
    const overlapWidth = Math.max(0, overlapEnd - overlapStart);

    if (overlapWidth === 0) {
      setGameOver(true);
      if (score > highScore) {
        setHighScore(score);
        localStorage.setItem('stackGameHighScore', score.toString());
      }
      return;
    }

    const newBlock: Block = {
      width: overlapWidth,
      left: overlapStart,
      bottom: currentBlock.bottom,
      color: currentBlock.color,
      id: currentBlock.id,
    };

    setBlocks((prev) => [...prev, newBlock]);
    setScore((prev) => prev + 1);
    setSpeed((prev) => prev + SPEED_INCREMENT); // Increase speed for next block

    const nextBlock: Block = {
      width: overlapWidth,
      left: 0,
      bottom: currentBlock.bottom + BLOCK_HEIGHT,
      color: COLORS[(currentBlock.id + 1) % COLORS.length],
      id: currentBlock.id + 1,
    };

    setCurrentBlock(nextBlock);
  };

  return (
    <div 
      className="min-h-screen w-full relative overflow-hidden cursor-pointer bg-gradient-to-t from-blue-300 via-blue-400 to-blue-600"
      onClick={handleClick}
    >
      {/* Score Display */}
      <div className="absolute top-8 left-1/2 -translate-x-1/2 text-center z-10">
        <div className="bg-white/90 backdrop-blur-sm rounded-xl p-4 shadow-lg">
          <div className="flex items-center gap-2 text-2xl font-bold text-blue-600">
            <Trophy size={24} />
            <span>{score}</span>
          </div>
          <div className="text-sm text-blue-500 mt-1">High Score: {highScore}</div>
        </div>
      </div>

      {/* Game Over Screen */}
      {gameOver && (
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-20">
          <div className="bg-white rounded-xl p-8 text-center shadow-2xl">
            <h2 className="text-3xl font-bold text-blue-600 mb-4">Game Over!</h2>
            <p className="text-gray-600 mb-6">Final Score: {score}</p>
            <button
              onClick={initializeGame}
              className="flex items-center gap-2 mx-auto bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg transition-colors"
            >
              <Undo2 size={20} />
              Play Again
            </button>
          </div>
        </div>
      )}

      {/* Game Blocks */}
      <div className="absolute inset-0 flex items-end">
        {blocks.map((block) => (
          <div
            key={block.id}
            className="absolute transition-transform duration-100 ease-out"
            style={{
              width: block.width,
              height: BLOCK_HEIGHT,
              left: block.left,
              bottom: block.bottom,
              background: block.color,
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            }}
          />
        ))}
        {currentBlock && (
          <div
            className="absolute animate-bounce"
            style={{
              width: currentBlock.width,
              height: BLOCK_HEIGHT,
              left: currentBlock.left,
              bottom: currentBlock.bottom,
              background: currentBlock.color,
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            }}
          />
        )}
      </div>

      {/* Instructions */}
      {!gameOver && blocks.length === 1 && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white text-center">
          <p className="text-2xl font-bold mb-2">Welcome, Tap to Stack!</p>
          <p className="text-lg opacity-80">Align the blocks as perfectly as you can</p>
        </div>
      )}
    </div>
  );
}

export default App;
