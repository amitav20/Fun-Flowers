import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { soundManager } from '../../utils/sound';
import { ArrowLeft, Star, Volume2, Music, RefreshCw, Trophy, Play, CircleDot } from 'lucide-react';

interface PianoKey {
  note: string;
  frequency: number;
  color: string;
  emoji: string;
  borderColor: string;
  shadowColor: string;
}

const PIANO_KEYS: PianoKey[] = [
  { note: 'C', frequency: 261.63, color: 'bg-gradient-to-t from-red-500 to-red-400', emoji: '🐶', borderColor: 'border-red-600', shadowColor: 'shadow-red-200' },
  { note: 'D', frequency: 293.66, color: 'bg-gradient-to-t from-orange-500 to-orange-400', emoji: '🐱', borderColor: 'border-orange-600', shadowColor: 'shadow-orange-200' },
  { note: 'E', frequency: 329.63, color: 'bg-gradient-to-t from-yellow-500 to-yellow-400', emoji: '🦁', borderColor: 'border-yellow-600', shadowColor: 'shadow-yellow-250' },
  { note: 'F', frequency: 349.23, color: 'bg-gradient-to-t from-green-500 to-green-400', emoji: '🐸', borderColor: 'border-green-600', shadowColor: 'shadow-green-200' },
  { note: 'G', frequency: 392.00, color: 'bg-gradient-to-t from-teal-500 to-teal-400', emoji: '🐳', borderColor: 'border-teal-600', shadowColor: 'shadow-teal-200' },
  { note: 'A', frequency: 440.00, color: 'bg-gradient-to-t from-blue-500 to-blue-400', emoji: '🐹', borderColor: 'border-blue-600', shadowColor: 'shadow-blue-200' },
  { note: 'B', frequency: 493.88, color: 'bg-gradient-to-t from-purple-500 to-purple-400', emoji: '🦊', borderColor: 'border-purple-600', shadowColor: 'shadow-purple-200' },
  { note: 'C2', frequency: 523.25, color: 'bg-gradient-to-t from-pink-500 to-pink-400', emoji: '🦄', borderColor: 'border-pink-600', shadowColor: 'shadow-pink-200' },
];

interface NurserySong {
  title: string;
  instructions: string;
  notes: string[]; // sequence of notes to follow
  level: 'easy' | 'medium' | 'hard';
}

const SONGS: NurserySong[] = [
  {
    title: 'Twinkle Twinkle 🌟',
    instructions: 'Follow the star notes!',
    notes: ['C', 'C', 'G', 'G', 'A', 'A', 'G'],
    level: 'easy'
  },
  {
    title: 'Row Your Boat 🛶',
    instructions: "Let's sail the music stream!",
    notes: ['C', 'C', 'C', 'D', 'E', 'D', 'E'],
    level: 'easy'
  },
  {
    title: 'Mary Had A Little Lamb 🐑',
    instructions: 'Tap the gentle note path!',
    notes: ['E', 'D', 'C', 'D', 'E', 'E', 'E'],
    level: 'medium'
  },
  {
    title: 'Frere Jacques 🔔',
    instructions: 'Ding dang dong!',
    notes: ['C', 'D', 'E', 'C', 'C', 'D', 'E', 'C'],
    level: 'medium'
  },
  {
    title: 'Ode To Joy 🌠',
    instructions: 'Joyful, joyful, we adore thee!',
    notes: ['E', 'E', 'F', 'G', 'G', 'F', 'E', 'D'],
    level: 'hard'
  },
  {
    title: 'Jingle Bells ❄️',
    instructions: 'Dashing through the snow!',
    notes: ['E', 'E', 'E', 'E', 'E', 'E', 'E', 'G', 'C', 'D', 'E'],
    level: 'hard'
  }
];

interface GameProps {
  onBack: () => void;
  onGameComplete: (starsEarned: number) => void;
}

