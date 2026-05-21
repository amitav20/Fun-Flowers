import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { soundManager } from '../../utils/sound';
import { ArrowLeft, Star, Volume2, Play, Square, CirclePlus, RefreshCw, Trophy } from 'lucide-react';

interface AnimalInstrument {
  id: string;
  name: string;
  emoji: string;
  color: string;
  ambientColor: string;
  borderColor: string;
  textColor: string;
  actionWord: string;
}

const ORCHESTRA_ANIMALS: AnimalInstrument[] = [
  {
    id: 'cow',
    name: 'Daisy the Cow',
    emoji: '🐮',
    color: 'from-amber-100 to-amber-200',
    ambientColor: 'bg-amber-50',
    borderColor: 'border-amber-300',
    textColor: 'text-amber-800',
    actionWord: 'MOO-O-O!'
  },
  {
    id: 'duck',
    name: 'Quigley the Duck',
    emoji: '🦆',
    color: 'from-yellow-100 to-yellow-200',
    ambientColor: 'bg-yellow-50',
    borderColor: 'border-yellow-300',
    textColor: 'text-yellow-800',
    actionWord: 'QUACK QUACK!'
  },
  {
    id: 'cat',
    name: 'Cleo the Cat',
    emoji: '🐱',
    color: 'from-pink-100 to-pink-200',
    ambientColor: 'bg-pink-50',
    borderColor: 'border-pink-300',
    textColor: 'text-pink-800',
    actionWord: 'MEOW!'
  },
  {
    id: 'lion',
    name: 'Leo the Lion',
    emoji: '🦁',
    color: 'from-orange-100 to-orange-200',
    ambientColor: 'bg-orange-50',
    borderColor: 'border-orange-300',
    textColor: 'text-orange-800',
    actionWord: 'ROARRR!'
  },
  {
    id: 'frog',
    name: 'Barnaby the Frog',
    emoji: '🐸',
    color: 'from-green-100 to-green-200',
    ambientColor: 'bg-green-50',
    borderColor: 'border-green-300',
    textColor: 'text-green-800',
    actionWord: 'RIBBIT!'
  },
  {
    id: 'sheep',
    name: 'Shirley the Sheep',
    emoji: '🐑',
    color: 'from-indigo-100 to-indigo-200',
    ambientColor: 'bg-indigo-50',
    borderColor: 'border-indigo-300',
    textColor: 'text-indigo-800',
    actionWord: 'BAAA-A!'
  },
  {
    id: 'bird',
    name: 'Bluey the Bird',
    emoji: '🐦',
    color: 'from-sky-100 to-sky-200',
    ambientColor: 'bg-sky-50',
    borderColor: 'border-sky-300',
    textColor: 'text-sky-800',
    actionWord: 'CHIRP CHIRP!'
  }
];

interface GameProps {
  onBack: () => void;
  onGameComplete: (starsEarned: number) => void;
}

