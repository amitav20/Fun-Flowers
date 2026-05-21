import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { soundManager } from '../utils/sound';
import { KidProfile, AgeGroup } from '../types';
import { Plus, Check, Star, Trash2 } from 'lucide-react';

const AVATARS = [
  { id: 'lion', emoji: '🦁', label: 'Brave Lion', bg: 'bg-amber-100 border-amber-300' },
  { id: 'panda', emoji: '🐼', label: 'Playful Panda', bg: 'bg-zinc-100 border-zinc-300' },
  { id: 'koala', emoji: '🐨', label: 'Cool Koala', bg: 'bg-slate-100 border-slate-300' },
  { id: 'rabbit', emoji: '🐰', label: 'Happy Bunny', bg: 'bg-rose-100 border-rose-300' },
  { id: 'frog', emoji: '🐸', label: 'Leap Frog', bg: 'bg-emerald-100 border-emerald-300' },
  { id: 'dino', emoji: '🦖', label: 'Baby Dino', bg: 'bg-green-100 border-green-300' },
];

const COLORS = [
  { id: 'rose', value: '#f43f5e', bgClass: 'bg-rose-500 shadow-rose-200' },
  { id: 'sky', value: '#0ea5e9', bgClass: 'bg-sky-500 shadow-sky-200' },
  { id: 'emerald', value: '#10b981', bgClass: 'bg-emerald-500 shadow-emerald-200' },
  { id: 'amber', value: '#f59e0b', bgClass: 'bg-amber-500 shadow-amber-200' },
  { id: 'purple', value: '#a855f7', bgClass: 'bg-purple-500 shadow-purple-200' },
];

interface ProfileCreatorProps {
  onProfileSelect: (profile: KidProfile) => void;
}

