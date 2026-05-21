import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { soundManager } from '../utils/sound';
import { KidProfile, AgeGroup, GameMetadata } from '../types';
import { 
  LogOut, 
  Star, 
  Award, 
  Shield, 
  PartyPopper, 
  Trophy, 
  Volume2, 
  Undo2, 
  Sparkle, 
  ChevronRight,
  Sparkles
} from 'lucide-react';

// Game component imports
import BalloonPop from './games/BalloonPop';
import ShapeMixer from './games/ShapeMixer';
import AnimalCounting from './games/AnimalCounting';
import LetterQuest from './games/LetterQuest';
import MathStarQuest from './games/MathStarQuest';
import WordSpelling from './games/WordSpelling';
import AnimalSoundOrchestra from './games/AnimalSoundOrchestra';
import MemoryMatchAdventure from './games/MemoryMatchAdventure';
import PatternSolverBridge from './games/PatternSolverBridge';
import RainbowPiano from './games/RainbowPiano';
import FarmSorter from './games/FarmSorter';
import ClockAdventure from './games/ClockAdventure';
import RhymesStories from './games/RhymesStories';

interface DashboardProps {
  activeProfile: KidProfile;
  onLogout: () => void;
  onProfileUpdate: (p: KidProfile) => void;
}

const GAMES_LIST: GameMetadata[] = [
  {
    id: 'balloon-pop',
    title: 'Balloon Pop 🎈',
    description: 'Pop colorful floating balloons to discover letters, numbers, and animals!',
    minAge: 2,
    maxAge: 3,
    icon: 'Sparkles',
    color: 'from-pink-400 to-rose-400 shadow-rose-100 border-rose-100 text-rose-600 bg-rose-50',
    difficulty: 'Very Easy'
  },
  {
    id: 'shape-mixer',
    title: 'Color Shape Matcher 🎨',
    description: 'Match beautiful shapes with bright, sunny colors in your painting card!',
    minAge: 2,
    maxAge: 3,
    icon: 'Palette',
    color: 'from-purple-400 to-indigo-400 shadow-indigo-100 border-indigo-100 text-indigo-600 bg-indigo-50',
    difficulty: 'Very Easy'
  },
  {
    id: 'animal-orchestra',
    title: 'Animal Orchestra 🐮🎵',
    description: 'Conduct your own funny animal sounds orchestra! Compose and play recorded musical sequences.',
    minAge: 2,
    maxAge: 3,
    icon: 'Sparkles',
    color: 'from-indigo-400 to-pink-400 shadow-indigo-150 border-indigo-200 text-indigo-700 bg-indigo-50',
    difficulty: 'Very Easy'
  },
  {
    id: 'rainbow-piano',
    title: 'Rainbow Piano 🎹🌈',
    description: 'Play beautiful musical notes with friendly animals or sing interactive nursery guidance songs!',
    minAge: 2,
    maxAge: 3,
    icon: 'Music',
    color: 'from-rose-400 to-red-400 shadow-rose-100 border-rose-200 text-rose-700 bg-rose-50',
    difficulty: 'Very Easy'
  },
  {
    id: 'counting',
    title: 'Animal Counting Quest 🐨',
    description: 'Help count sweet bees, cats, and apples and find their magic number blocks!',
    minAge: 4,
    maxAge: 5,
    icon: 'Calculator',
    color: 'from-amber-400 to-orange-400 shadow-orange-100 border-orange-100 text-orange-600 bg-orange-50',
    difficulty: 'Easy'
  },
  {
    id: 'letter-quest',
    title: 'Phonics Letter Finder 🔤',
    description: 'Find correct starting letter sound blocks for friendly animal objects!',
    minAge: 4,
    maxAge: 5,
    icon: 'Languages',
    color: 'from-sky-400 to-blue-400 shadow-blue-100 border-blue-100 text-blue-600 bg-blue-50',
    difficulty: 'Easy'
  },
  {
    id: 'memory-match',
    title: 'Memory Card Match 🐨🃏',
    description: 'Match cute animated animal pairs under flipping cards using clean concentration memory steps.',
    minAge: 4,
    maxAge: 5,
    icon: 'Star',
    color: 'from-teal-400 to-emerald-400 shadow-emerald-100 border-emerald-100 text-emerald-600 bg-emerald-50',
    difficulty: 'Easy'
  },
  {
    id: 'farm-sorter',
    title: 'Farm Color Sorter 🚜🌾',
    description: 'Sort healthy fruits and vegetables into matching wagons by color classification!',
    minAge: 4,
    maxAge: 5,
    icon: 'Wheat',
    color: 'from-lime-400 to-emerald-400 shadow-emerald-100 border-emerald-100 text-emerald-600 bg-emerald-50',
    difficulty: 'Easy'
  },
  {
    id: 'math-quest',
    title: 'Star Math Rocket 🚀',
    description: 'Thrust a star spaceship across planets by solving math additions and subtractions!',
    minAge: 6,
    maxAge: 8,
    icon: 'Rocket',
    color: 'from-blue-600 to-indigo-600 shadow-cyan-950 border-cyan-900/40 text-cyan-400 bg-slate-900',
    difficulty: 'Medium'
  },
  {
    id: 'spelling',
    title: 'Spelling Word Quest 🐸',
    description: 'Rearrange scrambled letters in order to spell names of frogs, ducks, and stars!',
    minAge: 6,
    maxAge: 8,
    icon: 'FileSpreadsheet',
    color: 'from-emerald-400 to-teal-500 shadow-teal-100 border-teal-100 text-teal-600 bg-teal-50',
    difficulty: 'Fun Adventure'
  },
  {
    id: 'pattern-solver',
    title: 'Astronaut Space Pattern 🛸🌌',
    description: 'Complete logical animal pattern arrays and skipping numbers to refuel star spaceships!',
    minAge: 6,
    maxAge: 8,
    icon: 'Sparkles',
    color: 'from-violet-500 to-indigo-600 shadow-pink-100 border-pink-100 text-pink-600 bg-pink-50',
    difficulty: 'Medium'
  },
  {
    id: 'clock-adventure',
    title: 'Clock Time Master ⏰✨',
    description: 'Read hours and minutes on interactive analog clocks or set hands to power spaceship dials!',
    minAge: 6,
    maxAge: 8,
    icon: 'Clock',
    color: 'from-violet-500 to-purple-600 shadow-pink-100 border-pink-100 text-pink-600 bg-pink-50',
    difficulty: 'Medium'
  },
  {
    id: 'rhymes-stories',
    title: 'Rhymes & Bedtime Stories 🌙✨',
    description: 'Sing interactive rhymes, play cozy bedtime games, or listen to sweet narrated stories for kids of all ages!',
    minAge: 2,
    maxAge: 8,
    icon: 'Moon',
    color: 'from-blue-900 to-indigo-950 shadow-indigo-950 border-indigo-900 text-cyan-300 bg-slate-900',
    difficulty: 'Fun Adventure'
  }
];

