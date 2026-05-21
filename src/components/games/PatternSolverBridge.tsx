import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { soundManager } from '../../utils/sound';
import { ArrowLeft, Star, Volume2, Trophy, HelpCircle, ChevronRight, Rocket, Smile } from 'lucide-react';

interface PatternQuestion {
  id: number;
  type: 'emoji' | 'numbers';
  sequence: string[]; // ['🍎', '🍌', '🍎', '🍌', '?']
  correctAnswer: string;
  choices: string[];
  instruction: string;
  level: 'easy' | 'medium' | 'hard';
}

const PATTERNS_LIST: PatternQuestion[] = [
  // Easy: ABAB repeating emoji patterns
  {
    id: 1,
    type: 'emoji',
    sequence: ['🍎', '🍌', '🍎', '🍌', '❓'],
    correctAnswer: '🍎',
    choices: ['🍎', '🍌', '🍇', '🍒'],
    instruction: 'Complete the fruit pattern!',
    level: 'easy'
  },
  {
    id: 2,
    type: 'emoji',
    sequence: ['🦖', '🪐', '🦖', '🪐', '🦖', '❓'],
    correctAnswer: '🪐',
    choices: ['🪐', '🦖', '🚀', '⭐'],
    instruction: 'Find the missing block!',
    level: 'easy'
  },
  {
    id: 3,
    type: 'emoji',
    sequence: ['🐱', '🐶', '🐱', '🐶', '❓'],
    correctAnswer: '🐱',
    choices: ['🐱', '🐶', '🦁', '🐸'],
    instruction: 'Animal pair match!',
    level: 'easy'
  },

  // Medium: ABC / Double pattern variations
  {
    id: 4,
    type: 'emoji',
    sequence: ['🎈', '🚀', '⭐', '🎈', '🚀', '❓'],
    correctAnswer: '⭐',
    choices: ['🎈', '🚀', '⭐', '🐨'],
    instruction: 'Solve the cosmic space pattern!',
    level: 'medium'
  },
  {
    id: 5,
    type: 'emoji',
    sequence: ['🐶', '🐶', '🐱', '🐱', '🐶', '❓'],
    correctAnswer: '🐶',
    choices: ['🐶', '🐱', '🦁', '🐸'],
    instruction: 'Look closely at the double pet patterns!',
    level: 'medium'
  },
  {
    id: 6,
    type: 'emoji',
    sequence: ['🚗', '✈️', '⛵', '🚗', '✈️', '❓'],
    correctAnswer: '⛵',
    choices: ['🚗', '✈️', '⛵', '🚀'],
    instruction: 'Complete the vehicles pattern!',
    level: 'medium'
  },

  // Hard: Skip counting sequence patterns
  {
    id: 7,
    type: 'numbers',
    sequence: ['2', '4', '6', '8', '❓'],
    correctAnswer: '10',
    choices: ['9', '10', '11', '12'],
    instruction: 'Count by twos!',
    level: 'hard'
  },
  {
    id: 8,
    type: 'numbers',
    sequence: ['10', '20', '30', '40', '❓'],
    correctAnswer: '50',
    choices: ['45', '50', '60', '70'],
    instruction: 'Count by tens!',
    level: 'hard'
  },
  {
    id: 9,
    type: 'numbers',
    sequence: ['5', '10', '15', '20', '❓'],
    correctAnswer: '25',
    choices: ['22', '24', '25', '30'],
    instruction: 'Complete the pattern step addition!',
    level: 'hard'
  }
];

interface GameProps {
  onBack: () => void;
  onGameComplete: (starsEarned: number) => void;
}

