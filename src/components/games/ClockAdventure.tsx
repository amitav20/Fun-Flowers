import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { soundManager } from '../../utils/sound';
import { ArrowLeft, Star, Clock, Trophy, RefreshCw, ChevronRight, HelpCircle } from 'lucide-react';

interface ClockQuestion {
  id: number;
  targetHour: number;
  targetMinute: number;
  choices: string[];
  instruction: string;
}

const QUESTIONS: ClockQuestion[] = [
  {
    id: 1,
    targetHour: 3,
    targetMinute: 0,
    choices: ['3:00', '12:15', '4:30', '6:00'],
    instruction: 'Select matching digital time for this afternoon clock!'
  },
  {
    id: 2,
    targetHour: 6,
    targetMinute: 30,
    choices: ['6:00', '6:30', '7:30', '5:30'],
    instruction: 'Find the half-hour time block!'
  },
  {
    id: 3,
    targetHour: 10,
    targetMinute: 15,
    choices: ['10:00', '10:15', '11:45', '9:15'],
    instruction: 'Read the quarter-hour space clock!'
  },
  {
    id: 4,
    targetHour: 1,
    targetMinute: 45,
    choices: ['1:15', '2:45', '1:45', '12:45'],
    instruction: 'Read the hands carefully! It is almost 2 o\'clock!'
  },
  {
    id: 5,
    targetHour: 8,
    targetMinute: 20,
    choices: ['8:20', '8:40', '9:20', '7:20'],
    instruction: 'Solve this 5-minute math intervals time!'
  }
];

interface GameProps {
  onBack: () => void;
  onGameComplete: (starsEarned: number) => void;
}