const ACHIEVEMENTS_LIST = [
  { id: 'first_play', title: 'First Game Play', desc: 'Played your very first learning game!', emoji: '🥳', badgeColor: 'bg-rose-100 border-rose-300' },
  { id: 'toddler_master', title: 'Play & Discover Master', desc: 'Completed a Toddler match!', emoji: '🎈', badgeColor: 'bg-purple-100 border-purple-300' },
  { id: 'math_wiz', title: 'Star Math Officer', desc: 'Answered difficult maths perfectly!', emoji: '🚀', badgeColor: 'bg-cyan-100 border-cyan-300' },
  { id: 'word_star', title: 'Grand Word Finder', desc: 'Completed spelling and word quests!', emoji: '📝', badgeColor: 'bg-emerald-100 border-emerald-300' },
];

export default function Dashboard({ activeProfile, onLogout, onProfileUpdate }: DashboardProps) {
  const [activeGameId, setActiveGameId] = useState<string | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);
  const [starsAwardedThisTurn, setStarsAwardedThisTurn] = useState(0);

  const getAgeLabel = (group: AgeGroup) => {
    if (group === 'toddler') return 'Toddlers (2-3 yrs) Track';
    if (group === 'preschool') return 'Preschoolers (4-5 yrs) Track';
    return 'Early Learners (6-8 yrs) Track';
  };

  const isRecommended = (game: GameMetadata, group: AgeGroup) => {
    if (group === 'toddler') return game.minAge === 2;
    if (group === 'preschool') return game.minAge === 4;
    return game.minAge === 6;
  };

  const handleLaunchGame = (gameId: string) => {
    soundManager.playBubble();
    setActiveGameId(gameId);
  };

  const handleBackToDashboard = () => {
    soundManager.playBubble();
    setActiveGameId(null);
  };

  const handleGameComplete = (starsEarned: number) => {
    soundManager.playSuccess();
    
    // Update profile metrics
    const updatedStars = activeProfile.stars + coinsEarnedRate(activeGameId || '', starsEarned);
    const updatedCount = activeProfile.completedGamesCount + 1;
    
    // Check for achievements
    const nextAchievements = [...activeProfile.achievements];
    if (updatedCount === 1 && !nextAchievements.includes('first_play')) {
      nextAchievements.push('first_play');
    }
    if ((activeGameId === 'balloon-pop' || activeGameId === 'shape-mixer' || activeGameId === 'animal-orchestra' || activeGameId === 'rainbow-piano') && !nextAchievements.includes('toddler_master')) {
      nextAchievements.push('toddler_master');
    }
    if ((activeGameId === 'math-quest' || activeGameId === 'pattern-solver' || activeGameId === 'clock-adventure') && !nextAchievements.includes('math_wiz')) {
      nextAchievements.push('math_wiz');
    }
    if ((activeGameId === 'spelling' || activeGameId === 'memory-match' || activeGameId === 'farm-sorter') && !nextAchievements.includes('word_star')) {
      nextAchievements.push('word_star');
    }

    const updatedProfile: KidProfile = {
      ...activeProfile,
      stars: updatedStars,
      completedGamesCount: updatedCount,
      achievements: nextAchievements,
    };

    onProfileUpdate(updatedProfile);
    setStarsAwardedThisTurn(starsEarned);
    setActiveGameId(null);
    setShowCelebration(true);
  };

  // Helper scaling for high-difficulty rewards
  const coinsEarnedRate = (gameId: string, base: number) => {
    if (gameId === 'math-quest' || gameId === 'spelling' || gameId === 'pattern-solver' || gameId === 'clock-adventure') {
      return base + 2; // bonus space stars
    }
    return base;
  };

  // Sound effects test for fun child engagement
  const handleTickleAvatar = () => {
    soundManager.playSparkle();
  };

  const getAvatarEmoji = (id: string) => {
    const avatars: Record<string, string> = {
      lion: '🦁', panda: '🐼', koala: '🐨', rabbit: '🐰', frog: '🐸', dino: '🦖'
    };
    return avatars[id] || '🧒';
  };

  return (
    <div id="learning-dashboard" className="min-h-screen bg-slate-50 select-none overflow-x-hidden relative">
      <AnimatePresence mode="wait">
        {/* If Game is active, render the specific game component inside full screen overlay */}
        {activeGameId ? (
          <motion.div 
            key={activeGameId}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-white"
          >
            {activeGameId === 'balloon-pop' && (
              <BalloonPop onBack={handleBackToDashboard} onGameComplete={handleGameComplete} />
            )}
            {activeGameId === 'shape-mixer' && (
              <ShapeMixer onBack={handleBackToDashboard} onGameComplete={handleGameComplete} />
            )}
            {activeGameId === 'animal-orchestra' && (
              <AnimalSoundOrchestra onBack={handleBackToDashboard} onGameComplete={handleGameComplete} />
            )}
            {activeGameId === 'rainbow-piano' && (
              <RainbowPiano onBack={handleBackToDashboard} onGameComplete={handleGameComplete} />
            )}
            {activeGameId === 'counting' && (
              <AnimalCounting onBack={handleBackToDashboard} onGameComplete={handleGameComplete} />
            )}
            {activeGameId === 'letter-quest' && (
              <LetterQuest onBack={handleBackToDashboard} onGameComplete={handleGameComplete} />
            )}
            {activeGameId === 'memory-match' && (
              <MemoryMatchAdventure onBack={handleBackToDashboard} onGameComplete={handleGameComplete} />
            )}
            {activeGameId === 'farm-sorter' && (
              <FarmSorter onBack={handleBackToDashboard} onGameComplete={handleGameComplete} />
            )}
            {activeGameId === 'math-quest' && (
              <MathStarQuest onBack={handleBackToDashboard} onGameComplete={handleGameComplete} />
            )}
            {activeGameId === 'spelling' && (
              <WordSpelling onBack={handleBackToDashboard} onGameComplete={handleGameComplete} />
            )}
            {activeGameId === 'pattern-solver' && (
              <PatternSolverBridge onBack={handleBackToDashboard} onGameComplete={handleGameComplete} />
            )}
            {activeGameId === 'clock-adventure' && (
              <ClockAdventure onBack={handleBackToDashboard} onGameComplete={handleGameComplete} />
            )}
            {activeGameId === 'rhymes-stories' && (
              <RhymesStories onBack={handleBackToDashboard} onGameComplete={handleGameComplete} />
            )}
          </motion.div>
        ) : (
          /* Dashboard Layout Home */
          <div className="max-w-6xl mx-auto px-4 py-6 md:py-8">
            
            {/* Upper Greeting Banner Hub */}
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xl flex flex-col md:flex-row gap-6 justify-between items-center mb-8 relative overflow-hidden">
              {/* Colored background blob */}
              <div 
                className="absolute right-0 top-0 bottom-0 w-1/3 opacity-10 rounded-l-full pointer-events-none"
                style={{ backgroundColor: activeProfile.color }}
              />

              <div className="flex flex-col sm:flex-row gap-5 items-center text-center sm:text-left z-10">
                <motion.div
                  onClick={handleTickleAvatar}
                  whileHover={{ scale: 1.1, rotate: [0, 5, -5, 0] }}
                  whileTap={{ scale: 0.95 }}
                  className="w-24 h-24 rounded-full border-4 shadow-md flex items-center justify-center text-6xl cursor-pointer hover:shadow-lg transition-shadow"
                  style={{ borderColor: activeProfile.color, backgroundColor: activeProfile.color + '18' }}
                >
                  {getAvatarEmoji(activeProfile.avatar)}
                </motion.div>
                
                <div>
                  <h1 className="text-3xl font-black text-slate-800 leading-tight">
                    Hello, <span className="capitalize" style={{ color: activeProfile.color }}>{activeProfile.name}</span>!
                  </h1>
                  <p className="text-sm font-semibold text-slate-400 mt-1 flex items-center gap-2 justify-center sm:justify-start">
                    <span className="inline-block w-2.5 h-2.5 rounded-full bg-indigo-500" />
                    Recommended Track: {getAgeLabel(activeProfile.ageGroup)}
                  </p>
                </div>
              </div>

              {/* Stats Counters Widget panel */}
              <div className="flex gap-4 items-center z-10 w-full sm:w-auto justify-center">
                <div className="bg-amber-50 rounded-2xl p-3 border border-amber-200 px-5 text-center min-w-[100px] shadow-sm flex items-center gap-3">
                  <Star className="text-amber-500 fill-amber-300 w-9 h-9 animate-bounce" />
                  <div className="text-left">
                    <p className="text-xs font-bold text-amber-600 uppercase">My Stars</p>
                    <p className="text-2xl font-black text-amber-900 tracking-tight">{activeProfile.stars}</p>
                  </div>
                </div>

                <div className="bg-purple-50 rounded-2xl p-3 border border-purple-100 px-5 text-center min-w-[100px] shadow-sm flex items-center gap-3">
                  <Trophy className="text-purple-500 fill-purple-100 w-9 h-9" />
                  <div className="text-left">
                    <p className="text-xs font-bold text-purple-600 uppercase">Cleared</p>
                    <p className="text-2xl font-black text-purple-900 tracking-tight">{activeProfile.completedGamesCount}</p>
                  </div>
                </div>
              </div>

              {/* Action utilities like Logout / switch profile safely */}
              <div className="absolute top-4 right-4 z-20">
                <button
                  onClick={onLogout}
                  className="flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-rose-500 hover:bg-rose-50 px-2.5 py-1.5 rounded-xl border border-dashed border-slate-200 hover:border-rose-100 transition-all cursor-pointer bg-white"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Switch Buddy</span>
                </button>
              </div>
            </div>

            {/* Quick sound introduction board */}
            <div className="mb-8 p-4 bg-indigo-50 rounded-2xl border border-indigo-100 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Volume2 className="text-indigo-600 w-6 h-6 animate-pulse" />
                <p className="text-xs sm:text-sm font-bold text-indigo-900 leading-relaxed">
                  Interactive Sound Synthesizers are fully activated! Pick your favorite level below. No internet needed! 🍦
                </p>
              </div>
              <button 
                onClick={() => { soundManager.playSparkle(); }}
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-xl shadow-sm transition-transform cursor-pointer"
              >
                Test Sound Chime 🎵
              </button>
            </div>

            {/* Core Games Playground Container Grid split by levels */}
            <div className="space-y-10">
              
              {/* Group Recommendation Section */}
              <div>
                <div className="flex items-center gap-2.5 mb-5">
                  <div className="p-1 px-3 bg-indigo-100 border border-indigo-200 rounded-full text-indigo-700 font-extrabold text-xs">
                    Recommended Pathways
                  </div>
                  <h2 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
                    🎯 Just For You, {activeProfile.name}!
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {GAMES_LIST.filter(g => isRecommended(g, activeProfile.ageGroup)).map((game) => (
                    <motion.div
                      key={game.id}
                      onClick={() => handleLaunchGame(game.id)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`relative bg-white rounded-3xl p-6 border-b-8 border-2 ${game.color} cursor-pointer transition-all flex flex-col justify-between`}
                    >
                      {/* Interactive recommended badge */}
                      <div className="absolute top-4 right-4 flex items-center gap-1 bg-amber-400 text-amber-950 font-black px-3 py-0.5 rounded-full text-[10px] tracking-wider uppercase shadow-sm">
                        <Sparkles className="w-3 h-3 fill-amber-950" />
                        <span>Best Choice!</span>
                      </div>

                      <div className="mb-6 pr-12">
                        <span className="text-xs font-bold text-slate-400 tracking-wider uppercase block mb-1">
                          Ages {game.minAge}-{game.maxAge} • {game.difficulty} Lesson
                        </span>
                        <h3 className="text-2xl font-extrabold text-slate-800 leading-tight mb-2">
                          {game.title}
                        </h3>
                        <p className="text-sm font-medium text-slate-500 leading-relaxed">
                          {game.description}
                        </p>
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t border-slate-100/30">
                        <span className="font-black text-rose-500 flex items-center gap-1 text-sm bg-rose-50 px-3 py-1 rounded-xl">
                          ⭐ Rewards: +3 Stars
                        </span>
                        <span className="text-xs font-black bg-indigo-50/80 px-3 py-1.5 rounded-2xl flex items-center gap-0.5">
                          Play Level <ChevronRight className="w-3 h-3" />
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Other age pathways (Explorer's directory) */}
              <div>
                <div className="flex items-center gap-2 mb-5">
                  <h2 className="text-xl font-bold text-slate-800 tracking-tight">
                    🗺️ Explore Other Age Group Adventures
                  </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {GAMES_LIST.filter(g => !isRecommended(g, activeProfile.ageGroup)).map((game) => (
                    <motion.div
                      key={game.id}
                      onClick={() => handleLaunchGame(game.id)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="bg-white border-2 border-slate-100 p-5 rounded-2xl hover:border-slate-200 hover:shadow-sm cursor-pointer transition-all flex flex-col justify-between"
                    >
                      <div className="mb-4">
                        <span className="text-[10px] font-black text-slate-400 tracking-wider uppercase block mb-1">
                          Ages {game.minAge}-{game.maxAge} • {game.difficulty}
                        </span>
                        <h4 className="font-extrabold text-base text-slate-800 leading-tight mb-1">
                          {game.title}
                        </h4>
                        <p className="text-xs text-slate-400 leading-normal line-clamp-2">
                          {game.description}
                        </p>
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-slate-50">
                        <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-lg">
                          +3 Stars
                        </span>
                        <span className="text-[10px] font-bold text-slate-400">Try level</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Achievements Showcase Cabinets */}
              <div className="bg-gradient-to-tr from-indigo-900 to-indigo-950 rounded-3xl p-6 border border-indigo-800 text-white shadow-xl relative overflow-hidden">
                {/* Background design ornaments */}
                <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-pink-500/10 rounded-full blur-2xl" />

                <div className="flex items-center gap-2 mb-5">
                  <Award className="text-amber-400 w-6 h-6" />
                  <h2 className="text-xl font-extrabold text-white tracking-tight">
                    🏆 My Star Achievements Cabinet
                  </h2>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {ACHIEVEMENTS_LIST.map((ach) => {
                    const isUnlocked = activeProfile.achievements.includes(ach.id);
                    return (
                      <div
                        key={ach.id}
                        className={`p-4 rounded-2xl border flex flex-col items-center text-center transition-all ${
                          isUnlocked 
                            ? 'bg-slate-900/60 border-indigo-600/50 shadow-md' 
                            : 'bg-slate-950/40 border-slate-900 opacity-40 grayscale'
                        }`}
                      >
                        <span className="text-4xl mb-2">{ach.emoji}</span>
                        <h4 className="font-bold text-sm text-indigo-100">{ach.title}</h4>
                        <p className="text-[10px] text-indigo-400 mt-1 leading-normal max-w-[120px] mx-auto">
                          {ach.desc}
                        </p>
                        
                        {isUnlocked ? (
                          <span className="text-[9px] font-black bg-emerald-500/20 text-emerald-400 px-2.5 py-0.5 rounded-full border border-emerald-500/30 mt-3 uppercase tracking-wider">
                            Unlocked!
                          </span>
                        ) : (
                          <span className="text-[9px] font-bold text-slate-500 bg-slate-900 mt-3 py-0.5 px-2 rounded-full">
                            Locked
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>

            {/* Level Celebrations Popup Modal */}
            <AnimatePresence>
              {showCelebration && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 bg-black/50 backdrop-blur-md flex items-center justify-center p-4 z-40 text-center"
                >
                  <motion.div 
                    initial={{ scale: 0.8, y: 30 }}
                    animate={{ scale: 1, y: 0 }}
                    exit={{ scale: 0.8, y: 30 }}
                    className="bg-white rounded-3xl p-6 md:p-8 max-w-sm w-full border-4 border-amber-400 shadow-2xl relative"
                  >
                    <div className="absolute -top-14 left-1/2 -translate-x-1/2 bg-amber-400 p-4 rounded-full border-4 border-white shadow-lg animate-bounce">
                      <PartyPopper className="w-12 h-12 text-amber-950" />
                    </div>

                    <h3 className="text-3xl font-black text-slate-950 mt-8 mb-2">
                      Fantastic Job! 🎉
                    </h3>
                    <p className="text-gray-600 font-medium mb-6">
                      You conquered the dynamic offline lesson and added <span className="font-bold text-amber-500 text-lg">+{starsAwardedThisTurn} Gold Stars</span> to your personal buddy profile cabinet!
                    </p>

                    <button
                      onClick={() => {
                        soundManager.playSparkle();
                        setShowCelebration(false);
                      }}
                      className="w-full bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-amber-950 font-black py-3 px-6 rounded-2xl shadow-md transition-all text-lg cursor-pointer"
                    >
                      Sweet Reward! ⭐
                    </button>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
