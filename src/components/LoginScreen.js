'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import styles from '../styles/LoginScreen.module.css';

const LOGIN_THEMES_RAW = [
  { id: 'default', name: 'Season 6 Login Screen', date: 'Jan 21, 2016', video: 'https://www.youtube.com/watch?v=lu0fUb0PGh4', image: '/images/login_background.png' },
  { id: 'starguardian2016', name: 'Star Guardian: Burning Bright', date: 'Oct 7, 2016', video: 'https://www.youtube.com/watch?v=6kEZEvMYKQY', image: '/images/star_guardian_2016_background.png' },
  { id: 'jinx', name: 'Jinx, the Loose Cannon', date: 'May 26, 2015', video: 'https://www.youtube.com/watch?v=JoHRzfKrdtk', image: '/images/jinx_background.png' },
  { id: 'vi', name: 'Vi, the Piltover Enforcer', date: 'May 26, 2015', video: 'https://www.youtube.com/watch?v=18yK0G9hHts', image: '/images/vi_background.png' },
  { id: 'worlds2016', name: '2016 World Championship', date: 'Sep 29, 2016', video: 'https://www.youtube.com/watch?v=ekXfarHm6Ao', image: '/images/worlds2016_background.png' },
];

const DEFAULT_THEMES = LOGIN_THEMES_RAW.map(theme => {
  if (theme.variants) {
    return { ...theme.variants[0], id: theme.id }; // Pick first variant for initial state
  }
  return theme;
}).sort((a, b) => new Date(a.date) - new Date(b.date));

const getYoutubeId = (url) => {
  if (!url) return null;
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&]{11})/);
  return match ? match[1] : null;
};

