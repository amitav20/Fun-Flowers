import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { soundManager } from '../../utils/sound';
import { ArrowLeft, Star, Volume2, Trophy, Check, HelpCircle } from 'lucide-react';

interface Question {
  id: number;
  itemEmoji: string;
  itemName: string;
  count: number;
  choices: number[];
  level: 'easy' | 'medium' | 'hard';
}

const COUNTING_POOL: Question[] = [
  // Easy Level: counts 1 to 4
  { id: 1, itemEmoji: '🦁', itemName: 'Happy Lions', count: 2, choices: [1, 2, 3], level: 'easy' },
  { id: 2, itemEmoji: '🐱', itemName: 'Cute Kitties', count: 3, choices: [2, 3, 4], level: 'easy' },
  { id: 3, itemEmoji: '🍎', itemName: 'Sweet Apples', count: 4, choices: [3, 4, 5], level: 'easy' },
  { id: 4, itemEmoji: '🦖', itemName: 'Baby Dino friends', count: 1, choices: [1, 2, 3], level: 'easy' },
  
  // Medium Level: counts 5 to 7
  { id: 5, itemEmoji: '🐝', itemName: 'Busy Bees', count: 5, choices: [3, 5, 6], level: 'medium' },
  { id: 6, itemEmoji: '⭐', itemName: 'Magic Stars', count: 6, choices: [4, 6, 8], level: 'medium' },
  { id: 7, itemEmoji: '🐸', itemName: 'Leaping Frogs', count: 7, choices: [5, 6, 7], level: 'medium' },
  { id: 8, itemEmoji: '🎈', itemName: 'Floaty Balloons', count: 5, choices: [4, 5, 6], level: 'medium' },

  // Hard Level: counts 8 to 12
  { id: 9, itemEmoji: '🐳', itemName: 'Grand Whales', count: 8, choices: [6, 8, 9], level: 'hard' },
  { id: 10, itemEmoji: '🍭', itemName: 'Twisty Lollipops', count: 9, choices: [8, 9, 10], level: 'hard' },
  { id: 11, itemEmoji: '🚗', itemName: 'Zooming Racecars', count: 10, choices: [9, 10, 11], level: 'hard' },
  { id: 12, itemEmoji: '🦉', itemName: 'Clever Owls', count: 12, choices: [10, 11, 12], level: 'hard' }
];

interface GameProps {
  onBack: () => void;
  onGameComplete: (starsEarned: number) => void;
}

