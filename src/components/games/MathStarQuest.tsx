import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { soundManager } from '../../utils/sound';
import { ArrowLeft, Star, Trophy, Rocket, Moon, Check } from 'lucide-react';

interface MathQuestion {
  id: number;
  num1: number;
  operation: '+' | '-';
  num2: number;
  correctAnswer: number;
  choices: number[];
  level: 'easy' | 'medium' | 'hard';
}

const MATH_POOL: MathQuestion[] = [
  // Easy: values up to 5
  { id: 1, num1: 2, operation: '+', num2: 1, correctAnswer: 3, choices: [2, 3, 4], level: 'easy' },
  { id: 2, num1: 4, operation: '-', num2: 2, correctAnswer: 2, choices: [1, 2, 3], level: 'easy' },
  { id: 3, num1: 3, operation: '+', num2: 2, correctAnswer: 5, choices: [4, 5, 6], level: 'easy' },
  { id: 4, num1: 5, operation: '-', num2: 1, correctAnswer: 4, choices: [3, 4, 5], level: 'easy' },

  // Medium: values up to 10
  { id: 5, num1: 4, operation: '+', num2: 3, correctAnswer: 7, choices: [6, 7, 8], level: 'medium' },
  { id: 6, num1: 8, operation: '-', num2: 3, correctAnswer: 5, choices: [4, 5, 6], level: 'medium' },
  { id: 7, num1: 5, operation: '+', num2: 5, correctAnswer: 10, choices: [9, 10, 11], level: 'medium' },
  { id: 8, num1: 10, operation: '-', num2: 4, correctAnswer: 6, choices: [5, 6, 7], level: 'medium' },

  // Hard: values up to 20
  { id: 9, num1: 12, operation: '+', num2: 5, correctAnswer: 17, choices: [15, 17, 18], level: 'hard' },
  { id: 10, num1: 15, operation: '-', num2: 6, correctAnswer: 9, choices: [8, 9, 10], level: 'hard' },
  { id: 11, num1: 11, operation: '+', num2: 4, correctAnswer: 15, choices: [14, 15, 16], level: 'hard' },
  { id: 12, num1: 18, operation: '-', num2: 9, correctAnswer: 9, choices: [7, 8, 9], level: 'hard' }
];

interface GameProps {
  onBack: () => void;
  onGameComplete: (starsEarned: number) => void;
}