export default function ProfileCreator({ onProfileSelect }: ProfileCreatorProps) {
  const [profiles, setProfiles] = useState<KidProfile[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [name, setName] = useState('');
  const [ageGroup, setAgeGroup] = useState<AgeGroup>('toddler');
  const [selectedAvatar, setSelectedAvatar] = useState(AVATARS[0].id);
  const [selectedColor, setSelectedColor] = useState(COLORS[0].value);

  // Load existing profiles from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('kids_learning_profiles');
    if (saved) {
      try {
        setProfiles(JSON.parse(saved));
      } catch (e) {
        setProfiles([]);
      }
    }
  }, []);

  const saveProfiles = (updatedList: KidProfile[]) => {
    setProfiles(updatedList);
    localStorage.setItem('kids_learning_profiles', JSON.stringify(updatedList));
  };

  const handleCreateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    soundManager.playSuccess();

    const newProfile: KidProfile = {
      id: Math.random().toString(),
      name: name.trim(),
      avatar: selectedAvatar,
      color: selectedColor,
      ageGroup,
      stars: 0,
      completedGamesCount: 0,
      achievements: [],
    };

    const updated = [...profiles, newProfile];
    saveProfiles(updated);
    
    // Reset form states
    setName('');
    setIsCreating(false);
    
    // Auto-select newly created profile!
    onProfileSelect(newProfile);
  };

  const handleDeleteProfile = (id: string, e: React.MouseEvent) => {
    e.stopPropagation(); // don't trigger selection
    soundManager.playWrong();
    
    const updated = profiles.filter(p => p.id !== id);
    saveProfiles(updated);
  };

  const handleSelect = (p: KidProfile) => {
    soundManager.playBubble();
    onProfileSelect(p);
  };

  const getAvatarEmoji = (id: string) => {
    return AVATARS.find(a => a.id === id)?.emoji || '🧒';
  };

  const currentThemeColorClass = (colorVal: string) => {
    return COLORS.find(c => c.value === colorVal)?.bgClass || 'bg-indigo-500';
  };

  return (
    <div id="profile-selection-component" className="min-h-screen bg-slate-50 flex items-center justify-center p-4 select-none relative overflow-hidden">
      
      {/* Playful Floating Circles background ornament */}
      <div className="absolute top-10 right-10 w-44 h-44 bg-pink-100 rounded-full blur-3xl opacity-60 pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-52 h-52 bg-sky-100 rounded-full blur-3xl opacity-60 pointer-events-none" />

      <div className="w-full max-w-2xl bg-white border border-slate-100 rounded-3xl p-6 md:p-8 shadow-2xl z-10 text-center relative">
        <div className="absolute top-4 left-4 flex gap-1 items-center">
          <Star className="text-amber-400 w-5 h-5 fill-amber-300 animate-spin-slow" />
          <span className="font-bold text-xs text-slate-400">Kids Offline Learning Hub</span>
        </div>

        {/* Dynamic header toggles */}
        {!isCreating ? (
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-slate-800 mb-2 tracking-tight">
              🦄 Who's Playing Today?
            </h1>
            <p className="text-slate-500 font-medium mb-8">
              Pick your cute animal avatar profile to start learning games!
            </p>

            {/* Profile Selection list */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 justify-center items-center mb-10">
              {profiles.map((p) => (
                <motion.div
                  key={p.id}
                  onClick={() => handleSelect(p)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="group relative bg-slate-50 border-2 border-slate-100 rounded-3xl p-5 shadow-sm hover:shadow-md cursor-pointer transition-all flex flex-col items-center gap-3 relative"
                  style={{ borderColor: p.color + '40' }}
                >
                  {/* Delete button hidden/visible */}
                  <button
                    onClick={(e) => handleDeleteProfile(p.id, e)}
                    className="absolute top-3 right-3 p-1.5 text-slate-300 hover:text-rose-500 bg-white shadow-sm border border-slate-100 rounded-full transition-colors opacity-0 group-hover:opacity-100"
                    title="Delete Profile"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  <div 
                    className="w-20 h-20 rounded-full flex items-center justify-center text-5xl border shadow-inner transition-transform"
                    style={{ backgroundColor: p.color + '15', borderColor: p.color }}
                  >
                    {getAvatarEmoji(p.avatar)}
                  </div>

                  <div>
                    <h3 className="font-bold text-lg text-slate-800 capitalize leading-tight">
                      {p.name}
                    </h3>
                    <p className="text-xs font-semibold text-slate-400 mt-0.5">
                      {p.ageGroup === 'toddler' ? 'Toddler (2-3)' : p.ageGroup === 'preschool' ? 'Preschool (4-5)' : 'Early (6-8)'}
                    </p>
                  </div>

                  <div className="flex items-center gap-1 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                    <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-300" />
                    <span className="text-xs font-black text-amber-800">{p.stars}</span>
                  </div>
                </motion.div>
              ))}

              {/* Add/New profile block */}
              <motion.button
                onClick={() => {
                  soundManager.playBubble();
                  setIsCreating(true);
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-slate-50 border-2 border-dashed border-slate-300 rounded-3xl p-5 hover:border-slate-400 transition-all flex flex-col items-center justify-center gap-3 h-full min-h-[190px] cursor-pointer"
              >
                <div className="w-14 h-14 rounded-full bg-slate-200 flex items-center justify-center text-slate-500">
                  <Plus className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-700">Add Kid</h3>
                  <p className="text-xs text-slate-400">Create Profile</p>
                </div>
              </motion.button>
            </div>
          </div>
        ) : (
          /* Profile creation form UI panel */
          <motion.form 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            onSubmit={handleCreateProfile}
            className="text-left max-w-lg mx-auto"
          >
            <h2 className="text-2xl font-black text-slate-800 text-center mb-1">
              🎨 Create Learning Buddy
            </h2>
            <p className="text-slate-500 font-medium text-center text-sm mb-6">
              Configure profile badge values safely offline
            </p>

            <div className="space-y-5">
              {/* Name Field */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">
                  Kid's Nickname
                </label>
                <input
                  type="text"
                  required
                  maxLength={10}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Liam, Emma..."
                  className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-2xl focus:border-indigo-500 focus:outline-none transition-colors font-bold text-slate-800 text-lg"
                />
              </div>

              {/* Age Group selects */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">
                  Select Age Group Range (Learning Path)
                </label>
                <div className="grid grid-cols-1 gap-3">
                  <button
                    type="button"
                    onClick={() => { soundManager.playBubble(); setAgeGroup('toddler'); }}
                    className={`flex items-start gap-3 p-3.5 rounded-2xl border-2 text-left cursor-pointer transition-all ${
                      ageGroup === 'toddler' 
                        ? 'bg-rose-50 border-rose-400 shadow-sm' 
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="text-3xl">🎈</div>
                    <div>
                      <h4 className="font-bold text-slate-800">Toddler Class (2-3 years)</h4>
                      <p className="text-xs font-semibold text-slate-500">Play-Discover: Shapes matching, balloon poppers, animal sounds.</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => { soundManager.playBubble(); setAgeGroup('preschool'); }}
                    className={`flex items-start gap-3 p-3.5 rounded-2xl border-2 text-left cursor-pointer transition-all ${
                      ageGroup === 'preschool' 
                        ? 'bg-rose-50 border-rose-400 shadow-sm' 
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="text-3xl">🦁</div>
                    <div>
                      <h4 className="font-bold text-slate-800">Preschool Class (4-5 years)</h4>
                      <p className="text-xs font-semibold text-slate-500">Explore-Count: Animal counting items, letter quests, word starts.</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => { soundManager.playBubble(); setAgeGroup('early'); }}
                    className={`flex items-start gap-3 p-3.5 rounded-2xl border-2 text-left cursor-pointer transition-all ${
                      ageGroup === 'early' 
                        ? 'bg-rose-50 border-rose-400 shadow-sm' 
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="text-3xl">🚀</div>
                    <div>
                      <h4 className="font-bold text-slate-800">Early Learners (6-8 years)</h4>
                      <p className="text-xs font-semibold text-slate-500">Solve-Learn: Cosmic math additions/subtractions, spelling words.</p>
                    </div>
                  </button>
                </div>
              </div>

              {/* Avatar pickers */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">
                  Pick Animal Avatar Friend
                </label>
                <div className="grid grid-cols-6 gap-2">
                  {AVATARS.map((a) => {
                    const isSelected = selectedAvatar === a.id;
                    return (
                      <button
                        key={a.id}
                        type="button"
                        onClick={() => { soundManager.playBubble(); setSelectedAvatar(a.id); }}
                        className={`aspect-square rounded-2xl ${a.bg} border-2 text-3xl flex items-center justify-center cursor-pointer transition-transform duration-100 ${
                          isSelected ? 'scale-110 ring-2 ring-indigo-500 border-indigo-500' : 'opacity-70 hover:opacity-100'
                        }`}
                        title={a.label}
                      >
                        {a.emoji}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Theme color Picker */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">
                  Avatar Frame Theme Color
                </label>
                <div className="flex gap-3">
                  {COLORS.map((c) => {
                    const isSelected = selectedColor === c.value;
                    return (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => { soundManager.playBubble(); setSelectedColor(c.value); }}
                        className={`w-8 h-8 rounded-full cursor-pointer border-2 transition-transform duration-100 ${c.bgClass} ${
                          isSelected ? 'scale-110 ring-2 ring-indigo-500 border-white' : 'border-transparent opacity-80 hover:opacity-100'
                        }`}
                      />
                    );
                  })}
                </div>
              </div>
            </div>

            {/* CTAs */}
            <div className="flex gap-3 mt-8">
              <button
                type="button"
                onClick={() => { soundManager.playBubble(); setIsCreating(false); }}
                className="flex-1 py-3 text-slate-700 bg-slate-100 hover:bg-slate-200 font-bold rounded-2xl text-center cursor-pointer transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-3 text-white bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 font-bold rounded-2xl text-center shadow-lg hover:shadow-xl transition-all cursor-pointer"
              >
                Let's Play! 🎉
              </button>
            </div>
          </motion.form>
        )}
      </div>
    </div>
  );
}
