'use client';

import React, { useState, useEffect } from 'react';
import styles from '../styles/HomeScreen.module.css';

const MATCH_DATA = [
  {
    type: 'RANKED (DRAFT)',
    blueTeam: [
      { name: 'Mirabis', champion: 'Sejuani' },
      { name: 'AsheIsElite', champion: 'Cassiopeia' },
      { name: 'Fat Chapstick', champion: 'Ashe' },
      { name: 'Hartwigg', champion: 'Kennen' },
      { name: 'ZENITH', champion: 'Leona' }
    ],
    redTeam: [
      { name: 'BoxerPete', champion: 'Tryndamere' },
      { name: 'Andybendy', champion: 'TwistedFate' },
      { name: 'FizzySodaPop', champion: 'LeeSin' },
      { name: 'Annie Bot', champion: 'Annie' },
      { name: 'Carry Gong', champion: 'Graves' }
    ]
  },
  {
    type: 'RANKED (DRAFT)',
    blueTeam: [
      { name: 'Hide on bush', champion: 'Azir' },
      { name: 'T1 Gumayusi', champion: 'Varus' },
      { name: 'T1 Keria', champion: 'Pyke' },
      { name: 'T1 Zeus', champion: 'Aatrox' },
      { name: 'T1 Oner', champion: 'LeeSin' }
    ],
    redTeam: [
      { name: 'G2 Caps', champion: 'Sylas' },
      { name: 'G2 Mikyx', champion: 'Thresh' },
      { name: 'G2 Hans Sama', champion: 'Draven' },
      { name: 'G2 BrokenBlade', champion: 'Gwen' },
      { name: 'G2 Yike', champion: 'Vi' }
    ]
  },
  {
    type: 'RANKED (DRAFT)',
    blueTeam: [
      { name: 'Doublelift', champion: 'Lucian' },
      { name: 'Bjergsen', champion: 'Zilean' },
      { name: 'CoreJJ', champion: 'Rakan' },
      { name: 'Impact', champion: 'Renekton' },
      { name: 'Santorin', champion: 'Sejuani' }
    ],
    redTeam: [
      { name: 'Jensen', champion: 'Orianna' },
      { name: 'Sneaky', champion: 'Jhin' },
      { name: 'Zeyzal', champion: 'Alistar' },
      { name: 'Licorice', champion: 'Ornn' },
      { name: 'Svenskeren', champion: 'LeeSin' }
    ]
  }
];

