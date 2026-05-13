'use client';

import { useState } from 'react';
import styles from '../styles/Header.module.css';

export default function Header({ userData, onNavigate, onProfileClick }) {
  const [settingsMenuOpen, setSettingsMenuOpen] = useState(false);
  const summonerName = userData?.riotId?.split('#')[0] || 'Unknown';
  const level = Math.min(userData?.summonerLevel || 30, 30);

  const handleLogout = () => {
    setSettingsMenuOpen(false);
    onNavigate('login');
  };

  const playClickSound = () => {
    const audio = new Audio('/sounds/click.mp3');
    audio.volume = 0.5;
    audio.play().catch(e => console.error("Sound play failed", e));
  };

  return (
    <div className={styles.clientHeader}>
      <div className={styles.clientVersion}>League of Legends 6.21.16_05_01_19_57</div>
      <img 
        src="/images/league_logo.png" 
        className={styles.leagueLogo} 
        alt="League of Legends" 
        onClick={() => onNavigate('main')}
      />
      
      <div className={styles.playButtonContainer}>
        <button className={styles.playButton} onClick={() => onNavigate('main')}>
          <span className={styles.playText}>Play</span>
        </button>
      </div>

      <div className={styles.clientNavRight}>
        <div className={styles.rightHeaderWrapper}>
          <div className={styles.summonerIconContainer}>
            <div className={styles.iconBorderBox}>
              {userData?.profileIconId ? (
                <img
                  src={`https://ddragon.leagueoflegends.com/cdn/14.21.1/img/profileicon/${userData.profileIconId}.png`}
                  alt=""
                  className={styles.mainHeaderIcon}
                  onError={(e) => { e.target.src = `https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/profile-icons/${userData.profileIconId}.jpg`; }}
                />
              ) : <div className={styles.mainHeaderIcon}></div>}
              <img src="/images/summoner_smallprofile_iconborder.png" className={styles.headerIconBorder} alt="" />
              <div className={styles.headerLevelBadge}>{level}</div>
            </div>
          </div>

          <div className={styles.rightHeaderColumn}>
            <div className={styles.headerTopRow}>
              <div className={styles.headerNameBox}>
                {summonerName}
              </div>
              <div className={styles.headerCurrencyBox}>
                <div className={styles.headerRpWrap}>
                  <span className={styles.headerRpIcon}></span>
                  <span className={styles.headerCurrencyText}>20</span>
                </div>
                <div className={styles.headerIpWrap}>
                  <span className={styles.headerIpIcon}></span>
                  <span className={styles.headerCurrencyText}>25354</span>
                </div>
              </div>
            </div>

            <div className={styles.headerBottomRow}>
              <button className={styles.headerLootBtn} onClick={playClickSound}></button>
              <button className={styles.headerEssenceBtn} onClick={playClickSound}></button>
              <button 
                className={styles.headerProfileBtn} 
                onClick={() => {
                  playClickSound();
                  if (onProfileClick) onProfileClick();
                  else onNavigate('profile');
                }}
              ></button>
              <button className={styles.headerHelpBtn} title="Help"></button>
              <button 
                className={styles.headerSettingsBtn} 
                title="Settings"
                onClick={() => {
                  playClickSound();
                  setSettingsMenuOpen(!settingsMenuOpen);
                }}
              ></button>
            </div>
          </div>
        </div>
      </div>

      {settingsMenuOpen && (
        <div className={styles.settingsDropdown}>
          <button className={styles.dropdownItem} onClick={handleLogout}>
            Log Out
          </button>
        </div>
      )}
    </div>
  );
}