export default function PatternSolverBridge({ onBack, onGameComplete }: GameProps) {
  const [patternLevel, setPatternLevel] = useState<'easy' | 'medium' | 'hard'>('easy');
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [rocketProgress, setRocketProgress] = useState(0); // 0 to 100 percentage
  const [isWon, setIsWon] = useState(false);
  const [stars, setStars] = useState(0);

  const filteredPatterns = PATTERNS_LIST.filter((p) => p.level === patternLevel);
  const activeQuestion = filteredPatterns[currentQuestionIdx % filteredPatterns.length] || filteredPatterns[0];
  const targetRounds = filteredPatterns.length;

  const handleChoiceSelect = (choice: string) => {
    if (isAnswered) return;

    setSelectedAnswer(choice);
    setIsAnswered(true);

    if (choice === activeQuestion.correctAnswer) {
      soundManager.playCorrect();
      
      const newCorrectCount = correctCount + 1;
      setCorrectCount(newCorrectCount);
      
      // Calculate how high our cosmic spaceship flies!
      const progressPercent = Math.min((newCorrectCount / targetRounds) * 100, 100);
      setRocketProgress(progressPercent);

      // Stars progress rewards
      setStars((prev) => prev + 1);

      if (newCorrectCount >= targetRounds) {
        setTimeout(() => {
          setIsWon(true);
          soundManager.playSuccess();
        }, 1200);
      } else {
        setTimeout(() => {
          moveToNextQuestion();
        }, 1500);
      }
    } else {
      soundManager.playWrong();
      setTimeout(() => {
        setSelectedAnswer(null);
        setIsAnswered(false);
      }, 1200);
    }
  };

  const moveToNextQuestion = () => {
    setSelectedAnswer(null);
    setIsAnswered(false);
    // Shuffle round or advance list safely
    setCurrentQuestionIdx((prev) => (prev + 1) % filteredPatterns.length);
  };

  const handleFinish = () => {
    onGameComplete(3); // Awards permanent stars!
  };

  const resetGame = () => {
    setCurrentQuestionIdx(0);
    setSelectedAnswer(null);
    setIsAnswered(false);
    setCorrectCount(0);
    setRocketProgress(0);
    setIsWon(false);
    setStars(0);
  };

  return (
    <div id="pattern-solver-game" className="flex flex-col h-full bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-950 select-none overflow-hidden text-white relative">
      
      {/* Game Header */}
      <div className="flex items-center justify-between p-4 bg-slate-950/80 backdrop-blur-md border-b border-indigo-950 z-10">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-3 py-2 text-indigo-200 bg-indigo-950/80 hover:bg-indigo-900 border border-indigo-800/50 rounded-2xl font-semibold transition-all shadow-md cursor-pointer text-xs md:text-sm"
        >
          <ArrowLeft className="w-5 h-5 animate-pulse" />
          <span>Back Dashboard</span>
        </button>

        <div className="flex items-center gap-2 bg-amber-950/80 px-4 py-1.5 rounded-full border border-amber-500/30 shadow-sm">
          <Star className="w-5 h-5 text-amber-400 fill-amber-300 animate-bounce" />
          <span className="font-bold text-amber-200 text-sm md:text-base">Space Stars: {stars}</span>
        </div>

        <div className="font-bold text-indigo-400 text-xs md:text-sm bg-indigo-950/90 px-3.5 py-1.5 rounded-2xl border border-indigo-900">
          Target Rocket fuel: {correctCount}/{targetRounds} 🚀
        </div>
      </div>

      {/* Main Sandbox Section */}
      <div className="flex-1 p-4 md:p-6 overflow-y-auto max-w-4xl mx-auto w-full flex flex-col justify-between">
        
        {/* Title area */}
        <div className="text-center mb-4 animate-[zoom-in_0.4s_ease-out]">
          <h1 className="text-2xl md:text-3.5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-300 tracking-tight">
            🚀 Space Pattern Star Rocket 🌌
          </h1>
          <p className="text-xs md:text-sm font-semibold text-indigo-300/80 mt-1">
            Fill the rocket fuel bridge with patterns to launch into deep space!
          </p>

          {/* Pattern Level selection tabs */}
          <div className="flex justify-center gap-2 mt-4">
            {(['easy', 'medium', 'hard'] as const).map((lvl) => (
              <button
                key={lvl}
                onClick={() => {
                  soundManager.playBubble();
                  setPatternLevel(lvl);
                  setCurrentQuestionIdx(0);
                  setCorrectCount(0);
                  setRocketProgress(0);
                  setStars(0);
                }}
                className={`px-3 py-1.5 text-xs font-black rounded-xl transition-all capitalize border cursor-pointer ${
                  patternLevel === lvl
                    ? 'bg-gradient-to-r from-cyan-500 to-indigo-500 text-white border-cyan-400 font-extrabold shadow-[0_0_12px_rgba(6,182,212,0.4)]'
                    : 'bg-slate-900/80 border-indigo-950 text-indigo-300 hover:bg-slate-800'
                }`}
              >
                {lvl === 'easy' ? '🍃 Easy' : lvl === 'medium' ? '⭐ Med' : '👑 Hard'}
              </button>
            ))}
          </div>
        </div>

        {/* Space track & rocket visual board preview */}
        <div className="relative bg-slate-950/60 border border-indigo-900/50 p-6 rounded-3xl min-h-[140px] flex items-center justify-between overflow-hidden my-4 shadow-inner">
          {/* Sparkles stars decoration background */}
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

          {/* Broken Bridge representation */}
          <div className="flex-1 mr-4">
            <p className="text-[10px] font-black tracking-wider text-cyan-400 uppercase mb-2">🚀 Rocket Flight Status</p>
            <div className="w-full bg-slate-900 h-6 pl-1 pr-1 border border-indigo-950 rounded-full flex items-center relative overflow-hidden shadow-inner">
              <motion.div 
                className="bg-gradient-to-r from-red-500 via-amber-400 to-emerald-500 h-4 rounded-full shadow-lg"
                animate={{ width: `${rocketProgress}%` }}
                transition={{ duration: 0.6 }}
              />
              <span className="absolute inset-y-0 right-3 flex items-center text-[9px] font-bold text-slate-400 pointer-events-none">
                {rocketProgress}% Thrusters Active
              </span>
            </div>
          </div>

          {/* Floating animated spaceship avatar */}
          <motion.div 
            animate={{ 
              y: [0, -8, 0],
              rotate: [0, 3, -3, 0]
            }}
            transition={{ 
              repeat: Infinity, 
              duration: 2.5,
              ease: "easeInOut"
            }}
            className="w-16 h-16 rounded-full bg-indigo-900/50 border border-indigo-700 flex items-center justify-center shadow-lg shadow-indigo-500/20"
          >
            <Rocket className="w-8 h-8 text-cyan-450 animate-pulse text-cyan-400" />
          </motion.div>
        </div>

        {/* The active query pattern row CARD */}
        <div className="bg-slate-900/90 border border-indigo-800/40 rounded-3xl p-6 md:p-8 text-center shadow-2xl relative my-auto">
          {/* Question instructions */}
          <p className="text-sm font-black tracking-wider text-cyan-400 uppercase mb-4">
            🤔 {activeQuestion.instruction}
          </p>

          {/* Sequence items display */}
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 md:gap-5 mb-8">
            {activeQuestion.sequence.map((item, idx) => {
              const isTargetQuestionIdx = item === '❓';
              return (
                <motion.div
                  key={idx}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: idx * 0.1 }}
                  className={`w-14 h-14 md:w-16 md:h-16 rounded-2xl flex items-center justify-center text-3xl font-black ${
                    isTargetQuestionIdx 
                      ? 'border-2 border-dashed border-cyan-400 bg-cyan-950/50 text-cyan-400 animate-pulse' 
                      : 'bg-indigo-950 border border-indigo-900/80 shadow-md text-white'
                  }`}
                >
                  {isTargetQuestionIdx && selectedAnswer ? selectedAnswer : item}
                </motion.div>
              );
            })}
          </div>

          {/* Correct visual indicator overlay */}
          <AnimatePresence>
            {isAnswered && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                className="absolute inset-0 bg-slate-950/95 rounded-3xl flex flex-col items-center justify-center z-10 p-4 border border-indigo-500"
              >
                {selectedAnswer === activeQuestion.correctAnswer ? (
                  <>
                    <Smile className="w-16 h-16 text-emerald-400 mb-2 animate-bounce" />
                    <h3 className="text-2xl font-black text-emerald-400">Wow, Splendid!</h3>
                    <p className="text-sm text-slate-300 font-semibold mt-1">
                      Matched sequence correctly! +1 Space fuel added 🚀
                    </p>
                  </>
                ) : (
                  <>
                    <HelpCircle className="w-16 h-16 text-rose-500 mb-2 animate-pulse" />
                    <h3 className="text-2xl font-black text-rose-400">Oops, Not Quite!</h3>
                    <p className="text-sm text-slate-300 font-semibold mt-1">
                      Give it another watch, you can definitely solve this! 🍦
                    </p>
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Choices Buttons */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
            {activeQuestion.choices.map((choice) => (
              <motion.button
                key={choice}
                onClick={() => handleChoiceSelect(choice)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-4 rounded-2xl text-2xl font-black tracking-normal transition-all cursor-pointer bg-gradient-to-tr from-indigo-950 to-indigo-900 hover:from-indigo-900 hover:to-indigo-800 border-2 border-indigo-800/80 text-white shadow-md"
              >
                {choice}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Practice Tip banner */}
        <div className="mt-6 p-4 rounded-2xl bg-slate-950/40 border border-indigo-950 text-center max-w-sm mx-auto w-full">
          <p className="text-[10px] text-slate-400 font-bold uppercase leading-relaxed">
            🚀 Mission objective: Complete 5 pattern bridge links to launch rocket astronauts to solar stars!
          </p>
        </div>

      </div>

      {/* Win Stage */}
      <AnimatePresence>
        {isWon && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-45 text-center"
          >
            <motion.div 
              initial={{ scale: 0.8, y: 35 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-slate-900 rounded-3xl p-6 md:p-8 max-w-sm w-full border-4 border-cyan-400 shadow-2xl relative text-white"
            >
              <div className="absolute -top-14 left-1/2 -translate-x-1/2 bg-cyan-400 p-4 rounded-full border-4 border-slate-900 shadow-lg animate-bounce">
                <Rocket className="w-12 h-12 text-slate-950" />
              </div>

              <h3 className="text-3xl font-black text-cyan-400 mt-8 mb-2">
                Blast Off! 🚀⭐
              </h3>
              <p className="text-slate-300 font-medium mb-6 leading-relaxed">
                Mission Success! Your Rocket Space Bridge pattern sequence is completely full! You earned <span className="font-bold text-amber-400 text-lg">3 Gold Stars</span>!
              </p>

              <div className="flex flex-col gap-2">
                <button
                  onClick={handleFinish}
                  className="w-full bg-gradient-to-r from-cyan-500 to-indigo-500 text-slate-950 font-black py-3 px-6 rounded-2xl shadow-md transition-all text-lg cursor-pointer hover:shadow-cyan-500/20"
                >
                  Save Cosmic Stars! ⭐
                </button>
                <button
                  onClick={resetGame}
                  className="w-full bg-indigo-950 text-slate-200 border border-indigo-800 font-bold py-2 rounded-xl text-xs transition-transform"
                >
                  Restart Mission
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
