import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { soundManager } from '../../utils/sound';
import { 
  ArrowLeft, 
  Volume2, 
  VolumeX, 
  BookOpen, 
  Music, 
  Sparkles, 
  Play, 
  Pause, 
  RotateCcw, 
  ChevronRight, 
  ChevronLeft, 
  Moon, 
  Star, 
  Cloud, 
  Sparkle,
  Fingerprint
} from 'lucide-react';

interface GameProps {
  onBack: () => void;
  onGameComplete: (starsEarned: number) => void;
}

// Data structures
interface Rhyme {
  id: string;
  title: string;
  emoji: string;
  color: string;
  description: string;
  lines: string[];
  melody: number[]; // frequencies for client-side synthesize song play-along
  avatarEmoji: string;
  avatarAnimation: string;
}

interface StoryPage {
  text: string;
  emojis: string;
  illustration: React.ReactNode;
}

interface BedtimeStory {
  id: string;
  title: string;
  emoji: string;
  color: string;
  intro: string;
  pages: StoryPage[];
}

const RHYMES: Rhyme[] = [
  {
    id: 'twinkle',
    title: 'Twinkle Twinkle Little Star',
    emoji: '🌟',
    color: 'from-amber-400 to-amber-600',
    description: 'Listen to the starry chime or tap the sky to create stars!',
    lines: [
      'Twinkle, twinkle, little star, ✨',
      'How I wonder what you are! 🤔',
      'Up above the world so high, ☁️',
      'Like a diamond in the sky. 💎',
      'Twinkle, twinkle, little star, ✨',
      'How I wonder what you are! '
    ],
    melody: [261.63, 261.63, 392.00, 392.00, 440.00, 440.00, 392.00, 349.23, 349.23, 329.63, 329.63, 293.66, 293.66, 261.63],
    avatarEmoji: '⭐',
    avatarAnimation: 'animate-pulse'
  },
  {
    id: 'diddle',
    title: 'Hey Diddle Diddle',
    emoji: '🐄',
    color: 'from-blue-400 to-indigo-600',
    description: 'Tap the cow to watch it jump over the moon!',
    lines: [
      'Hey, diddle, diddle, 🎻',
      'The cat and the fiddle, 🐱',
      'The cow jumped over the moon; 🐮🌙',
      'The little dog laughed to see such sport, 🐶',
      'And the dish ran away with the spoon! 🥄'
    ],
    melody: [293.66, 329.63, 349.23, 392.00, 440.00, 493.88, 523.25, 440.00, 523.25, 392.00],
    avatarEmoji: '🐮',
    avatarAnimation: 'animate-bounce'
  },
  {
    id: 'humpty',
    title: 'Humpty Dumpty Sat on a Wall',
    emoji: '🥚',
    color: 'from-orange-400 to-red-500',
    description: 'Help rebuild Humpty Dumpty and put him back together!',
    lines: [
      'Humpty Dumpty sat on a wall, 🪜',
      'Humpty Dumpty had a great fall; 💥',
      'All the king’s horses and all the king’s men, 🐎',
      'Couldn’t put Humpty together again! 🩹',
      'But we can help him stand back tall! '
    ],
    melody: [261.63, 293.66, 329.63, 261.63, 329.63, 349.23, 392.00, 261.63, 392.00, 440.00, 523.25, 392.00, 261.63],
    avatarEmoji: '🥚',
    avatarAnimation: 'animate-spin'
  }
];

