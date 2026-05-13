'use client';

import styles from '../styles/MainMenu.module.css';
import Header from './Header';
import HomeScreen from './HomeScreen';

export default function MainMenu({ userData, onNavigate }) {
  // In a real app, userData would have icon url, level, etc.
  const summonerName = userData?.riotId?.split('#')[0] || 'Unknown';
  const level = userData?.summonerLevel || 30;

  return (
    <div className={styles.container}>
      <Header userData={userData} onNavigate={onNavigate} />

      <div className={styles.mainContent}>
        {/* Center Area (Home Screen Content) */}
        <div className={styles.centerArea}>
           <HomeScreen />
        </div>

      </div>
    </div>
  );
}