export default function MathStarQuest({ onBack, onGameComplete }: GameProps) {
  const [mathLevel, setMathLevel] = useState<'easy' | 'medium' | 'hard'>('easy');
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [stars, setStars] = useState(0);
  const [gameWon, setGameWon] = useState(false);

  const filteredQuestions = MATH_POOL.filter((q) => q.level === mathLevel);
  const activeQuestion = filteredQuestions[currentIdx % filteredQuestions.length] || filteredQuestions[0];
  const targetRounds = filteredQuestions.length; // Complete all filtered rounds to clear

  // Rocket progress calculations based on current index
  const rocketProgress = (currentIdx / targetRounds) * 100;

  const handleChoice = (choice: number) => {
    if (isAnswered) return;
    setSelectedAnswer(choice);
    setIsAnswered(true);

    if (choice === activeQuestion.correctAnswer) {
      soundManager.playCorrect();
      setStars((prev) => prev + 1);

      setTimeout(() => {
        const nextIdx = currentIdx + 1;
        if (nextIdx >= targetRounds) {
          setGameWon(true);
          soundManager.playSuccess();
        } else {
          setCurrentIdx(nextIdx);
          setSelectedAnswer(null);
          setIsAnswered(false);
        }
      }, 1500);
    } else {
      soundManager.playWrong();
      setTimeout(() => {
        setSelectedAnswer(null);
        setIsAnswered(false);
      }, 1200);
    }
  };

  const handleFinish = () => {
    onGameComplete(3);
  };

  const handleReset = () => {
    setCurrentIdx(0);
    setSelectedAnswer(null);
    setIsAnswered(false);
    setStars(0);
    setGameWon(false);
  };

  return (
    <div id="math-quest-game" className="flex flex-col h-full bg-slate-950 text-white select-none overflow-hidden relative">
      {/* Space Sky background stars */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/30 via-slate-950 to-slate-950 pointer-events-none z-0">
        {/* Simple inline generated background details */}
        <div className="absolute top-12 left-10 w-2 h-2 bg-white rounded-full opacity-40 animate-pulse" />
        <div className="absolute top-36 right-16 w-1.5 h-1.5 bg-white rounded-full opacity-60 animate-normal" />
        <div className="absolute bottom-24 left-24 w-1 h-1 bg-white rounded-full opacity-30 animate-pulse" />
        <div className="absolute top-1/2 right-10 w-1 h-1 bg-white rounded-full opacity-50" />
      </div>

      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 z-10">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-3 py-2 text-blue-300 bg-slate-800 hover:bg-slate-700 rounded-2xl font-semibold transition-all shadow-sm"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back</span>
        </button>

        <div className="flex items-center gap-2 bg-amber-500/10 px-4 py-1.5 rounded-full border border-amber-500/30 shadow-sm">
          <Star className="w-5 h-5 text-amber-400 fill-amber-500" />
          <span className="font-bold text-amber-300 text-lg">Stars: {stars}</span>
        </div>

        <div className="font-bold text-blue-400 text-sm md:text-base bg-blue-500/10 px-3 py-1.5 rounded-2xl border border-blue-500/20">
          Rocket Progress: {currentIdx}/{targetRounds} 🚀
        </div>
      </div>

      {/* Interactive cosmic flight-track */}
      <div className="w-full max-w-2xl mx-auto px-6 mt-6 z-10 relative">
        <div className="w-full h-4 bg-slate-800 rounded-full overflow-hidden flex items-center p-0.5 border border-slate-700">
          <motion.div 
            className="h-full bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-500 rounded-full"
            animate={{ width: `${rocketProgress}%` }}
            transition={{ type: 'spring', stiffness: 60 }}
          />
        </div>
        <div className="flex justify-between text-xs text-slate-400 mt-1 font-mono">
          <span>Earth 🌍</span>
          <span>Target Planet Star Station 🌠</span>
        </div>

        {/* Floating Rocket on path */}
        <div className="relative w-full h-8 mt-1">
          <motion.div
            className="absolute top-0 text-cyan-400"
            animate={{ left: `calc(${rocketProgress}% - 12px)` }}
            transition={{ type: 'spring', stiffness: 60 }}
          >
            <Rocket className="w-6 h-6 rotate-95 fill-cyan-500/30 animate-bounce" />
          </motion.div>
        </div>
      </div>

      {/* Main Board Arena */}
      <div className="flex-1 flex flex-col items-center justify-center p-4 z-10">
        <AnimatePresence mode="wait">
          {!gameWon && (
            <motion.div
              key={activeQuestion.id}
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.92 }}
              className="w-full max-w-xl flex flex-col items-center justify-center"
            >
              {/* Level Selection Tabs */}
              <div className="flex justify-center gap-2 mb-6 bg-slate-900/60 p-1.5 rounded-2xl border border-slate-850 shadow-sm max-w-xs mx-auto">
                {(['easy', 'medium', 'hard'] as const).map((lvl) => (
                  <button
                    key={lvl}
                    onClick={() => {
                      soundManager.playBubble();
                      setMathLevel(lvl);
                      setCurrentIdx(0);
                      setSelectedAnswer(null);
                      setIsAnswered(false);
                      setStars(0);
                    }}
                    className={`px-3 py-1 text-xs font-black rounded-xl transition-all capitalize border cursor-pointer ${
                      mathLevel === lvl
                        ? 'bg-blue-600 text-white border-blue-400 shadow-[0_0_12px_rgba(59,130,246,0.4)]'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-850/80'
                    }`}
                  >
                    {lvl === 'easy' ? '🍃 Easy' : lvl === 'medium' ? '⭐ Med' : '👑 Hard'}
                  </button>
                ))}
              </div>

              <div className="text-center mb-6">
                <h1 className="text-2xl md:text-3xl font-black text-blue-200 tracking-tight">
                  🪐 Star Math Odyssey!
                </h1>
                <p className="text-slate-400 font-medium text-sm mt-1">
                  Solve the cosmic math equation to thrust the rocket forward!
                </p>
              </div>

              {/* Glowing Nebula Equation Card */}
              <motion.div 
                whileHover={{ scale: 1.02 }}
                className="w-full max-w-md bg-slate-900/60 backdrop-blur-md rounded-3xl p-8 border border-slate-700/80 shadow-[0_0_30px_rgba(59,130,246,0.15)] flex justify-between items-center min-h-[160px] mb-8 text-center px-10 relative overflow-hidden"
              >
                {/* Glowing Background accent */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl" />

                <div className="text-5xl md:text-6xl font-black text-white font-mono z-10 w-full flex justify-center items-center gap-4">
                  <span>{activeQuestion.num1}</span>
                  <span className="text-cyan-400 font-bold">{activeQuestion.operation}</span>
                  <span>{activeQuestion.num2}</span>
                  <span className="text-slate-500">=</span>
                  <span className="text-cyan-400 underline decoration-indigo-500 underline-offset-8">?</span>
                </div>
              </motion.div>

              {/* Space Station Choice Cards */}
              <div className="w-full grid grid-cols-3 gap-4">
                {activeQuestion.choices.map((choice) => {
                  const isSelected = selectedAnswer === choice;
                  const isCorrect = choice === activeQuestion.correctAnswer;

                  let btnColor = 'bg-slate-900 border-slate-700 text-white hover:bg-slate-800 border-b-8 active:border-b-2 active:translate-y-1.5';
                  if (isSelected) {
                    btnColor = isCorrect 
                      ? 'bg-emerald-600 border-emerald-800 text-white scale-105'
                      : 'bg-rose-600 border-rose-800 text-white scale-95';
                  }

                  return (
                    <motion.button
                      key={choice}
                      disabled={isAnswered}
                      onClick={() => handleChoice(choice)}
                      className={`h-24 md:h-28 rounded-3xl text-4xl md:text-5xl font-black font-mono border-2 shadow-lg transition-all flex flex-col items-center justify-center cursor-pointer ${btnColor}`}
                    >
                      <span>{choice}</span>
                      {isSelected && isCorrect && (
                        <Check className="w-6 h-6 text-white mt-1 fill-white" />
                      )}
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Level Complete Space Landing Dialog */}
        <AnimatePresence>
          {gameWon && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 z-30 text-slate-900"
            >
              <motion.div 
                initial={{ scale: 0.8, y: 50 }}
                animate={{ scale: 1, y: 0 }}
                className="bg-white rounded-3xl p-6 md:p-8 max-w-sm w-full text-center border-4 border-cyan-400 shadow-2xl relative"
              >
                {/* Trophy Medal item */}
                <div className="absolute -top-14 left-1/2 -translate-x-1/2 bg-gradient-to-b from-cyan-400 to-blue-500 p-4 rounded-full border-4 border-white shadow-lg animate-bounce">
                  <Rocket className="w-12 h-12 text-white fill-cyan-200" />
                </div>
                
                <h3 className="text-3xl font-extrabold text-indigo-950 mt-8 mb-2">
                  Mission Accomplished! 🪐
                </h3>
                <p className="text-gray-600 font-medium mb-6">
                  You successfully navigated the flight paths and landed safely on the Star Station! Earned <span className="font-bold text-amber-500">3 Space Stars</span>!
                </p>

                <div className="flex flex-col gap-3">
                  <button
                    onClick={handleFinish}
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-3 px-6 rounded-2xl shadow-md transform hover:scale-105 active:scale-95 transition-all text-lg"
                  >
                    Keep Star Reward ⭐
                  </button>
                  <button
                    onClick={handleReset}
                    className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2 px-6 rounded-2xl transition-all"
                  >
                    Fly Space Quest Again
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
