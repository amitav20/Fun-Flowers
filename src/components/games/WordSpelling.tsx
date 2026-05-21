import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { soundManager } from '../../utils/sound';
import { ArrowLeft, Star, Trophy, RotateCcw, Check } from 'lucide-react';

interface SpellingWord {
  id: number;
  word: string; // uppercase spelling word
  emoji: string;
  clue: string;
  level: 'easy' | 'medium' | 'hard';
}

const WORDS_POOL: SpellingWord[] = [
  // Easy: 3-letter words
  { id: 1, word: 'CAT', emoji: '🐱', clue: 'Says meow meow', level: 'easy' },
  { id: 2, word: 'DOG', emoji: '🐶', clue: 'Wags its tail', level: 'easy' },
  { id: 3, word: 'SUN', emoji: '☀️', clue: 'Shines hot in day', level: 'easy' },
  { id: 4, word: 'FOX', emoji: '🦊', clue: 'A clever animal', level: 'easy' },

  // Medium: 4-letter words
  { id: 5, word: 'FROG', emoji: '🐸', clue: 'Leaps in ponds', level: 'medium' },
  { id: 6, word: 'STAR', emoji: '⭐', clue: 'Shines bright in sky', level: 'medium' },
  { id: 7, word: 'DUCK', emoji: '🦆', clue: 'Says "quack quack"', level: 'medium' },
  { id: 8, word: 'FISH', emoji: '🐟', clue: 'Swims in the blue sea', level: 'medium' },

  // Hard: 5+ letter words
  { id: 9, word: 'APPLE', emoji: '🍎', clue: 'Sweet crunchy fruit', level: 'hard' },
  { id: 10, word: 'TRAIN', emoji: '🚂', clue: 'Choo choo tracks', level: 'hard' },
  { id: 11, word: 'CANDY', emoji: '🍭', clue: 'Sweet twisty candy', level: 'hard' },
  { id: 12, word: 'BANANA', emoji: '🍌', clue: 'Peel monkeys love', level: 'hard' }
];

interface GameProps {
  onBack: () => void;
  onGameComplete: (starsEarned: number) => void;
}