const STORIES: BedtimeStory[] = [
  {
    id: 'koala',
    title: 'The Sleepy Little Koala',
    emoji: '🐨',
    color: 'from-emerald-600 to-teal-850 bg-slate-900',
    intro: 'Join Kiki the baby Koala as she finds her cozy sleeping branch.',
    pages: [
      {
        text: 'Once upon a time, high up in a grand green eucalyptus tree, lived Kiki the baby Koala. She loved playing with ladybugs in the daytime.',
        emojis: '🌲 🐨 🐞',
        illustration: (
          <div className="relative w-full h-40 bg-emerald-950/40 rounded-3xl flex items-center justify-center overflow-hidden border border-emerald-500/10">
            <span className="text-7xl absolute animate-bounce">🐨</span>
            <span className="text-3xl absolute bottom-4 left-6">🌲</span>
            <span className="text-3xl absolute top-4 right-8">🐞</span>
          </div>
        )
      },
      {
        text: 'Soon, the golden sun went down, and the beautiful night sky filled with a cozy silver moon and thousands of tiny twinkling stars.',
        emojis: '🌙 ✨ 🌌',
        illustration: (
          <div className="relative w-full h-40 bg-indigo-950/40 rounded-3xl flex items-center justify-center overflow-hidden border border-indigo-500/10">
            <span className="text-6xl absolute top-4 animate-pulse">🌙</span>
            <span className="text-xl absolute top-6 right-10 animate-ping">✨</span>
            <span className="text-xl absolute bottom-6 left-10 animate-ping">✨</span>
            <span className="text-4xl absolute bottom-4">🐨</span>
          </div>
        )
      },
      {
        text: 'Kiki yawned a huge, cozy koala yawn, stretched her soft fuzzy ears, and snuggled warm and soundly right against her loving mama.',
        emojis: '🥱 🐨 💤',
        illustration: (
          <div className="relative w-full h-40 bg-purple-950/40 rounded-3xl flex items-center justify-center overflow-hidden border border-purple-500/10">
            <span className="text-7xl absolute animate-pulse">👩‍👦</span>
            <span className="text-3xl absolute bottom-4 right-10">🐨</span>
            <span className="text-2xl absolute top-6 right-16 animate-pulse">💤</span>
            <span className="text-3xl absolute top-8 left-12 animate-bounce">🥱</span>
          </div>
        )
      },
      {
        text: '"Sweet dreams, little treetops adventurer," whispered the quiet night wind. Kiki closed her sleepy eyes, smiled, and fell asleep.',
        emojis: '🌲 😴 ⭐',
        illustration: (
          <div className="relative w-full h-40 bg-slate-950/50 rounded-3xl flex items-center justify-center overflow-hidden border border-slate-500/10">
            <span className="text-7xl absolute opacity-90">😴</span>
            <span className="text-4xl absolute bottom-4 left-10">🐨</span>
            <span className="text-3xl absolute top-4 right-10 animate-pulse">⭐</span>
            <span className="text-2xl absolute bottom-4 right-16">🛌</span>
          </div>
        )
      }
    ]
  },
  {
    id: 'rocket',
    title: "Brave Rocket's Space Dream",
    emoji: '🚀',
    color: 'from-blue-600 to-purple-900 bg-slate-950',
    intro: 'Cosmic Comet the explorer rocket learns how to recharge his energy core.',
    pages: [
      {
        text: 'Cosmic Comet was a friendly blue space rocket who loved zooming past warm orange planets and shiny asteroids all day.',
        emojis: '🚀 🪐 ☄️',
        illustration: (
          <div className="relative w-full h-40 bg-blue-950/30 rounded-3xl flex items-center justify-center overflow-hidden border border-blue-500/10">
            <motion.span animate={{ x: [-20, 20, -20] }} transition={{ repeat: Infinity, duration: 4 }} className="text-6xl absolute">🚀</motion.span>
            <span className="text-4xl absolute bottom-4 right-8">🪐</span>
          </div>
        )
      },
      {
        text: 'When the giant cosmic clock chimed bedtime hours, Comet knew it was time to glide into low-power mode and cool his rocket jets.',
        emojis: '⏰ 🔌 🔋',
        illustration: (
          <div className="relative w-full h-40 bg-zinc-900/50 rounded-3xl flex items-center justify-center overflow-hidden border border-purple-500/10">
            <span className="text-5xl absolute top-4 animate-bounce">⏰</span>
            <span className="text-4xl absolute left-8 bottom-6">🔌</span>
            <span className="text-5xl absolute right-10">🔋</span>
          </div>
        )
      },
      {
        text: 'Comet floated slowly on a soft blue cushion of stardust, listening to the soothing, gentle cosmic hum of space crickets.',
        emojis: '🌌 🛸 🎶',
        illustration: (
          <div className="relative w-full h-40 bg-violet-950/40 rounded-3xl flex items-center justify-center overflow-hidden border border-violet-500/10">
            <span className="text-6xl absolute bottom-4 animate-pulse">🛸</span>
            <span className="text-3xl absolute top-4 right-12 animate-bounce">🦗</span>
            <span className="text-3xl absolute top-8 left-16">🌌</span>
          </div>
        )
      },
      {
        text: 'He closed his solar shield eyes and dreamed of floating candy-corn planets and fuzzy sleeping space puppies. Choo-choo, bedtime!',
        emojis: '😴 🪐 🌌',
        illustration: (
          <div className="relative w-full h-40 bg-slate-950/60 rounded-3xl flex items-center justify-center overflow-hidden border border-indigo-500/10">
            <span className="text-7xl absolute">😴</span>
            <span className="text-4xl absolute bottom-2 right-12">🐶</span>
            <span className="text-3xl absolute top-6 left-12">🪐</span>
          </div>
        )
      }
    ]
  },
  {
    id: 'sheep',
    title: "Puffy the Starry Counting Sheep",
    emoji: '🐑',
    color: 'from-sky-700 to-indigo-950 bg-slate-950',
    intro: 'Help Puffy count the shiny star lights to relax and float off to dreamland.',
    pages: [
      {
        text: 'Puffy was a soft cotton-candy sheep who loved leaping over white daisy flowers on the grassy green hills.',
        emojis: '🐑 🌼 ⛰️',
        illustration: (
          <div className="relative w-full h-40 bg-sky-950/40 rounded-3xl flex items-center justify-center overflow-hidden border border-sky-500/10">
            <motion.span animate={{ y: [0, -25, 0] }} transition={{ repeat: Infinity, duration: 2.2 }} className="text-6xl absolute">🐑</motion.span>
            <span className="text-3xl absolute bottom-3 left-8">🌼</span>
            <span className="text-3xl absolute bottom-3 right-8">🌼</span>
          </div>
        )
      },
      {
        text: 'When night fell, Puffy snuggled into a fluffy cloud bed. He looked up at the deep starry dome and saw One golden star shining bright!',
        emojis: '☁️ ⭐ 🧼',
        illustration: (
          <div className="relative w-full h-40 bg-indigo-950/50 rounded-3xl flex items-center justify-center overflow-hidden border border-indigo-500/15">
            <span className="text-7xl absolute -left-1/3 opacity-30">☁️</span>
            <span className="text-5xl absolute animate-pulse text-yellow-300">⭐</span>
            <span className="text-4xl absolute bottom-3 right-1/4">🐑</span>
            <p className="absolute top-2 left-4 text-xs font-mono text-indigo-400">Total: 1 Star!</p>
          </div>
        )
      },
      {
        text: 'Next, he counted Two, Three, and Four lovely twinkling sparkles! The beautiful heavens looked like a shiny magical blanket.',
        emojis: '✨ ⭐ 🌌',
        illustration: (
          <div className="relative w-full h-40 bg-slate-950 rounded-3xl flex items-center justify-center overflow-hidden border border-teal-500/10">
            <span className="text-2xl absolute top-3 left-10 animate-pulse">⭐</span>
            <span className="text-3xl absolute top-4 right-14 animate-pulse">⭐</span>
            <span className="text-2xl absolute bottom-5 left-12 animate-pulse">⭐</span>
            <span className="text-4xl absolute bottom-4 animate-ping">✨</span>
            <span className="text-5xl absolute text-center animate-bounce">🐑</span>
            <p className="absolute top-2 left-4 text-xs font-mono text-indigo-400">Total: 4 Stars! 🌟</p>
          </div>
        )
      },
      {
        text: '"One, two, three, four... snore," whispered Puffy as his cozy eyes closed. He drifted away floating high on sweet starry waves.',
        emojis: '💤 🐑 💖',
        illustration: (
          <div className="relative w-full h-40 bg-indigo-950/60 rounded-3xl flex items-center justify-center overflow-hidden border border-purple-500/10">
            <span className="text-7xl absolute opacity-90">😴</span>
            <span className="text-5xl absolute bottom-4 left-6">☁️</span>
            <span className="text-2xl absolute top-4 right-12 animate-pulse">💤</span>
            <span className="text-4xl absolute bottom-4 right-12 animate-bounce">🐑</span>
          </div>
        )
      }
    ]
  },
  {
    id: 'ocean',
    title: "Marina the Mermaid's Cozy Coral Reef",
    emoji: '🧜',
    color: 'from-blue-600 to-teal-800 bg-slate-950',
    intro: 'Swim down to the secret underwater glow cave for a warm, bubbly rest.',
    pages: [
      {
        text: 'Marina the kind little mermaid swam through the warm coral lagoons, exchanging high-fives with neon clownfishes.',
        emojis: '🌊 🧜 🐠',
        illustration: (
          <div className="relative w-full h-40 bg-teal-950/40 rounded-3xl flex items-center justify-center overflow-hidden border border-teal-500/10">
            <motion.span animate={{ y: [-10, 10, -10] }} transition={{ repeat: Infinity, duration: 3 }} className="text-6xl absolute">🧜</motion.span>
            <span className="text-3xl absolute bottom-3 left-4">🪸</span>
            <motion.span animate={{ x: [80, -80, 80] }} transition={{ repeat: Infinity, duration: 4 }} className="text-2xl absolute top-4">🐠</motion.span>
          </div>
        )
      },
      {
        text: 'The deep ocean turned a soothing, dreamy twilight purple. Marina sailed into her cozy bioluminescent cave made of soft pearly shells.',
        emojis: '🪸 🐚 🟣',
        illustration: (
          <div className="relative w-full h-40 bg-purple-950/30 rounded-3xl flex items-center justify-center overflow-hidden border border-purple-500/10">
            <span className="text-5xl absolute top-4 animate-pulse">🐚</span>
            <span className="text-3xl absolute bottom-4 right-12 animate-bounce">🪸</span>
            <span className="text-5xl absolute animate-pulse">🧜‍♀️</span>
          </div>
        )
      },
      {
        text: 'She listened to the quiet, rhythmic sounds of the deep tides washing back and forth. Bubbles floated past her, tickling her snout.',
        emojis: '🫧 🌊 🔔',
        illustration: (
          <div className="relative w-full h-40 bg-blue-950/50 rounded-3xl flex items-center justify-center overflow-hidden border border-blue-500/10">
            <motion.span animate={{ y: [40, -40] }} transition={{ repeat: Infinity, duration: 3 }} className="text-xl absolute left-12">🫧</motion.span>
            <motion.span animate={{ y: [35, -35] }} transition={{ repeat: Infinity, duration: 2.5 }} className="text-3xl absolute right-16">🫧</motion.span>
            <motion.span animate={{ y: [50, -50] }} transition={{ repeat: Infinity, duration: 4 }} className="text-2xl absolute bottom-2 left-1/2">🫧</motion.span>
            <span className="text-5xl absolute animate-pulse">🧜‍♀️</span>
          </div>
        )
      },
      {
        text: '"Hush, little ocean swimmer, the deep sea is holding you warm," sang the friendly turtle. Marina snuggled into her bed and fell fast asleep.',
        emojis: '🐢 😴 💤',
        illustration: (
          <div className="relative w-full h-40 bg-teal-950/60 rounded-3xl flex items-center justify-center overflow-hidden border border-teal-500/20">
            <span className="text-6xl absolute animate-bounce">🐢</span>
            <span className="text-4xl absolute bottom-2 right-12 animate-pulse">🧜‍♀️</span>
            <span className="text-3xl absolute top-6 right-16 animate-pulse">💤</span>
            <span className="text-5xl absolute top-2 left-6">🛌</span>
          </div>
        )
      }
    ]
  }
];

