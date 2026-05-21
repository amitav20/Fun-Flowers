import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { soundManager } from '../../utils/sound';
import { ArrowLeft, Star, Volume2, Trophy } from 'lucide-react';

interface Balloon {
  id: number;
  x: number; // percentage width 10-90
  y: number; // starts below screen (110)
  size: number; // pixel size
  color: string;
  emoji: string;
  speed: number;
  letter: string;
}

const BALLOON_COLORS = [
  'from-pink-400 to-pink-500 shadow-pink-300',
  'from-purple-400 to-purple-500 shadow-purple-300',
  'from-sky-400 to-sky-500 shadow-sky-300',
  'from-amber-400 to-amber-500 shadow-amber-300',
  'from-emerald-400 to-emerald-500 shadow-emerald-300',
  'from-rose-400 to-rose-500 shadow-rose-300',
];

const EMOJIS = ['🐶', '🐱', '🦁', '🐵', '🐼', '🐨', '🦖', '🦄', '🍎', '🍉', '🍕', '🍰', '🚗', '🚀', '⭐', '🎈'];
const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ123456789';

interface GameProps {
  onBack: () => void;
  onGameComplete: (starsEarned: number) => void;
}

export default function BalloonPop({ onBack, onGameComplete }: GameProps) {
  const [speedLevel, setSpeedLevel] = useState<'easy' | 'medium' | 'hard'>('easy');
  const [balloons, setBalloons] = useState<Balloon[]>([]);
  const [poppedCount, setPoppedCount] = useState(0);
  const [stars, setStars] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isWon, setIsWon] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const idRef = useRef(0);
  
  const targetCount = speedLevel === 'easy' ? 8 : speedLevel === 'medium' ? 12 : 16;

  // Initialize and spawn loops
  useEffect(() => {
    if (!isPlaying || isWon) return;

    // Spawn 1 balloon immediately, then spawn more periodically
    spawnBalloon();
    const interval = setInterval(() => {
      spawnBalloon();
    }, 1300);

    return () => clearInterval(interval);
  }, [isPlaying, isWon]);

  // Animation frame loop to drift balloons upward
  useEffect(() => {
    if (!isPlaying || isWon) return;

    let animFrame: number;
    
    const updatePhysics = () => {
      setBalloons((prev) => {
        // Filter out balloons that have drifted too high (above y: -20)
        return prev
          .map((b) => ({
            ...b,
            y: b.y - b.speed,
          }))
          .filter((b) => b.y > -20);
      });
      animFrame = requestAnimationFrame(updatePhysics);
    };

    animFrame = requestAnimationFrame(updatePhysics);
    return () => cancelAnimationFrame(animFrame);
  }, [isPlaying, isWon]);

  const spawnBalloon = () => {
    idRef.current += 1;
    const size = Math.floor(Math.random() * 25) + 65; // size between 65px and 90px
    const balloonColor = BALLOON_COLORS[Math.floor(Math.random() * BALLOON_COLORS.length)];
    const balloonEmoji = EMOJIS[Math.floor(Math.random() * EMOJIS.length)];
    const balloonLetter = LETTERS[Math.floor(Math.random() * LETTERS.length)];
    
    // speed based on selected level
    let speed = Math.random() * 0.2 + 0.18; // easy
    if (speedLevel === 'medium') {
      speed = Math.random() * 0.35 + 0.38;
    } else if (speedLevel === 'hard') {
      speed = Math.random() * 0.5 + 0.75;
    }

    const newBalloon: Balloon = {
      id: idRef.current,
      x: Math.floor(Math.random() * 80) + 10, // keep 10% safety margin left/right
      y: 110, // below container height
      size,
      color: balloonColor,
      emoji: Math.random() > 0.4 ? balloonEmoji : balloonLetter,
      speed,
      letter: balloonLetter
    };

    setBalloons((prev) => [...prev, newBalloon]);
  };

  const handlePop = (id: number) => {
    if (isWon) return;
    soundManager.playPop();
    
    setBalloons((prev) => prev.filter((b) => b.id !== id));
    
    const nextPopped = poppedCount + 1;
    setPoppedCount(nextPopped);

    // Every 4 balloons, child gets a star reward sound!
    if (nextPopped % 4 === 0) {
      setStars((prev) => prev + 1);
      soundManager.playSparkle();
    }

    if (nextPopped >= targetCount) {
      handleWin();
    }
  };

  const handleWin = () => {
    setIsWon(true);
    setIsPlaying(false);
    soundManager.playSuccess();
  };

  const resetGame = () => {
    setBalloons([]);
    setPoppedCount(0);
    setStars(0);
    setIsWon(false);
    setIsPlaying(true);
  };

  const handleFinish = () => {
    onGameComplete(3); // Award 3 permanent profile stars!
  };

  return (
    <div id="balloon-pop-game" className="flex flex-col h-full bg-gradient-to-b from-sky-100 via-sky-50 to-emerald-50 select-none overflow-hidden relative">
      {/* Game Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between p-4 bg-white/70 backdrop-blur-md border-b border-sky-100 z-10 gap-3">
        <div className="flex items-center gap-3 w-full sm:w-auto justify-between">
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-3 py-2 text-sky-700 bg-sky-100 hover:bg-sky-200 rounded-2xl font-semibold transition-all shadow-sm cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </button>

          <div className="flex items-center gap-2 bg-amber-50 px-4 py-1.5 rounded-full border border-amber-200 shadow-sm">
            <Star className="w-5 h-5 text-amber-500 fill-amber-400 animate-spin-slow" />
            <span className="font-bold text-amber-800 text-lg">Stars: {stars}</span>
          </div>
        </div>

        {/* Level Selector Tabs */}
        <div className="flex bg-sky-150/55 p-1 rounded-2xl border border-sky-100/50">
          {(['easy', 'medium', 'hard'] as const).map((lvl) => (
            <button
              key={lvl}
              onClick={() => {
                soundManager.playBubble();
                setSpeedLevel(lvl);
                setBalloons([]);
                setPoppedCount(0);
              }}
              className={`px-3 py-1 text-xs font-black rounded-xl transition-all capitalize cursor-pointer ${
                speedLevel === lvl
                  ? 'bg-sky-600 text-white shadow-sm'
                  : 'text-sky-700 hover:bg-sky-100/60'
              }`}
            >
              {lvl === 'easy' ? '🍃 Easy' : lvl === 'medium' ? '🎈 Medium' : '⚡ Hard'}
            </button>
          ))}
        </div>

        <div className="font-bold text-sky-800 text-sm md:text-base bg-sky-200/50 px-3 py-1.5 rounded-2xl">
          Popped: {poppedCount}/{targetCount} 🎈
        </div>
      </div>

      {/* Primary Floating Stage */}
      <div 
        ref={containerRef} 
        className="flex-1 w-full relative overflow-hidden cursor-pointer"
        style={{ touchAction: 'none' }}
      >
        {!isWon && (
          <div className="absolute top-4 left-0 right-0 text-center pointer-events-none z-10 px-4">
            <h1 className="text-2xl font-extrabold text-sky-900 tracking-tight drop-shadow-sm">
              🎈 Tap to Pop the Balloons!
            </h1>
            <p className="text-sky-600 font-medium text-sm mt-1">
              Find Letters, Numbers, and Friendly Animals!
            </p>
          </div>
        )}

        <AnimatePresence>
          {balloons.map((balloon) => (
            <motion.div
              key={balloon.id}
              onClick={() => handlePop(balloon.id)}
              className={`absolute rounded-full bg-gradient-to-tr ${balloon.color} shadow-lg flex items-center justify-center cursor-pointer`}
              style={{
                width: balloon.size,
                height: balloon.size * 1.15, // Balloon shape is slightly taller than wide
                left: `${balloon.x}%`,
                top: `${balloon.y}%`,
                transform: 'translate(-50%, -50%)',
              }}
              whileTap={{ scale: 0.8 }}
              initial={{ scale: 0.1 }}
              animate={{ scale: 1 }}
              exit={{
                scale: 2,
                opacity: 0,
                transition: { duration: 0.15 }
              }}
            >
              <div className="text-3xl font-bold select-none text-white drop-shadow-sm filter">
                {balloon.emoji}
              </div>
              
              {/* Balloon String knot at bottom */}
              <div 
                className="absolute bg-inherit"
                style={{
                  width: 8,
                  height: 8,
                  bottom: -4,
                  left: 'calc(50% - 4px)',
                  clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)',
                }}
              />
              {/* Hanging string */}
              <div 
                className="absolute w-0.5 bg-sky-300 opacity-60"
                style={{
                  height: 35,
                  bottom: -38,
                  left: 'calc(50% - 0.25px)',
                }}
              />
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Level Complete Modal */}
        <AnimatePresence>
          {isWon && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/40 backdrop-blur-md flex items-center justify-center p-4 z-30"
            >
              <motion.div 
                initial={{ scale: 0.8, y: 50 }}
                animate={{ scale: 1, y: 0 }}
                className="bg-white rounded-3xl p-6 md:p-8 max-w-sm w-full text-center border-4 border-emerald-400 shadow-2xl relative"
              >
                {/* Achievement Badge visual */}
                <div className="absolute -top-14 left-1/2 -translate-x-1/2 bg-gradient-to-b from-amber-300 to-amber-500 p-4 rounded-full border-4 border-white shadow-lg animate-bounce">
                  <Trophy className="w-12 h-12 text-white fill-amber-200" />
                </div>
                
                <h3 className="text-3xl font-extrabold text-emerald-600 mt-8 mb-2">
                  Fantastic Job! 🎉
                </h3>
                <p className="text-gray-600 font-medium mb-6">
                  You popped all the balloons and earned <span className="font-bold text-amber-500 text-lg">3 Shiny Stars</span>! Let's add them to your collection!
                </p>

                <div className="flex flex-col gap-3">
                  <button
                    onClick={handleFinish}
                    className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-bold py-3 px-6 rounded-2xl shadow-md transform hover:scale-105 active:scale-95 transition-all text-lg"
                  >
                    Keep Star Reward ⭐
                  </button>
                  <button
                    onClick={resetGame}
                    className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2 px-6 rounded-2xl transition-all"
                  >
                    Play Again
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