export default function ClockAdventure({ onBack, onGameComplete }: GameProps) {
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [mode, setMode] = useState<'quiz' | 'set-hand'>('quiz'); // Quiz or Set interactive hand
  const [isWon, setIsWon] = useState(false);
  const [stars, setStars] = useState(0);

  // For interactive set-hand mode
  const [interactiveHour, setInteractiveHour] = useState(12);
  const [interactiveMinute, setInteractiveMinute] = useState(0);
  const [targetSetTime, setTargetSetTime] = useState({ hour: 4, minute: 30 });

  const activeQuestion = QUESTIONS[currentQuestionIdx];

  const handleChoiceSelect = (choice: string) => {
    if (isAnswered) return;

    setSelectedAnswer(choice);
    setIsAnswered(true);

    const formatTarget = `${activeQuestion.targetHour}:${activeQuestion.targetMinute === 0 ? '00' : activeQuestion.targetMinute}`;

    if (choice === formatTarget) {
      soundManager.playCorrect();
      const nextCorrectCount = correctCount + 1;
      setCorrectCount(nextCorrectCount);
      setStars((s) => s + 1);

      if (nextCorrectCount >= 5) {
        setTimeout(() => {
          setIsWon(true);
          soundManager.playSuccess();
        }, 1200);
      } else {
        setTimeout(() => {
          advanceQuestion();
        }, 1600);
      }
    } else {
      soundManager.playWrong();
      setTimeout(() => {
        setSelectedAnswer(null);
        setIsAnswered(false);
      }, 1500);
    }
  };

  const advanceQuestion = () => {
    setSelectedAnswer(null);
    setIsAnswered(false);
    setCurrentQuestionIdx((prev) => (prev + 1) % QUESTIONS.length);
  };

  const adjustInteractiveTime = (hoursDiff: number, minsDiff: number) => {
    soundManager.playBubble();
    
    // adjust hours safely 1 to 12
    let nextHour = interactiveHour + hoursDiff;
    if (nextHour > 12) nextHour = 1;
    if (nextHour < 1) nextHour = 12;

    // adjust minutes safely 0 to 55
    let nextMin = interactiveMinute + minsDiff;
    if (nextMin >= 60) {
      nextMin = 0;
      nextHour = nextHour + 1 > 12 ? 1 : nextHour + 1;
    }
    if (nextMin < 0) {
      nextMin = 45;
      nextHour = nextHour - 1 < 1 ? 12 : nextHour - 1;
    }

    setInteractiveHour(nextHour);
    setInteractiveMinute(nextMin);
  };

  const verifyInteractiveHandSetting = () => {
    if (interactiveHour === targetSetTime.hour && interactiveMinute === targetSetTime.minute) {
      soundManager.playSuccess();
      setCorrectCount((c) => c + 1);
      setStars((s) => s + 1);

      if (correctCount + 1 >= 5) {
        setIsWon(true);
      } else {
        // Generate next target set time
        const targets = [
          { hour: 9, minute: 0 },
          { hour: 11, minute: 15 },
          { hour: 1, minute: 30 },
          { hour: 7, minute: 45 },
        ];
        const randomTarget = targets[Math.floor(Math.random() * targets.length)];
        setTargetSetTime(randomTarget);
        // Reset interactive values slightly away
        setInteractiveHour(12);
        setInteractiveMinute(0);
      }
    } else {
      soundManager.playWrong();
      soundManager.playBubble();
    }
  };

  const handleFinish = () => {
    onGameComplete(3); // Save 3 star rewards
  };

  const resetGame = () => {
    setCurrentQuestionIdx(0);
    setSelectedAnswer(null);
    setIsAnswered(false);
    setCorrectCount(0);
    setIsWon(false);
    setStars(0);
    setInteractiveHour(12);
    setInteractiveMinute(0);
    setTargetSetTime({ hour: 4, minute: 30 });
  };

  // SVGs Clock layout properties
  const formatHourAngle = (h: number, m: number) => ((h % 12) * 30) + (m * 0.5);
  const formatMinuteAngle = (m: number) => m * 6;

  const activeHour = mode === 'quiz' ? activeQuestion.targetHour : interactiveHour;
  const activeMinute = mode === 'quiz' ? activeQuestion.targetMinute : interactiveMinute;

  return (
    <div id="clock-adventure-game" className="flex flex-col h-full bg-gradient-to-b from-slate-900 via-violet-950 to-slate-950 select-none overflow-hidden text-white relative">
      
      {/* Game Header */}
      <div className="flex items-center justify-between p-4 bg-slate-950/80 backdrop-blur-md border-b border-violet-900 z-10">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-3 py-2 text-violet-200 bg-violet-950 hover:bg-violet-900 border border-violet-800/40 rounded-2xl font-semibold transition-all shadow-md cursor-pointer text-xs md:text-sm"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back</span>
        </button>

        <div className="flex items-center gap-2 bg-amber-950/80 px-4 py-1.5 rounded-full border border-amber-500/30 shadow-sm">
          <Star className="w-5 h-5 text-amber-400 fill-amber-300 animate-spin-slow" />
          <span className="font-bold text-amber-200 text-sm md:text-base">Clock Stars: {stars}</span>
        </div>

        <div className="font-bold text-violet-400 text-xs md:text-sm bg-violet-950 border border-violet-800/50 px-3 py-1.5 rounded-2xl">
          Progress: {correctCount}/5 Clocks ⏰
        </div>
      </div>

      {/* Main Body Stage */}
      <div className="flex-1 p-4 md:p-6 overflow-y-auto max-w-4xl mx-auto w-full flex flex-col justify-between">
        
        {/* Helper Title */}
        <div className="text-center mb-4">
          <h1 className="text-2.5xl md:text-3.5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-violet-300 to-pink-300 tracking-tight">
            ⏰ Time Travel Clock Master 🌌
          </h1>
          <p className="text-xs md:text-sm font-semibold text-violet-300/80 mt-1">
            Learn analog clock structures & daily time settings!
          </p>

          {/* Toggle level difficulty modes */}
          <div className="flex justify-center gap-3 mt-4">
            <button
              onClick={() => { soundManager.playBubble(); setMode('quiz'); resetGame(); }}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                mode === 'quiz' 
                  ? 'bg-violet-600 text-white shadow-md' 
                  : 'bg-slate-900 border border-violet-900 text-violet-300 hover:bg-slate-800'
              }`}
            >
              📖 Quiz Mode: Read Hands
            </button>
            <button
              onClick={() => { soundManager.playBubble(); setMode('set-hand'); resetGame(); }}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                mode === 'set-hand' 
                  ? 'bg-pink-600 text-white shadow-md' 
                  : 'bg-slate-900 border border-pink-900/50 text-pink-300 hover:bg-slate-800'
              }`}
            >
              🔧 Interactive Mode: Adjust Clock
            </button>
          </div>
        </div>

        {/* ANALOG CLOCK SVG RENDERER CARD */}
        <div className="my-auto flex flex-col md:flex-row items-center justify-center gap-8 bg-slate-950/50 p-6 rounded-3xl border border-violet-900/40">
          
          {/* Beautiful SVG clock face scale */}
          <div className="relative w-48 h-48 md:w-56 md:h-56 shrink-0">
            <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-xl select-none">
              {/* Outside casing rim */}
              <circle cx="100" cy="100" r="95" className="fill-slate-800 stroke-violet-500 stroke-[5]" />
              <circle cx="100" cy="100" r="88" className="fill-white" />

              {/* Minute ticks and notches helper */}
              {Array.from({ length: 12 }).map((_, i) => {
                const angle = (i * 30 * Math.PI) / 180;
                const tx = 100 + 72 * Math.sin(angle);
                const ty = 100 - 72 * Math.cos(angle);
                const displayNum = i === 0 ? 12 : i;
                return (
                  <text
                    key={i}
                    x={tx}
                    y={ty + 4}
                    className="text-[14px] font-black text-slate-800 select-none text-center"
                    textAnchor="middle"
                  >
                    {displayNum}
                  </text>
                );
              })}

              {/* Hour hand */}
              <line
                x1="100"
                y1="100"
                x2="100"
                y2="55"
                className="stroke-slate-900 stroke-[6] rounded-xl"
                transform={`rotate(${formatHourAngle(activeHour, activeMinute)} 100 100)`}
              />

              {/* Minute hand */}
              <line
                x1="100"
                y1="100"
                x2="100"
                y2="30"
                className="stroke-violet-600 stroke-[4] rounded-xl"
                transform={`rotate(${formatMinuteAngle(activeMinute)} 100 100)`}
              />

              {/* Center decorative ring pin */}
              <circle cx="100" cy="100" r="7" className="fill-violet-500 stroke-white stroke-2" />
            </svg>
          </div>

          {/* Interactive Mode or Quiz multiple choices Panel */}
          <div className="flex-1 w-full max-w-xs text-center md:text-left flex flex-col justify-center">
            {mode === 'quiz' ? (
              <div>
                <p className="text-xs font-black uppercase text-cyan-400 tracking-wider mb-2">
                  ⏰ Read the clock!
                </p>
                <h3 className="text-base font-bold text-white mb-6 leading-relaxed">
                  {activeQuestion.instruction}
                </h3>

                {/* Choices cards */}
                <div className="grid grid-cols-2 gap-4">
                  {activeQuestion.choices.map((choice) => {
                    const isSelected = selectedAnswer === choice;
                    const formatTarget = `${activeQuestion.targetHour}:${activeQuestion.targetMinute === 0 ? '00' : activeQuestion.targetMinute}`;
                    const isCorrect = choice === formatTarget;

                    return (
                      <motion.button
                        key={choice}
                        disabled={isAnswered}
                        onClick={() => handleChoiceSelect(choice)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className={`py-4 rounded-2xl font-black text-lg transition-all cursor-pointer border-2 shadow-sm ${
                          isAnswered
                            ? isCorrect
                              ? 'bg-emerald-600 border-emerald-500 text-white'
                              : isSelected
                              ? 'bg-rose-600 border-rose-500 text-white'
                              : 'bg-slate-900 border-slate-800 text-slate-500'
                            : 'bg-slate-900 border-violet-900/50 hover:bg-slate-800 text-white'
                        }`}
                      >
                        {choice}
                      </motion.button>
                    );
                  })}
                </div>
              </div>
            ) : (
              /* Setinteractive hand mode console panel */
              <div className="text-center md:text-left">
                <span className="text-xs font-black uppercase text-pink-400 tracking-widest block mb-1">
                  🔧 SET THE TIME MISSION
                </span>
                <h2 className="text-2xl font-black text-white leading-tight">
                  Set details to: <span className="text-yellow-400 font-extrabold">{targetSetTime.hour}:{targetSetTime.minute === 0 ? '00' : targetSetTime.minute}</span>
                </h2>
                <p className="text-xs text-slate-400 mt-1 mb-5">
                  Use the green and red knobs below to move the clock hands!
                </p>

                {/* Digital readout helper */}
                <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-2xl mb-5 text-center">
                  <span className="text-gray-400 text-[10px] font-bold uppercase tracking-widest block">Current Hand positions</span>
                  <span className="text-3xl font-black text-white tracking-wider animate-pulse font-mono">
                    {interactiveHour}:{interactiveMinute === 0 ? '00' : interactiveMinute}
                  </span>
                </div>

                {/* Knobs controls */}
                <div className="flex flex-col gap-3">
                  <div className="flex gap-2.5">
                    <button
                      onClick={() => adjustInteractiveTime(1, 0)}
                      className="flex-1 py-2 rounded-xl bg-violet-600 text-xs font-black shadow-sm"
                    >
                      +1 Hour ⏰
                    </button>
                    <button
                      onClick={() => adjustInteractiveTime(0, 15)}
                      className="flex-1 py-2 rounded-xl bg-pink-600 text-xs font-black shadow-sm"
                    >
                      +15 Mins ⏱️
                    </button>
                  </div>

                  <button
                    onClick={verifyInteractiveHandSetting}
                    className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-black text-sm rounded-xl hover:shadow-lg transition-shadow uppercase tracking-wider"
                  >
                    Check Time Match ✅
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>

        {/* Tip status banner */}
        <div className="mt-8 p-3 rounded-2xl bg-slate-950/40 border border-violet-950 text-center max-w-sm mx-auto w-full">
          <p className="text-[10px] text-slate-400 font-extrabold uppercase leading-normal">
            ⭐ Correctly solve or set 5 clocks to power the astronaut sun dial and earn stars!
          </p>
        </div>

      </div>

      {/* Win celebration prompt */}
      <AnimatePresence>
        {isWon && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-40 text-center"
          >
            <motion.div 
              initial={{ scale: 0.8, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-slate-900 rounded-3xl p-6 md:p-8 max-w-sm w-full border-4 border-amber-400 shadow-2xl relative text-white"
            >
              <div className="absolute -top-14 left-1/2 -translate-x-1/2 bg-amber-400 p-4 rounded-full border-4 border-slate-900 shadow-lg animate-bounce">
                <Trophy className="w-12 h-12 text-slate-950" />
              </div>

              <h3 className="text-3xl font-black text-amber-400 mt-8 mb-2">
                Time Wizard! ⏰🎉
              </h3>
              <p className="text-slate-300 font-medium mb-6 leading-relaxed">
                Splendid work! You verified all clock configurations perfectly! You earned <span className="font-bold text-amber-400 text-lg">3 Gold Stars</span>!
              </p>

              <div className="flex flex-col gap-2">
                <button
                  onClick={handleFinish}
                  className="w-full bg-gradient-to-r from-violet-500 to-pink-500 text-white font-black py-3 px-6 rounded-2xl shadow-md transition-all text-lg cursor-pointer"
                >
                  Save Time-Travel Stars! ⭐
                </button>
                <button
                  onClick={resetGame}
                  className="w-full bg-slate-800 text-slate-300 font-bold py-2 rounded-xl text-xs transition-colors"
                >
                  Practice Again
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