const HomeScreen = () => {
  const [videoOpen, setVideoOpen] = useState(false);
  const [currentVideoId, setCurrentVideoId] = useState('');
  const [currentMatchIndex, setCurrentMatchIndex] = useState(0);
  const [matchTimers, setMatchTimers] = useState([0, 0, 0]);

  useEffect(() => {
    // Initialize each match with a different random starting time
    const initialTimers = MATCH_DATA.map(() => 
      Math.floor(Math.random() * (1080 - 300 + 1)) + 300
    );
    setMatchTimers(initialTimers);

    const timer = setInterval(() => {
      setMatchTimers(prev => prev.map(time => time + 1));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (totalSeconds) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const nextMatch = (e) => {
    e.stopPropagation();
    setCurrentMatchIndex((prev) => (prev + 1) % MATCH_DATA.length);
  };

  const prevMatch = (e) => {
    e.stopPropagation();
    setCurrentMatchIndex((prev) => (prev - 1 + MATCH_DATA.length) % MATCH_DATA.length);
  };

  const openVideo = (id) => {
    setCurrentVideoId(id);
    setVideoOpen(true);
  };

  const currentMatch = MATCH_DATA[currentMatchIndex];

  return (
    <div className={styles.homeContainer}>
      <div className={styles.sideSpacer}></div>
      
      <div className={styles.contentArea}>
        {/* Left Column: News */}
        <div className={styles.leftColumn}>
          <div className={styles.mainNewsBox}>
            <img src="/images/maindiv.jpg" alt="Main Feature" className={styles.newsImage} />
            <div className={styles.mainNewsOverlay}>
              <h2 className={styles.mainNewsTitle}>A new star is rising.</h2>
              <p className={styles.mainNewsDesc}>The Star Guardians have arrived to protect the universe. Discover the new skins and bundles available now.</p>
            </div>
          </div>
          
          <div className={styles.bottomNewsRow}>
            <div className={styles.subNewsBox} onClick={() => openVideo('Y-gsY5oAsL0')}>
              <img src="/images/thumbnail.jpg" alt="Ivern Spotlight" className={styles.newsImage} />
              <div className={styles.playButtonOverlay}>
                <div className={styles.playIcon}></div>
              </div>
              <div className={styles.subNewsOverlay}>
                <h3 className={styles.subNewsTitle}>Ivern Champion Spotlight</h3>
              </div>
            </div>
            <div className={styles.subNewsBox} onClick={() => openVideo('oorajmbSJUM')}>
              <img src="/images/div2.jpg" alt="Feedback" className={styles.newsImage} />
              <div className={styles.playButtonOverlay}>
                <div className={styles.playIcon}></div>
              </div>
              <div className={styles.subNewsOverlay}>
                <h3 className={styles.subNewsTitle}>Star Guardian: New Horizon</h3>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Skins, Spotlight, Watch Match */}
        <div className={styles.rightColumn}>
          <div className={styles.skinsRow}>
            <div className={styles.skinBox}>
              <img src="/images/skin1.jpg" alt="Arclight Vel'Koz" className={styles.newsImage} />
              <div className={styles.skinOverlay}>
                <div className={styles.skinName}>Arclight Vel'Koz</div>
                <div className={styles.skinPrice}><img src="/images/rp_logo.png" className={styles.rpIcon} alt="RP" /> 1350</div>
              </div>
            </div>
            <div className={styles.skinBox}>
              <img src="/images/skin2.jpg" alt="Star Guardian Jinx" className={styles.newsImage} />
              <div className={styles.skinOverlay}>
                <div className={styles.skinName}>Star Guardian Jinx</div>
                <div className={styles.skinPrice}><img src="/images/rp_logo.png" className={styles.rpIcon} alt="RP" /> 1820</div>
              </div>
            </div>
          </div>

          <div className={styles.smallNewsRow}>
            <div className={styles.smallNewsBox}>
              <img src="/images/smalldiv1.jpg" alt="NACC Spotlight" className={styles.newsImage} />
              <div className={styles.smallNewsOverlay}>
                <h4 className={styles.smallNewsTitle}>Two For One Rune Pages</h4>
                <p className={styles.smallNewsDesc}>To help you get the most out of your seals, marks, glyphs and quintessences, we are holding a sale on Rune Pages.</p>
              </div>
            </div>
            <div 
              className={styles.smallNewsBox}
              onClick={() => window.open('https://ko-fi.com/Y8Y6OIYA1', '_blank')}
            >
              <img src="/images/smalldiv2.jpg" alt="Bard Spotlight" className={styles.newsImage} />
              <div className={styles.smallNewsOverlay}>
                <h4 className={styles.smallNewsTitle}>Support me on Ko-Fi</h4>
                <p className={styles.smallNewsDesc}>If you enjoy this project and would like to support its development, feel free to buy me a coffee!</p>
              </div>
            </div>
          </div>

          <div className={styles.watchMatchBox}>
            <div className={styles.watchMatchHeader}>
              <span className={styles.arrow} onClick={prevMatch}>{'<'}</span>
              <div className={styles.matchTeams}>
                <div className={styles.teamSide}>
                  {currentMatch.blueTeam.map((player, idx) => (
                    <div key={idx} className={styles.player}>
                      <span className={styles.playerName}>{player.name}</span>
                      <img 
                        src={`https://ddragon.leagueoflegends.com/cdn/14.21.1/img/champion/${player.champion}.png`}
                        alt={player.champion}
                        className={styles.champIcon}
                      />
                    </div>
                  ))}
                </div>
                <div className={styles.vsText}>VS</div>
                <div className={styles.teamSide}>
                  {currentMatch.redTeam.map((player, idx) => (
                    <div key={idx} className={styles.player}>
                      <img 
                        src={`https://ddragon.leagueoflegends.com/cdn/14.21.1/img/champion/${player.champion}.png`}
                        alt={player.champion}
                        className={styles.champIcon}
                      />
                      <span className={styles.playerName}>{player.name}</span>
                    </div>
                  ))}
                </div>
              </div>
              <span className={styles.arrow} onClick={nextMatch}>{'>'}</span>
            </div>
            <div className={styles.watchMatchFooter}>
              <span className={styles.matchType}>{currentMatch.type}</span>
              <span className={styles.matchTime}>{formatTime(matchTimers[currentMatchIndex])}</span>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.sideSpacer}></div>

      {videoOpen && (
        <div className={styles.modalOverlay} onClick={() => setVideoOpen(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <button className={styles.closeButton} onClick={() => setVideoOpen(false)}>×</button>
            <div className={styles.videoWrapper}>
              <iframe
                width="100%"
                height="100%"
                src={`https://www.youtube.com/embed/${currentVideoId}?autoplay=1`}
                title="YouTube video player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomeScreen;