// Custom synth note helper
function playCozyTone(freq: number, type: OscillatorType = 'sine', duration: number = 0.3) {
  if (typeof window === 'undefined') return;
  const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
  if (!AudioContextClass) return;
  
  try {
    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    
    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch (e) {
    // Audio context not allowed or suspended
  }
}

export default function RhymesStories({ onBack, onGameComplete }: GameProps) {
  const [activeTab, setActiveTab] = useState<'rhymes' | 'stories' | 'sandbox'>('rhymes');

  // Nursery Rhymes Game states
  const [selectedRhymeIdx, setSelectedRhymeIdx] = useState(0);
  const [currentLineIdx, setCurrentLineIdx] = useState(0);
  const [isPlayingMelody, setIsPlayingMelody] = useState(false);
  const [rhymeScaleStars, setRhymeScaleStars] = useState(0);
  // Cow game states helper
  const [cowJumping, setCowJumping] = useState(false);
  const [humptyFallen, setHumptyFallen] = useState(false);
  const [dishRan, setDishRan] = useState(false);

  // Bedtime Stories states
  const [selectedStoryIdx, setSelectedStoryIdx] = useState(0);
  const [storyPageIdx, setStoryPageIdx] = useState(0);
  const [isNarrating, setIsNarrating] = useState(false);
  const [lullabyActive, setLullabyActive] = useState(false);
  const lullabyInterval = useRef<NodeJS.Timeout | null>(null);

  // Custom bedtime reading settings for multiple age groups
  const [storyFontSize, setStoryFontSize] = useState<'sm' | 'base' | 'lg' | 'xl' | '2xl'>('lg');
  const [autoPlayStories, setAutoPlayStories] = useState(false);
  const [highlightedWordIdx, setHighlightedWordIdx] = useState<number | null>(null);
  const autoPlayTimer = useRef<NodeJS.Timeout | null>(null);

  // Night Sky Sandbox state
  const [sandboxItems, setSandboxItems] = useState<{ id: string; x: number; y: number; emoji: string; size: number }[]>([]);
  const [selectedPlacementItem, setSelectedPlacementItem] = useState('⭐');
  const [constellationStep, setConstellationStep] = useState(0);
  const [constellationCompleted, setConstellationCompleted] = useState(false);
  
  const constellationDots = [
    { x: 120, y: 180, num: 1 },
    { x: 190, y: 110, num: 2 },
    { x: 260, y: 180, num: 3 },
    { x: 330, y: 140, num: 4 },
    { x: 400, y: 220, num: 5 },
  ];

  const activeRhyme = RHYMES[selectedRhymeIdx];
  const activeStory = STORIES[selectedStoryIdx];

  // Cozy Lullaby Background Sound Sequence
  useEffect(() => {
    if (lullabyActive) {
      // Gentle offline sleeping arpeggios
      let tick = 0;
      const notes = [392.00, 440.00, 493.88, 523.25, 587.33, 659.25]; // Dreamy high scale
      lullabyInterval.current = setInterval(() => {
        const tone = notes[tick % notes.length];
        playCozyTone(tone, 'sine', 1.2);
        tick++;
      }, 2000);
    } else {
      if (lullabyInterval.current) {
        clearInterval(lullabyInterval.current);
      }
    }
    return () => {
      if (lullabyInterval.current) {
        clearInterval(lullabyInterval.current);
      }
    };
  }, [lullabyActive]);

  // Synthesized cozy sound FX triggers using client-side oscillator nodes
  const playBedtimeSoundFx = (action: 'breeze' | 'ocean' | 'chime' | 'owl' | 'sparkle') => {
    if (typeof window === 'undefined') return;
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;

    try {
      const ctx = new AudioContextClass();
      const now = ctx.currentTime;

      if (action === 'sparkle') {
        const freqs = [880, 1046.50, 1318.51, 1567.98, 2093.00];
        freqs.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, now + idx * 0.08);
          gain.gain.setValueAtTime(0.08, now + idx * 0.08);
          gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.3);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + idx * 0.08);
          osc.stop(now + idx * 0.08 + 0.3);
        });
      } else if (action === 'chime') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(587.33, now); // D5
        osc.frequency.exponentialRampToValueAtTime(880.00, now + 0.3); // A5
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.7);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(now + 0.7);
      } else if (action === 'ocean') {
        let duration = 2.0;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(80, now);
        osc.frequency.linearRampToValueAtTime(110, now + 1.0);
        osc.frequency.linearRampToValueAtTime(75, now + 2.0);
        gain.gain.setValueAtTime(0.01, now);
        gain.gain.linearRampToValueAtTime(0.15, now + 1.0);
        gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(now + duration);
      } else if (action === 'breeze') {
        let duration = 1.8;
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gain = ctx.createGain();
        osc1.type = 'triangle';
        osc1.frequency.setValueAtTime(140, now);
        osc1.frequency.linearRampToValueAtTime(115, now + 0.9);
        osc1.frequency.linearRampToValueAtTime(135, now + 1.8);
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(145, now);
        osc2.frequency.linearRampToValueAtTime(120, now + 0.9);
        gain.gain.setValueAtTime(0.01, now);
        gain.gain.linearRampToValueAtTime(0.12, now + 0.8);
        gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(ctx.destination);
        osc1.start();
        osc2.start();
        osc1.stop(now + duration);
        osc2.stop(now + duration);
      } else if (action === 'owl') {
        const hoots = [
          { f: 330, start: 0, d: 0.25 },
          { f: 300, start: 0.28, d: 0.4 },
          { f: 330, start: 0.8, d: 0.25 },
          { f: 300, start: 1.08, d: 0.4 },
        ];
        hoots.forEach((h) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(h.f, now + h.start);
          osc.frequency.exponentialRampToValueAtTime(h.f - 20, now + h.start + h.d);
          gain.gain.setValueAtTime(0.08, now + h.start);
          gain.gain.exponentialRampToValueAtTime(0.001, now + h.start + h.d);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + h.start);
          osc.stop(now + h.start + h.d);
        });
      }
    } catch (e) {
      // Audio fallback support
    }
  };

  // Speak single word on click for early vocabulary training (every age group)
  const speakWord = (word: string, index: number) => {
    soundManager.playBubble();
    setHighlightedWordIdx(index);
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      const sanitized = word.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?"'✨]/g,"");
      const utterance = new SpeechSynthesisUtterance(sanitized);
      utterance.rate = 0.70; // patient reading rate
      utterance.pitch = 1.25; // sweet and happy voice pitch
      utterance.onend = () => {
        setHighlightedWordIdx(null);
      };
      utterance.onerror = () => {
        setHighlightedWordIdx(null);
      };
      window.speechSynthesis.speak(utterance);
    } else {
      setTimeout(() => {
        setHighlightedWordIdx(null);
      }, 900);
    }
  };

  // Auto-play page progress tracker
  useEffect(() => {
    if (autoPlayStories) {
      const currentText = activeStory.pages[storyPageIdx]?.text || '';
      
      // Auto narration logic
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
        setIsNarrating(true);
        const utterance = new SpeechSynthesisUtterance(currentText);
        utterance.rate = 0.82;
        utterance.pitch = 1.15;
        utterance.onend = () => {
          setIsNarrating(false);
          // Auto advance slide after text ends and a comforting 3s pause
          autoPlayTimer.current = setTimeout(() => {
            if (storyPageIdx < activeStory.pages.length - 1) {
              setStoryPageIdx(prev => prev + 1);
            } else {
              setStoryPageIdx(0); // circular story loops
            }
          }, 2500);
        };
        utterance.onerror = () => {
          setIsNarrating(false);
        };
        window.speechSynthesis.speak(utterance);
      } else {
        // Fallback progress
        setIsNarrating(true);
        const waitMs = currentText.split(' ').length * 550 + 2000;
        autoPlayTimer.current = setTimeout(() => {
          setIsNarrating(false);
          if (storyPageIdx < activeStory.pages.length - 1) {
            setStoryPageIdx(prev => prev + 1);
          } else {
            setStoryPageIdx(0);
          }
        }, waitMs);
      }
    } else {
      if (autoPlayTimer.current) {
        clearTimeout(autoPlayTimer.current);
      }
    }

    return () => {
      if (autoPlayTimer.current) {
        clearTimeout(autoPlayTimer.current);
      }
    };
  }, [autoPlayStories, storyPageIdx, selectedStoryIdx]);

  // Handle manual SpeechSynthesis narration safely
  const handleSpeakState = (text: string) => {
    // If autoPlay is on, disable direct manual speak so they don't fight
    if (autoPlayStories) {
      setAutoPlayStories(false);
    }

    if (isNarrating) {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      setIsNarrating(false);
      return;
    }

    soundManager.playBubble();
    setIsNarrating(true);
    
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.82; // comforting kid-friendly pacing
      utterance.pitch = 1.15;
      utterance.onend = () => {
        setIsNarrating(false);
      };
      utterance.onerror = () => {
        setIsNarrating(false);
      };
      window.speechSynthesis.speak(utterance);
    } else {
      // Simulate text flow without voice
      setTimeout(() => {
        setIsNarrating(false);
      }, 5000);
    }
  };

  // Play synthetic melody chimes
  const playRhymeMelody = async () => {
    if (isPlayingMelody) return;
    setIsPlayingMelody(true);
    soundManager.playSparkle();

    const songMelody = activeRhyme.melody;
    for (let i = 0; i < songMelody.length; i++) {
      if (selectedRhymeIdx !== RHYMES.indexOf(activeRhyme)) break; // Cancel if rhyme switched
      playCozyTone(songMelody[i], 'triangle', 0.4);
      setCurrentLineIdx(i % activeRhyme.lines.length);
      await new Promise((resolve) => setTimeout(resolve, 450));
    }
    setIsPlayingMelody(false);
    setRhymeScaleStars((prev) => Math.min(prev + 1, 3));
  };

  // Click on Rhyme Star
  const handleRhymeTapNote = (freq: number) => {
    playCozyTone(freq, 'sine', 0.6);
    // Spawn particles or activate visual action
    soundManager.playBubble();
  };

  // Night Sky click on canvas
  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Grid safety bounds checks
    if (x < 0 || y < 0) return;

    // Create item
    const frequencies = [261.63, 293.66, 329.63, 349.23, 392.00, 440.00, 493.88, 523.25];
    const verticalIndex = Math.min(Math.floor((y / rect.height) * frequencies.length), frequencies.length - 1);
    const scaleTone = frequencies[frequencies.length - 1 - verticalIndex]; // Lower height = higher pitch

    playCozyTone(scaleTone, 'triangle', 0.5);

    const newItem = {
      id: Math.random().toString(36).substring(2, 9),
      x,
      y,
      emoji: selectedPlacementItem,
      size: Math.random() * (40 - 24) + 24
    };

    setSandboxItems((prev) => [...prev, newItem]);
  };

  // Tap dynamic constellation dot
  const handleConstellationDotClick = (dotNum: number) => {
    if (constellationCompleted) return;

    if (dotNum === constellationStep + 1) {
      soundManager.playCorrect();
      setConstellationStep(dotNum);
      if (dotNum === constellationDots.length) {
        setConstellationCompleted(true);
        soundManager.playSuccess();
        playCozyTone(880, 'sine', 1.0);
      }
    } else {
      soundManager.playWrong();
    }
  };

  const handleClaimAward = () => {
    // Return to dashboard and award stars!
    const totalAwardStars = 5;
    onGameComplete(totalAwardStars);
  };

  return (
    <div id="rhymes-bedtime-learning-adventure" className="flex flex-col h-full bg-slate-950 text-slate-100 select-none overflow-hidden relative font-sans">
      
      {/* Visual background atmospheric elements */}
      <div className="absolute top-1/2 left-1/4 w-96 h-96 rounded-full bg-indigo-900/10 blur-3.5xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-blue-900/15 blur-3.5xl pointer-events-none" />

      {/* Game navigation header inside iFrame */}
      <div className="flex flex-col sm:flex-row items-center justify-between p-4 bg-slate-900/80 border-b border-indigo-950/40 z-10 gap-3">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-3 py-2 text-indigo-200 bg-slate-900 border border-indigo-950 hover:bg-slate-800 rounded-2xl font-semibold transition-all shadow-sm cursor-pointer text-xs"
        >
          <ArrowLeft className="w-5 h-5 text-indigo-400" />
          <span>Back to Hub</span>
        </button>

        {/* Tab selection */}
        <div className="flex bg-slate-950/80 p-1 rounded-2xl border border-indigo-950/40 shadow-inner">
          <button
            onClick={() => { soundManager.playBubble(); setActiveTab('rhymes'); }}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'rhymes' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Music className="w-3.5 h-3.5" />
            <span>Interactive Rhymes</span>
          </button>
          <button
            onClick={() => { soundManager.playBubble(); setActiveTab('stories'); }}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'stories' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Cozy Stories</span>
          </button>
          <button
            onClick={() => { soundManager.playBubble(); setActiveTab('sandbox'); }}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'sandbox' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Moon className="w-3.5 h-3.5 text-yellow-300" />
            <span>Night Sky Builder</span>
          </button>
        </div>

        {/* Reward stars visual count */}
        <div className="flex items-center gap-2 bg-indigo-950/50 px-4 py-1.5 rounded-full border border-indigo-900 shadow-sm">
          <Star className="w-4 h-4 text-yellow-400 fill-yellow-400 animate-pulse" />
          <span className="font-extrabold text-indigo-300 text-xs sm:text-sm">
            Bedtime Stars Quest: Complete & Claim!
          </span>
        </div>
      </div>

      {/* Primary Tab Body Panels */}
      <div className="flex-1 p-4 md:p-6 overflow-y-auto max-w-4xl mx-auto w-full flex flex-col justify-between">
        
        <AnimatePresence mode="wait">
          {activeTab === 'rhymes' && (
            <motion.div
              key="rhymes-tab"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="flex-1 flex flex-col md:flex-row gap-6 items-center"
            >
              {/* Left Column: Rhyme Selector & Visual Cartoon Sandbox */}
              <div className="w-full md:w-1/2 flex flex-col gap-4">
                <div className="bg-slate-900/90 border border-indigo-950/80 p-4 rounded-3xl">
                  <h3 className="font-black text-xs text-indigo-400 uppercase tracking-widest mb-2 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-indigo-400" />
                    <span>Select Nursery Rhyme</span>
                  </h3>
                  <div className="grid grid-cols-1 gap-2">
                    {RHYMES.map((rh, idx) => (
                      <button
                        key={rh.id}
                        onClick={() => {
                          soundManager.playBubble();
                          setSelectedRhymeIdx(idx);
                          setCurrentLineIdx(0);
                        }}
                        className={`p-3.5 rounded-2xl flex items-center justify-between text-left border cursor-pointer transition-all ${
                          selectedRhymeIdx === idx 
                            ? 'bg-gradient-to-r from-indigo-900/90 to-slate-900 border-indigo-500 shadow-lg shadow-indigo-500/10' 
                            : 'bg-slate-950 border-indigo-950 hover:bg-slate-900/60'
                        }`}
                      >
                        <div>
                          <p className="font-black text-sm">{rh.title}</p>
                          <p className="text-[11px] text-slate-400 mt-0.5">{rh.description}</p>
                        </div>
                        <span className="text-2xl">{rh.emoji}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Animated Cartoon Playground Container */}
                <div className="bg-slate-900/50 border border-indigo-950/85 p-5 rounded-3xl flex flex-col items-center justify-center text-center relative h-56 overflow-hidden">
                  <p className="text-[10px] text-slate-400 absolute top-3 flex items-center gap-1">
                    <Fingerprint className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
                    <span>Tap elements below for music & reactions!</span>
                  </p>

                  {activeRhyme.id === 'twinkle' && (
                    <div className="relative w-full h-full flex items-center justify-center">
                      <motion.button 
                        whileHover={{ scale: 1.2 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleRhymeTapNote(329.63)}
                        className="text-8xl select-none absolute cursor-pointer animate-pulse filter drop-shadow-[0_0_15px_rgba(234,179,8,0.4)]"
                      >
                        ⭐
                      </motion.button>
                      <button onClick={() => handleRhymeTapNote(261.63)} className="absolute top-4 left-6 text-3xl hover:scale-125 transition-transform cursor-pointer">✨</button>
                      <button onClick={() => handleRhymeTapNote(392.00)} className="absolute top-10 right-10 text-4xl hover:scale-125 transition-transform cursor-pointer">✨</button>
                      <button onClick={() => handleRhymeTapNote(440.00)} className="absolute bottom-6 left-12 text-3xl hover:scale-125 transition-transform cursor-pointer">✨</button>
                      <button onClick={() => handleRhymeTapNote(349.23)} className="absolute bottom-8 right-12 text-3xl hover:scale-125 transition-transform cursor-pointer">✨</button>
                    </div>
                  )}

                  {activeRhyme.id === 'diddle' && (
                    <div className="relative w-full h-full flex flex-col items-center justify-center">
                      {/* Interactive moon */}
                      <span className="text-6xl absolute top-4 left-1/2 -translate-x-1/2 filter drop-shadow-[0_0_10px_rgba(148,163,184,0.3)]">🌙</span>
                      
                      {/* Jumper Cow */}
                      <motion.button 
                        onClick={() => {
                          if (cowJumping) return;
                          setCowJumping(true);
                          soundManager.playAnimalSound('cow');
                          setTimeout(() => setCowJumping(false), 1600);
                        }}
                        animate={cowJumping ? {
                          y: [-20, -110, -110, 0],
                          x: [-70, -30, 30, 70],
                          rotate: [0, 180, 270, 360],
                          scale: [1, 1.4, 1.4, 1]
                        } : {}}
                        transition={{ duration: 1.6 }}
                        className="text-5xl absolute bottom-4 left-4 z-10 cursor-pointer bg-slate-950/40 p-1.5 rounded-full"
                      >
                        🐮
                      </motion.button>

                      {/* Music Fiddle Violin */}
                      <button 
                        onClick={() => { soundManager.playCorrect(); playCozyTone(440, 'triangle', 0.8); }}
                        className="text-4xl absolute bottom-4 right-6 hover:scale-110 active:scale-95 transition-all cursor-pointer"
                      >
                        🎻
                      </button>

                      {/* Running Dish & Spoon */}
                      <motion.button
                        onClick={() => {
                          if (dishRan) return;
                          setDishRan(true);
                          soundManager.playSparkle();
                          setTimeout(() => setDishRan(false), 2000);
                        }}
                        animate={dishRan ? { x: [-100, 250] } : {}}
                        transition={{ duration: 2.0 }}
                        className="text-4xl absolute top-10 left-10 cursor-pointer"
                      >
                        🍽️🥄
                      </motion.button>
                    </div>
                  )}

                  {activeRhyme.id === 'humpty' && (
                    <div className="relative w-full h-full flex flex-col items-center justify-center">
                      {/* Wall */}
                      <div className="w-48 h-10 bg-gradient-to-r from-amber-700 to-amber-900 border border-amber-800 rounded absolute bottom-0 flex justify-center" />
                      
                      {/* Humpty can fall and break or jump back up */}
                      <motion.button
                        onClick={() => {
                          soundManager.playBubble();
                          if (!humptyFallen) {
                            setHumptyFallen(true);
                            soundManager.playWrong();
                          } else {
                            setHumptyFallen(false);
                            soundManager.playSparkle();
                          }
                        }}
                        animate={humptyFallen ? {
                          y: [0, 80],
                          rotate: [0, -45],
                        } : {
                          y: [0],
                          rotate: [0],
                        }}
                        className="text-6xl absolute cursor-pointer bottom-10 z-10"
                      >
                        {humptyFallen ? '🩹🤕' : '🥚'}
                      </motion.button>

                      <p className="text-[11px] text-amber-200 absolute bottom-12 right-2 max-w-[120px]">
                        {humptyFallen ? 'Tap him to patch him up! 🩹' : 'Tap Humpty to see his fall! 💥'}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column: Interactive Lyrics Display Panel */}
              <div className="w-full md:w-1/2 flex flex-col gap-5">
                <div className="bg-gradient-to-b from-indigo-950 to-slate-900 border border-indigo-900/60 p-6 rounded-3xl flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-[10px] font-black text-rose-400 uppercase tracking-widest bg-rose-500/10 px-3 py-1 rounded-full border border-rose-500/20">
                        🎶 Nursery Sing-Along
                      </span>
                      <div className="flex gap-1.5">
                        <span className={`w-3 h-3 rounded-full ${rhymeScaleStars >= 1 ? 'text-yellow-400 fill-yellow-400' : 'text-slate-600'}`}>⭐</span>
                        <span className={`w-3 h-3 rounded-full ${rhymeScaleStars >= 2 ? 'text-yellow-400 fill-yellow-400' : 'text-slate-600'}`}>⭐</span>
                        <span className={`w-3 h-3 rounded-full ${rhymeScaleStars >= 3 ? 'text-yellow-400 fill-yellow-400' : 'text-slate-600'}`}>⭐</span>
                      </div>
                    </div>

                    <h2 className="text-xl font-black text-indigo-200 mb-1">{activeRhyme.title} {activeRhyme.emoji}</h2>
                    <p className="text-xs text-slate-400 mb-4">Read together to improve children grammar and spelling rules!</p>

                    {/* Lyric Lines Layout with Active highlight highlight */}
                    <div className="space-y-3 my-4">
                      {activeRhyme.lines.map((line, index) => (
                        <motion.button
                          key={index}
                          onClick={() => {
                            soundManager.playBubble();
                            setCurrentLineIdx(index);
                            playCozyTone(activeRhyme.melody[index % activeRhyme.melody.length], 'sine', 0.65);
                          }}
                          animate={currentLineIdx === index ? { scale: 1.02, x: 4 } : { scale: 1, x: 0 }}
                          className={`w-full p-2 py-2.5 rounded-xl text-left font-semibold text-xs transition-all cursor-pointer flex items-center justify-between ${
                            currentLineIdx === index 
                              ? 'bg-indigo-600 text-white shadow-md font-extrabold border-l-4 border-rose-400' 
                              : 'bg-slate-950/40 text-slate-300 hover:bg-slate-900 hover:text-white border-l-4 border-transparent'
                          }`}
                        >
                          <span>{line}</span>
                          {currentLineIdx === index && (
                            <Volume2 className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
                          )}
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  {/* Play Melody sequence controller */}
                  <div className="pt-4 border-t border-indigo-950/40 flex items-center gap-3">
                    <button
                      disabled={isPlayingMelody}
                      onClick={playRhymeMelody}
                      className="flex-1 py-3 px-5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black rounded-xl shadow-md cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      <Play className="w-4 h-4" />
                      <span>{isPlayingMelody ? 'Orchestra in Session...' : 'Play Synthetic Chimes Melody'}</span>
                    </button>
                    {isPlayingMelody && (
                      <button
                        onClick={() => { setIsPlayingMelody(false); }}
                        className="p-3 bg-rose-500 hover:bg-rose-600 text-white text-xs rounded-xl cursor-pointer"
                      >
                        <VolumeX className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'stories' && (
            <motion.div
              key="stories-tab"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="flex-1 flex flex-col lg:flex-row gap-6 items-stretch"
            >
              {/* Left Side: Illustration and Backing Sounds Panel */}
              <div className="w-full lg:w-5/12 flex flex-col gap-4">
                {/* Book selection list */}
                <div className="bg-slate-900 border border-indigo-950/80 p-4 rounded-3xl shrink-0">
                  <h3 className="font-extrabold text-xs text-indigo-400 uppercase tracking-widest mb-3 flex items-center justify-between">
                    <span className="flex items-center gap-1">
                      <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Cozy Sleeping Library</span>
                    </span>
                    <span className="text-[8px] bg-indigo-650/40 px-2 py-0.5 rounded text-indigo-200">
                      Select a storybook
                    </span>
                  </h3>
                  <div className="grid grid-cols-2 gap-2">
                    {STORIES.map((st, idx) => (
                      <button
                        key={st.id}
                        onClick={() => {
                          soundManager.playBubble();
                          setSelectedStoryIdx(idx);
                          setStoryPageIdx(0);
                          setIsNarrating(false);
                          setAutoPlayStories(false);
                        }}
                        className={`p-2.5 rounded-xl text-left border cursor-pointer transition-all duration-200 flex items-center gap-2 ${
                          selectedStoryIdx === idx 
                            ? 'bg-gradient-to-r from-indigo-900 to-indigo-850 text-white border-indigo-400 shadow-lg' 
                            : 'bg-slate-950/50 border-indigo-950/60 text-slate-350 hover:bg-slate-900/40'
                        }`}
                      >
                        <span className="text-xl shrink-0">{st.emoji}</span>
                        <div className="truncate">
                          <p className="font-bold text-[11px] truncate leading-tight">{st.title}</p>
                          <p className="text-[9px] text-slate-400 mt-0.5 truncate">{st.intro}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Main Illustration Block */}
                <div className="bg-slate-900/40 border border-indigo-950/60 p-4 rounded-3xl flex-1 flex flex-col justify-between gap-4">
                  <div>
                    <span className="text-[9px] text-indigo-400 font-bold tracking-widest uppercase mb-2 block">
                      🎨 Story Visualiser Scene
                    </span>
                    {activeStory.pages[storyPageIdx]?.illustration}
                  </div>

                  {/* Sensory Audio FX Buttons */}
                  <div className="bg-slate-950/65 border border-indigo-950 p-3 rounded-2xl">
                    <p className="text-[10px] font-bold text-amber-300 mb-2 flex items-center gap-1.5 justify-center">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin" />
                      <span>Sound FX: Tap to Hear Sleeping Nature & Vibes!</span>
                    </p>
                    <div className="grid grid-cols-5 gap-1.5">
                      {[
                        { id: 'breeze', label: 'Breeze 🍃', desc: 'Whispering wind' },
                        { id: 'ocean', label: 'Ocean 🌊', desc: 'Deep waves' },
                        { id: 'chime', label: 'Chimes 🔔', desc: 'Cozy dreams' },
                        { id: 'owl', label: 'Wise Owl 🦉', desc: 'Woodland sleep' },
                        { id: 'sparkle', label: 'Fairy ✨', desc: 'Sparkle dust' }
                      ].map((sfx) => (
                        <button
                          key={sfx.id}
                          onClick={() => playBedtimeSoundFx(sfx.id as any)}
                          className="flex flex-col items-center justify-center py-2 px-1 rounded-lg border border-indigo-950/40 bg-indigo-950/20 hover:bg-indigo-900/30 text-[9px] font-black text-indigo-300 transition-all cursor-pointer hover:border-indigo-500 hover:text-white"
                          title={sfx.desc}
                        >
                          <span className="text-sm block mb-1">{sfx.label.split(' ')[1]}</span>
                          <span className="text-[8px] font-medium leading-tight opacity-75">{sfx.label.split(' ')[0]}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Background Music player */}
                  <button
                    onClick={() => {
                      soundManager.playBubble();
                      setLullabyActive(!lullabyActive);
                    }}
                    className={`py-2 px-4 rounded-2xl flex items-center justify-between text-xs font-black transition-all cursor-pointer ${
                      lullabyActive 
                        ? 'bg-rose-950/40 text-rose-300 border border-rose-800 shadow shadow-rose-950/50' 
                        : 'bg-slate-900 border border-indigo-950 text-indigo-300 hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${lullabyActive ? 'bg-rose-500 animate-ping' : 'bg-slate-600'}`} />
                      <span>Gentle Sleep Chimes Arpeggiator (Ambient loop)</span>
                    </div>
                    <span>{lullabyActive ? '🔊 ON' : '🔇 OFF'}</span>
                  </button>
                </div>
              </div>

              {/* Right Side: Multi-Page Interactive Storybook with rich aids */}
              <div className="w-full lg:w-7/12 flex flex-col gap-4">
                <div className="bg-slate-900 border border-indigo-950/80 p-5 rounded-3xl flex-1 flex flex-col justify-between gap-5 min-h-[350px]">
                  <div>
                    {/* Storybook configuration panel (fonts sizes & autoplay slideshow) */}
                    <div className="flex items-center justify-between pb-3.5 border-b border-indigo-950/80 flex-wrap gap-2.5">
                      <div className="flex items-center gap-1.5 bg-slate-950/60 p-1 rounded-xl border border-indigo-950">
                        <span className="text-[10px] font-bold text-slate-400 px-2">Font Size:</span>
                        {[
                          { id: 'sm', label: 'A-', title: 'Tiny size' },
                          { id: 'base', label: 'A', title: 'Regular size' },
                          { id: 'lg', label: 'A+', title: 'Large size' },
                          { id: 'xl', label: 'A++', title: 'Huge size' },
                          { id: '2xl', label: 'Jumbo', title: 'Toddler view' }
                        ].map((sz) => (
                          <button
                            key={sz.id}
                            onClick={() => { soundManager.playBubble(); setStoryFontSize(sz.id as any); }}
                            className={`px-2 py-1 text-[10px] font-bold rounded-lg transition-all cursor-pointer ${
                              storyFontSize === sz.id 
                                ? 'bg-indigo-600 text-white shadow' 
                                : 'text-slate-400 hover:bg-indigo-950 hover:text-indigo-200'
                            }`}
                            title={sz.title}
                          >
                            {sz.label}
                          </button>
                        ))}
                      </div>

                      {/* Slideshow autoplay toggle switch */}
                      <button
                        onClick={() => {
                          soundManager.playBubble();
                          setAutoPlayStories(!autoPlayStories);
                        }}
                        className={`px-3 py-1.5 rounded-xl text-[10px] font-extrabold flex items-center gap-1.5 border transition-all cursor-pointer ${
                          autoPlayStories 
                            ? 'bg-emerald-950/50 border-emerald-500 text-emerald-300' 
                            : 'bg-slate-950 border-indigo-950 text-indigo-400'
                        }`}
                      >
                        <span className={`w-2 h-2 rounded-full ${autoPlayStories ? 'bg-emerald-400 animate-pulse' : 'bg-slate-600'}`} />
                        <span>Autoplay Hands-Free 🛌</span>
                      </button>
                    </div>

                    {/* Book Metadata Header */}
                    <div className="flex justify-between items-center mt-4 mb-2">
                      <span className="text-[9px] font-black text-emerald-400 tracking-wider bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20 uppercase flex items-center gap-1">
                        <span>📖 Interactive Read</span>
                      </span>
                      <span className="text-xs font-bold text-slate-400 bg-slate-950 px-2.5 py-1 rounded-full border border-indigo-950">
                        Page {storyPageIdx + 1} of {activeStory.pages.length}
                      </span>
                    </div>

                    <h2 className="text-xl font-extrabold text-indigo-200 tracking-tight">{activeStory.title}</h2>
                    <p className="text-[10px] text-slate-400 mt-0.5 mb-4">{activeStory.intro}</p>

                    {/* Visualizer acoustic signal bar */}
                    {isNarrating && (
                      <div className="flex items-center gap-1.5 h-6 my-2 px-2.5 py-1 bg-amber-400/10 rounded-full border border-amber-400/20 w-fit">
                        <div className="w-1 bg-amber-400 h-2.5 rounded animate-bounce [animation-delay:-0.1s]" />
                        <div className="w-1 bg-amber-400 h-4 rounded animate-bounce [animation-delay:-0.3s]" />
                        <div className="w-1 bg-amber-400 h-3 rounded animate-bounce [animation-delay:-0.2s]" />
                        <div className="w-1 bg-amber-400 h-1.5 rounded animate-bounce [animation-delay:-0.4s]" />
                        <span className="text-[9px] text-amber-300 font-extrabold uppercase tracking-widest pl-1">Storyteller active</span>
                      </div>
                    )}

                    {/* Educational Word-by-word spelling & speak click widget */}
                    <div className="bg-slate-950/40 p-3 rounded-2xl border border-indigo-950/40 my-4">
                      <p className="text-[9px] font-bold text-indigo-400 mb-2.5 flex items-center gap-1 bg-indigo-950/20 px-2 py-1 rounded-lg w-fit">
                        💡 <span>Children Tip: Click on any word to hear it pronounced out loud!</span>
                      </p>
                      <motion.div 
                        key={`${selectedStoryIdx}-${storyPageIdx}`}
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.35 }}
                        className={`leading-relaxed text-slate-100 font-medium flex flex-wrap gap-x-1.5 gap-y-2 select-none justify-start ${
                          storyFontSize === 'sm' ? 'text-[11px] leading-normal' :
                          storyFontSize === 'base' ? 'text-xs md:text-sm leading-normal' :
                          storyFontSize === 'lg' ? 'text-sm md:text-base leading-relaxed' :
                          storyFontSize === 'xl' ? 'text-base md:text-lg font-semibold leading-relaxed' :
                          'text-lg md:text-xl font-bold leading-loose'
                        }`}
                      >
                        {activeStory.pages[storyPageIdx]?.text.split(' ').map((word, wordIdx) => {
                          const isWordHighlighted = highlightedWordIdx === wordIdx;
                          return (
                            <span
                              key={wordIdx}
                              onClick={() => speakWord(word, wordIdx)}
                              className={`rounded px-1.5 py-0.5 cursor-pointer transition-all duration-150 transform active:scale-95 ${
                                isWordHighlighted
                                  ? 'bg-amber-400 text-slate-950 font-black scale-105 shadow-md shadow-amber-400/30'
                                  : 'hover:bg-indigo-600/30 hover:text-amber-200'
                              }`}
                              title="Tap to pronounce!"
                            >
                              {word}
                            </span>
                          );
                        })}
                      </motion.div>
                    </div>
                  </div>

                  {/* Foot navigation control bar */}
                  <div className="pt-4 border-t border-indigo-950/60 flex flex-col sm:flex-row items-center gap-3 justify-between">
                    {/* Narrator switch */}
                    <button
                      onClick={() => handleSpeakState(activeStory.pages[storyPageIdx]?.text || '')}
                      disabled={autoPlayStories}
                      className={`w-full sm:w-auto flex items-center justify-center gap-1.5 px-4.5 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                        autoPlayStories
                          ? 'bg-slate-950 text-slate-600 border border-slate-900 cursor-not-allowed'
                          : isNarrating 
                            ? 'bg-amber-500 text-slate-950 shadow-md animate-pulse font-black' 
                            : 'bg-indigo-950 text-indigo-300 border border-indigo-900 hover:bg-slate-900'
                      }`}
                    >
                      <Volume2 className="w-4 h-4" />
                      <span>{autoPlayStories ? 'Playing Auto-Slides...' : isNarrating ? 'Stop Narrator 🗣️' : 'Read Out Loud (TTS) 🎙️'}</span>
                    </button>

                    {/* Navigation buttons */}
                    <div className="flex gap-2 w-full sm:w-auto justify-end">
                      <button
                        disabled={storyPageIdx === 0}
                        onClick={() => {
                          soundManager.playBubble();
                          setStoryPageIdx(prev => prev - 1);
                          setIsNarrating(false);
                          setAutoPlayStories(false);
                        }}
                        className="p-2.5 bg-slate-950 border border-indigo-950 hover:bg-slate-900 rounded-xl disabled:opacity-40 cursor-pointer"
                        title="Previous page"
                      >
                        <ChevronLeft className="w-4 h-4 text-indigo-400" />
                      </button>

                      <button
                        onClick={() => {
                          soundManager.playBubble();
                          setIsNarrating(false);
                          setAutoPlayStories(false);
                          if (storyPageIdx < activeStory.pages.length - 1) {
                            setStoryPageIdx(prev => prev + 1);
                          } else {
                            // finished the storybook
                            soundManager.playSuccess();
                            setStoryPageIdx(0);
                            playBedtimeSoundFx('sparkle');
                          }
                        }}
                        className="px-4.5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs cursor-pointer flex items-center justify-center gap-1 flex-1 sm:flex-none"
                      >
                        <span>{storyPageIdx === activeStory.pages.length - 1 ? 'Read Again 🔄' : 'Next Page'}</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'sandbox' && (
            <motion.div
              key="sandbox-tab"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="flex-1 flex flex-col gap-6"
            >
              {/* High-level title introduction */}
              <div className="text-center">
                <h2 className="text-xl font-black text-indigo-200">🌌 Interactive Night Sky Builder 🌙</h2>
                <p className="text-xs text-indigo-400 mt-1">Tap selection items below and click on the deep night sky to play music and build dreams!</p>
              </div>

              {/* Night Sky interactive canvas */}
              <div className="relative w-full h-80 bg-gradient-to-b from-slate-950 via-indigo-950 to-slate-950 rounded-3xl border border-indigo-900/50 shadow-inner overflow-hidden cursor-crosshair" onClick={handleCanvasClick}>
                {/* Background ambient stars */}
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/20 via-slate-950 to-slate-950 pointer-events-none" />
                <div className="absolute top-10 right-12 w-14 h-14 bg-yellow-200/5 rounded-full blur-xl pointer-events-none" />

                {/* Render current sandbox elements */}
                {sandboxItems.map((item) => (
                  <motion.div
                    key={item.id}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    style={{ left: item.x - 16, top: item.y - 16, fontSize: item.size }}
                    className="absolute pointer-events-none filter drop-shadow-[0_0_8px_rgba(255,255,255,0.2)]"
                  >
                    {item.emoji}
                  </motion.div>
                ))}

                {/* Render Constellation Connection Dot Lines if dot challenge is active */}
                <svg className="absolute inset-0 pointer-events-none w-full h-full">
                  {constellationDots.map((dot, idx) => {
                    if (idx < constellationStep - 1) {
                      const nextDot = constellationDots[idx + 1];
                      return (
                        <line 
                          key={idx}
                          x1={dot.x} 
                          y1={dot.y} 
                          x2={nextDot.x} 
                          y2={nextDot.y} 
                          className="stroke-cyan-400 stroke-[3px] stroke-dasharray animate-pulse" 
                        />
                      );
                    }
                    return null;
                  })}
                </svg>

                {/* Render Constellation Connection Dot Buttons */}
                {constellationDots.map((dot) => {
                  const isUnlocked = dot.num <= constellationStep;
                  return (
                    <button
                      key={dot.num}
                      onClick={(e) => {
                        e.stopPropagation(); // Stop trigger canvas placement
                        handleConstellationDotClick(dot.num);
                      }}
                      style={{ left: dot.x - 12, top: dot.y - 12 }}
                      className={`absolute w-6 h-6 rounded-full flex items-center justify-center font-black text-[10px] border transition-all z-25 cursor-pointer ${
                        isUnlocked 
                          ? 'bg-cyan-500 border-cyan-300 text-slate-950 font-black shadow-[0_0_8px_rgba(6,182,212,0.6)]' 
                          : 'bg-indigo-950/80 border-indigo-800 text-indigo-300 hover:bg-slate-900'
                      }`}
                    >
                      {dot.num}
                    </button>
                  );
                })}

                {/* Constellation completion badge */}
                {constellationCompleted && (
                  <motion.div 
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-slate-900/90 border-2 border-cyan-400 rounded-2xl p-4 text-center max-w-xs z-30"
                  >
                    <Star className="w-10 h-10 text-yellow-400 fill-yellow-400 mx-auto animate-bounce mb-2" />
                    <h4 className="font-extrabold text-sm text-cyan-300">Teddy Bear Constellation Connect! 🧸</h4>
                    <p className="text-[10px] text-slate-300 mt-1">Fantastic job tracing the starry lines and unlocking deep space chimes!</p>
                  </motion.div>
                )}

                {/* Cozy instruction overlay */}
                {sandboxItems.length === 0 && (
                  <div className="absolute bottom-4 left-4 pointer-events-none bg-slate-950/70 p-2.5 rounded-xl border border-indigo-950 max-w-xxs text-[10px] text-indigo-300">
                    💡 <b>Tap anywhere on the night sky</b> to place cozy sleep stickers! Each location triggers a musical space note!
                  </div>
                )}
              </div>

              {/* Selection items bottom panel */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-900 border border-indigo-950/85 p-4 rounded-3xl">
                <div className="flex gap-2.5 items-center flex-wrap">
                  <span className="text-[11px] font-black text-indigo-300 uppercase tracking-wider block sm:mr-2">Choose Sticker:</span>
                  {[
                    { id: '⭐', label: 'Star 🌟' },
                    { id: '🌙', label: 'Moon 🌙' },
                    { id: '☁️', label: 'Cloud ☁️' },
                    { id: '🐑', label: 'Sheep 🐑' },
                    { id: '🚀', label: 'Rocket 🚀' },
                    { id: '🪐', label: 'Planet 🪐' }
                  ].map((it) => (
                    <button
                      key={it.id}
                      onClick={() => { soundManager.playBubble(); setSelectedPlacementItem(it.id); }}
                      className={`px-3 py-1.5 text-xs font-black rounded-xl transition-all border cursor-pointer ${
                        selectedPlacementItem === it.id 
                          ? 'bg-indigo-600 border-indigo-400 text-white shadow' 
                          : 'bg-slate-950 border-indigo-950 text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      <span>{it.id}</span>
                    </button>
                  ))}
                </div>

                {/* Reset sky controls */}
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      soundManager.playBubble();
                      setSandboxItems([]);
                      setConstellationStep(0);
                      setConstellationCompleted(false);
                    }}
                    className="px-3.5 py-1.5 rounded-xl border border-rose-950/50 bg-rose-950/20 text-rose-300 hover:bg-rose-950/40 font-extrabold text-xs cursor-pointer"
                  >
                    Clear Sky 🔄
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Universal Finish & Claim Story Star Rewards Panel */}
        <div className="mt-8 p-4 rounded-3xl bg-slate-900 border border-indigo-950/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="text-left">
            <p className="font-extrabold text-sm text-yellow-300">🌟 Sleepy Bedtime Reward!</p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Read stories, play rhymes, or construct dynamic starry night skies to collect your learning buddy reward stars!
            </p>
          </div>
          <button
            onClick={handleClaimAward}
            className="px-6 py-3 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-amber-950 font-black text-xs rounded-xl shadow-md cursor-pointer tracking-wider uppercase animate-pulse shrink-0"
          >
            Claim Stars & Return ⭐
          </button>
        </div>

      </div>
    </div>
  );
}
