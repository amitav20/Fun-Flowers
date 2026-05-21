import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { soundManager } from '../../utils/sound';
import { ArrowLeft, Star, Trophy, Check } from 'lucide-react';

interface LetterQuestion {
  id: number;
  emoji: string;
  wordName: string;
  correctLetter: string;
  choices: string[];
  level: 'easy' | 'medium' | 'hard';
}

const LETTER_POOL: LetterQuestion[] = [
  // Easy: Familiar simple nouns (A for Apple, D for Dog, C for Car, S for Sun)
  { id: 1, emoji: '🍎', wordName: 'Apple', correctLetter: 'A', choices: ['A', 'P', 'B'], level: 'easy' },
  { id: 2, emoji: '🐶', wordName: 'Dog', correctLetter: 'D', choices: ['D', 'C', 'G'], level: 'easy' },
  { id: 3, emoji: '🚗', wordName: 'Car', correctLetter: 'C', choices: ['B', 'T', 'C'], level: 'easy' },
  { id: 4, emoji: '☀️', wordName: 'Sun', correctLetter: 'S', choices: ['H', 'S', 'N'], level: 'easy' },

  // Medium: 5-7 letter nouns (F as in Fish, B as in Balloon, F as in Frog, K as in Koala)
  { id: 5, emoji: '🐟', wordName: 'Fish', correctLetter: 'F', choices: ['F', 'S', 'M'], level: 'medium' },
  { id: 6, emoji: '🎈', wordName: 'Balloon', correctLetter: 'B', choices: ['P', 'B', 'W'], level: 'medium' },
  { id: 7, emoji: '🐸', wordName: 'Frog', correctLetter: 'F', choices: ['F', 'R', 'K'], level: 'medium' },
  { id: 8, emoji: '🐨', wordName: 'Koala', correctLetter: 'K', choices: ['L', 'K', 'Q'], level: 'medium' },

  // Hard: Longer words (I for Ice Cream, D for Dinosaur, U for Umbrella, B for Butterfly)
  { id: 9, emoji: '🍦', wordName: 'Ice Cream', correctLetter: 'I', choices: ['I', 'J', 'Y'], level: 'hard' },
  { id: 10, emoji: '🦖', wordName: 'Dinosaur', correctLetter: 'D', choices: ['T', 'D', 'R'], level: 'hard' },
  { id: 11, emoji: '☂️', wordName: 'Umbrella', correctLetter: 'U', choices: ['V', 'U', 'W'], level: 'hard' },
  { id: 12, emoji: '🦋', wordName: 'Butterfly', correctLetter: 'B', choices: ['B', 'P', 'D'], level: 'hard' }
];

interface GameProps {
  onBack: () => void;
  onGameComplete: (starsEarned: number) => void;
}

