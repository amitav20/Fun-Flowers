import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { soundManager } from '../../utils/sound';
import { ArrowLeft, Star, Trash2, Trophy, HelpCircle, RefreshCw, Sparkles, Navigation } from 'lucide-react';

interface FoodItem {
  id: string;
  emoji: string;
  name: string;
  targetCategory: 'red' | 'yellow' | 'purple';
}

const ALL_FOODS: FoodItem[] = [
  // Red foods
  { id: 'apple', emoji: '🍎', name: 'Sweet Apple', targetCategory: 'red' },
  { id: 'strawberry', emoji: '🍓', name: 'Strawberry', targetCategory: 'red' },
  { id: 'cherry', emoji: '🍒', name: 'Cherries', targetCategory: 'red' },
  { id: 'tomato', emoji: '🍅', name: 'Juicy Tomato', targetCategory: 'red' },
  // Yellow foods
  { id: 'banana', emoji: '🍌', name: 'Yummy Banana', targetCategory: 'yellow' },
  { id: 'lemon', emoji: '🍋', name: 'Sour Lemon', targetCategory: 'yellow' },
  { id: 'corn', emoji: '🌽', name: 'Sweet Corn', targetCategory: 'yellow' },
  { id: 'pineapple', emoji: '🍍', name: 'Pineapple', targetCategory: 'yellow' },
  // Purple foods
  { id: 'grapes', emoji: '🍇', name: 'Purple Grapes', targetCategory: 'purple' },
  { id: 'eggplant', emoji: '🍆', name: 'Eggplant', targetCategory: 'purple' },
  { id: 'blueberry', emoji: '🫐', name: 'Blueberries', targetCategory: 'purple' },
  { id: 'fig', emoji: '🍇', name: 'Sweet Fig', targetCategory: 'purple' },
];

interface Wagon {
  category: 'red' | 'yellow' | 'purple';
  title: string;
  color: string;
  emoji: string;
  wagonStyles: string;
  textStyles: string;
}

const WAGONS: Wagon[] = [
  {
    category: 'red',
    title: 'Red Wagon 🍎',
    emoji: '🚜',
    color: 'bg-red-500',
    wagonStyles: 'from-red-100 via-red-200 to-red-350 border-red-400 text-red-850',
    textStyles: 'text-red-800'
  },
  {
    category: 'yellow',
    title: 'Yellow Wagon 🍌',
    emoji: '🚜',
    color: 'bg-yellow-400',
    wagonStyles: 'from-yellow-100 via-yellow-250 to-yellow-350 border-yellow-450 text-yellow-900',
    textStyles: 'text-yellow-800'
  },
  {
    category: 'purple',
    title: 'Purple Wagon 🍇',
    emoji: '🚜',
    color: 'bg-purple-500',
    wagonStyles: 'from-purple-100 via-purple-200 to-purple-350 border-purple-400 text-purple-850',
    textStyles: 'text-purple-800'
  }
];

interface GameProps {
  onBack: () => void;
  onGameComplete: (starsEarned: number) => void;
}

