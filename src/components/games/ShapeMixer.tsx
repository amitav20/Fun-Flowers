import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { soundManager } from '../../utils/sound';
import { ArrowLeft, Star, Volume2, Trophy, RotateCcw } from 'lucide-react';

interface ShapeItem {
  id: string;
  name: string;
  svgPath: string; // inline SVG rendering instructions
  viewBox: string;
  level: 'easy' | 'medium' | 'hard';
}

const SHAPES: ShapeItem[] = [
  // Easy
  {
    id: 'star',
    name: 'Star',
    svgPath: 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z',
    viewBox: '0 0 24 24',
    level: 'easy'
  },
  {
    id: 'heart',
    name: 'Heart',
    svgPath: 'M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z',
    viewBox: '0 0 24 24',
    level: 'easy'
  },
  {
    id: 'circle',
    name: 'Circle',
    svgPath: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z',
    viewBox: '0 0 24 24',
    level: 'easy'
  },
  // Medium
  {
    id: 'triangle',
    name: 'Triangle',
    svgPath: 'M12 2L2 22h20L12 2z',
    viewBox: '0 0 24 24',
    level: 'medium'
  },
  {
    id: 'moon',
    name: 'Crescent Moon',
    svgPath: 'M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z',
    viewBox: '0 0 24 24',
    level: 'medium'
  },
  {
    id: 'cloud',
    name: 'Cloud',
    svgPath: 'M17.5 19A5.5 5.5 0 0 0 18 8.02A7.5 7.5 0 0 0 3.5 11.5A5.5 5.5 0 0 0 4 22h13.5a5.5 5.5 0 0 0 0-11z',
    viewBox: '0 0 24 24',
    level: 'medium'
  },
  // Hard
  {
    id: 'hexagon',
    name: 'Hexagon',
    svgPath: 'M12 2l8.66 5v10L12 22l-8.66-5V7L12 2z',
    viewBox: '0 0 24 24',
    level: 'hard'
  },
  {
    id: 'diamond',
    name: 'Diamond',
    svgPath: 'M12 2L2 12l10 10 10-10L12 2z',
    viewBox: '0 0 24 24',
    level: 'hard'
  }
];

const COLORS = [
  { id: 'red', name: 'Ruby Red', colorClass: 'bg-rose-500 shadow-rose-300', fill: '#f43f5e' },
  { id: 'blue', name: 'Ocean Blue', colorClass: 'bg-sky-500 shadow-sky-300', fill: '#0ea5e9' },
  { id: 'green', name: 'Forest Green', colorClass: 'bg-emerald-500 shadow-emerald-300', fill: '#10b981' },
  { id: 'yellow', name: 'Sunny Yellow', colorClass: 'bg-amber-400 shadow-amber-200', fill: '#f59e0b' },
  { id: 'purple', name: 'Royal Purple', colorClass: 'bg-purple-500 shadow-purple-300', fill: '#a855f7' },
];

interface GameProps {
  onBack: () => void;
  onGameComplete: (starsEarned: number) => void;
}