export default function LetterQuest({ onBack, onGameComplete }: GameProps) {
  const [letterLevel, setLetterLevel] = useState<'easy' | 'medium' | 'hard'>('easy');
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedLetter, setSelectedLetter] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [stars, setStars] = useState(0);
  const [gameWon, setGameWon] = useState(false);

  const filteredLetters = LETTER_POOL.filter((l) => l.level === letterLevel);
  const activeQuestion = filteredLetters[currentIdx % filteredLetters.length] || filteredLetters[0];
  const targetRounds = filteredLetters.length;

  const handleChoice = (choice: string) => {
    if (isAnswered) return;
    setSelectedLetter(choice);
    setIsAnswered(true);

    if (choice === activeQuestion.correctLetter) {
      soundManager.playCorrect();
      setStars((prev) => prev + 1);

      setTimeout(() => {
        const nextIdx = currentIdx + 1;
        if (nextIdx >= targetRounds) {
          setGameWon(true);
          soundManager.playSuccess();
        } else {
          setCurrentIdx(nextIdx);
          setSelectedLetter(null);
          setIsAnswered(false);
        }
      }, 1500);
    } else {
      soundManager.playWrong();
      setTimeout(() => {
        setSelectedLetter(null);
        setIsAnswered(false);
      }, 1200);
    }
  };

  const handleFinish = () => {
    onGameComplete(3);
  };

  const handleReset = () => {
    setCurrentIdx(0);
    setSelectedLetter(null);
    setIsAnswered(false);
    setStars(0);
    setGameWon(false);
  };

  return (
    <div id="letter-quest-game" className="flex flex-col h-full bg-gradient-to-b from-sky-100 via-sky-50 to-pink-50 select-none overflow-hidden relative">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-white/70 backdrop-blur-md border-b border-sky-100 z-10">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-3 py-2 text-sky-700 bg-sky-100 hover:bg-sky-200 rounded-2xl font-semibold transition-all shadow-sm"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back</span>
        </button>

        <div className="flex items-center gap-2 bg-amber-50 px-4 py-1.5 rounded-full border border-amber-200 shadow-sm">
          <Star className="w-5 h-5 text-amber-500 fill-amber-400" />
          <span className="font-bold text-amber-800 text-lg">Stars: {stars}</span>
        </div>

        <div className="font-bold text-sky-800 text-sm md:text-base bg-sky-200/50 px-3 py-1.5 rounded-2xl">
          Progress: {currentIdx}/{targetRounds} 🔤
        </div>
      </div>

      {/* Main Board Arena */}
      <div className="flex-1 flex flex-col items-center justify-center p-4">
        <AnimatePresence mode="wait">
          {!gameWon && (
            <motion.div
              key={activeQuestion.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="flex-1 w-full max-w-xl flex flex-col items-center justify-center"
            >
              {/* Level Selection Tabs */}
              <div className="flex justify-center gap-2 mb-6 bg-sky-100/50 p-1.5 rounded-2xl border border-sky-200 shadow-sm max-w-xs mx-auto">
                {(['easy', 'medium', 'hard'] as const).map((lvl) => (
                  <button
                    key={lvl}
                    onClick={() => {
                      soundManager.playBubble();
                      setLetterLevel(lvl);
                      setCurrentIdx(0);
                      setSelectedLetter(null);
                      setIsAnswered(false);
                      setStars(0);
                    }}
                    className={`px-3 py-1 text-xs font-black rounded-xl transition-all capitalize cursor-pointer ${
                      letterLevel === lvl
                        ? 'bg-sky-600 text-white shadow-md'
                        : 'text-sky-800 hover:bg-sky-150/40'
                    }`}
                  >
                    {lvl === 'easy' ? '🍃 Easy' : lvl === 'medium' ? '⭐ Med' : '👑 Hard'}
                  </button>
                ))}
              </div>

              <div className="text-center mb-6">
                <h1 className="text-2xl md:text-3xl font-black text-sky-900 tracking-tight">
                  🔤 Find the First Letter!
                </h1>
                <p className="text-sky-600 font-medium text-sm mt-1">
                  What letter begins the name of the object below?
                </p>
              </div>

              {/* Big Interactive Card with Emoji */}
              <motion.div 
                whileHover={{ scale: 1.02 }}
                className="w-full max-w-xs bg-white rounded-3xl p-8 border-4 border-sky-200 shadow-xl flex flex-col items-center justify-center min-h-[220px] mb-8 relative text-center"
              >
                <div className="text-8xl md:text-9xl mb-4 filter drop-shadow animate-bounce">
                  {activeQuestion.emoji}
                </div>
                
                {/* Reveal name of word under the emoji */}
                <h2 className="text-3xl font-black text-sky-800 tracking-wide uppercase">
                  {activeQuestion.wordName}
                </h2>
              </motion.div>

              {/* Multiple Choice Letter Blocks */}
              <div className="w-full grid grid-cols-3 gap-4">
                {activeQuestion.choices.map((letter) => {
                  const isSelected = selectedLetter === letter;
                  const isCorrectLetter = letter === activeQuestion.correctLetter;

                  let btnColor = 'bg-white hover:bg-sky-50 text-sky-900 border-b-8 border-sky-200 active:border-b-2 active:translate-y-1.5';
                  if (isSelected) {
                    btnColor = isCorrectLetter 
                      ? 'bg-emerald-500 border-b-8 border-emerald-700 text-white scale-105'
                      : 'bg-rose-500 border-b-8 border-rose-700 text-white scale-95';
                  }

                  return (
                    <motion.button
                      key={letter}
                      disabled={isAnswered}
                      onClick={() => handleChoice(letter)}
                      className={`h-24 md:h-28 rounded-3xl text-4xl md:text-5xl font-black border-4 shadow-lg transition-all flex flex-col items-center justify-center cursor-pointer ${btnColor}`}
                    >
                      <span>{letter}</span>
                      {isSelected && isCorrectLetter && (
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
                className="bg-white rounded-3xl p-6 md:p-8 max-w-sm w-full text-center border-4 border-sky-400 shadow-2xl relative"
              >
                {/* Trophy Medal */}
                <div className="absolute -top-14 left-1/2 -translate-x-1/2 bg-gradient-to-b from-amber-300 to-amber-500 p-4 rounded-full border-4 border-white shadow-lg animate-bounce">
                  <Trophy className="w-12 h-12 text-white fill-amber-200" />
                </div>
                
                <h3 className="text-3xl font-extrabold text-sky-600 mt-8 mb-2">
                  Phonics Hero! 🔠
                </h3>
                <p className="text-gray-600 font-medium mb-6">
                  You corresponding letters to words flawlessly! Collect your <span className="font-bold text-amber-500">3 Gold Stars</span>!
                </p>

                <div className="flex flex-col gap-3">
                  <button
                    onClick={handleFinish}
                    className="w-full bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 text-white font-bold py-3 px-6 rounded-2xl shadow-md transform hover:scale-105 active:scale-95 transition-all text-lg"
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