export default function FarmSorter({ onBack, onGameComplete }: GameProps) {
  const [shelfItems, setShelfItems] = useState<FoodItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<FoodItem | null>(null);
  const [sortedItems, setSortedItems] = useState<Record<'red' | 'yellow' | 'purple', string[]>>({
    red: [],
    yellow: [],
    purple: [],
  });
  const [solvedCount, setSolvedCount] = useState(0);
  const [round, setRound] = useState(1);
  const [isWon, setIsWon] = useState(false);
  const [errorFeedback, setErrorFeedback] = useState<string | null>(null);

  const targetItemsToWin = 10;

  useEffect(() => {
    generateNewRound();
  }, []);

  const generateNewRound = () => {
    // Select random foods
    const shuffled = [...ALL_FOODS].sort(() => Math.random() - 0.5);
    setShelfItems(shuffled.slice(0, 5));
    setSelectedItem(null);
  };

  const handleItemSelect = (item: FoodItem) => {
    soundManager.playBubble();
    setSelectedItem(item);
    setErrorFeedback(null);
  };

  const handleWagonClick = (category: 'red' | 'yellow' | 'purple') => {
    if (!selectedItem) {
      setErrorFeedback('Tap a sweet food first!');
      return;
    }

    if (selectedItem.targetCategory === category) {
      // Correct Match!
      soundManager.playCorrect();
      const updatedSorted = { ...sortedItems };
      updatedSorted[category] = [...updatedSorted[category], selectedItem.emoji];
      setSortedItems(updatedSorted);

      // Remove from table
      const remainingItems = shelfItems.filter((i) => i.id !== selectedItem.id);
      setShelfItems(remainingItems);
      setSelectedItem(null);

      // Score
      const nextSolvedCount = solvedCount + 1;
      setSolvedCount(nextSolvedCount);

      if (nextSolvedCount >= targetItemsToWin) {
        setTimeout(() => {
          setIsWon(true);
          soundManager.playSuccess();
        }, 800);
      } else if (remainingItems.length === 0) {
        // Automatically start next miniature round
        setTimeout(() => {
          setRound((r) => r + 1);
          soundManager.playSparkle();
          generateNewRound();
        }, 800);
      }
    } else {
      // Wrong Match
      soundManager.playWrong();
      setErrorFeedback(`Whoops! That food does not match the ${category} wagon!`);
      setTimeout(() => {
        setErrorFeedback(null);
      }, 1500);
    }
  };

  const handleFinish = () => {
    onGameComplete(3); // Awards 3 full gold stars
  };

  const resetGame = () => {
    setSortedItems({ red: [], yellow: [], purple: [] });
    setSolvedCount(0);
    setRound(1);
    setIsWon(false);
    generateNewRound();
  };

  return (
    <div id="farm-sorter-game" className="flex flex-col h-full bg-gradient-to-b from-amber-50 via-lime-50 to-emerald-100 select-none overflow-hidden relative">
      
      {/* Game Header */}
      <div className="flex items-center justify-between p-4 bg-white/70 backdrop-blur-md border-b border-lime-100 z-10">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-3 py-2 text-emerald-700 bg-emerald-100 hover:bg-emerald-200 rounded-2xl font-semibold transition-all shadow-sm cursor-pointer text-xs md:text-sm"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back</span>
        </button>

        <div className="flex items-center gap-2 bg-amber-150 px-4 py-1.5 rounded-full border border-amber-300 shadow-sm">
          <Star className="w-5 h-5 text-amber-505 fill-amber-300 animate-spin-slow text-amber-500" />
          <span className="font-bold text-amber-950 text-xs md:text-sm">
            Wagon Loads: {solvedCount}/{targetItemsToWin} 🍎
          </span>
        </div>

        <div className="font-bold text-emerald-800 text-xs md:text-sm bg-lime-200/50 px-3 py-1.5 rounded-2xl">
          Harvest Round: {round} 🚜
        </div>
      </div>

      {/* Main Container */}
      <div className="flex-1 p-4 md:p-6 overflow-y-auto max-w-4xl mx-auto w-full flex flex-col justify-between">
        
        {/* Helper Title info */}
        <div className="text-center mb-4">
          <h1 className="text-2.5xl md:text-3.5xl font-black text-emerald-900 tracking-tight">
            🚜 Farm Color Loader Sorter 🍎
          </h1>
          <p className="text-xs md:text-sm font-semibold text-emerald-600 mt-1">
            Tap the sweet farm food, then tap its matching wagon color basket!
          </p>
        </div>

        {/* Selected food showcase bubble */}
        {selectedItem && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl p-4 shadow-md max-w-sm mx-auto w-full text-center border-l-4 border-amber-400 mb-4 flex items-center justify-center gap-3"
          >
            <span className="text-4xl animate-bounce">{selectedItem.emoji}</span>
            <div className="text-left">
              <p className="text-[10px] uppercase tracking-wider text-slate-400 font-extrabold">Loaded Selection</p>
              <h3 className="font-black text-base text-slate-800">{selectedItem.name}</h3>
            </div>
          </motion.div>
        )}

        {/* Error Feedback message bar */}
        <AnimatePresence>
          {errorFeedback && (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ opacity: 0 }}
              className="bg-rose-100 text-rose-800 border border-rose-200 font-bold text-xs p-2.5 rounded-xl text-center max-w-sm mx-auto w-full mb-4"
            >
              ⚠️ {errorFeedback}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Farm Food Table / Shelf */}
        <div className="bg-amber-100/40 p-5 rounded-3xl border-2 border-dashed border-amber-200 mb-8 mt-auto">
          <p className="text-[10px] font-black tracking-wider text-amber-800 uppercase text-center mb-4">
            🍒 Fresh Farm Food Harvest Shelf
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            {shelfItems.length === 0 ? (
              <p className="text-xs font-bold text-slate-400 p-6">Wagons loading... new food growing! 🌱</p>
            ) : (
              shelfItems.map((item) => {
                const isItemActive = selectedItem?.id === item.id;
                return (
                  <motion.div
                    key={item.id}
                    onClick={() => handleItemSelect(item)}
                    whileHover={{ scale: 1.08 }}
                    whileTap={{ scale: 0.95 }}
                    className={`w-16 h-18 md:w-20 md:h-22 rounded-2xl border-2 border-b-6 border-amber-200 bg-white p-3 shadow-sm cursor-pointer text-center relative flex flex-col items-center justify-center transition-all ${
                      isItemActive ? 'scale-110 !border-b-2 translate-y-2 border-teal-500 shadow-teal-150 shadow-md ring-2 ring-teal-400' : ''
                    }`}
                  >
                    <span className="text-3.5xl md:text-4xl">{item.emoji}</span>
                    <span className="text-[9px] font-black text-slate-500 mt-1 leading-none truncate w-full text-center">
                      {item.name}
                    </span>
                  </motion.div>
                );
              })
            )}
          </div>
        </div>

        {/* WAGONS CONTAINER - Drop zones */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-auto">
          {WAGONS.map((wagon) => {
            const wagonContents = sortedItems[wagon.category];
            return (
              <motion.div
                key={wagon.category}
                onClick={() => handleWagonClick(wagon.category)}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                className={`rounded-3xl p-5 border-2 border-b-8 shadow-md flex flex-col justify-between min-h-[160px] cursor-pointer bg-gradient-to-br ${wagon.wagonStyles}`}
              >
                {/* Wagon header representation */}
                <div className="flex items-center justify-between">
                  <span className={`w-3.5 h-3.5 rounded-full ${wagon.color} shadow-sm`} />
                  <span className="text-xs font-black uppercase tracking-wider">{wagon.title}</span>
                </div>

                {/* Loaded foods visuals */}
                <div className="flex flex-wrap items-center gap-1.5 p-3.5 bg-white/70 border border-white rounded-2xl min-h-[56px] my-3">
                  {wagonContents.length === 0 ? (
                    <p className="text-[10px] text-slate-400 font-extrabold mx-auto text-center">
                      Empty Wagon
                    </p>
                  ) : (
                    wagonContents.slice(-5).map((emoji, index) => (
                      <motion.span
                        key={index}
                        initial={{ scale: 0, rotate: -20 }}
                        animate={{ scale: 1, rotate: 0 }}
                        className="text-xl"
                      >
                        {emoji}
                      </motion.span>
                    ))
                  )}
                  {wagonContents.length > 5 && (
                    <span className="text-[9px] font-black text-slate-500 shrink-0">
                      +{wagonContents.length - 5}
                    </span>
                  )}
                </div>

                {/* Tractor Conductor Button */}
                <div className="text-center font-bold text-[11px] bg-white/90 border border-slate-200 py-1 rounded-xl">
                  {wagon.emoji} Put Food Here
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Progress summary message card */}
        <div className="mt-8 p-3 rounded-2xl bg-white/80 border border-lime-150 text-center max-w-md mx-auto w-full">
          <p className="text-[9px] text-emerald-800 font-extrabold uppercase leading-normal">
            ⭐ Sort {targetItemsToWin} fruits & veggies to deliver the harvest to the town and earn 3 Gold Stars!
          </p>
        </div>

      </div>

      {/* Level Win Modal */}
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
                Grand Harvester! 🎉
              </h3>
              <p className="text-gray-600 font-medium mb-6 leading-relaxed">
                You successfully sorted {solvedCount} healthy foods into the correct wagons! You earned <span className="font-bold text-amber-500 text-lg">3 Gold Stars</span>!
              </p>

              <div className="flex flex-col gap-2">
                <button
                  onClick={handleFinish}
                  className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-black py-3 px-6 rounded-2xl shadow-md transition-all text-lg cursor-pointer"
                >
                  Harvest Stars! ⭐
                </button>
                <button
                  onClick={resetGame}
                  className="w-full bg-slate-100 text-slate-700 font-bold py-2 rounded-xl text-xs transition-transform"
                >
                  Sort More Crop
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