export default function AnimalSoundOrchestra({ onBack, onGameComplete }: GameProps) {
  const [recordedSequence, setRecordedSequence] = useState<string[]>([]);
  const [isPlayingSequence, setIsPlayingSequence] = useState(false);
  const [activeAnimalId, setActiveAnimalId] = useState<string | null>(null);
  const [conductedConcertCount, setConductedConcertCount] = useState(0);
  const [isWon, setIsWon] = useState(false);
  const [mode, setMode] = useState<'free' | 'remix' | 'simon'>('free'); // free, remix or Simon Says Level

  // Simon Says Specific States
  const [simonSequence, setSimonSequence] = useState<string[]>([]);
  const [simonInputIdx, setSimonInputIdx] = useState(0);
  const [isReplayingSimon, setIsReplayingSimon] = useState(false);
  const [simonPhase, setSimonPhase] = useState<'idle' | 'watch' | 'repeat' | 'success' | 'fail'>('idle');

  const targetConcertGoal = 3;

  const startSimonRound = async () => {
    if (isReplayingSimon) return;
    setSimonPhase('watch');
    setIsReplayingSimon(true);
    setSimonInputIdx(0);
    
    // Choose 3 random animals
    const animals = ['cow', 'duck', 'cat', 'lion', 'frog', 'sheep', 'bird'];
    const sequence: string[] = [];
    for (let i = 0; i < 3; i++) {
      sequence.push(animals[Math.floor(Math.random() * animals.length)]);
    }
    setSimonSequence(sequence);

    // Dynamic Flash Playback
    await new Promise((resolve) => setTimeout(resolve, 650));
    for (const animalId of sequence) {
      setActiveAnimalId(animalId);
      soundManager.playAnimalSound(animalId);
      await new Promise((resolve) => setTimeout(resolve, 650));
      setActiveAnimalId(null);
      await new Promise((resolve) => setTimeout(resolve, 150));
    }

    setIsReplayingSimon(false);
    setSimonPhase('repeat');
  };

  const handleAnimalTap = (animalId: string) => {
    if (isPlayingSequence || isReplayingSimon) return;
    
    // Play localized customized client-side synthesizer sound
    soundManager.playAnimalSound(animalId);
    setActiveAnimalId(animalId);
    setTimeout(() => {
      setActiveAnimalId(null);
    }, 550);

    // Simon Says Mode Tracker
    if (mode === 'simon') {
      if (simonPhase !== 'repeat') return;
      const expectedId = simonSequence[simonInputIdx];

      if (animalId === expectedId) {
        // Correct tap!
        const nextInputIdx = simonInputIdx + 1;
        setSimonInputIdx(nextInputIdx);

        if (nextInputIdx === simonSequence.length) {
          // Completed sequence successfully!
          setSimonPhase('success');
          soundManager.playCorrect();
          const nextConcert = conductedConcertCount + 1;
          setConductedConcertCount(nextConcert);

          if (nextConcert >= targetConcertGoal) {
            setTimeout(() => {
              setIsWon(true);
              soundManager.playSuccess();
            }, 800);
          } else {
            // Automatically launch next Simon round
            setTimeout(() => {
              startSimonRound();
            }, 1200);
          }
        }
      } else {
        // Oops! Incorrect match
        setSimonPhase('fail');
        soundManager.playWrong();
        setSimonInputIdx(0);
        setTimeout(() => {
          setSimonPhase('repeat');
          startSimonRound();
        }, 1500);
      }
      return;
    }

    // Record sequence
    if (mode === 'remix') {
      if (recordedSequence.length < 8) {
        setRecordedSequence((prev) => [...prev, animalId]);
      }
    }
  };

  const clearSequence = () => {
    soundManager.playBubble();
    setRecordedSequence([]);
  };

  const playBackSequence = async () => {
    if (recordedSequence.length === 0 || isPlayingSequence) return;
    
    setIsPlayingSequence(true);
    soundManager.playSparkle();

    for (let i = 0; i < recordedSequence.length; i++) {
       const animalId = recordedSequence[i];
       setActiveAnimalId(animalId);
       soundManager.playAnimalSound(animalId);
       await new Promise((resolve) => setTimeout(resolve, 500));
       setActiveAnimalId(null);
       await new Promise((resolve) => setTimeout(resolve, 100)); // gap
    }

    setIsPlayingSequence(false);
    
    // Increase progress toward star badge!
    const nextConcertCount = conductedConcertCount + 1;
    setConductedConcertCount(nextConcertCount);

    if (nextConcertCount >= targetConcertGoal) {
      setTimeout(() => {
        setIsWon(true);
        soundManager.playSuccess();
      }, 500);
    } else {
      soundManager.playSparkle();
    }
  };

  const handleFinish = () => {
    onGameComplete(3); // Awards 3 Stars
  };

  const resetGame = () => {
    setRecordedSequence([]);
    setConductedConcertCount(0);
    setIsWon(false);
    setMode('free');
    setSimonSequence([]);
    setSimonInputIdx(0);
    setSimonPhase('idle');
  };

  return (
    <div id="animal-sound-orchestra-game" className="flex flex-col h-full bg-gradient-to-b from-indigo-50 via-purple-50 to-pink-50 select-none overflow-hidden relative">
      
      {/* Game Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between p-4 bg-white/70 backdrop-blur-md border-b border-indigo-100 z-10 gap-3">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-3 py-2 text-indigo-700 bg-indigo-100 hover:bg-indigo-200 rounded-2xl font-semibold transition-all shadow-sm cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back</span>
        </button>

        <div className="flex items-center gap-2 bg-amber-50 px-4 py-1.5 rounded-full border border-amber-200 shadow-sm">
          <Star className="w-5 h-5 text-amber-500 fill-amber-400 animate-pulse" />
          <span className="font-bold text-indigo-900 text-sm md:text-base">
            {mode === 'simon' ? 'Simon Streak: ' : 'Concerts: '} {conductedConcertCount}/{targetConcertGoal}
          </span>
        </div>

        <div className="font-bold text-indigo-800 text-sm md:text-base bg-indigo-200/50 px-3 py-1.5 rounded-2xl capitalize">
          {mode === 'free' ? '🍃 Level 1: Sandbox' : mode === 'remix' ? '💿 Level 2: Recorder' : '👑 Level 3: Simon Mimic'}
        </div>
      </div>

      {/* Main Sandbox Workspace grid wrapper */}
      <div className="flex-1 p-4 md:p-6 overflow-y-auto max-w-4xl mx-auto w-full flex flex-col justify-between">
        
        {/* Helper Prompt and Title info */}
        <div className="text-center mb-6">
          <h1 className="text-2xl md:text-3.5xl font-black text-indigo-900 tracking-tight">
            🦁 Animal Orchestra Playroom 🎵
          </h1>
          <p className="text-xs md:text-sm font-semibold text-indigo-600 mt-1">
            {mode === 'simon' 
              ? 'Watch and listen to the animals, then tap them in the exact same order! 📣' 
              : 'Tap the sweet animals to make music! Record an interactive concert to earn stars!'}
          </p>

          {/* Toggle modes */}
          <div className="flex justify-center gap-3 mt-4 flex-wrap">
            <button
              onClick={() => { soundManager.playBubble(); resetGame(); setMode('free'); }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                mode === 'free' 
                  ? 'bg-indigo-600 text-white shadow-md' 
                  : 'bg-white border border-indigo-150 text-indigo-600 hover:bg-indigo-50/50'
              }`}
            >
              🍃 Level 1: Sandbox
            </button>
            <button
              onClick={() => { soundManager.playBubble(); resetGame(); setMode('remix'); }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                mode === 'remix' 
                  ? 'bg-purple-600 text-white shadow-md' 
                  : 'bg-white border border-purple-150 text-purple-600 hover:bg-purple-50/50'
              }`}
            >
              💿 Level 2: Recorder
            </button>
            <button
              onClick={() => { soundManager.playBubble(); resetGame(); setMode('simon'); }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                mode === 'simon' 
                  ? 'bg-rose-600 text-white shadow-md' 
                  : 'bg-white border border-rose-150 text-rose-600 hover:bg-rose-50/50'
              }`}
            >
              👑 Level 3: Simon Says
            </button>
          </div>
        </div>

        {/* Dynamic Soundboard Instrument Panel grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 md:gap-6 my-auto">
          {ORCHESTRA_ANIMALS.map((animal) => {
            const isActive = activeAnimalId === animal.id;
            return (
              <motion.div
                key={animal.id}
                onClick={() => handleAnimalTap(animal.id)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`relative rounded-3xl p-4 md:p-5 border-2 border-b-8 cursor-pointer text-center select-none bg-gradient-to-br ${animal.color} ${animal.borderColor} transition-all duration-150 shadow-md ${
                  isActive ? 'scale-110 !border-b-2 translate-y-2 border-indigo-400 shadow-indigo-200' : ''
                }`}
              >
                <div className="text-5xl md:text-6xl mb-2 flex items-center justify-center h-16 pointer-events-none">
                  <motion.span
                    animate={isActive ? { rotate: [0, -15, 15, -15, 0], scale: [1, 1.2, 1] } : {}}
                    transition={{ duration: 0.5 }}
                  >
                    {animal.emoji}
                  </motion.span>
                </div>
                
                <h3 className="font-extrabold text-sm md:text-base text-slate-800 pointer-events-none">
                  {animal.name}
                </h3>

                <AnimatePresence>
                  {isActive && (
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      className="absolute inset-0 bg-white/95 rounded-3xl flex flex-col items-center justify-center p-3"
                    >
                      <span className="text-4xl">{animal.emoji}</span>
                      <span className="font-black text-indigo-900 tracking-wider text-sm mt-1 animate-pulse">
                        {animal.actionWord}
                      </span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}

          {/* Special Stage Director Board card */}
          {mode === 'remix' && (
            <div className="col-span-1 border-2 border-dashed border-indigo-300 rounded-3xl p-4 flex flex-col items-center justify-center bg-indigo-50/50 text-center">
              <span className="text-3xl mb-1">👑</span>
              <p className="font-bold text-xs text-indigo-900">Stage Maestro</p>
              <p className="text-[10px] text-indigo-500 mt-1 max-w-[120px]">
                Create a loop, and play back your concert!
              </p>
            </div>
          )}
        </div>

        {/* Stage Recorder / Live Sequence player console */}
        <div className="mt-8 bg-white rounded-3xl p-4 md:p-5 shadow-lg border border-indigo-100 flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
              <p className="font-extrabold text-indigo-950 text-xs sm:text-sm">
                {mode === 'remix' 
                  ? '🎤 My Concert Sound Tape (Max 8 Steps)' 
                  : mode === 'simon' 
                  ? '👑 Simon Says Live Sound Matcher' 
                  : '💡 Dynamic Free Play sandbox panel'}
              </p>
            </div>
            {mode === 'remix' && recordedSequence.length > 0 && (
              <button
                onClick={clearSequence}
                className="text-xs font-black text-rose-500 hover:text-rose-600 flex items-center gap-1 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            )}
          </div>

          {mode === 'remix' ? (
            <div className="flex flex-col gap-4">
              {/* Tape sequence notes representer */}
              <div className="flex gap-2.5 items-center p-3 bg-slate-50 border border-slate-100 rounded-2xl overflow-x-auto min-h-[60px]">
                {recordedSequence.length === 0 ? (
                  <p className="text-xs text-slate-400 font-semibold mx-auto">
                    No animals added yet! Tap animals above to compose a song 🎵
                  </p>
                ) : (
                  recordedSequence.map((animalId, index) => {
                    const profile = ORCHESTRA_ANIMALS.find((a) => a.id === animalId);
                    return (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, scale: 0.7 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className={`w-10 h-10 rounded-full flex items-center justify-center text-xl bg-gradient-to-br ${profile?.color || 'from-indigo-150 to-indigo-250'} border shadow-sm relative shrink-0`}
                      >
                        {profile?.emoji}
                        <span className="absolute -bottom-1 -right-1 bg-indigo-600 text-white rounded-full text-[8px] px-1 font-bold">
                          {index + 1}
                        </span>
                      </motion.div>
                    );
                  })
                )}
              </div>

              {/* Action conductors */}
              <div className="flex gap-4">
                <button
                  disabled={recordedSequence.length === 0 || isPlayingSequence}
                  onClick={playBackSequence}
                  className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:from-indigo-300 disabled:to-purple-300 disabled:cursor-not-allowed text-white text-sm font-black py-3 px-4 rounded-xl shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>{isPlayingSequence ? 'Playing Concert...' : 'Play Concert Reel 🎸'}</span>
                </button>
              </div>
            </div>
          ) : mode === 'simon' ? (
            <div className="p-4 rounded-2xl bg-rose-50/50 border border-rose-100 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-left">
                {simonPhase === 'idle' && (
                  <>
                    <p className="text-xs font-bold text-rose-900">🎮 Ready for Level 3 challenge?</p>
                    <p className="text-[11px] text-rose-700 mt-0.5">
                      Click start to hear an animal sequence and repeat it from memory!
                    </p>
                  </>
                )}
                {simonPhase === 'watch' && (
                  <>
                    <p className="text-xs font-bold text-rose-900 animate-pulse">👀 Listen & Watch Closely!</p>
                    <p className="text-[11px] text-rose-700 mt-0.5">
                      The orchestra is flashing a magical combination order...
                    </p>
                  </>
                )}
                {simonPhase === 'repeat' && (
                  <>
                    <p className="text-xs font-bold text-rose-900">👉 Repeat the Sequence!</p>
                    <p className="text-[11px] text-rose-700 mt-0.5">
                      Tap the flashing animals! Progress: <span className="font-extrabold text-rose-600">{simonInputIdx} of {simonSequence.length}</span>
                    </p>
                  </>
                )}
                {simonPhase === 'success' && (
                  <>
                    <p className="text-xs font-bold text-emerald-800">🎉 Fantastic Mastery!</p>
                    <p className="text-[11px] text-emerald-700 mt-0.5">
                      You matched the sequence perfectly! Ready for the next one?
                    </p>
                  </>
                )}
                {simonPhase === 'fail' && (
                  <>
                    <p className="text-xs font-bold text-rose-800">😢 Oh, Wrong Animal!</p>
                    <p className="text-[11px] text-rose-700 mt-0.5">
                      Don't worry, let's watch the melody play one more time!
                    </p>
                  </>
                )}
              </div>
              <button
                disabled={isReplayingSimon}
                onClick={startSimonRound}
                className="px-5 py-2.5 bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white font-black text-xs rounded-xl shadow-md cursor-pointer disabled:opacity-50"
              >
                {simonPhase === 'idle' ? '🟢 Start Game' : '🔄 Play Again'}
              </button>
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100 flex items-center justify-between">
              <div className="text-left">
                <p className="text-xs font-bold text-indigo-900">🌟 Conducting Practice</p>
                <p className="text-[11px] text-indigo-600 mt-0.5 max-w-[320px]">
                  Switch to <b>Recorder Mode</b> or <b>Simon Says</b> and show your extreme musical memory skills!
                </p>
              </div>
              <button
                onClick={() => { soundManager.playBubble(); setMode('remix'); }}
                className="px-3.5 py-1.5 bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-black text-xs rounded-lg shadow-sm cursor-pointer"
              >
                Go Record 💿
              </button>
            </div>
          )}
        </div>

      </div>

      {/* Level Win Celebration Popup modal */}
      <AnimatePresence>
        {isWon && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-md flex items-center justify-center p-4 z-40 text-center"
          >
            <motion.div 
              initial={{ scale: 0.8, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-white rounded-3xl p-6 md:p-8 max-w-sm w-full border-4 border-amber-400 shadow-2xl relative"
            >
              <div className="absolute -top-14 left-1/2 -translate-x-1/2 bg-amber-400 p-4 rounded-full border-4 border-white shadow-lg animate-bounce">
                <Trophy className="w-12 h-12 text-amber-950" />
              </div>

              <h3 className="text-3xl font-black text-slate-950 mt-8 mb-2">
                Spectacular Tune! 🎉
              </h3>
              <p className="text-gray-600 font-medium mb-6">
                You successfully composed and conducted {conductedConcertCount} animal concerts! You earned <span className="font-bold text-amber-500 text-lg">3 Gold Stars</span>!
              </p>

              <div className="flex flex-col gap-2">
                <button
                  onClick={handleFinish}
                  className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-black py-3 px-6 rounded-2xl shadow-md transition-all text-lg cursor-pointer"
                >
                  Save Gold Stars! ⭐
                </button>
                <button
                  onClick={resetGame}
                  className="w-full bg-slate-100 text-slate-700 font-bold py-2 rounded-xl text-xs transition-all"
                >
                  Compose More Music
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