export default function LoginScreen({ onLoginSuccess, onShowTerms }) {
  const videoRef = useRef(null);
  const [riotId, setRiotId] = useState('');
  const [region, setRegion] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [disableMusic, setDisableMusic] = useState(true);
  const [disableAnimations, setDisableAnimations] = useState(false);
  const [audioUnlocked, setAudioUnlocked] = useState(false);
  const [status, setStatus] = useState(''); // '', 'Authenticating', 'Waiting'
  const [themes, setThemes] = useState(DEFAULT_THEMES);
  const [currentTheme, setCurrentTheme] = useState(DEFAULT_THEMES.find(t => t.id === 'default'));
  const [showThemeSelector, setShowThemeSelector] = useState(false);
  const [iframeReady, setIframeReady] = useState(false);
  const ytPlayerRef = useRef(null);
  const ytContainerRef = useRef(null);
  const ytApiReady = useRef(false);
  const pendingThemeId = useRef(null);
  const disableMusicRef = useRef(disableMusic);
  const audioUnlockedRef = useRef(audioUnlocked);

  // Keep refs in sync with state so createYTPlayer always sees current values
  useEffect(() => { disableMusicRef.current = disableMusic; }, [disableMusic]);
  useEffect(() => { audioUnlockedRef.current = audioUnlocked; }, [audioUnlocked]);

  useEffect(() => {
    // 1. Force muted state and attempt play immediately (visuals only)
    if (videoRef.current) {
      videoRef.current.muted = true;
      videoRef.current.play().catch(() => {
        // Still block? Handled by unlockAudio
      });
    }

    // 2. Add interaction listeners to "unlock" audio
    const unlockAudio = () => {
      if (videoRef.current) {
        // Unmute directly in the event handler for maximum reliability
        videoRef.current.muted = false;
        videoRef.current.volume = 0.5; // 50% volume is a safe default
        videoRef.current.play().catch(() => { });
      }
      setAudioUnlocked(true);

      // Remove listeners after first interaction
      window.removeEventListener('click', unlockAudio);
      window.removeEventListener('keydown', unlockAudio);
      window.removeEventListener('touchstart', unlockAudio);
    };

    window.addEventListener('click', unlockAudio);
    window.addEventListener('keydown', unlockAudio);
    window.addEventListener('touchstart', unlockAudio);

    const rememberedUsername = localStorage.getItem('rememberedUsername');
    if (rememberedUsername) {
      setRiotId(rememberedUsername);
      setRememberMe(true);
    }

    // Randomize variants on client mount
    const randomizedThemes = LOGIN_THEMES_RAW.map(theme => {
      if (theme.variants) {
        const randomVariant = theme.variants[Math.floor(Math.random() * theme.variants.length)];
        return { ...randomVariant, id: theme.id };
      }
      return theme;
    }).sort((a, b) => new Date(a.date) - new Date(b.date));

    setThemes(randomizedThemes);

    const savedThemeId = localStorage.getItem('loginTheme');
    if (savedThemeId) {
      const theme = randomizedThemes.find(t => t.id === savedThemeId);
      if (theme) setCurrentTheme(theme);
      else setCurrentTheme(randomizedThemes.find(t => t.id === 'default'));
    } else {
      setCurrentTheme(randomizedThemes.find(t => t.id === 'default'));
    }

    return () => {
      window.removeEventListener('click', unlockAudio);
      window.removeEventListener('keydown', unlockAudio);
      window.removeEventListener('touchstart', unlockAudio);
    };
  }, []); // Only run once on mount

  // Load YouTube IFrame API once
  useEffect(() => {
    if (window.YT && window.YT.Player) {
      ytApiReady.current = true;
      return;
    }
    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    document.head.appendChild(tag);
    window.onYouTubeIframeAPIReady = () => {
      ytApiReady.current = true;
      if (pendingThemeId.current) {
        createYTPlayer(pendingThemeId.current);
        pendingThemeId.current = null;
      }
    };
  }, []);

  const createYTPlayer = useCallback((videoId) => {
    if (!ytContainerRef.current) return;
    // Destroy previous player cleanly
    if (ytPlayerRef.current) {
      try { ytPlayerRef.current.destroy(); } catch (_) {}
      ytPlayerRef.current = null;
    }
    // Clear the container and create a NEW child element for YT to replace.
    // This keeps React's ownership of ytContainerRef intact — YT only
    // replaces the inner child, not the React-managed wrapper.
    ytContainerRef.current.innerHTML = '';
    const playerEl = document.createElement('div');
    ytContainerRef.current.appendChild(playerEl);

    setIframeReady(false);
    const shouldBeMuted = !audioUnlockedRef.current || disableMusicRef.current;
    ytPlayerRef.current = new window.YT.Player(playerEl, {
      width: '100%',
      height: '100%',
      videoId,
      playerVars: {
        autoplay: 1,
        mute: shouldBeMuted ? 1 : 0,
        loop: 1,
        playlist: videoId,
        controls: 0,
        showinfo: 0,
        disablekb: 1,
        fs: 0,
        modestbranding: 1,
        iv_load_policy: 3,
        rel: 0,
        cc_load_policy: 0,
      },
      events: {
        onStateChange: (e) => {
          // 1 = PLAYING — video is actually running, safe to reveal
          if (e.data === 1) setIframeReady(true);
        },
      },
    });
  }, []);

  // Create/update player whenever the YouTube theme changes
  useEffect(() => {
    const videoId = getYoutubeId(currentTheme.video);
    if (!videoId) return;
    if (!ytApiReady.current) {
      pendingThemeId.current = videoId;
      return;
    }
    createYTPlayer(videoId);
    // Cleanup: destroy the player before React unmounts the container
    return () => {
      if (ytPlayerRef.current) {
        try { ytPlayerRef.current.destroy(); } catch (_) {}
        ytPlayerRef.current = null;
      }
      if (ytContainerRef.current) ytContainerRef.current.innerHTML = '';
    };
  }, [currentTheme.id, createYTPlayer]);

  // Sync mute/unmute with the YT player when settings change
  useEffect(() => {
    if (!ytPlayerRef.current) return;
    try {
      if (!audioUnlocked || disableMusic) ytPlayerRef.current.mute();
      else ytPlayerRef.current.unMute();
    } catch (_) {}
  }, [disableMusic, audioUnlocked]);

  // Update video state based on settings AND audio unlock status
  useEffect(() => {
    if (videoRef.current) {
      // It must be muted if audio isn't unlocked OR if user disabled music
      const shouldBeMuted = !audioUnlocked || disableMusic;
      videoRef.current.muted = shouldBeMuted;

      if (videoRef.current.paused) {
        videoRef.current.play().catch(() => { });
      }
    }
  }, [disableMusic, audioUnlocked, currentTheme.id]);

  const handleThemeSelect = (theme) => {
    setIframeReady(false);
    setCurrentTheme(theme);
    localStorage.setItem('loginTheme', theme.id);
    setShowThemeSelector(false);
  };

  const isFormValid = riotId.trim() !== '' && region.trim() !== '';

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!isFormValid || loading) return;

    setLoading(true);
    setError('');
    setStatus('Starting authentication process. Waiting for server...');

    try {
      if (!riotId.includes('#')) {
        setError('Please include your tagline (e.g. Name#Tag)');
        setLoading(false);
        setStatus('');
        return;
      }

      if (rememberMe) {
        localStorage.setItem('rememberedUsername', riotId);
      } else {
        localStorage.removeItem('rememberedUsername');
      }

      // Simulate the progression of the login status
      const responsePromise = fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ riotId, region })
      });

      // Wait for at least 1.5s to show the first message
      await new Promise(resolve => setTimeout(resolve, 1500));
      setStatus('Logging on...');

      // Wait for the actual response
      const response = await responsePromise;
      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Login failed. Please check your credentials.');
        setLoading(false);
        setStatus('');
        return;
      }

      // Show 'Logging on...' for at least another 1s for the authentic feel
      await new Promise(resolve => setTimeout(resolve, 1000));
      onLoginSuccess(data);
    } catch (err) {
      setError('A network error occurred. Please try again.');
      setLoading(false);
      setStatus('');
    }
  };

  return (
    <div className={styles.container}>
      {/* Static Background Image (shown when animations are disabled or no video available) */}
      {(disableAnimations || !currentTheme.video) && (
        <Image
          src={currentTheme.image}
          alt=""
          fill
          style={{ objectFit: 'cover' }}
          className={styles.staticBg}
          priority
        />
      )}

      {/* Local Video Background */}
      {currentTheme.video && !currentTheme.video.includes('youtube.com') && (
        <video
          key={currentTheme.id}
          ref={videoRef}
          autoPlay={true}
          muted={true}
          loop
          playsInline
          className={`${styles.videoBg} ${disableAnimations ? styles.hidden : ''}`}
          src={currentTheme.video}
        />
      )}

      {/* YouTube Background — always mounted so audio persists when animations are disabled */}
      {currentTheme.video && currentTheme.video.includes('youtube.com') && (
        <>
          {/* YT player mounts into this div; hidden visually when animations off */}
          <div
            ref={ytContainerRef}
            className={`${styles.videoBg} ${styles.youtubeIframe}`}
            style={{
              pointerEvents: 'none',
              position: 'absolute',
              top: 0, left: 0,
              width: '100%',
              height: '100%',
              visibility: disableAnimations ? 'hidden' : 'visible',
            }}
          />
          {/* Cover image: always visible when animations off, fades out once playing when on */}
          <Image
            src={currentTheme.image}
            alt=""
            fill
            style={{
              objectFit: 'cover',
              transition: disableAnimations ? 'none' : 'opacity 1.5s ease',
              opacity: disableAnimations ? 1 : (iframeReady ? 0 : 1),
              pointerEvents: 'none',
            }}
            className={styles.staticBg}
            priority
          />
        </>
      )}

      {/* Overlay for atmosphere */}
      <div className={styles.overlay} />

      {/* Login Status Modal */}
      {status && (
        <div className={styles.statusOverlay}>
          <div className={styles.statusBox}>
            <div className={styles.statusTitle}>Login Status</div>
            <div className={styles.statusMessage}>{status}</div>
            <div className={styles.loadingContainer}>
              <div className={styles.loadingBars}>
                <div className={styles.bar}></div>
                <div className={styles.bar}></div>
                <div className={styles.bar}></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Theme Selector Modal */}
      {showThemeSelector && (
        <div className={styles.themeSelectorOverlay} onClick={() => setShowThemeSelector(false)}>
          <div className={styles.themeSelectorBox} onClick={e => e.stopPropagation()}>
            <div className={styles.themeSelectorHeader}>
              <h3 className={styles.themeSelectorTitle}>Select Login Screen</h3>
              <button className={styles.closeButton} onClick={() => setShowThemeSelector(false)}>X</button>
            </div>
            <div className={styles.themeGrid}>
              {themes.map(theme => (
                <div
                  key={theme.id}
                  className={`${styles.themeOption} ${currentTheme.id === theme.id ? styles.activeTheme : ''}`}
                  onClick={() => handleThemeSelect(theme)}
                >
                  <Image src={theme.image} alt={theme.name} width={200} height={120} className={styles.themeThumbnail} style={{ objectFit: 'cover', objectPosition: 'center 20%' }} />
                  <div className={styles.themeInfo}>
                    <div className={styles.themeName}>{theme.name}</div>
                    {theme.date && <div className={styles.themeDate}>{theme.date}</div>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className={styles.content}>
        <div className={styles.loginGroup}>
          {/* Top Left Logo */}
          <div className={styles.headerLogo}>
            <Image src="/images/league_logo.png" alt="League of Legends" width={280} height={160} className={styles.logoImage} priority style={{ width: '280px', height: 'auto' }} />
          </div>

          {/* Mid Left Login Box */}
          <div className={styles.loginBox}>
            <h2 className={styles.title}>Account Login</h2>

            <form onSubmit={handleLogin}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Username</label>
                <input
                  type="text"
                  className={styles.input}
                  value={riotId}
                  onChange={(e) => setRiotId(e.target.value)}
                  placeholder="Riot ID#TAG"
                  spellCheck="false"
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Region / Server</label>
                <div className={styles.selectWrapper}>
                  <select
                    className={styles.select}
                    value={region}
                    onChange={(e) => setRegion(e.target.value)}
                  >
                    <option value="" disabled>Select a Region</option>
                    <option value="NA">North America (NA)</option>
                    <option value="EUW">Europe West (EUW)</option>
                    <option value="EUNE">Europe Nordic & East (EUNE)</option>
                    <option value="KR">Korea (KR)</option>
                    <option value="BR">Brazil (BR)</option>
                    <option value="JP">Japan (JP)</option>
                    <option value="LAN">Latin America North (LAN)</option>
                    <option value="LAS">Latin America South (LAS)</option>
                    <option value="TR">Turkey (TR)</option>
                    <option value="RU">Russia (RU)</option>
                  </select>
                </div>
              </div>

              <div className={styles.optionsRow}>
                <label className={styles.checkboxContainer}>
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                  <span className={styles.checkmark}></span>
                  Remember Username
                </label>

                <button
                  type="submit"
                  className={`${styles.loginButton} ${isFormValid ? styles.active : ''}`}
                  disabled={!isFormValid || loading}
                >
                  {loading ? '...' : 'Log In'}
                </button>
              </div>

              {error && <div className={styles.error}>{error}</div>}
            </form>

            <div className={styles.footerLinks}>
              <div>Don't have an account? <a href="#">Sign up now!</a></div>
              <div>Forgot your <a href="#">username?</a></div>
              <div>Forgot your <a href="#">password?</a></div>
            </div>
          </div>

          <div className={styles.freeText}>
            Playing League of Legends is <span className={styles.freePart}>FREE!</span>
          </div>
        </div>

        {/* Bottom Left Controls */}
        <div className={styles.bottomLeft}>
          <div className={styles.riotBrand}>
            <a href="https://ko-fi.com/Y8Y6OIYA1" target="_blank" rel="noopener noreferrer" className={styles.kofiLink}>
              <Image src="/images/kofi.png" alt="Ko-fi" width={100} height={36} className={styles.riotLogoImage} />
            </a>
          </div>
          <div className={styles.settingsGroup}>
            <a
              href="#"
              className={styles.termsLink}
              onClick={(e) => {
                e.preventDefault();
                onShowTerms();
              }}
            >
              Terms of use
            </a>
            <label className={styles.settingsCheckbox}>
              <input
                type="checkbox"
                checked={disableMusic}
                onChange={(e) => setDisableMusic(e.target.checked)}
              />
              <span className={styles.smallCheckmark}></span>
              Disable Login Music
            </label>
            <label className={styles.settingsCheckbox}>
              <input
                type="checkbox"
                checked={disableAnimations}
                onChange={(e) => setDisableAnimations(e.target.checked)}
              />
              <span className={styles.smallCheckmark}></span>
              Disable Menu Animations
            </label>
          </div>
        </div>

        {/* Bottom Right Controls */}
        <div className={styles.bottomRight}>
          <button className={styles.cogButton} onClick={() => setShowThemeSelector(true)}>
            <svg viewBox="0 0 24 24" className={styles.cogSvg}>
              <path fill="currentColor" d="M19.14,12.94c0.04-0.3,0.06-0.61,0.06-0.94c0-0.32-0.02-0.64-0.06-0.94l2.03-1.58c0.18-0.14,0.23-0.41,0.12-0.61 l-1.92-3.32c-0.12-0.22-0.37-0.29-0.59-0.22l-2.39,0.96c-0.5-0.38-1.03-0.7-1.62-0.94L14.4,2.81c-0.04-0.24-0.24-0.41-0.48-0.41 h-3.84c-0.24,0-0.43,0.17-0.47,0.41L9.25,5.35C8.66,5.59,8.12,5.92,7.63,6.29L5.24,5.33c-0.22-0.08-0.47,0-0.59,0.22L2.73,8.87 C2.62,9.08,2.66,9.34,2.86,9.48l2.03,1.58C4.84,11.36,4.8,11.69,4.8,12s0.02,0.64,0.06,0.94l-2.03,1.58 c-0.18,0.14-0.23,0.41-0.12,0.61l1.92,3.32c0.12,0.22,0.37,0.29,0.59,0.22l2.39-0.96c0.5,0.38,1.03,0.7,1.62,0.94l0.36,2.54 c0.05,0.24,0.24,0.41,0.48,0.41h3.84c0.24,0,0.43-0.17,0.47-0.41l0.36-2.54c0.59-0.24,1.13-0.56,1.62-0.94l2.39,0.96 c0.22,0.08,0.47,0,0.59-0.22l1.92-3.32c0.12-0.22,0.07-0.49-0.12-0.61L19.14,12.94z M12,15.6c-1.98,0-3.6-1.62-3.6-3.6 s1.62-3.6,3.6-3.6s3.6,1.62,3.6,3.6S13.98,15.6,12,15.6z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