export default function WordSpelling({ onBack, onGameComplete }: GameProps) {
  const [spellingLevel, setSpellingLevel] = useState<'easy' | 'medium' | 'hard'>('easy');
  const [currentIdx, setCurrentIdx] = useState(0);
  const [scrambled, setScrambled] = useState<{ id: string; letter: string }[]>([]);
  const [spelled, setSpelled] = useState<{ id: string; letter: string }[]>([]);
  const [stars, setStars] = useState(0);
  const [isDone, setIsDone] = useState(false);
  const [gameWon, setGameWon] = useState(false);
  const [showError, setShowError] = useState(false);

  const filteredWords = WORDS_POOL.filter((w) => w.level === spellingLevel);
  const active = filteredWords[currentIdx % filteredWords.length] || filteredWords[0];
  const targetRounds = filteredWords.length;

  useEffect(() => {
    initializeWord();
  }, [currentIdx, spellingLevel]);

  const initializeWord = () => {
    if (!active) return;
    const word = active.word;
    const letterArray = word.split('');
    
    // Scramble the letters
    let scrambledArray = letterArray.map((letter, index) => ({
      id: `${letter}-${index}-${Math.random()}`,
      letter,
    }));
    
    // Ensure it's genuinely scrambled and not already spelling the word
    let attempts = 0;
    while (attempts < 5) {
      scrambledArray = [...scrambledArray].sort(() => Math.random() - 0.5);
      if (scrambledArray.map(item => item.letter).join('') !== word) {
        break;
      }
      attempts++;
    }

    setScrambled(scrambledArray);
    setSpelled([]);
    setIsDone(false);
    setShowError(false);
  };

  const handleLetterTap = (letterObj: { id: string; letter: string }) => {
    if (isDone) return;
    soundManager.playBubble();

    // Add to spelled letters, remove from scrambled pools
    const nextSpelled = [...spelled, letterObj];
    setSpelled(nextSpelled);
    setScrambled((prev) => prev.filter((item) => item.id !== letterObj.id));

    // Check if word is fully spelled
    if (nextSpelled.length === active.word.length) {
      const spelledWord = nextSpelled.map(item => item.letter).join('');
      if (spelledWord === active.word) {
        // Correct word spelling
        setIsDone(true);
        soundManager.playCorrect();
        setStars((prev) => prev + 1);

        setTimeout(() => {
          const nextIdx = currentIdx + 1;
          if (nextIdx >= targetRounds) {
            setGameWon(true);
            soundManager.playSuccess();
          } else {
            setCurrentIdx(nextIdx);
          }
        }, 1600);
      } else {
        // Wrong spelling sequence triggered
        soundManager.playWrong();
        setShowError(true);
        setTimeout(() => {
          // Reset current word to help them re-spell
          initializeWord();
        }, 1200);
      }
    }
  };

  const handleRemoveLetter = (letterObj: { id: string; letter: string }) => {
    if (isDone) return;
    soundManager.playBubble();

    // Remove from spelled state, return back to scrambled pools
    setSpelled((prev) => prev.filter((item) => item.id !== letterObj.id));
    setScrambled((prev) => [...prev, letterObj]);
  };

  const handleResetWord = () => {
    soundManager.playBubble();
    initializeWord();
  };

  const handleFinish = () => {
    onGameComplete(3);
  };

  const handleResetGame = () => {
    setCurrentIdx(0);
    setStars(0);
    setGameWon(false);
  };

  return (
    <div id="spelling-game" className="flex flex-col h-full bg-gradient-to-b from-emerald-100 via-emerald-50 to-teal-50 select-none overflow-hidden relative">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-white/70 backdrop-blur-md border-b border-emerald-100 z-10">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-3 py-2 text-emerald-700 bg-emerald-100 hover:bg-emerald-200 rounded-2xl font-semibold transition-all shadow-sm"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back</span>
        </button>

        <div className="flex items-center gap-2 bg-amber-50 px-4 py-1.5 rounded-full border border-amber-200 shadow-sm">
          <Star className="w-5 h-5 text-amber-500 fill-amber-400" />
          <span className="font-bold text-amber-800 text-lg">Stars: {stars}</span>
        </div>

        <div className="font-bold text-emerald-800 text-sm md:text-base bg-emerald-200/50 px-3 py-1.5 rounded-2xl">
          Words Spelled: {currentIdx}/{targetRounds} 🔠
        </div>
      </div>

      {/* Main Board Arena */}
      <div className="flex-1 flex flex-col items-center justify-center p-4">
        <AnimatePresence mode="wait">
          {!gameWon && (
            <motion.div
              key={active.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex-1 w-full max-w-xl flex flex-col items-center justify-center"
            >
              {/* Level Selection Tabs */}
              <div className="flex justify-center gap-2 mb-5 bg-emerald-100/50 p-1.5 rounded-2xl border border-emerald-200 shadow-sm max-w-xs mx-auto">
                {(['easy', 'medium', 'hard'] as const).map((lvl) => (
                  <button
                    key={lvl}
                    onClick={() => {
                      soundManager.playBubble();
                      setSpellingLevel(lvl);
                      setCurrentIdx(0);
                      setStars(0);
                    }}
                    className={`px-3 py-1 text-xs font-black rounded-xl transition-all capitalize cursor-pointer ${
                      spellingLevel === lvl
                        ? 'bg-emerald-600 text-white shadow-md'
                        : 'text-emerald-800 hover:bg-emerald-150/40'
                    }`}
                  >
                    {lvl === 'easy' ? '🍃 Easy' : lvl === 'medium' ? '⭐ Med' : '👑 Hard'}
                  </button>
                ))}
              </div>

              <div className="text-center mb-6">
                <h1 className="text-2xl md:text-3xl font-black text-emerald-900 tracking-tight">
                  🐢 Spelling Adventure!
                </h1>
                <p className="text-emerald-600 font-medium text-sm mt-1">
                  Spell the word of the animal or object shown!
                </p>
              </div>

              {/* Central Display Card */}
              <div className="w-full max-w-sm bg-white rounded-3xl p-6 border-4 border-emerald-300 shadow-xl flex flex-col items-center justify-center min-h-[160px] mb-6 text-center relative">
                {/* Score particle splash indicator */}
                <AnimatePresence>
                  {isDone && (
                    <motion.div 
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1.1, opacity: 1 }}
                      className="absolute inset-0 bg-emerald-500/90 rounded-2xl flex flex-col items-center justify-center text-white z-10"
                    >
                      <span className="text-5xl mb-2">🎈 Correct!</span>
                      <span className="font-bold">Next word coming up...</span>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Scrambled word visual clue */}
                <span className="text-7xl md:text-8xl mb-2 animate-pulse">{active.emoji}</span>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Clue: {active.clue}
                </span>
              </div>

              {/* Dynamic Answer Slot Blanks */}
              <div className="flex justify-center items-center gap-3 mb-8 w-full">
                {Array.from({ length: active.word.length }).map((_, index) => {
                  const letterObj = spelled[index];
                  return (
                    <motion.button
                      key={index}
                      onClick={() => letterObj && handleRemoveLetter(letterObj)}
                      className={`w-14 h-14 md:w-16 md:h-16 rounded-2xl border-b-4 border-3 flex items-center justify-center text-2xl md:text-3xl font-black transition-all ${
                        showError 
                          ? 'bg-rose-100 border-rose-400 text-rose-500 scale-95' 
                          : letterObj 
                            ? 'bg-emerald-500 border-emerald-600 border-b-6 text-white text-3xl font-extrabold cursor-pointer hover:bg-emerald-600'
                            : 'bg-slate-50 border-slate-300 border-dashed text-slate-300'
                      }`}
                      whileHover={letterObj ? { scale: 1.05 } : {}}
                      whileTap={letterObj ? { scale: 0.95 } : {}}
                    >
                      {letterObj ? letterObj.letter : ''}
                    </motion.button>
                  );
                })}
              </div>

              {/* Mixed-letter selection blocks */}
              <div className="w-full bg-emerald-200/30 p-4 rounded-3xl border border-emerald-100 mb-6 min-h-[100px] flex items-center justify-center">
                <div className="flex flex-wrap gap-3 justify-center items-center w-full">
                  <AnimatePresence>
                    {scrambled.map((item) => (
                      <motion.button
                        key={item.id}
                        layout
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.5 }}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleLetterTap(item)}
                        className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-white text-emerald-800 border-4 border-emerald-200 border-b-6 shadow-md hover:bg-emerald-50 text-2xl md:text-3xl font-black flex items-center justify-center cursor-pointer active:translate-y-0.5 active:border-b-2"
                      >
                        {item.letter}
                      </motion.button>
                    ))}
                  </AnimatePresence>

                  {scrambled.length === 0 && spelled.length < active.word.length && (
                    <span className="text-emerald-600 italic font-medium">All letters sorted!</span>
                  )}
                </div>
              </div>

              {/* Reset state block button */}
              <button
                onClick={handleResetWord}
                className="flex items-center gap-2 px-4 py-2 font-bold text-emerald-800 bg-emerald-100 hover:bg-emerald-200 rounded-2xl transition-all shadow-sm cursor-pointer border border-emerald-200"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Reset word</span>
              </button>
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
                className="bg-white rounded-3xl p-6 md:p-8 max-w-sm w-full text-center border-4 border-emerald-400 shadow-2xl relative"
              >
                {/* Trophy Medal item */}
                <div className="absolute -top-14 left-1/2 -translate-x-1/2 bg-gradient-to-b from-amber-300 to-amber-500 p-4 rounded-full border-4 border-white shadow-lg animate-bounce">
                  <Trophy className="w-12 h-12 text-white fill-amber-200" />
                </div>
                
                <h3 className="text-3xl font-extrabold text-emerald-600 mt-8 mb-2">
                  Grand Spell Master! 📝
                </h3>
                <p className="text-gray-600 font-medium mb-6">
                  You spelled all words dynamically! You won <span className="font-bold text-amber-500">3 Radiant Stars</span>!
                </p>

                <div className="flex flex-col gap-3">
                  <button
                    onClick={handleFinish}
                    className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-bold py-3 px-6 rounded-2xl shadow-md transform hover:scale-105 active:scale-95 transition-all text-lg"
                  >
                    Keep Star Reward ⭐
                  </button>
                  <button
                    onClick={handleResetGame}
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