export default function AnimalCounting({ onBack, onGameComplete }: GameProps) {
  const [countingLevel, setCountingLevel] = useState<'easy' | 'medium' | 'hard'>('easy');
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [tappedItems, setTappedItems] = useState<number[]>([]); // items already tapped by child to count along
  const [stars, setStars] = useState(0);
  const [gameWon, setGameWon] = useState(false);
  const [totalAttempts, setTotalAttempts] = useState(0);

  const filteredQuestions = COUNTING_POOL.filter((q) => q.level === countingLevel);
  const activeQuestion = filteredQuestions[currentIdx % filteredQuestions.length] || filteredQuestions[0];
  const targetRounds = filteredQuestions.length;

  const handleItemTap = (index: number) => {
    soundManager.playBubble();
    if (tappedItems.includes(index)) {
      setTappedItems((prev) => prev.filter((i) => i !== index));
    } else {
      setTappedItems((prev) => [...prev, index]);
    }
  };

  const handleChoiceSelect = (choice: number) => {
    if (isAnswered) return;
    setTotalAttempts((p) => p + 1);
    setSelectedAnswer(choice);
    setIsAnswered(true);

    if (choice === activeQuestion.count) {
      soundManager.playCorrect();
      setStars((prev) => prev + 1);
      
      setTimeout(() => {
        // Go to next question
        const nextIdx = currentIdx + 1;
        if (nextIdx >= targetRounds) {
          setGameWon(true);
          soundManager.playSuccess();
        } else {
          setCurrentIdx(nextIdx);
          setSelectedAnswer(null);
          setIsAnswered(false);
          setTappedItems([]);
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
    onGameComplete(3); // Award 3 permanent stars
  };

  const handleReset = () => {
    setCurrentIdx(0);
    setSelectedAnswer(null);
    setIsAnswered(false);
    setTappedItems([]);
    setStars(0);
    setGameWon(false);
    setTotalAttempts(0);
  };

  // Generate an array of size 'count' to map children emojis
  const renderingItems = Array.from({ length: activeQuestion.count }, (_, i) => i);

  return (
    <div id="counting-game" className="flex flex-col h-full bg-gradient-to-b from-amber-100 via-amber-50 to-orange-50 select-none overflow-hidden relative">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-white/70 backdrop-blur-md border-b border-amber-100 z-10">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-3 py-2 text-amber-700 bg-amber-100 hover:bg-amber-200 rounded-2xl font-semibold transition-all shadow-sm"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back</span>
        </button>

        <div className="flex items-center gap-2 bg-amber-50 px-4 py-1.5 rounded-full border border-amber-200 shadow-sm">
          <Star className="w-5 h-5 text-amber-500 fill-amber-400" />
          <span className="font-bold text-amber-800 text-lg">Stars: {stars}</span>
        </div>

        <div className="font-bold text-amber-800 text-sm md:text-base bg-amber-200/50 px-3 py-1.5 rounded-2xl">
          Progress: {currentIdx}/{targetRounds} 🦁
        </div>
      </div>

      {/* Main Board Arena */}
      <div className="flex-1 flex flex-col items-center justify-center p-4">
        <AnimatePresence mode="wait">
          {!gameWon && (
            <motion.div
              key={activeQuestion.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex-1 w-full max-w-xl flex flex-col items-center justify-center"
            >
              {/* Level Selection Tabs */}
              <div className="flex justify-center gap-2 mb-6 bg-amber-100/50 p-1.5 rounded-2xl border border-amber-200 shadow-sm max-w-xs mx-auto">
                {(['easy', 'medium', 'hard'] as const).map((lvl) => (
                  <button
                    key={lvl}
                    onClick={() => {
                      soundManager.playBubble();
                      setCountingLevel(lvl);
                      setCurrentIdx(0);
                      setSelectedAnswer(null);
                      setIsAnswered(false);
                      setTappedItems([]);
                      setStars(0);
                    }}
                    className={`px-3 py-1 text-xs font-black rounded-xl transition-all capitalize cursor-pointer ${
                      countingLevel === lvl
                        ? 'bg-amber-600 text-white shadow-md'
                        : 'text-amber-800 hover:bg-amber-150/40'
                    }`}
                  >
                    {lvl === 'easy' ? '🍃 Easy' : lvl === 'medium' ? '⭐ Med' : '👑 Hard'}
                  </button>
                ))}
              </div>

              <div className="text-center mb-6">
                <h1 className="text-2xl md:text-3xl font-black text-amber-900 tracking-tight">
                  🐾 Count the {activeQuestion.itemName}!
                </h1>
                <p className="text-amber-700 font-medium text-sm mt-1">
                  Tip: Tap each animal to count along out loud! 📣
                </p>
              </div>

              {/* Counting Box */}
              <div className="w-full bg-white rounded-3xl p-6 md:p-8 border-4 border-amber-200 shadow-xl flex flex-wrap gap-4 items-center justify-center min-h-[180px] md:min-h-[220px] mb-8 relative">
                {renderingItems.map((idx) => {
                  const isCounted = tappedItems.includes(idx);
                  const countOrder = tappedItems.indexOf(idx) + 1;
                  return (
                    <motion.button
                      key={idx}
                      onClick={() => handleItemTap(idx)}
                      whileHover={{ scale: 1.12 }}
                      whileTap={{ scale: 0.9 }}
                      className={`relative w-20 h-20 md:w-24 md:h-24 rounded-2xl flex items-center justify-center text-5xl md:text-6xl cursor-pointer transition-all ${
                        isCounted 
                          ? 'bg-amber-100 border-4 border-amber-400 shadow-inner' 
                          : 'bg-orange-50/50 border-2 border-dashed border-orange-200'
                      }`}
                    >
                      <span>{activeQuestion.itemEmoji}</span>
                      
                      {/* Interactive Tapped Number Bubble */}
                      <AnimatePresence>
                        {isCounted && (
                          <motion.div
                            initial={{ scale: 0, rotate: -20 }}
                            animate={{ scale: 1, rotate: 0 }}
                            exit={{ scale: 0 }}
                            className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center text-sm font-black shadow-md border-2 border-white"
                          >
                            {countOrder}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.button>
                  );
                })}
              </div>

              {/* Multiple Choice Panel */}
              <div className="w-full grid grid-cols-3 gap-4">
                {activeQuestion.choices.map((choice) => {
                  const isSelected = selectedAnswer === choice;
                  const isCorrectChoice = choice === activeQuestion.count;
                  
                  let btnColor = 'bg-white hover:bg-amber-50 text-amber-900 border-b-8 border-amber-200 active:border-b-2 active:translate-y-1.5';
                  if (isSelected) {
                    btnColor = isCorrectChoice 
                      ? 'bg-emerald-500 border-b-8 border-emerald-700 text-white scale-105'
                      : 'bg-rose-500 border-b-8 border-rose-700 text-white scale-95';
                  }

                  return (
                    <motion.button
                      key={choice}
                      disabled={isAnswered}
                      onClick={() => handleChoiceSelect(choice)}
                      className={`h-24 md:h-28 rounded-3xl text-4xl md:text-5xl font-black border-4 shadow-lg transition-all flex flex-col items-center justify-center p-2 cursor-pointer ${btnColor}`}
                    >
                      <span>{choice}</span>
                      {isSelected && isCorrectChoice && (
                        <Check className="w-6 h-6 text-white mt-1 fill-white" />
                      )}
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Level Complete Dialog */}
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
                className="bg-white rounded-3xl p-6 md:p-8 max-w-sm w-full text-center border-4 border-amber-400 shadow-2xl relative"
              >
                {/* Trophy Badge */}
                <div className="absolute -top-14 left-1/2 -translate-x-1/2 bg-gradient-to-b from-amber-300 to-amber-500 p-4 rounded-full border-4 border-white shadow-lg animate-bounce">
                  <Trophy className="w-12 h-12 text-white fill-amber-200" />
                </div>
                
                <h3 className="text-3xl font-extrabold text-amber-600 mt-8 mb-2">
                  Amazing Mathematician! 🔢
                </h3>
                <p className="text-gray-600 font-medium mb-6">
                  You counted all the animals! You have won <span className="font-bold text-amber-500">3 Gold Stars</span>!
                </p>

                <div className="flex flex-col gap-3">
                  <button
                    onClick={handleFinish}
                    className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold py-3 px-6 rounded-2xl shadow-md transform hover:scale-105 active:scale-95 transition-all text-lg"
                  >
                    Keep Star Reward ⭐
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
