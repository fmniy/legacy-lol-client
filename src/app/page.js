'use client';

import { useState, useEffect } from 'react';
import LoginScreen from '../components/LoginScreen';
import MainMenu from '../components/MainMenu';
import ProfileScreen from '../components/ProfileScreen';
import TermsOfUse from '../components/TermsOfUse';

export default function Home() {
  const [currentScreen, setCurrentScreen] = useState('login');
  const [showTerms, setShowTerms] = useState(false);
  const [userData, setUserData] = useState({
    riotId: '',
    region: ''
  });

  useEffect(() => {
    const savedUser = localStorage.getItem('activeUser');
    if (savedUser) {
      setUserData(JSON.parse(savedUser));
      setCurrentScreen('main');
    }
  }, []);

  const handleLoginSuccess = (data) => {
    setUserData(data);
    localStorage.setItem('activeUser', JSON.stringify(data));
    setCurrentScreen('main');
  };

  const handleNavigate = (screen) => {
    if (screen === 'login') {
      localStorage.removeItem('activeUser');
    }
    setCurrentScreen(screen);
  };

  return (
    <main>
      {currentScreen === 'login' && (
        <LoginScreen 
          onLoginSuccess={handleLoginSuccess} 
          onShowTerms={() => setShowTerms(true)}
        />
      )}
      
      {currentScreen === 'main' && (
        <MainMenu userData={userData} onNavigate={handleNavigate} />
      )}
      
      {currentScreen === 'profile' && (
        <ProfileScreen 
          userData={userData}
          onNavigate={handleNavigate} 
        />
      )}

      {showTerms && (
        <TermsOfUse onClose={() => setShowTerms(false)} />
      )}
    </main>
  );
}