export default function RainbowPiano({ onBack, onGameComplete }: GameProps) {
  const [pianoLevel, setPianoLevel] = useState<'easy' | 'medium' | 'hard'>('easy');
  const [activeNote, setActiveNote] = useState<string | null>(null);
  const [songMode, setSongMode] = useState<boolean>(false);
  const [selectedSongIdx, setSelectedSongIdx] = useState<number>(0);
  const [songProgressIdx, setSongProgressIdx] = useState<number>(0);
  const [playCount, setPlayCount] = useState<number>(0);
  const [isWon, setIsWon] = useState<boolean>(false);
  const [autoPlaying, setAutoPlaying] = useState<boolean>(false);

  const targetPlayForWin = 12; // 12 notes tapped for win
  const filteredSongs = SONGS.filter((s) => s.level === pianoLevel);
  const activeSong = filteredSongs[selectedSongIdx % filteredSongs.length] || filteredSongs[0];

  const syntheticPianoSound = (frequency: number) => {
    // Standard direct audio synthesize for gorgeous baby-friendly piano chimes
    if (typeof window === 'undefined') return;
    try {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioCtxClass();
      const now = ctx.currentTime;

      // Note oscillator sine + triangle mix
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gainNode = ctx.createGain();

      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(frequency, now);

      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(frequency * 2, now); // Overtones

      gainNode.gain.setValueAtTime(0.35, now);
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.8);

      osc1.connect(gainNode);
      osc2.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 0.85);
      osc2.stop(now + 0.85);
    } catch (e) {
      console.error(e);
    }
  };

  const handleKeyPress = (noteObj: PianoKey) => {
    if (autoPlaying) return;

    syntheticPianoSound(noteObj.frequency);
    setActiveNote(noteObj.note);

    setTimeout(() => {
      setActiveNote(null);
    }, 450);

    // Score evaluation
    if (songMode) {
      const targetNote = activeSong.notes[songProgressIdx];
      if (noteObj.note === targetNote) {
        soundManager.playCorrect();
        const nextProgress = songProgressIdx + 1;
        if (nextProgress >= activeSong.notes.length) {
          // Song completed!
          setSongProgressIdx(0);
          soundManager.playSuccess();
          setPlayCount((prev) => prev + 5);
          triggerEvaluation(playCount + 5);
        } else {
          setSongProgressIdx(nextProgress);
        }
      } else {
        // Did not match note precisely: soft reset index or allow mistakes for toddlers
        setSongProgressIdx(0);
      }
    } else {
      // Free play mode: increment standard progress
      const nextPlayCount = playCount + 1;
      setPlayCount(nextPlayCount);
      triggerEvaluation(nextPlayCount);
    }
  };

  const triggerEvaluation = (currentCount: number) => {
    if (currentCount >= targetPlayForWin) {
      setTimeout(() => {
        setIsWon(true);
        soundManager.playSuccess();
      }, 700);
    }
  };

  const startAutoPlay = async () => {
    if (autoPlaying) return;
    setAutoPlaying(true);
    soundManager.playSparkle();

    const notesToPlay = activeSong.notes;
    for (let i = 0; i < notesToPlay.length; i++) {
      const matchNote = PIANO_KEYS.find((k) => k.note === notesToPlay[i]);
      if (matchNote) {
        setActiveNote(matchNote.note);
        syntheticPianoSound(matchNote.frequency);
        await new Promise((resolve) => setTimeout(resolve, 500));
        setActiveNote(null);
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
    }

    setAutoPlaying(false);
    setPlayCount((prev) => prev + 6);
    triggerEvaluation(playCount + 6);
  };

  const handleFinish = () => {
    onGameComplete(3); // Save 3 beautiful stars
  };

  const resetPiano = () => {
    setSongProgressIdx(0);
    setPlayCount(0);
    setIsWon(false);
    setSongMode(false);
    setAutoPlaying(false);
  };

  return (
    <div id="rainbow-piano-game" className="flex flex-col h-full bg-gradient-to-b from-red-50 via-teal-50 to-pink-100 select-none overflow-hidden relative">
      
      {/* Game Custom Header */}
      <div className="flex items-center justify-between p-4 bg-white/70 backdrop-blur-md border-b border-rose-100 z-10">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-3 py-2 text-rose-700 bg-rose-100 hover:bg-rose-200 rounded-2xl font-semibold transition-all shadow-sm cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back</span>
        </button>

        <div className="flex items-center gap-2 bg-amber-50 px-4 py-1.5 rounded-full border border-amber-200 shadow-sm">
          <Star className="w-5 h-5 text-amber-500 fill-amber-300 animate-bounce" />
          <span className="font-bold text-rose-950 text-sm md:text-base">
            Music Practice: {Math.min(playCount, targetPlayForWin)}/{targetPlayForWin} 🌟
          </span>
        </div>

        <button
          onClick={resetPiano}
          className="p-2 text-slate-500 hover:text-rose-600 bg-slate-100 hover:bg-rose-50 rounded-full transition-colors"
        >
          <RefreshCw className="w-5 h-5" />
        </button>
      </div>

      {/* Main Container Sandbox */}
      <div className="flex-1 p-4 md:p-6 overflow-y-auto max-w-4xl mx-auto w-full flex flex-col justify-between">
        
        {/* Title details */}
        <div className="text-center mb-4">
          <h1 className="text-2xl md:text-3.5xl font-black text-rose-800 tracking-tight">
            🌈 Musical Rainbow Piano 🎹
          </h1>
          <p className="text-xs md:text-sm text-slate-500 font-semibold mt-1">
            Play beautiful synthesizer keys to make delightful melodies and learn songs!
          </p>

          {/* Mode selections */}
          <div className="flex justify-center gap-3 mt-4">
            <button
              onClick={() => { soundManager.playBubble(); setSongMode(false); }}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${
                !songMode 
                  ? 'bg-rose-600 text-white shadow-md' 
                  : 'bg-white border border-rose-100 text-rose-600 hover:bg-rose-50'
              }`}
            >
              ⭐ Free Play Sandbox
            </button>
            <button
              onClick={() => { soundManager.playBubble(); setSongMode(true); setSongProgressIdx(0); }}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${
                songMode 
                  ? 'bg-purple-600 text-white shadow-md' 
                  : 'bg-white border border-purple-100 text-purple-600 hover:bg-purple-50'
              }`}
            >
              🎵 Nursery Melody Guide
            </button>
          </div>
        </div>

        {/* Nursery Song details and highlights if active */}
        {songMode && (
          <div className="bg-white/80 border border-purple-150 rounded-2xl p-4 shadow-sm text-center mb-6 max-w-xl mx-auto w-full">
            {/* Song Level Toggles */}
            <div className="flex justify-center gap-2 mb-3 bg-purple-100/30 p-1.5 rounded-xl border border-purple-200/20 max-w-xs mx-auto">
              {(['easy', 'medium', 'hard'] as const).map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => {
                    soundManager.playBubble();
                    setPianoLevel(lvl);
                    setSelectedSongIdx(0);
                    setSongProgressIdx(0);
                  }}
                  className={`px-3 py-1 text-[10px] font-black rounded-lg transition-all capitalize cursor-pointer ${
                    pianoLevel === lvl
                      ? 'bg-purple-600 text-white shadow-sm'
                      : 'text-purple-700 hover:bg-purple-100/60'
                  }`}
                >
                  {lvl === 'easy' ? '🍃 Easy' : lvl === 'medium' ? '⭐ Med' : '👑 Hard'}
                </button>
              ))}
            </div>

            <div className="flex justify-between items-center mb-2">
              <span className="text-[10px] font-black text-purple-600 uppercase tracking-wider">Lesson melody</span>
              <div className="flex gap-1">
                {filteredSongs.map((song, idx) => (
                  <button
                    key={idx}
                    onClick={() => { soundManager.playBubble(); setSelectedSongIdx(idx); setSongProgressIdx(0); }}
                    className={`px-2 py-1 text-[10px] rounded-lg font-bold cursor-pointer ${
                      selectedSongIdx % filteredSongs.length === idx ? 'bg-purple-600 text-white' : 'bg-purple-100 text-purple-700'
                    }`}
                  >
                    {song.title.split(' ')[0]} {/* first word or emoji */}
                  </button>
                ))}
              </div>
            </div>

            <h3 className="font-extrabold text-base text-slate-800">{activeSong.title}</h3>
            <p className="text-xs text-purple-500 mt-1">{activeSong.instructions}</p>

            {/* Note steps progression highlights */}
            <div className="flex items-center justify-center gap-2 mt-3 p-2 bg-purple-50/50 rounded-xl overflow-x-auto">
              {activeSong.notes.map((note, index) => {
                const isActive = index === songProgressIdx;
                const isPassed = index < songProgressIdx;
                return (
                  <div
                    key={index}
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold leading-none ${
                      isActive 
                        ? 'bg-amber-400 text-amber-950 ring-2 ring-amber-500 animate-pulse font-black' 
                        : isPassed 
                        ? 'bg-emerald-500 text-white' 
                        : 'bg-slate-200 text-slate-500'
                    }`}
                  >
                    {note}
                  </div>
                );
              })}
            </div>

            {/* Autoplay chimes player */}
            <button
              onClick={startAutoPlay}
              disabled={autoPlaying}
              className="mt-3.5 mx-auto px-4 py-1.5 bg-gradient-to-r from-purple-500 to-indigo-500 text-white text-[11px] font-black rounded-lg flex items-center gap-1 hover:shadow-md transition-shadow cursor-pointer disabled:opacity-50"
            >
              <Play className="w-3 h-3 fill-current" />
              <span>{autoPlaying ? 'Singing melody...' : 'Autoplay Demo 🎵'}</span>
            </button>
          </div>
        )}

        {/* Massive, lovely Rainbow Piano Keyboard */}
        <div className="my-auto py-2 flex items-stretch justify-center gap-2 h-64 md:h-80 w-full overflow-x-auto whitespace-nowrap px-1">
          {PIANO_KEYS.map((key) => {
            const isTapped = activeNote === key.note;
            const songNoteToTap = songMode ? activeSong.notes[songProgressIdx] : null;
            const isHighlightedForSong = songMode && key.note === songNoteToTap;

            return (
              <motion.div
                key={key.note}
                onClick={() => handleKeyPress(key)}
                whileTap={{ scaleY: 0.94 }}
                className={`relative w-12 sm:w-16 md:w-20 rounded-b-3xl border-b-[10px] sm:border-b-[14px] ${key.borderColor} ${key.color} shadow-lg cursor-pointer ${key.shadowColor} select-none transition-all flex flex-col justify-between p-3 shrink-0 ${
                  isTapped ? '!border-b-2 translate-y-2 brightness-110' : ''
                }`}
              >
                {/* Highlighted ripple dot indicator for children guidance */}
                {isHighlightedForSong && (
                  <span className="absolute top-4 left-1/2 -translate-x-1/2 flex h-3.5 w-3.5 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-white shadow-sm flex items-center justify-center">
                      <CircleDot className="w-2.5 h-2.5 text-rose-500" />
                    </span>
                  </span>
                )}

                {/* Piano face note sticker */}
                <div className="text-2xl sm:text-3.5xl md:text-4.5xl flex items-center justify-center h-14 select-none pointer-events-none mb-4">
                  <motion.span
                    animate={isTapped ? { scale: [1, 1.3, 1], rotate: [0, 10, -10, 0] } : {}}
                    transition={{ duration: 0.3 }}
                  >
                    {key.emoji}
                  </motion.span>
                </div>

                {/* Note Alphabet label tag */}
                <div className="text-center font-black text-sm sm:text-base md:text-lg text-white/90 drop-shadow select-none pointer-events-none">
                  {key.note}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Dynamic Tips Banner */}
        <div className="mt-8 bg-white/60 border border-rose-150 p-4 rounded-2xl max-w-sm mx-auto w-full text-center">
          <p className="text-[10px] text-rose-800 font-extrabold uppercase uppercase-normal leading-relaxed">
            🎹 Tap piano keys or switch to Melody Guide to play Twinkle Twinkle automatically!
          </p>
        </div>

      </div>

      {/* Celebratory Level Win Modal */}
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

              <h3 className="text-3xl font-black text-slate-900 mt-8 mb-2">
                Spectacular Concert! 🎉
              </h3>
              <p className="text-gray-600 font-medium mb-6">
                You played beautifully! You unlocked <span className="font-bold text-amber-500 text-lg">3 Shiny Gold Stars</span>!
              </p>

              <div className="flex flex-col gap-2">
                <button
                  onClick={handleFinish}
                  className="w-full bg-gradient-to-r from-rose-500 to-pink-500 text-white font-black py-3 px-6 rounded-2xl shadow-md transition-all text-lg cursor-pointer"
                >
                  Collect Stars Now! ⭐
                </button>
                <button
                  onClick={resetPiano}
                  className="w-full p-2 bg-slate-100 text-slate-600 font-bold rounded-xl text-xs"
                >
                  Play Sandbox Again
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