export default function ShapeMixer({ onBack, onGameComplete }: GameProps) {
  const [shapeLevel, setShapeLevel] = useState<'easy' | 'medium' | 'hard'>('easy');
  const [currentShapeIdx, setCurrentShapeIdx] = useState(0);
  const [selectedColor, setSelectedColor] = useState<typeof COLORS[0] | null>(null);
  const [canvasColor, setCanvasColor] = useState<string | null>(null); // hex filled code
  const [isMatched, setIsMatched] = useState(false);
  const [stars, setStars] = useState(0);
  const [roundsCompleted, setRoundsCompleted] = useState(0);
  const [gameWon, setGameWon] = useState(false);

  const filteredPool = SHAPES.filter((s) => s.level === shapeLevel);
  const activeShape = filteredPool[currentShapeIdx % filteredPool.length] || filteredPool[0];
  const targetRounds = 3;

  const handleSelectColor = (color: typeof COLORS[0]) => {
    soundManager.playBubble();
    setSelectedColor(color);
  };

  const handleApplyColor = () => {
    if (!selectedColor || isMatched) return;
    
    soundManager.playCorrect();
    setCanvasColor(selectedColor.fill);
    setIsMatched(true);
    setStars((prev) => prev + 1);

    setTimeout(() => {
      const nextRound = roundsCompleted + 1;
      setRoundsCompleted(nextRound);
      
      if (nextRound >= targetRounds) {
        setGameWon(true);
        soundManager.playSuccess();
      } else {
        // Next shape animation setup
        setTimeout(() => {
          setCurrentShapeIdx((prev) => (prev + 1) % filteredPool.length);
          setCanvasColor(null);
          setSelectedColor(null);
          setIsMatched(false);
        }, 1200);
      }
    }, 800);
  };

  const handleFinish = () => {
    onGameComplete(3); // Award 3 stars
  };

  const handleReset = () => {
    setCurrentShapeIdx(0);
    setCanvasColor(null);
    setSelectedColor(null);
    setIsMatched(false);
    setStars(0);
    setRoundsCompleted(0);
    setGameWon(false);
  };

  return (
    <div id="shape-mixer-game" className="flex flex-col h-full bg-gradient-to-b from-purple-100 via-purple-50 to-pink-50 select-none overflow-hidden relative">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between p-4 bg-white/70 backdrop-blur-md border-b border-purple-100 z-10 gap-3">
        <div className="flex items-center gap-3 w-full sm:w-auto justify-between">
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-3 py-2 text-purple-700 bg-purple-100 hover:bg-purple-200 rounded-2xl font-semibold transition-all shadow-sm cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </button>

          <div className="flex items-center gap-2 bg-amber-50 px-4 py-1.5 rounded-full border border-amber-200 shadow-sm">
            <Star className="w-5 h-5 text-amber-500 fill-amber-400 animate-spin-slow" />
            <span className="font-bold text-amber-800 text-lg">Stars: {stars}</span>
          </div>
        </div>

        {/* Level Controls */}
        <div className="flex bg-purple-100/50 p-1 rounded-2xl border border-purple-200/30">
          {(['easy', 'medium', 'hard'] as const).map((lvl) => (
            <button
              key={lvl}
              onClick={() => {
                soundManager.playBubble();
                setShapeLevel(lvl);
                setCurrentShapeIdx(0);
                setCanvasColor(null);
                setSelectedColor(null);
                setIsMatched(false);
                setRoundsCompleted(0);
              }}
              className={`px-3 py-1 text-xs font-black rounded-xl transition-all capitalize cursor-pointer ${
                shapeLevel === lvl
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-purple-700 hover:bg-purple-100/60'
              }`}
            >
              {lvl === 'easy' ? '☀️ Basic' : lvl === 'medium' ? '⭐ Medium' : '🪐 Geometric'}
            </button>
          ))}
        </div>

        <div className="font-bold text-purple-800 text-sm md:text-base bg-purple-200/50 px-3 py-1.5 rounded-2xl">
          Match: {roundsCompleted}/{targetRounds} ✨
        </div>
      </div>

      {/* Main Board Arena */}
      <div className="flex-1 flex flex-col items-center justify-center p-4 relative">
        <AnimatePresence mode="wait">
          {!gameWon && (
            <motion.div
              key={activeShape.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="flex-1 flex flex-col justify-center items-center max-w-lg w-full"
            >
              {/* Educational Title Instructions */}
              <div className="text-center mb-6">
                <h1 className="text-2xl font-black text-purple-900 drop-shadow-sm flex items-center gap-2 justify-center">
                  🎨 Color the Shape: <span className="text-pink-600 bg-pink-100 px-3 py-1 rounded-full text-xl">{activeShape.name}</span>
                </h1>
                <p className="text-purple-600 font-medium text-sm mt-1">
                  Pick a color on the bottom, then click on the empty shape!
                </p>
              </div>

              {/* Central interactive shape */}
              <motion.div
                onClick={handleApplyColor}
                whileHover={{ scale: isMatched ? 1 : 1.03 }}
                whileTap={{ scale: isMatched ? 1 : 0.97 }}
                className={`w-64 h-64 md:w-80 md:h-80 rounded-3xl bg-white border-4 ${selectedColor && !isMatched ? 'border-dashed border-purple-400 hover:border-solid hover:border-purple-600 animate-pulse' : 'border-purple-200'} shadow-xl flex items-center justify-center cursor-pointer transition-colors relative`}
              >
                <svg
                  viewBox={activeShape.viewBox}
                  className="w-48 h-48 md:w-56 md:h-56 select-none"
                  style={{ transition: 'fill 0.5s ease-in-out' }}
                >
                  <motion.path
                    d={activeShape.svgPath}
                    fill={canvasColor || '#e2e8f0'}
                    stroke={canvasColor ? '#ffffff' : '#a855f7'}
                    strokeWidth={canvasColor ? "0" : "1.5"}
                    animate={isMatched ? { scale: [1, 1.1, 1], rotate: [0, 10, -10, 0] } : {}}
                    transition={{ duration: 0.6 }}
                  />
                </svg>

                {/* Sparkling Overlay */}
                {isMatched && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1.2 }}
                    className="absolute inset-0 flex items-center justify-center pointer-events-none"
                  >
                    <span className="text-6xl animate-ping opacity-75">✨</span>
                  </motion.div>
                )}

                {/* Helper overlay instruction inside shape */}
                {!canvasColor && (
                  <div className="absolute text-purple-400 font-bold hover:text-purple-600 text-sm select-none pointer-events-none p-2 bg-purple-50 rounded-xl max-w-[80%] text-center">
                    {selectedColor ? `Tap to color ${selectedColor.name}!` : "Select a color below!"}
                  </div>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Color Palette Station */}
        {!gameWon && (
          <div className="w-full max-w-xl bg-white/80 p-5 rounded-3xl border-2 border-purple-100 shadow-md mb-4">
            <h4 className="text-center font-bold text-purple-800 mb-3 text-sm tracking-wide uppercase">
              Magic Colors Palette Menu
            </h4>
            <div className="flex justify-center items-center gap-3 md:gap-4 flex-wrap">
              {COLORS.map((color) => {
                const isSelected = selectedColor?.id === color.id;
                return (
                  <button
                    key={color.id}
                    onClick={() => handleSelectColor(color)}
                    className={`group relative flex flex-col items-center gap-1 focus:outline-none`}
                  >
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className={`w-14 h-14 md:w-16 md:h-16 rounded-full ${color.colorClass} border-4 ${isSelected ? 'border-white ring-4 ring-purple-500 scale-105 shadow-inner' : 'border-slate-50'} shadow-md transition-all flex items-center justify-center cursor-pointer`}
                    >
                      {isSelected && (
                        <span className="text-white text-lg font-bold">⭐</span>
                      )}
                    </motion.div>
                    <span className="text-[11px] font-bold text-purple-700 tracking-tight">
                      {color.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Game Win Overlays */}
        <AnimatePresence>
          {gameWon && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/40 backdrop-blur-md flex items-center justify-center p-4 z-30"
            >
              <motion.div 
                initial={{ scale: 0.8, y: 50 }}
                animate={{ scale: 1, y: 0 }}
                className="bg-white rounded-3xl p-6 md:p-8 max-w-sm w-full text-center border-4 border-purple-400 shadow-2xl relative"
              >
                {/* Trophy Decoration */}
                <div className="absolute -top-14 left-1/2 -translate-x-1/2 bg-gradient-to-b from-amber-300 to-amber-500 p-4 rounded-full border-4 border-white shadow-lg animate-bounce">
                  <Trophy className="w-12 h-12 text-white fill-amber-200" />
                </div>
                
                <h3 className="text-3xl font-extrabold text-purple-600 mt-8 mb-2">
                  Double Sparkle! ✨🎨
                </h3>
                <p className="text-gray-600 font-medium mb-6">
                  You painted all shapes perfectly! Enjoy your new <span className="font-bold text-amber-500">3 Gold Stars</span>!
                </p>

                <div className="flex flex-col gap-3">
                  <button
                    onClick={handleFinish}
                    className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-bold py-3 px-6 rounded-2xl shadow-md transform hover:scale-105 active:scale-95 transition-all text-lg"
                  >
                    Collect Star Reward ⭐
                  </button>
                  <button
                    onClick={handleReset}
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
