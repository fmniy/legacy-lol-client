'use client';

import { useState, useEffect, useRef } from 'react';
import styles from '../styles/LoginScreen.module.css';

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

    return () => {
      window.removeEventListener('click', unlockAudio);
      window.removeEventListener('keydown', unlockAudio);
      window.removeEventListener('touchstart', unlockAudio);
    };
  }, []); // Only run once on mount

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
  }, [disableMusic, audioUnlocked]);

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
      {/* Static Background Image (shown when animations are disabled) */}
      {disableAnimations && (
        <img
          src="/images/login_background.png"
          alt=""
          className={styles.staticBg}
        />
      )}

      {/* Video Background (always present for audio, hidden visually if animations disabled) */}
      <video
        ref={videoRef}
        autoPlay={true}
        muted={true}
        loop
        playsInline
        className={`${styles.videoBg} ${disableAnimations ? styles.hidden : ''}`}
        src="/videos/login_background.mp4"
      />

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

      <div className={styles.content}>
        <div className={styles.loginGroup}>
          {/* Top Left Logo */}
          <div className={styles.headerLogo}>
            <img src="/images/league_logo.png" alt="League of Legends" className={styles.logoImage} />
            <div className={styles.fanProjectTag}>FAN PROJECT</div>
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
              <img src="/images/kofi.png" alt="Ko-fi" className={styles.riotLogoImage} />
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

        {/* Bottom Right Info Button */}
        <div className={styles.bottomRight}>
          <button className={styles.infoButton}>i</button>
        </div>
      </div>
    </div>
  );
}
