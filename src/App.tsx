/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { KidProfile } from './types';
import ProfileCreator from './components/ProfileCreator';
import Dashboard from './components/Dashboard';

export default function App() {
  const [activeProfile, setActiveProfile] = useState<KidProfile | null>(null);

  // Restore active profile session if present
  useEffect(() => {
    const savedActiveId = localStorage.getItem('kids_active_profile_id');
    const savedProfiles = localStorage.getItem('kids_learning_profiles');
    if (savedActiveId && savedProfiles) {
      try {
        const profilesList = JSON.parse(savedProfiles) as KidProfile[];
        const found = profilesList.find((p) => p.id === savedActiveId);
        if (found) {
          setActiveProfile(found);
        }
      } catch (e) {
        // clear corrupted sessions
        localStorage.removeItem('kids_active_profile_id');
      }
    }
  }, []);

  const handleProfileSelect = (profile: KidProfile) => {
    setActiveProfile(profile);
    localStorage.setItem('kids_active_profile_id', profile.id);
  };

  const handleLogout = () => {
    setActiveProfile(null);
    localStorage.removeItem('kids_active_profile_id');
  };

  const handleProfileUpdate = (updatedProfile: KidProfile) => {
    setActiveProfile(updatedProfile);
    
    // Save state back to profiles list in localStorage
    const savedProfilesStr = localStorage.getItem('kids_learning_profiles');
    if (savedProfilesStr) {
      try {
        const list = JSON.parse(savedProfilesStr) as KidProfile[];
        const idx = list.findIndex((p) => p.id === updatedProfile.id);
        if (idx !== -1) {
          list[idx] = updatedProfile;
          localStorage.setItem('kids_learning_profiles', JSON.stringify(list));
        }
      } catch (e) {
        console.error('Failed to sync profile update offline:', e);
      }
    }
  };

  return (
    <div className="font-sans antialiased bg-slate-50 min-h-screen text-slate-800">
      {activeProfile ? (
        <Dashboard
          activeProfile={activeProfile}
          onLogout={handleLogout}
          onProfileUpdate={handleProfileUpdate}
        />
      ) : (
        <ProfileCreator onProfileSelect={handleProfileSelect} />
      )}
    </div>
  );
}

