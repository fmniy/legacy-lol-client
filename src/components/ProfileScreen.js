'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import styles from '../styles/ProfileScreen.module.css';
import Header from './Header';
import RunesTab from './RunesTab';
import MasteriesTab from './MasteriesTab';
import SpellsTab from './SpellsTab';

const getSeededRandom = (seed, field) => {
  const combined = seed + field;
  let hash = 0;
  for (let i = 0; i < combined.length; i++) {
    hash = ((hash << 5) - hash) + combined.charCodeAt(i);
    hash |= 0;
  }
  let t = hash + 0x6D2B79F5;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

export default function ProfileScreen({ userData, onNavigate }) {
  const sessionSeed = useMemo(() => Math.random().toString(36).substring(7), []);
  const [profileData, setProfileData] = useState(null);
  const [viewedUserData, setViewedUserData] = useState(userData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [scale, setScale] = useState(1);

  const puuid = viewedUserData?.puuid || userData?.puuid;
  const region = viewedUserData?.region || userData?.region || 'na1';
  const [masteryPage, setMasteryPage] = useState(0); // 0: Top Champions, 1: In Progress
  const [rankedPage, setRankedPage] = useState(0); // 0: Ranked, 1: Normal
  const [normalWins, setNormalWins] = useState(0);
  const [creepScore, setCreepScore] = useState(0);
  const [takedowns, setTakedowns] = useState(0);
  const [aramWins, setAramWins] = useState(0);
  const [aramTakedowns, setAramTakedowns] = useState(0);
  const [aramTurrets, setAramTurrets] = useState(0);
  const [honors, setHonors] = useState({ friendly: 0, helpful: 0, teamwork: 0, opponent: 0 });
  const [activeTab, setActiveTab] = useState('profile');
  const [matchHistory, setMatchHistory] = useState([]);
  const [loadingMatches, setLoadingMatches] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [leaguePlayers, setLeaguePlayers] = useState([]);
  const [viewedDivision, setViewedDivision] = useState('I');
  const [selectedQueue, setSelectedQueue] = useState('Solo Queue');
  const [tooltip, setTooltip] = useState({ visible: false, x: 0, y: 0, type: null });
  const [allChampions, setAllChampions] = useState([]);
  const [champSearchQuery, setChampSearchQuery] = useState('');
  const [sorting, setSorting] = useState('Highest Mastery');
  const [primaryRole, setPrimaryRole] = useState('All');
  const [availability, setAvailability] = useState('All');
  const [runesHaveChanges, setRunesHaveChanges] = useState(false);
  const [masteriesHaveChanges, setMasteriesHaveChanges] = useState(false);
  const [pendingTab, setPendingTab] = useState(null);
  const [pendingPage, setPendingPage] = useState(null);
  const [showRunesWarning, setShowRunesWarning] = useState(false);
  const [showDeleteMasteryWarning, setShowDeleteMasteryWarning] = useState(false);
  const runesRef = useRef(null);
  const masteriesRef = useRef(null);

  const playClickSound = () => {
    const audio = new Audio('/sounds/click.mp3');
    audio.volume = 0.5;
    audio.play().catch(e => console.error("Sound play failed", e));
  };

  const handleTabChange = (newTab) => {
    if ((activeTab === 'runes' && runesHaveChanges) || (activeTab === 'masteries' && masteriesHaveChanges)) {
      setPendingTab(newTab);
      setShowRunesWarning(true);
    } else {
      setActiveTab(newTab);
    }
    playClickSound();
  };

  const handleSaveAndSwitch = () => {
    if (activeTab === 'runes' && runesRef.current) {
      runesRef.current.save();
      if (pendingPage === 'NEW') {
        runesRef.current.addPage();
      } else if (pendingPage !== null) {
        runesRef.current.switchPage(pendingPage);
      }
    } else if (activeTab === 'masteries' && masteriesRef.current) {
      masteriesRef.current.save();
      if (pendingPage === 'NEW') {
        masteriesRef.current.addPage();
      } else if (pendingPage !== null) {
        masteriesRef.current.switchPage(pendingPage);
      }
    }
    
    if (pendingTab) {
      setActiveTab(pendingTab);
    }
    setShowRunesWarning(false);
    setPendingTab(null);
    setPendingPage(null);
  };

  const handleDiscardAndSwitch = () => {
    if (activeTab === 'runes' && runesRef.current) {
      runesRef.current.discard();
      if (pendingPage === 'NEW') {
        runesRef.current.addPage();
      } else if (pendingPage !== null) {
        runesRef.current.switchPage(pendingPage);
      }
    } else if (activeTab === 'masteries' && masteriesRef.current) {
      masteriesRef.current.discard();
      if (pendingPage === 'NEW') {
        masteriesRef.current.addPage();
      } else if (pendingPage !== null) {
        masteriesRef.current.switchPage(pendingPage);
      }
    }

    if (pendingTab) {
      setActiveTab(pendingTab);
    }
    setShowRunesWarning(false);
    setPendingTab(null);
    setPendingPage(null);
  };

  useEffect(() => {
    const fetchAllChamps = async () => {
      try {
        const res = await fetch('https://ddragon.leagueoflegends.com/cdn/14.21.1/data/en_US/champion.json');
        if (res.ok) {
          const data = await res.json();
          // Sort alphabetically by default
          const champs = Object.values(data.data).sort((a, b) => a.name.localeCompare(b.name));
          setAllChampions(champs);
        }
      } catch (err) {
        console.error('Failed to fetch all champions:', err);
      }
    };
    fetchAllChamps();
  }, []);

  const fetchMatchHistory = async () => {
    if (loadingMatches) return;
    setLoadingMatches(true);

    try {
      const res = await fetch('/api/match-history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ puuid, region })
      });
      if (res.ok) {
        const data = await res.json();
        setMatchHistory(data.matches || []);
      }
    } catch (err) {
      console.error('Failed to fetch match history:', err);
    } finally {
      setLoadingMatches(false);
    }
  };

  useEffect(() => {
    // Clear matches when switching users to avoid showing stale data
    setMatchHistory([]);
    if (activeTab === 'matchHistory') {
      fetchMatchHistory();
    }
  }, [viewedUserData, activeTab]);

  const [winCountdown, setWinCountdown] = useState(0);
  const [chestDays, setChestDays] = useState(0);
  const [availableChests, setAvailableChests] = useState(0);
  const [rerollCount, setRerollCount] = useState(0);

  useEffect(() => {
    if (!viewedUserData) return;
    const puuid = (viewedUserData.puuid && viewedUserData.puuid !== 'default')
      ? viewedUserData.puuid
      : (viewedUserData.riotId || 'default');
    const seed = sessionSeed + puuid;

    // Chests
    setChestDays(Math.floor(getSeededRandom(seed, 'chest') * 7) + 1);
    setAvailableChests(Math.floor(getSeededRandom(seed, 'availableChestsCount') * 5));

    // Rerolls
    setRerollCount(Math.floor(getSeededRandom(seed, 'rerolls') * 3));

    // First Win
    const isAvailable = getSeededRandom(seed, 'winAvailable') > 0.4;
    if (isAvailable) {
      setWinCountdown(0);
    } else {
      const now = new Date();
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
      const offset = Math.floor(getSeededRandom(seed, 'winReset') * 22 * 3600);
      const resetTime = startOfDay + offset * 1000;
      let diff = Math.floor((resetTime - now.getTime()) / 1000);
      if (diff < 0) diff += 24 * 3600;
      setWinCountdown(diff);
    }
  }, [viewedUserData, sessionSeed]);
  const wrapperRef = useRef(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setWinCountdown(prev => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    const updateScale = () => {
      // Measure window size, leaving room for the 70px top client header
      // Subtract 60px (30px on each side) to leave ~1cm margin from the screen edge
      const availableWidth = window.innerWidth - 60;
      const availableHeight = window.innerHeight - 105 - 60;
      const scaleX = availableWidth / 1024;
      const scaleY = availableHeight / 600;
      setScale(Math.min(scaleX, scaleY));
    };

    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, []);


  useEffect(() => {
    // Preload background images to prevent flickering when switching tabs
    const imagesToPreload = [
      '/images/summoners_profile_bg.jpg',
      '/images/summoners_history_bg.jpg',
      '/images/summoners_masteryprogress_profile_bg.jpg',
      '/images/blank_parchment.jpg',
      '/images/summoners_runes_bg.jpg'
    ];
    imagesToPreload.forEach((src) => {
      const img = new Image();
      img.src = src;
    });
  }, []);

  useEffect(() => {
    async function fetchProfile() {
      if (!viewedUserData?.riotId && !viewedUserData?.puuid) return;
      setLoading(true);

      // Ensure we have a stable seed for randomization
      const puuid = viewedUserData.puuid && viewedUserData.puuid !== 'default'
        ? viewedUserData.puuid
        : (viewedUserData.riotId || 'default');

      try {
        const response = await fetch('/api/profile', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            riotId: viewedUserData.riotId,
            region: viewedUserData.region,
            puuid: viewedUserData.puuid
          })
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || `Failed with status: ${response.status}`);
        }

        const data = await response.json();
        const normalizeTier = (tier) => {
          if (!tier) return tier;
          const tierUpper = tier.toUpperCase();
          if (tierUpper === 'EMERALD') return 'PLATINUM';
          if (tierUpper === 'IRON') return 'BRONZE';
          if (tierUpper === 'GRANDMASTER') return 'MASTER';
          return tier;
        };

        if (data.rank && data.rank.tier) {
          data.rank.tier = normalizeTier(data.rank.tier);
        }
        if (data.flexRank && data.flexRank.tier) {
          data.flexRank.tier = normalizeTier(data.flexRank.tier);
        }
        if (data.pastRank && data.pastRank.tier) {
          data.pastRank.tier = normalizeTier(data.pastRank.tier);
        }
        if (data.mastery && Array.isArray(data.mastery)) {
          data.mastery = data.mastery.map(m => ({
            ...m,
            championLevel: Math.min(m.championLevel, 7)
          }));
        }
        setProfileData({
          ...data,
          summonerLevel: Math.min(data.summonerLevel || viewedUserData?.summonerLevel || 30, 30),
          profileIconId: data.profileIconId || viewedUserData?.profileIconId || 1
        });
        // Randomize Normal stats
        const getRankWins = (tier, rand) => {
          const t = tier ? tier.toUpperCase() : 'UNRANKED';
          if (['CHALLENGER', 'GRANDMASTER', 'MASTER'].includes(t)) return Math.floor(rand * (800 - 500 + 1)) + 500;
          if (['DIAMOND', 'PLATINUM'].includes(t)) return Math.floor(rand * (800 - 250 + 1)) + 250;
          if (t === 'GOLD') return Math.floor(rand * (749 - 100 + 1)) + 100;
          return Math.floor(rand * (499 - 50 + 1)) + 50;
        };

        const wins = getRankWins(data.rank?.tier, getSeededRandom(puuid, 'wins'));
        setNormalWins(wins);

        const getCSValue = (w, rand) => {
          if (w >= 750) return Math.floor(rand * (199999 - 150000 + 1)) + 150000; // Wins Diamond -> CS Plat
          if (w >= 500) return Math.floor(rand * (149999 - 100000 + 1)) + 100000; // Wins Plat -> CS Gold
          if (w >= 250) return Math.floor(rand * (99999 - 50000 + 1)) + 50000;   // Wins Gold -> CS Silver
          return Math.floor(rand * (49999 - 10000 + 1)) + 10000;                // Wins Silver/Bronze -> CS Bronze
        };

        const getTakedownsValue = (w, rand) => {
          if (w >= 750) return Math.floor(rand * (30000 - 25000 + 1)) + 25000;
          if (w >= 500) return Math.floor(rand * (24999 - 15000 + 1)) + 15000;
          if (w >= 250) return Math.floor(rand * (14999 - 10000 + 1)) + 10000;
          if (w >= 100) return Math.floor(rand * (9999 - 5000 + 1)) + 5000;
          return Math.floor(rand * (4999 - 1000 + 1)) + 1000;
        };

        setCreepScore(getCSValue(wins, getSeededRandom(puuid, 'cs')));
        setTakedowns(getTakedownsValue(wins, getSeededRandom(puuid, 'takedowns')));

        const getARAMWins = (nW, randD, randV) => {
          let targetR;
          if (nW >= 750) targetR = randD > 0.5 ? 'DIAMOND' : 'PLATINUM';
          else if (nW >= 500) targetR = randD > 0.5 ? 'PLATINUM' : 'GOLD';
          else if (nW >= 250) targetR = randD > 0.5 ? 'GOLD' : 'SILVER';
          else if (nW >= 100) targetR = randD > 0.5 ? 'SILVER' : 'BRONZE';
          else targetR = 'BRONZE';
          if (targetR === 'DIAMOND') return { val: Math.floor(randV * (200 - 150 + 1)) + 150, rank: 'DIAMOND' };
          if (targetR === 'PLATINUM') return { val: Math.floor(randV * (149 - 100 + 1)) + 100, rank: 'PLATINUM' };
          if (targetR === 'GOLD') return { val: Math.floor(randV * (99 - 50 + 1)) + 50, rank: 'GOLD' };
          if (targetR === 'SILVER') return { val: Math.floor(randV * (49 - 25 + 1)) + 25, rank: 'SILVER' };
          return { val: Math.floor(randV * (24 - 10 + 1)) + 10, rank: 'BRONZE' };
        };

        const { val: aWins, rank: aRank } = getARAMWins(wins, getSeededRandom(puuid, 'aramDecision'), getSeededRandom(puuid, 'aramWins'));
        setAramWins(aWins);

        const getARAMTakedownsByRank = (rank, rand) => {
          if (rank === 'DIAMOND') return Math.floor(rand * (7500 - 6000 + 1)) + 6000;
          if (rank === 'PLATINUM') return Math.floor(rand * (5999 - 4500 + 1)) + 4500;
          if (rank === 'GOLD') return Math.floor(rand * (4499 - 3000 + 1)) + 3000;
          if (rank === 'SILVER') return Math.floor(rand * (2999 - 2000 + 1)) + 2000;
          return Math.floor(rand * (1999 - 1000 + 1)) + 1000;
        };

        const getTurretsByARAMRank = (rank, rand) => {
          let targetR;
          if (rank === 'DIAMOND') targetR = 'PLATINUM';
          else if (rank === 'PLATINUM') targetR = 'GOLD';
          else if (rank === 'GOLD') targetR = 'SILVER';
          else targetR = 'BRONZE';
          if (targetR === 'PLATINUM') return Math.floor(rand * (149 - 100 + 1)) + 100;
          if (targetR === 'GOLD') return Math.floor(rand * (99 - 50 + 1)) + 50;
          if (targetR === 'SILVER') return Math.floor(rand * (49 - 25 + 1)) + 25;
          return Math.floor(rand * (24 - 10 + 1)) + 10;
        };

        setAramTakedowns(getARAMTakedownsByRank(aRank, getSeededRandom(puuid, 'aramTakedowns')));
        setAramTurrets(getTurretsByARAMRank(aRank, getSeededRandom(puuid, 'aramTurrets')));

        const h1 = Math.floor(getSeededRandom(puuid, 'h1') * (300 - 40 + 1)) + 40;
        const h2 = Math.floor(getSeededRandom(puuid, 'h2') * (300 - 40 + 1)) + 40;
        const h3 = Math.floor(getSeededRandom(puuid, 'h3') * (300 - 40 + 1)) + 40;
        const h4 = Math.floor(getSeededRandom(puuid, 'h4') * (300 - 40 + 1)) + 40;
        const sortedHonors = [h1, h2, h3, h4].sort((a, b) => b - a);

        setHonors({
          friendly: sortedHonors[2],
          helpful: sortedHonors[3],
          teamwork: sortedHonors[0],
          opponent: sortedHonors[1]
        });
      } catch (err) {
        console.error("Profile Fetch Error:", err);
        setProfileData({
          summonerName: viewedUserData?.riotId?.split('#')[0] || 'Unknown',
          summonerLevel: Math.min(viewedUserData?.summonerLevel || 30, 30),
          profileIconId: viewedUserData?.profileIconId || 1,
          rank: null,
          mastery: [],
          error: err.message
        });
        const getRankWins = (tier, rand) => {
          const t = tier ? tier.toUpperCase() : 'UNRANKED';
          if (['CHALLENGER', 'GRANDMASTER', 'MASTER'].includes(t)) return Math.floor(rand * (800 - 500 + 1)) + 500;
          if (['DIAMOND', 'PLATINUM'].includes(t)) return Math.floor(rand * (800 - 250 + 1)) + 250;
          if (t === 'GOLD') return Math.floor(rand * (749 - 100 + 1)) + 100;
          return Math.floor(rand * (499 - 50 + 1)) + 50;
        };

        const wins = getRankWins(null, getSeededRandom(puuid, 'wins'));
        setNormalWins(wins);

        const getCSValue = (w, rand) => {
          if (w >= 750) return Math.floor(rand * (199999 - 150000 + 1)) + 150000;
          if (w >= 500) return Math.floor(rand * (149999 - 100000 + 1)) + 100000;
          if (w >= 250) return Math.floor(rand * (99999 - 50000 + 1)) + 50000;
          return Math.floor(rand * (49999 - 10000 + 1)) + 10000;
        };

        const getTakedownsValue = (w, rand) => {
          if (w >= 750) return Math.floor(rand * (30000 - 25000 + 1)) + 25000;
          if (w >= 500) return Math.floor(rand * (24999 - 15000 + 1)) + 15000;
          if (w >= 250) return Math.floor(rand * (14999 - 10000 + 1)) + 10000;
          if (w >= 100) return Math.floor(rand * (9999 - 5000 + 1)) + 5000;
          return Math.floor(rand * (4999 - 1000 + 1)) + 1000;
        };

        setNormalWins(wins);
        setCreepScore(getCSValue(wins, getSeededRandom(puuid, 'cs')));
        setTakedowns(getTakedownsValue(wins, getSeededRandom(puuid, 'takedowns')));

        const getARAMWins = (nW, randD, randV) => {
          let targetR;
          if (nW >= 750) targetR = randD > 0.5 ? 'DIAMOND' : 'PLATINUM';
          else if (nW >= 500) targetR = randD > 0.5 ? 'PLATINUM' : 'GOLD';
          else if (nW >= 250) targetR = randD > 0.5 ? 'GOLD' : 'SILVER';
          else if (nW >= 100) targetR = randD > 0.5 ? 'SILVER' : 'BRONZE';
          else targetR = 'BRONZE';
          if (targetR === 'DIAMOND') return { val: Math.floor(randV * (200 - 150 + 1)) + 150, rank: 'DIAMOND' };
          if (targetR === 'PLATINUM') return { val: Math.floor(randV * (149 - 100 + 1)) + 100, rank: 'PLATINUM' };
          if (targetR === 'GOLD') return { val: Math.floor(randV * (99 - 50 + 1)) + 50, rank: 'GOLD' };
          if (targetR === 'SILVER') return { val: Math.floor(randV * (49 - 25 + 1)) + 25, rank: 'SILVER' };
          return { val: Math.floor(randV * (24 - 10 + 1)) + 10, rank: 'BRONZE' };
        };

        const { val: aWins, rank: aRank } = getARAMWins(wins, getSeededRandom(puuid, 'aramDecision'), getSeededRandom(puuid, 'aramWins'));
        setAramWins(aWins);

        const getARAMTakedownsByRank = (rank, rand) => {
          if (rank === 'DIAMOND') return Math.floor(rand * (7500 - 6000 + 1)) + 6000;
          if (rank === 'PLATINUM') return Math.floor(rand * (5999 - 4500 + 1)) + 4500;
          if (rank === 'GOLD') return Math.floor(rand * (4499 - 3000 + 1)) + 3000;
          if (rank === 'SILVER') return Math.floor(rand * (2999 - 2000 + 1)) + 2000;
          return Math.floor(rand * (1999 - 1000 + 1)) + 1000;
        };

        const getTurretsByARAMRank = (rank, rand) => {
          let targetR;
          if (rank === 'DIAMOND') targetR = 'PLATINUM';
          else if (rank === 'PLATINUM') targetR = 'GOLD';
          else if (rank === 'GOLD') targetR = 'SILVER';
          else targetR = 'BRONZE';
          if (targetR === 'PLATINUM') return Math.floor(rand * (149 - 100 + 1)) + 100;
          if (targetR === 'GOLD') return Math.floor(rand * (99 - 50 + 1)) + 50;
          if (targetR === 'SILVER') return Math.floor(rand * (49 - 25 + 1)) + 25;
          return Math.floor(rand * (24 - 10 + 1)) + 10;
        };

        setAramTakedowns(getARAMTakedownsByRank(aRank, getSeededRandom(puuid, 'aramTakedowns')));
        setAramTurrets(getTurretsByARAMRank(aRank, getSeededRandom(puuid, 'aramTurrets')));

        const h1 = Math.floor(getSeededRandom(puuid, 'h1') * (300 - 40 + 1)) + 40;
        const h2 = Math.floor(getSeededRandom(puuid, 'h2') * (300 - 40 + 1)) + 40;
        const h3 = Math.floor(getSeededRandom(puuid, 'h3') * (300 - 40 + 1)) + 40;
        const h4 = Math.floor(getSeededRandom(puuid, 'h4') * (300 - 40 + 1)) + 40;
        const sortedHonors = [h1, h2, h3, h4].sort((a, b) => b - a);

        setHonors({
          friendly: sortedHonors[2],
          helpful: sortedHonors[3],
          teamwork: sortedHonors[0],
          opponent: sortedHonors[1]
        });

        setError('Failed to fetch real data. Using mock data.');
      } finally {
        setLoading(false);
      }
    }

    if (viewedUserData?.riotId && viewedUserData?.region) {
      setRankedPage(0);
      setMasteryPage(0);
      fetchProfile();
      setViewedDivision(profileData?.rank?.rank || 'V');
    }
  }, [viewedUserData]);

  useEffect(() => {
    if (profileData?.rank?.rank) {
      setViewedDivision(profileData.rank.rank);
    }
  }, [profileData]);

  const generateMockLeague = (puuid, division, queue, tier, lp, actualDivision) => {
    const seedBase = puuid + division + queue + sessionSeed;
    const rank = division || 'IV';
    const currentLp = lp || 0;

    const names = [
      'Hide on bush', 'Dopa', 'T1 Faker', 'C9 Berserker', 'G2 Caps', 'Doublelift', 'Bjergsen', 'MadLife', 'InSec', 'Reapered',
      'TheShy', 'Rookie', 'JackeyLove', 'Knight', 'Chovy', 'ShowMaker', 'Gumayusi', 'Keria', 'Zeus', 'Oner',
      'Viper', 'Meiko', 'Scout', 'Tarzan', 'Xiaohu', 'Bin', 'GALA', 'Ming', 'Impact', 'CoreJJ',
      'Hans Sama', 'Mikyx', 'BrokenBlade', 'Elyoya', 'Humanoid', 'Upset', 'Hylissang', 'Alphari', 'Perkz', 'Jankos',
      'Nightmare X', 'Shadow Ninja', 'God of LoL', 'King of Mid', 'Support Main', 'Jungle Diff', 'Better ADC wins', 'Top Gap', 'Feed or AFK', 'Toxic Player',
      'Solo Carry', 'Hardstuck', 'Diamond 1 King', 'Road to Master', 'LP Farmer', 'Win Trader', 'KDA Player', 'One Trick Pony', 'OTP Riven',
      'Best Riven NA', 'Best Zed EU', 'Korean Jinx', 'Chinese Lee Sin', 'EUW King', 'NA Talent', 'LPL Hope', 'LCK Legend', 'Wild Card', 'Minor Region',
      'Silver Scrapes', 'Pentakill', 'First Blood', 'Blue Buff', 'Red Buff', 'Baron Nashor', 'Elder Dragon', 'Inhibitor', 'Nexus', 'Minion',
      'Caster Minion', 'Cannon Minion', 'Super Minion', 'Scuttle Crab', 'Rift Herald', 'Honeyfruit', 'Blast Cone', 'Scryers Bloom', 'Vision Ward', 'Pink Ward',
      'Oracle Lens', 'Sweeper', 'Stopwatch', 'Zhonya', 'Guardian Angel', 'Flash Flash', 'Ignite Me', 'Teleport Home', 'Smite God', 'Heal Me',
      'Flame On', 'Tilt Lord', 'Salt Mine', 'Lag Spike', 'High Ping', 'DCed', 'Reconnect', 'FF at 15', 'Open Mid', 'No Ganks',
      'Afk Farm', 'Split Push', 'Backdoor', 'Base Race', 'Xpeke', 'Snoopeh', 'Yellowstar', 'Soaz', 'Diamondprox', 'Alex Ich',
      'Darien', 'Genja', 'Edward', 'Froggen', 'Wickd', 'Scarra', 'Voyboy', 'Saintvicious', 'HotshotGG', 'Chaox',
      'Xpecial', 'The OddOne', 'WildTurtle', 'Dyrus', 'Reginald', 'TheRainMan', 'Dan Dinh', 'Bigfatlp', 'JiJi', 'Krepo',
      'Snoopeh', 'Yellowpete', 'Toyz', 'Stanley', 'Bebe', 'Lilballz', 'MiSTakE', 'Misaya', 'Weixiao', 'Caomei',
      'Clearlove', 'Fzzf', 'Uzi', 'GoGoing', 'Lovelin', 'Cool', 'San', 'Cloud', 'Zero', 'Corn',
      'Cola', 'Insec', 'Zero', 'Flame', 'Shy', 'Ambition', 'Score', 'Ryu', 'Ssumday', 'Kakao',
      'Rookie', 'Smeb', 'Pray', 'Gorilla', 'Kuro', 'Huni', 'Reignover', 'Febiven', 'Rekkles', 'Yellowstar',
      'Jensen', 'Sneaky', 'Smoothie', 'Impact', 'Contractz', 'Hauntzer', 'Svenskeren', 'Biofrost', 'Pobelter', 'Xmithie',
      'Olleh', 'Darshan', 'Huhi', 'Stixxay', 'Aphromoo', 'Zven', 'Mithy', 'Trick', 'Expect', 'Perkz'
    ];

    const isKR = (viewedUserData?.region || userData?.region || '').toLowerCase().includes('kr');

    let finalNames = [...names];
    if (isKR) {
      const koreanNames = [
        '상혁', '성웅', '준식', '재완', '진식', '경인', '재원', '광희', '종인', '현종',
        '민호', '승빈', '성영', '윤재', '범현', '영민', '종석', '한규', '우석', '지훈',
        '건희', '민석', '현준', '창현', '태민', '성진', '지민', '도현', '성후', '지후',
        '민준', '서준', '예준', '주원', '유준', '준우', '상훈', '도윤', '준서', '시우',
        '건우', '우진', '지성', '현우', '동현', '준영', '현준', '지훈', '승민', '민규'
      ];
      // Create a pool where 75% are Korean names
      const krPool = [];
      for (let i = 0; i < names.length; i++) {
        const rand = getSeededRandom(seedBase + i, 'regionalName');
        if (rand < 0.75) {
          krPool.push(koreanNames[Math.floor(getSeededRandom(seedBase + i, 'krNameIdx') * koreanNames.length)]);
        } else {
          krPool.push(names[i]);
        }
      }
      finalNames = krPool;
    }

    const shuffledNames = [...finalNames].sort((a, b) => getSeededRandom(seedBase + a, 'nameShuffle') - 0.5);

    const players = [];
    const selfInPromotion = lp === 100;
    let selfPromoProgress = [];
    if (selfInPromotion) {
      const gamesPlayed = Math.floor(getSeededRandom(seedBase, 'selfGamesPlayed') * 3); // 0, 1, or 2
      let wins = 0;
      for (let j = 0; j < 3; j++) {
        if (j < gamesPlayed) {
          const res = (getSeededRandom(seedBase + j, 'selfGameResult') > 0.5 && wins < 1) ? 'W' : 'L';
          if (res === 'W') wins++;
          selfPromoProgress.push(res);
        } else {
          selfPromoProgress.push('N');
        }
      }
    }

    const currentPlayer = {
      name: viewedUserData?.riotId?.split('#')[0] || 'Summoner',
      rank: 0,
      icon: profileData?.profileIconId || 1,
      lp: currentLp,
      wins: Math.floor(getSeededRandom(seedBase, 'mockWins') * 100) + 20,
      emblems: {
        hotStreak: getSeededRandom(seedBase, 'hot') > 0.8,
        recruit: getSeededRandom(seedBase, 'rec') > 0.9,
        veteran: getSeededRandom(seedBase, 'vet') > 0.7
      },
      trend: 'same',
      isSelf: true,
      inPromotion: selfInPromotion,
      promoProgress: selfPromoProgress
    };

    const tUpper = tier.toUpperCase();
    const isChallenger = tUpper === 'CHALLENGER';
    const isMaster = tUpper === 'MASTER';
    const isTopTier = isChallenger || isMaster;

    // Only include the current player if they are in this division, or if it's a top tier (no divisions)
    if (isTopTier || division === actualDivision) {
      players.push(currentPlayer);
    }

    const is3v3 = queue === 'Team 3v3';
    const playerCount = isTopTier ? 199 : (is3v3 ? 19 : 49);

    for (let i = 0; i < playerCount; i++) {
      const seed = seedBase + i;
      let otherLp;
      if (isChallenger) {
        otherLp = Math.floor(getSeededRandom(seed, 'lp') * 1500) + 1000;
      } else if (isMaster) {
        otherLp = Math.floor(getSeededRandom(seed, 'lp') * 699) + 300;
      } else {
        otherLp = Math.floor(getSeededRandom(seed, 'lp') * 100);
      }

      const inPromotion = isTopTier ? false : (i < 2 || (i < 4 && otherLp > 70));
      let promoProgress = [];
      if (inPromotion) {
        // Best of 3: Generate 3 statuses
        // W: Win, L: Loss, N: Not Played
        const gamesPlayed = Math.floor(getSeededRandom(seed, 'gamesPlayed') * 3); // 0, 1, or 2 played
        let wins = 0;
        for (let j = 0; j < 3; j++) {
          if (j < gamesPlayed) {
            const res = (getSeededRandom(seed + j, 'gameResult') > 0.5 && wins < 1) ? 'W' : 'L';
            if (res === 'W') wins++;
            promoProgress.push(res);
          } else {
            promoProgress.push('N');
          }
        }
      }

      players.push({
        name: shuffledNames[i % shuffledNames.length],
        icon: Math.floor(getSeededRandom(seed, 'icon') * 4000) + 1000,
        lp: otherLp,
        wins: Math.floor(getSeededRandom(seed, 'wins') * 200) + (isTopTier ? 100 : 6),
        emblems: {
          hotStreak: getSeededRandom(seed, 'hot') > 0.85,
          recruit: getSeededRandom(seed, 'rec') > 0.95,
          veteran: getSeededRandom(seed, 'vet') > 0.75
        },
        trend: getSeededRandom(seed, 'trend') > 0.6 ? 'up' : (getSeededRandom(seed, 'trend') < 0.3 ? 'down' : 'same'),
        trendValue: Math.floor(getSeededRandom(seed, 'trendVal') * 15) + 1,
        isSelf: false,
        inPromotion: inPromotion,
        promoProgress: promoProgress
      });
    }

    players.sort((a, b) => b.lp - a.lp);
    players.forEach((p, index) => { p.rank = index + 1; });
    return players;
  };

  const currentRank = useMemo(() => {
    if (!profileData) return null;
    if (selectedQueue === 'Solo Queue') return profileData.rank || { tier: 'Unranked', rank: 'I', lp: 0 };
    if (selectedQueue === 'Team 5v5') return profileData.flexRank || { tier: 'Unranked', rank: 'I', lp: 0 };
    if (selectedQueue === 'Team 3v3') return profileData.team3v3Rank || { tier: 'Unranked', rank: 'I', lp: 0 };
    return profileData.rank || { tier: 'Unranked', rank: 'I', lp: 0 };
  }, [profileData, selectedQueue]);

  useEffect(() => {
    if (activeTab === 'leagues' && profileData) {
      const tier = currentRank?.tier || 'Silver';
      const lp = currentRank?.lp || 0;
      const actualDivision = currentRank?.rank || 'I';
      setLeaguePlayers(generateMockLeague(viewedUserData?.puuid || 'default', viewedDivision, selectedQueue, tier, lp, actualDivision));
    }
  }, [activeTab, profileData, viewedDivision, selectedQueue, currentRank]);

  useEffect(() => {
    if (currentRank?.rank) {
      setViewedDivision(currentRank.rank);
    } else {
      setViewedDivision('I');
    }
  }, [currentRank]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    let query = searchQuery;
    if (!query.includes('#')) {
      const currentTag = userData.riotId.split('#')[1];
      if (currentTag) query += `#${currentTag}`;
      else query += '#NA1'; // Fallback tag
    }

    setLoading(true);
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          riotId: query,
          region: userData.region
        })
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Summoner not found');
      }

      const newSummoner = await res.json();
      setViewedUserData(newSummoner);
      setSearchQuery('');
      setActiveTab('profile'); // Return to main profile view when searching
    } catch (err) {
      console.error('Search failed:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const summonerName = profileData?.summonerName || viewedUserData?.riotId?.split('#')[0] || 'Unknown';
  const level = profileData?.summonerLevel || viewedUserData?.summonerLevel || 30;

  const rankTier = profileData?.rank?.tier || null;
  const getBorderImage = (tier) => {
    if (!tier) return null;
    const t = tier.toLowerCase();
    if (t === 'bronze') return '/images/bronze_border.png';
    if (t === 'silver') return '/images/silver_border.png';
    if (t === 'gold') return '/images/gold_border.png';
    if (t === 'platinum') return '/images/platinum_border.png';
    if (t === 'diamond') return '/images/diamond_border.png';
    if (t === 'master' || t === 'challenger') return '/images/challenger_border.png';
    return `/images/${t}_border.png`;
  };
  const borderImage = getBorderImage(rankTier);

  const getLeagueName = () => {
    const puuid = viewedUserData?.puuid || 'default';
    const champions = [
      'Aatrox', 'Ahri', 'Akali', 'Alistar', 'Amumu', 'Anivia', 'Annie', 'Ashe', 'Azir',
      'Bard', 'Brand', 'Braum', 'Caitlyn', 'Corki', 'Darius', 'Diana', 'Draven', 'Ekko',
      'Elise', 'Ezreal', 'Fiora', 'Fizz', 'Galio', 'Garen', 'Gnar', 'Gragas', 'Graves',
      'Irelia', 'Ivern', 'Janna', 'Jax', 'Jayce', 'Jhin', 'Jinx', 'Karma', 'Katarina',
      'Kayle', 'Kennen', 'Leona', 'Lucian', 'Lulu', 'Lux', 'Nami', 'Nasus', 'Olaf',
      'Poppy', 'Quinn', 'Rengar', 'Riven', 'Ryze', 'Shaco', 'Shen', 'Sion', 'Sivir',
      'Sona', 'Swain', 'Syndra', 'Talon', 'Taric', 'Teemo', 'Thresh', 'Udyr', 'Urgot',
      'Varus', 'Vayne', 'Vi', 'Viktor', 'Yasuo', 'Zac', 'Zed', 'Zyra'
    ];
    const suffixes = [
      "'s Wizards", "'s Shadows", "'s Elite", "'s Commandos", "'s Avengers",
      "'s Zealots", "'s Ravagers", "'s Paladins", "'s Warriors", "'s Heroes",
      "'s Renegades", "'s Chosen", "'s Alliance", "'s Vanguard", "'s Snipers",
      "'s Assassins", "'s Sorcerers", "'s Knights"
    ];

    // Incorporate division and queue into the seed for unique names per division
    const seed = puuid + viewedDivision + selectedQueue + sessionSeed;

    const champIdx = Math.floor(getSeededRandom(seed, 'leagueChamp') * champions.length);
    const suffIdx = Math.floor(getSeededRandom(seed, 'leagueSuff') * suffixes.length);
    return champions[champIdx] + suffixes[suffIdx];
  };

  const getDisplayMastery = () => {
    if (!profileData?.mastery) return [];
    if (masteryPage === 0) {
      const slice = profileData.mastery.slice(0, 3);
      if (slice.length === 3) return [slice[1], slice[0], slice[2]];
      if (slice.length === 2) return [slice[1], slice[0]];
      return slice;
    } else {
      // In Progress: Filter out Mastery 7 and take top 8
      return profileData.mastery
        .filter(m => m.championLevel < 7)
        .slice(0, 8);
    }
  };

  const getFilteredChampions = () => {
    let merged = allChampions.map(champ => {
      const mastery = profileData?.mastery?.find(m => m.championId.toString() === champ.key) || {
        championLevel: 0,
        championPoints: 0,
        chestGranted: false
      };
      return {
        ...champ,
        ...mastery
      };
    });

    if (champSearchQuery) {
      merged = merged.filter(c => c.name.toLowerCase().includes(champSearchQuery.toLowerCase()));
    }

    if (primaryRole !== 'All') {
      merged = merged.filter(c => c.tags.includes(primaryRole));
    }

    if (sorting === 'Highest Mastery') {
      merged.sort((a, b) => b.championPoints - a.championPoints || a.name.localeCompare(b.name));
    } else if (sorting === 'Name') {
      merged.sort((a, b) => a.name.localeCompare(b.name));
    }

    // Randomly assign chest available markers: exactly 20, skipping the first row (idx 0-9)
    // We use puuid + sessionSeed to keep it stable but "random"
    const candidates = merged.map((_, i) => i).slice(10);
    const shuffled = [...candidates];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const seed = puuid + sessionSeed + i + 'chest';
      const j = Math.floor(getSeededRandom(seed, 'shuffle') * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    const selectedIndices = new Set(shuffled.slice(0, 20));

    merged = merged.map((champ, idx) => {
      return { ...champ, chestAvailableMock: selectedIndices.has(idx) };
    });

    if (champSearchQuery) {
      merged = merged.filter(c => c.name.toLowerCase().includes(champSearchQuery.toLowerCase()));
    }

    if (primaryRole !== 'All') {
      merged = merged.filter(c => c.tags.includes(primaryRole));
    }

    if (availability === 'Owned') {
      merged = merged.filter(c => c.championLevel > 0);
    } else if (availability === 'Unowned') {
      merged = merged.filter(c => c.championLevel === 0);
    }

    return merged;
  };

  const handleCrestMouseMove = (e, type) => {
    setTooltip({
      visible: true,
      x: e.clientX,
      y: e.clientY,
      type
    });
  };

  const hideTooltip = () => setTooltip({ visible: false, x: 0, y: 0, type: null });

  const renderTooltip = () => {
    if (!tooltip.visible || !tooltip.type || !profileData) return null;

    let title = "";
    let sub = "";
    let wins = 0;
    let games = 0;
    let lp = 0;

    const puuid = viewedUserData?.puuid || 'default';
    const seed = sessionSeed + puuid + tooltip.type;

    if (tooltip.type === 'solo') {
      const tier = profileData.rank?.tier || 'Unranked';
      const rank = profileData.rank?.rank || 'I';
      const isUnranked = tier.toUpperCase() === 'UNRANKED' || tier.toUpperCase() === 'PROVISIONAL';

      title = `Ranked Solo/Duo - ${isUnranked ? 'Provisional' : (tier.charAt(0) + tier.slice(1).toLowerCase() + ' ' + rank)}`;
      sub = profileData.rank?.leagueName || "Summoner's Rift";

      if (isUnranked) {
        wins = 3;
        games = 4;
        lp = 0;
      } else {
        // Calculate wins to match the "self" entry in the Leagues tab
        const seedBase = puuid + rank + 'Solo Queue' + sessionSeed;
        wins = Math.floor(getSeededRandom(seedBase, 'mockWins') * 100) + 20;

        // Calculate losses (ensure positive winrate: losses < wins)
        const losses = Math.floor(getSeededRandom(seedBase, 'mockLosses') * (wins - 5));
        games = wins + losses;
        lp = profileData.rank?.lp || 0;
      }
    } else if (tooltip.type === 'flex3') {
      title = "Ranked Teams 3v3 - Provisional";
      sub = "The Twisted Treeline";
      wins = 3;
      games = 4;
      lp = 0; // In placements
    } else if (tooltip.type === 'flex5') {
      const tier = profileData.flexRank?.tier || 'Unranked';
      const rank = profileData.flexRank?.rank || 'I';
      const isUnranked = tier.toUpperCase() === 'UNRANKED' || tier.toUpperCase() === 'PROVISIONAL';

      title = `Flex 5v5 - ${isUnranked ? 'Provisional' : (tier.charAt(0) + tier.slice(1).toLowerCase() + ' ' + rank)}`;
      sub = "Summoner's Rift";

      if (isUnranked) {
        wins = 2;
        games = 2;
        lp = 0;
      } else {
        // Calculate wins to match the "self" entry in the Leagues tab when Flex 5v5 is selected
        const seedBase = puuid + rank + 'Team 5v5' + sessionSeed;
        wins = Math.floor(getSeededRandom(seedBase, 'mockWins') * 100) + 20;

        // Calculate losses (ensure positive winrate: losses < wins)
        const losses = Math.floor(getSeededRandom(seedBase, 'mockLosses') * (wins - 5));
        games = wins + losses;
        lp = profileData.flexRank?.lp || 0;
      }
    }

    return (
      <div
        className={styles.rankTooltip}
        style={{
          left: `${tooltip.x + 15}px`,
          top: `${tooltip.y + 15}px`
        }}
      >
        <div className={styles.tooltipTitle}>{title}</div>
        <div className={styles.tooltipSubtitle}>{sub}</div>
        <div className={styles.tooltipStatsContainer}>
          <div className={styles.tooltipStatsLeft}>
            Wins: <span className={styles.tooltipWinsCount}>{wins}</span> Games: {games}
            {tooltip.type === 'flex3' && <div style={{ marginTop: '2px' }}>Placements</div>}
          </div>
          <div className={styles.tooltipStatsRight}>
            LP: {lp}
          </div>
        </div>
      </div>
    );
  };

  const getQueueName = (queueId) => {
    const queueMap = {
      0: 'Custom game',
      400: 'Normal (Draft)',
      420: 'Ranked Solo',
      430: 'Normal (Blind)',
      440: 'Ranked Flex',
      450: 'ARAM',
      700: 'Clash'
    };
    return queueMap[queueId] || 'Normal game';
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    return `${months[date.getMonth()]} ${date.getDate().toString().padStart(2, '0')}, ${date.getFullYear()}`;
  };

  const getMasteryBorder = (level) => {
    if (level === 7) return '/images/mastery_7_circle.png';
    if (level === 6) return '/images/mastery_6_circle.png';
    if (level === 5) return '/images/mastery_5_circle.png';
    return '/images/lvlup_mastery.png';
  };

  const getMasteryBanner = (level) => {
    const safeLevel = Math.max(1, Math.min(level, 7));
    return `/images/banner-mastery-small-lvl${safeLevel}.png`;
  };

  const getCrestImage = (tier, rank) => {
    if (!tier || tier.toUpperCase() === 'UNRANKED' || tier.toUpperCase() === 'PROVISIONAL') return '/images/provisional.png';
    const t = tier.toLowerCase();
    if (t === 'master' || t === 'challenger' || t === 'grandmaster') return `/images/${t}.png`;

    // rank is I, II, III, IV
    const romanToNumber = { 'I': '1', 'II': '2', 'III': '3', 'IV': '4', 'V': '4' };
    const num = romanToNumber[rank] || '4';
    return `/images/${t}_${num}.png`;
  };

  const getNormalBadge = (wins) => {
    if (wins >= 750) return '/images/diamond.png';
    if (wins >= 500) return '/images/platinum.png';
    if (wins >= 250) return '/images/gold.png';
    if (wins >= 100) return '/images/silver.png';
    return '/images/bronze.png';
  };

  const getCSBadge = (wins) => {
    if (wins >= 750) return '/images/platinum.png';
    if (wins >= 500) return '/images/gold.png';
    if (wins >= 250) return '/images/silver.png';
    return '/images/bronze.png';
  };

  const getARAMBadge = (wins) => {
    if (wins >= 150) return '/images/diamond.png';
    if (wins >= 100) return '/images/platinum.png';
    if (wins >= 50) return '/images/gold.png';
    if (wins >= 25) return '/images/silver.png';
    return '/images/bronze.png';
  };

  const getARAMTurretsBadge = (wins) => {
    if (wins >= 150) return '/images/platinum.png';
    if (wins >= 100) return '/images/gold.png';
    if (wins >= 50) return '/images/silver.png';
    return '/images/bronze.png';
  };

  return (
    <div className={styles.container}>
      <Header
        userData={userData}
        onNavigate={onNavigate}
        onProfileClick={() => {
          setViewedUserData(userData);
          handleTabChange('profile');
        }}
      />

      <div className={styles.mainContent}>
        {loading && <div className={styles.loading}>Loading Profile...</div>}

        {!loading && profileData && (
          <div className={styles.parchmentWrapper} ref={wrapperRef}>
            <div
              className={`${styles.parchmentContainer} ${activeTab === 'matchHistory' ? styles.parchmentHistory :
                activeTab === 'leagues' ? styles.parchmentLeagues :
                  activeTab === 'champions' ? styles.parchmentChampions :
                    activeTab === 'runes' ? styles.parchmentRunes :
                    activeTab === 'masteries' ? styles.parchmentMasteries :
                    activeTab === 'spells' ? styles.parchmentSpells :
                      (activeTab === 'profile' && masteryPage === 1 ? styles.parchmentMasteryProgress : '')
                }`}
              style={{ transform: `scale(${scale})`, transformOrigin: 'center center' }}
            >

              <div style={{ transform: 'translateX(-25px)' }}>
                <div className={styles.topProfileBar}>
                  <div className={styles.summonerNameBox}>
                    <div className={styles.summonerNameRed}>{summonerName}</div>
                  </div>

                  {viewedUserData?.puuid === userData?.puuid && (
                    <button className={styles.createTeamBtn}>Create a Ranked Team</button>
                  )}
                </div>

                <div className={styles.tabsRow}>
                  <div className={styles.tabs}>
                    <div className={`${styles.tab} ${activeTab === 'profile' ? styles.active : ''}`} onClick={() => handleTabChange('profile')}>Profile</div>
                    <div className={`${styles.tab} ${activeTab === 'leagues' ? styles.active : ''}`} onClick={() => handleTabChange('leagues')}>Leagues</div>
                    <div className={`${styles.tab} ${activeTab === 'matchHistory' ? styles.active : ''}`} onClick={() => handleTabChange('matchHistory')}>Match History</div>
                    {viewedUserData?.puuid === userData?.puuid && (
                      <>
                        <div className={`${styles.tab} ${activeTab === 'champions' ? styles.active : ''}`} onClick={() => handleTabChange('champions')}>Champions</div>
                        <div className={`${styles.tab} ${activeTab === 'runes' ? styles.active : ''}`} onClick={() => handleTabChange('runes')}>Runes</div>
                        <div className={`${styles.tab} ${activeTab === 'masteries' ? styles.active : ''}`} onClick={() => handleTabChange('masteries')}>Masteries</div>
                        <div className={`${styles.tab} ${activeTab === 'spells' ? styles.active : ''}`} onClick={() => handleTabChange('spells')}>Spells</div>
                      </>
                    )}
                  </div>
                  {viewedUserData?.puuid === userData?.puuid && (
                    <div className={styles.searchBox}>
                      <input
                        type="text"
                        placeholder="Find Summoner"
                        className={styles.searchInput}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                      />
                    </div>
                  )}
                </div>

              </div>

              {activeTab === 'profile' ? (
                <>
                  <div className={styles.mainBanner}>
                    {borderImage && (
                      <img
                        src={borderImage}
                        className={styles.rankBannerBorder}
                        style={(rankTier?.toLowerCase() === 'silver' || rankTier?.toLowerCase() === 'gold' || rankTier?.toLowerCase() === 'platinum' || rankTier?.toLowerCase() === 'diamond' || rankTier?.toLowerCase() === 'master' || rankTier?.toLowerCase() === 'challenger') ? {
                          height: '175%',
                          top: '-37.5%',
                          width: '108%',
                          left: '-4%'
                        } : {}}
                        alt={`${rankTier} Border`}
                      />
                    )}
                    <div className={styles.bannerBorder}></div>
                    <div className={styles.bannerContent}>
                      <div className={styles.bannerIconWrapper}>
                        {profileData.profileIconId ? (
                          <img
                            src={`https://ddragon.leagueoflegends.com/cdn/14.21.1/img/profileicon/${profileData.profileIconId}.png`}
                            className={styles.bannerIcon}
                            alt="Icon"
                            onError={(e) => { e.target.src = `https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/profile-icons/${profileData.profileIconId}.jpg`; }}
                          />
                        ) : (
                          <div className={styles.bannerIcon}></div>
                        )}
                        <div className={styles.yearBadge}>2015</div>
                      </div>

                      <div className={styles.bannerInfo}>
                        <div className={styles.bannerName}>{summonerName}</div>
                        <div className={styles.bannerLevelText}>Level {level}</div>
                      </div>

                      {viewedUserData?.puuid === userData?.puuid && (
                        <div className={styles.bannerRightStats}>
                          <div className={styles.statLine}>
                            {availableChests > 0 ? 'Chests available' : `Next chest available in ${chestDays} days`}
                            <div className={styles.miniIconsWrapper}>
                              {Array.from({ length: Math.max(1, availableChests) }).map((_, i) => (
                                <img key={i} src="/images/minichest_icon.png" className={styles.miniStatIcon} alt="chest" />
                              ))}
                            </div>
                          </div>
                          <div className={styles.statLine}>
                            Rerolls [{rerollCount}/2]
                            <div className={styles.miniIconsWrapper}>
                              <img
                                src={rerollCount > 0 ? "/images/minidice_available.png" : "/images/minidice_notavailable.png"}
                                className={styles.miniDiceIcon}
                                alt="reroll"
                              />
                            </div>
                          </div>
                          <div className={styles.statLine}>
                            {winCountdown === 0 ? 'First win of the day bonus available' : `First Win of the Day bonus available in ${formatTime(winCountdown)}`}
                            <div className={styles.miniIconsWrapper}>
                              <img
                                src={winCountdown === 0 ? "/images/firstwin_icon.png" : "/images/firstwinnotavailble_icon.png"}
                                className={styles.miniStatIcon}
                                alt="first win"
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className={styles.profileBody}>
                    <div className={styles.columnLeft}>
                      <div className={styles.topChampionsHeader}>
                        <div
                          className={`${styles.arrow} ${styles.arrowLeft}`}
                          onClick={() => setMasteryPage(prev => (prev === 0 ? 1 : 0))}
                        ></div>
                        <div className={styles.topChampionsTitleContainer}>
                          <div className={styles.topChampionsTitle}>
                            {masteryPage === 0 ? 'Top Champions' : 'In Progress'}
                          </div>
                          <div className={styles.paginationDots}>
                            <span className={`${styles.dot} ${masteryPage === 0 ? styles.activeDot : ''}`} onClick={() => setMasteryPage(0)}></span>
                            <span className={`${styles.dot} ${masteryPage === 1 ? styles.activeDot : ''}`} onClick={() => setMasteryPage(1)}></span>
                          </div>
                        </div>
                        <div
                          className={`${styles.arrow} ${styles.arrowRight}`}
                          onClick={() => setMasteryPage(prev => (prev === 0 ? 1 : 0))}
                        ></div>
                      </div>
                      <div className={`${styles.championsList} ${masteryPage === 1 ? styles.inProgressGrid : ''}`}>
                        {getDisplayMastery().map((champ, idx) => (
                          <div
                            key={champ.championId || idx}
                            className={`${styles.championItem} ${masteryPage === 0 && idx === 1 ? styles.centerChamp : ''} ${masteryPage === 1 ? styles.inProgressItem : ''}`}
                          >
                            <div className={styles.champVisuals}>
                              <div className={styles.champIconWrapper}>
                                {champ.championStringId && (
                                  <img
                                    src={`https://ddragon.leagueoflegends.com/cdn/14.21.1/img/champion/${champ.championStringId}.png`}
                                    className={styles.champIconImg}
                                    alt={champ.championName}
                                    onError={(e) => { e.target.src = `https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/champion-icons/${champ.championId}.png`; }}
                                  />
                                )}
                                {masteryPage === 0 && (
                                  <img
                                    src={getMasteryBorder(champ.championLevel)}
                                    className={styles.champIconBorderImg}
                                    alt="Mastery Border"
                                  />
                                )}
                              </div>
                              <div className={styles.masteryBanner}>
                                <img
                                  src={getMasteryBanner(champ.championLevel)}
                                  className={styles.masteryBannerImg}
                                  alt={`Mastery Level ${champ.championLevel}`}
                                />
                              </div>
                            </div>
                            {masteryPage === 0 && champ.championLevel >= 7 && (
                              <div className={styles.champScore}>
                                {(champ.championPoints / 1000).toFixed(1)}k
                              </div>
                            )}
                            <div className={styles.champName}>{champ.championName}</div>
                          </div>
                        ))}
                      </div>
                      {masteryPage === 0 && (
                        <div className={styles.totalMasteryScore}>
                          <div className={styles.totalScoreNumber}>
                            {profileData.totalMasteryScore !== undefined ? profileData.totalMasteryScore : (profileData.mastery ? profileData.mastery.reduce((acc, curr) => acc + curr.championLevel, 0) : 0)}
                          </div>
                          <div className={styles.totalScoreLabel}>Mastery Score</div>
                        </div>
                      )}
                    </div>

                    <div className={styles.middleDivider}>
                      <div className={styles.honorItem}>
                        <div className={styles.honorPlaceholder}></div>
                        <div className={styles.honorValueBox}>{honors.friendly}</div>
                      </div>
                      <div className={styles.honorItem}>
                        <div className={styles.honorPlaceholder}></div>
                        <div className={styles.honorValueBox}>{honors.helpful}</div>
                      </div>
                      <div className={styles.honorItem}>
                        <div className={styles.honorPlaceholder}></div>
                        <div className={styles.honorValueBox}>{honors.teamwork}</div>
                      </div>
                      <div className={styles.honorItem}>
                        <div className={styles.honorPlaceholder}></div>
                        <div className={styles.honorValueBox}>{honors.opponent}</div>
                      </div>
                    </div>

                    <div className={styles.columnRight}>
                      <div className={styles.rankedHeader}>
                        <div
                          className={styles.arrow}
                          style={{ borderRight: '18px solid #a08c5c', transform: 'translateY(-6px)' }}
                          onClick={() => setRankedPage(prev => (prev - 1 + 3) % 3)}
                        ></div>
                        <div className={styles.topChampionsTitleContainer}>
                          <div className={styles.topChampionsTitle}>
                            {rankedPage === 0 ? 'Ranked' : rankedPage === 1 ? 'Normal' : 'ARAM'}
                          </div>
                          <div className={styles.paginationDots}>
                            <span className={`${styles.dot} ${rankedPage === 0 ? styles.activeDot : ''}`} onClick={() => setRankedPage(0)}></span>
                            <span className={`${styles.dot} ${rankedPage === 1 ? styles.activeDot : ''}`} onClick={() => setRankedPage(1)}></span>
                            <span className={`${styles.dot} ${rankedPage === 2 ? styles.activeDot : ''}`} onClick={() => setRankedPage(2)}></span>
                          </div>
                        </div>
                        <div
                          className={styles.arrow}
                          style={{ borderLeft: '18px solid #a08c5c', transform: 'translateY(-6px)' }}
                          onClick={() => setRankedPage(prev => (prev + 1) % 3)}
                        ></div>
                      </div>
                      <div className={styles.rankInfo}>
                        {rankedPage === 0 && (
                          <>
                            <div
                              className={`${styles.teamInfo} ${styles.teamLeft}`}
                              onMouseMove={(e) => handleCrestMouseMove(e, 'flex3')}
                              onMouseLeave={hideTooltip}
                            >
                              <img src="/images/provisional.png" className={styles.smallRankBadge} alt="provisional" />
                              <div className={styles.teamLink}>Team 3v3</div>
                              <div style={{ color: 'black', fontSize: '11px', marginTop: '3px' }}>Placements</div>
                              <div style={{ color: 'black', fontSize: '11px', marginTop: '1px' }}>4/10 games</div>
                            </div>

                            <div
                              className={styles.rankBadge}
                              onMouseMove={(e) => handleCrestMouseMove(e, 'solo')}
                              onMouseLeave={hideTooltip}
                            >
                              <img
                                src={getCrestImage(profileData.rank?.tier, profileData.rank?.rank)}
                                alt={profileData.rank?.tier || 'Unranked'}
                                className={styles.rankEmblemImg}
                                onError={(e) => { e.target.src = '/images/unranked.png'; }}
                              />
                            </div>
                            <div className={styles.rankDetailsContainer}>
                              <div className={styles.rankTypeLabel}>Ranked</div>
                              <div className={styles.rankTier}>
                                {profileData.rank?.tier ? profileData.rank.tier.charAt(0) + profileData.rank.tier.slice(1).toLowerCase() : 'Unranked'} {profileData.rank?.rank || ''}
                              </div>
                              <div className={styles.rankLP}>
                                {profileData.rank?.lp !== undefined ? `${profileData.rank.lp} LP` : ''}
                              </div>
                              {['PLATINUM', 'EMERALD', 'DIAMOND', 'MASTER', 'GRANDMASTER', 'CHALLENGER'].includes(profileData.rank?.tier?.toUpperCase()) && (
                                <div className={styles.decayIconContainer}>
                                  <img src="/images/decay_icon.png" className={styles.decayIcon} alt="Decay Warning" />
                                </div>
                              )}
                            </div>

                            <div
                              className={`${styles.teamInfo} ${styles.teamRight}`}
                              onMouseMove={(e) => handleCrestMouseMove(e, 'flex5')}
                              onMouseLeave={hideTooltip}
                            >
                              <img
                                src={getCrestImage(profileData.flexRank?.tier, profileData.flexRank?.rank)}
                                className={styles.smallRankBadge}
                                alt="Ranked Flex"
                                onError={(e) => { e.target.src = '/images/unranked.png'; }}
                              />
                              <div className={styles.teamLink}>Team 5v5</div>
                              <div style={{ color: 'black', fontSize: '11px', marginTop: '3px' }}>
                                {profileData.flexRank?.tier ? `${profileData.flexRank.tier.charAt(0) + profileData.flexRank.tier.slice(1).toLowerCase()} ${profileData.flexRank.rank}` : 'Unranked'}
                              </div>
                              {profileData.flexRank?.lp !== undefined && (
                                <div style={{ color: 'black', fontSize: '11px', marginTop: '1px' }}>
                                  {profileData.flexRank.lp} LP
                                </div>
                              )}
                            </div>
                          </>
                        )}
                        {rankedPage === 1 && (
                          <>
                            <div className={`${styles.teamInfo} ${styles.teamLeft}`}>
                              <img
                                src={getNormalBadge(normalWins)}
                                className={styles.smallRankBadge}
                                alt="Takedowns"
                                onError={(e) => { e.target.src = '/images/unranked.png'; }}
                              />
                              <div className={styles.teamLink}>Takedowns</div>
                              <div className={styles.teamLink} style={{ color: 'black', fontSize: '11px', marginTop: '3px' }}>{takedowns}</div>
                            </div>

                            <div className={styles.rankBadge}>
                              <img
                                src={getNormalBadge(normalWins)}
                                alt="Normal Wins"
                                className={styles.rankEmblemImg}
                                onError={(e) => { e.target.src = '/images/unranked.png'; }}
                              />
                            </div>
                            <div className={styles.rankDetailsContainer}>
                              <div className={styles.rankTypeLabel}>Wins</div>
                              <div className={styles.rankTier}>
                                {normalWins}
                              </div>
                              <div className={styles.rankLP}>
                              </div>
                            </div>

                            <div className={`${styles.teamInfo} ${styles.teamRight}`}>
                              <img
                                src={getCSBadge(normalWins)}
                                className={styles.smallRankBadge}
                                alt="Creep Score"
                                onError={(e) => { e.target.src = '/images/unranked.png'; }}
                              />
                              <div className={styles.teamLink}>Creep Score</div>
                              <div className={styles.teamLink} style={{ color: 'black', fontSize: '11px', marginTop: '3px' }}>{creepScore}</div>
                            </div>
                          </>
                        )}
                        {rankedPage === 2 && (
                          <>
                            <div className={`${styles.teamInfo} ${styles.teamLeft}`}>
                              <img
                                src={getARAMBadge(aramWins)}
                                className={styles.smallRankBadge}
                                alt="Takedowns"
                                onError={(e) => { e.target.src = '/images/unranked.png'; }}
                              />
                              <div className={styles.teamLink}>Takedowns</div>
                              <div className={styles.teamLink} style={{ color: 'black', fontSize: '11px', marginTop: '3px' }}>{aramTakedowns}</div>
                            </div>

                            <div className={styles.rankBadge}>
                              <img
                                src={getARAMBadge(aramWins)}
                                alt="ARAM Wins"
                                className={styles.rankEmblemImg}
                                onError={(e) => { e.target.src = '/images/unranked.png'; }}
                              />
                            </div>
                            <div className={styles.rankDetailsContainer}>
                              <div className={styles.rankTypeLabel}>Wins</div>
                              <div className={styles.rankTier}>
                                {aramWins}
                              </div>
                              <div className={styles.rankLP}>
                              </div>
                            </div>

                            <div className={`${styles.teamInfo} ${styles.teamRight}`}>
                              <img
                                src={getARAMTurretsBadge(aramWins)}
                                className={styles.smallRankBadge}
                                alt="Turrets destroyed"
                                onError={(e) => { e.target.src = '/images/unranked.png'; }}
                              />
                              <div className={styles.teamLink}>Turrets destroyed</div>
                              <div className={styles.teamLink} style={{ color: 'black', fontSize: '11px', marginTop: '3px' }}>{aramTurrets}</div>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </>
              ) : activeTab === 'leagues' ? (
                <div className={styles.leaguesWrapper}>
                  <div className={styles.leaguesMainArea}>
                    {/* Top Header Area */}
                    <div className={styles.leaguesHeader}>
                      <div className={styles.leagueCrestContainer}>
                        <img
                          src={getCrestImage(currentRank?.tier, viewedDivision)}
                          className={styles.leagueCrestImg}
                          alt=""
                        />
                      </div>

                      <div className={styles.leagueTierInfo}>
                        {currentRank?.tier?.toUpperCase() !== 'CHALLENGER' && currentRank?.tier?.toUpperCase() !== 'MASTER' && currentRank?.tier?.toUpperCase() !== 'UNRANKED' && currentRank?.tier?.toUpperCase() !== 'PROVISIONAL' && (
                          <div className={styles.divisionSelectorWrapper}>
                            <div className={styles.divisionLabel}>Division</div>
                            <div className={styles.leagueDivisionBox}>
                              <div className={styles.divisionValue}>{viewedDivision || 'V'}</div>
                              <div className={styles.divisionArrows}>
                                <div
                                  className={`${styles.divisionArrowUp} ${viewedDivision === 'I' ? styles.disabledArrow : ''}`}
                                  onClick={() => {
                                    const divs = ['I', 'II', 'III', 'IV'];
                                    const idx = divs.indexOf(viewedDivision);
                                    if (idx > 0) setViewedDivision(divs[idx - 1]);
                                  }}
                                ></div>
                                <div
                                  className={`${styles.divisionArrowDown} ${(viewedDivision === 'IV' || viewedDivision === 'V') ? styles.disabledArrow : ''}`}
                                  onClick={() => {
                                    const divs = ['I', 'II', 'III', 'IV'];
                                    const idx = divs.indexOf(viewedDivision);
                                    if (idx < divs.length - 1) setViewedDivision(divs[idx + 1]);
                                  }}
                                ></div>
                              </div>
                            </div>
                          </div>
                        )}
                        <div className={styles.leagueNameContainer}>
                          <div className={styles.leagueTierName}>{currentRank?.tier || 'Silver'}</div>
                          <div className={styles.leagueFullName}>
                            {(currentRank?.tier?.toUpperCase() !== 'UNRANKED' && currentRank?.tier?.toUpperCase() !== 'PROVISIONAL') ? getLeagueName() : ''}
                          </div>
                        </div>
                      </div>

                      <div className={styles.queueSelectorContainer}>
                        <select
                          className={styles.queueSelect}
                          value={selectedQueue}
                          onChange={(e) => setSelectedQueue(e.target.value)}
                        >
                          <option>Solo Queue</option>
                          <option>Team 5v5</option>
                          <option>Team 3v3</option>
                        </select>
                      </div>
                    </div>

                    {/* Main Content: Table */}
                    <div className={`${styles.leaguesTableContainer} legacy-scrollbar`}>
                      {(currentRank?.tier?.toUpperCase() === 'UNRANKED' || currentRank?.tier?.toUpperCase() === 'PROVISIONAL') ? (
                        <div className={styles.unrankedMessage}>
                          Finish your placement matches to get into a division
                        </div>
                      ) : (
                        <table className={styles.leaguesTable}>
                          <tbody>
                            {/* UP FOR PROMOTION section */}
                            {profileData?.rank?.tier?.toUpperCase() !== 'CHALLENGER' && profileData?.rank?.tier?.toUpperCase() !== 'MASTER' && (
                              <>
                                <tr className={styles.sectionHeaderRow}>
                                  <td colSpan="3" className={styles.sectionHeaderCell}>UP FOR PROMOTION</td>
                                  <td className={styles.emblemsHeaderCell}>EMBLEMS</td>
                                  <td className={styles.winsHeaderCell}>WINS</td>
                                  <td className={styles.pointsHeaderCell}>BEST OF 3</td>
                                </tr>
                                {leaguePlayers.filter(p => p.inPromotion).map((p, idx) => (
                                  <tr
                                    key={p.name + idx}
                                    className={`${styles.leagueRow} ${p.isSelf ? styles.selfRow : ''}`}
                                  >
                                    <td className={styles.rankCol}>
                                      {p.rank}
                                    </td>
                                    <td className={styles.trendCol}>
                                      {p.trend === 'up' && <span className={styles.trendUp}>▲{p.trendValue}</span>}
                                      {p.trend === 'down' && <span className={styles.trendDown}>▼{p.trendValue}</span>}
                                      {p.trend === 'same' && <span className={styles.trendSame}>-</span>}
                                    </td>
                                    <td className={styles.summonerCol}>
                                      <img
                                        src={`https://ddragon.leagueoflegends.com/cdn/14.21.1/img/profileicon/${p.icon}.png`}
                                        className={styles.tableIcon}
                                        alt=""
                                        onError={(e) => {
                                          if (e.target.src.includes('ddragon') && !e.target.src.includes('fallback')) {
                                            e.target.src = `https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/profile-icons/${p.icon}.png`;
                                          } else {
                                            const modernId = 3000 + (p.rank % 500);
                                            e.target.src = `https://ddragon.leagueoflegends.com/cdn/14.21.1/img/profileicon/${modernId}.png?fallback=true`;
                                          }
                                        }}
                                      />
                                      <span className={styles.summonerNameText}>{p.name}</span>
                                    </td>
                                    <td className={styles.emblemsCol}>
                                      <div className={styles.emblemIcons}>
                                        {p.emblems.hotStreak && <img src="/images/streak_icon.png" className={styles.emblemImg} title="Hot Streak" alt="" />}
                                        {p.emblems.veteran && <img src="/images/bluestreak_icon.png" className={styles.emblemImg} title="Veteran" alt="" />}
                                      </div>
                                    </td>
                                    <td className={styles.winsCol}>{p.wins}</td>
                                    <td className={styles.pointsCol}>
                                      <div className={styles.promoDotsMini}>
                                        {(p.promoProgress || ['N', 'N', 'N']).map((status, j) => (
                                          <span
                                            key={j}
                                            className={`${styles.promoDotMini} ${status === 'W' ? styles.promoWin : status === 'L' ? styles.promoLoss : styles.promoEmpty}`}
                                          >
                                            {status === 'W' ? '✓' : status === 'L' ? 'X' : '-'}
                                          </span>
                                        ))}
                                      </div>
                                    </td>
                                  </tr>
                                ))}
                              </>
                            )}

                            {/* ALL SUMMONERS section */}
                            <tr className={styles.sectionHeaderRow}>
                              <td colSpan="3" className={styles.sectionHeaderCell}>SUMMONERS</td>
                              <td className={styles.emblemsHeaderCell}>EMBLEMS</td>
                              <td className={styles.winsHeaderCell}>WINS</td>
                              <td className={styles.pointsHeaderCell}>POINTS</td>
                            </tr>
                            {leaguePlayers.filter(p => !p.inPromotion).map((p, idx) => (
                              <tr
                                key={p.name + idx}
                                className={`${styles.leagueRow} ${p.isSelf ? styles.selfRow : ''}`}
                              >
                                <td className={styles.rankCol}>
                                  {p.rank}
                                </td>
                                <td className={styles.trendCol}>
                                  {p.trend === 'up' && <span className={styles.trendUp}>▲{p.trendValue}</span>}
                                  {p.trend === 'down' && <span className={styles.trendDown}>▼{p.trendValue}</span>}
                                  {p.trend === 'same' && <span className={styles.trendSame}>-</span>}
                                </td>
                                <td className={styles.summonerCol}>
                                  <img
                                    src={`https://ddragon.leagueoflegends.com/cdn/14.21.1/img/profileicon/${p.icon}.png`}
                                    className={styles.tableIcon}
                                    alt=""
                                    onError={(e) => {
                                      if (e.target.src.includes('ddragon') && !e.target.src.includes('fallback')) {
                                        e.target.src = `https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/profile-icons/${p.icon}.png`;
                                      } else {
                                        const classicId = (p.rank % 28) + 1;
                                        e.target.src = `https://ddragon.leagueoflegends.com/cdn/14.21.1/img/profileicon/${classicId}.png?fallback=true`;
                                      }
                                    }}
                                  />
                                  <span className={styles.summonerNameText}>{p.name}</span>
                                </td>
                                <td className={styles.emblemsCol}>
                                  <div className={styles.emblemIcons}>
                                    {p.emblems.hotStreak && <img src="/images/streak_icon.png" className={styles.emblemImg} title="Hot Streak" alt="" />}
                                    {p.emblems.veteran && <img src="/images/bluestreak_icon.png" className={styles.emblemImg} title="Veteran" alt="" />}
                                  </div>
                                </td>
                                <td className={styles.winsCol}>{p.wins}</td>
                                <td className={styles.pointsCol}>{p.lp}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}
                    </div>
                  </div>

                  {/* Sidebar */}
                  <div className={`${styles.leaguesSidebar} legacy-scrollbar`}>
                    <div className={styles.sidebarSelfInfo}>
                      <img
                        src={`https://ddragon.leagueoflegends.com/cdn/14.21.1/img/profileicon/${profileData?.profileIconId || 1}.png`}
                        className={styles.sidebarSelfIcon}
                        alt=""
                      />
                      <div className={styles.sidebarSelfName}>{summonerName}</div>
                    </div>

                    <div className={styles.sidebarSection}>
                      <div className={styles.sidebarSectionTitle}>Promotion Series</div>
                      <div className={styles.promoStatusText}>
                        {profileData?.rank?.lp === 100
                          ? "This person will be promoted if they win 2 game(s) in this series!"
                          : "Not currently in a promotion series."}
                      </div>
                      {profileData?.rank?.lp === 100 && (
                        <div className={styles.sidebarPromoDots}>
                          {(leaguePlayers.find(p => p.isSelf)?.promoProgress || ['N', 'N', 'N']).map((status, j) => (
                            <span
                              key={j}
                              className={`${styles.sidebarPromoDot} ${status === 'W' ? styles.dotSuccess : status === 'L' ? styles.dotFailure : styles.dotEmpty}`}
                            >
                              {status === 'W' ? '✓' : status === 'L' ? 'X' : '-'}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className={styles.sidebarSection}>
                      <div className={styles.sidebarSectionTitle}>Top Played Champions</div>
                      <div className={styles.topPlayedChampsList}>
                        {profileData?.mastery?.slice(0, 4).map((champ, i) => (
                          <div key={i} className={styles.topPlayedChampRow}>
                            <div className={styles.topChampIcon}>
                              <img
                                src={`https://ddragon.leagueoflegends.com/cdn/14.21.1/img/champion/${champ.championStringId}.png`}
                                alt=""
                                className={styles.topChampSidebarImg}
                                onError={(e) => { e.target.src = '/images/lol_icon.jpg'; }}
                              />
                            </div>
                            <div className={styles.topChampBarContainer}>
                              <div
                                className={styles.topChampBar}
                                style={{ width: `${Math.max(20, Math.min(100, (champ.championPoints / (profileData.mastery[0].championPoints || 1)) * 100))}%` }}
                              ></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <button className={styles.seeMoreStatsBtn}>See More Stats</button>
                    <div className={styles.moreAboutLeagues}>More about the League System</div>
                  </div>
                </div>
              ) : activeTab === 'champions' ? (
                <div className={styles.championsTabWrapper}>
                  <div className={styles.championsFilters}>
                    <div className={styles.filterGroup}>
                      <input
                        type="text"
                        placeholder="Search Champions"
                        className={styles.champSearchInput}
                        value={champSearchQuery}
                        onChange={(e) => setChampSearchQuery(e.target.value)}
                      />
                    </div>
                    <div className={styles.filterGroup}>
                      <span className={styles.filterLabel}>Sorting</span>
                      <select className={styles.champSelect} value={sorting} onChange={(e) => setSorting(e.target.value)}>
                        <option>Highest Mastery</option>
                        <option>Name</option>
                      </select>
                    </div>
                    <div className={styles.filterGroup}>
                      <span className={styles.filterLabel}>Primary Role</span>
                      <select className={styles.champSelect} value={primaryRole} onChange={(e) => setPrimaryRole(e.target.value)}>
                        <option>All</option>
                        <option>Assassin</option>
                        <option>Fighter</option>
                        <option>Mage</option>
                        <option>Marksman</option>
                        <option>Support</option>
                        <option>Tank</option>
                      </select>
                    </div>
                    <div className={styles.filterGroup}>
                      <span className={styles.filterLabel}>Availability</span>
                      <select className={styles.champSelect} value={availability} onChange={(e) => setAvailability(e.target.value)}>
                        <option>All</option>
                        <option>Owned</option>
                        <option>Unowned</option>
                      </select>
                    </div>
                  </div>

                  <div className={`${styles.championsGridContainer} legacy-scrollbar`}>
                    <div className={styles.championsGrid}>
                      {getFilteredChampions().map((champ) => (
                        <div key={champ.id} className={styles.champCard}>
                          <div className={styles.champCardVisuals}>
                            <div className={styles.champCardIconWrapper}>
                              <img
                                src={`https://ddragon.leagueoflegends.com/cdn/14.21.1/img/champion/${champ.id}.png`}
                                className={styles.champCardImg}
                                alt={champ.name}
                              />
                              {champ.chestAvailableMock && (
                                <div className={styles.chestAvailableMarker} title="Chest Available">!</div>
                              )}
                            </div>
                            <div className={styles.champCardMasteryBanner}>
                              <img
                                src={getMasteryBanner(champ.championLevel || 1)}
                                className={styles.champCardBannerImg}
                                style={champ.championLevel === 0 ? { opacity: 0.4, filter: 'grayscale(100%)' } : {}}
                                alt=""
                              />
                            </div>
                          </div>
                          <div className={styles.champCardName}>{champ.name}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : activeTab === 'runes' ? (
                <RunesTab 
                  key={userData?.puuid}
                  ref={runesRef}
                  playClickSound={playClickSound} 
                  puuid={userData?.puuid}
                  scale={scale}

                  onUnsavedChangesChange={(hasChanges, targetPage) => {
                    setRunesHaveChanges(hasChanges);
                    if (targetPage !== undefined) {
                      setPendingPage(targetPage);
                      setShowRunesWarning(true);
                    }
                  }}
                />
              ) : activeTab === 'masteries' ? (
                <MasteriesTab
                  key={userData?.puuid}
                  ref={masteriesRef}
                  playClickSound={playClickSound}
                  puuid={userData?.puuid}
                  summonerLevel={level}
                  scale={scale}
                  onUnsavedChangesChange={(hasChanges, targetPage) => {
                    setMasteriesHaveChanges(hasChanges);
                    if (targetPage !== undefined) {
                      setPendingPage(targetPage);
                      setShowRunesWarning(true);
                    }
                  }}
                  onDelete={() => setShowDeleteMasteryWarning(true)}
                />
              ) : activeTab === 'spells' ? (
                <SpellsTab playClickSound={playClickSound} />
              ) : (
                <div className={`${styles.matchHistoryWrapper} legacy-scrollbar`}>
                  {loadingMatches ? (
                    <div className={styles.loadingMatches}>Loading Match History...</div>
                  ) : (
                    <div className={styles.matchList}>
                      {matchHistory.map((match, idx) => (
                        <div key={match.matchId} className={styles.matchItem}>
                          <div className={styles.matchChampIcon}>
                            <img
                              src={`https://ddragon.leagueoflegends.com/cdn/14.21.1/img/champion/${match.championName}.png`}
                              alt={match.championName}
                              onError={(e) => { e.target.src = `https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/champion-icons/${match.championId}.png`; }}
                            />
                          </div>
                          <div className={styles.matchSpells}>
                            <img src={`https://ddragon.leagueoflegends.com/cdn/14.21.1/img/spell/${match.spell1Name}.png`} alt="" />
                            <img src={`https://ddragon.leagueoflegends.com/cdn/14.21.1/img/spell/${match.spell2Name}.png`} alt="" />
                          </div>
                          <div className={styles.matchInfo}>
                            <div className={match.win ? styles.victoryText : styles.defeatText}>
                              {match.win ? 'Victory' : 'Defeat'} <span className={styles.queueType}>({getQueueName(match.queueId)})</span>
                            </div>
                            <div className={styles.gameModeText}>Classic</div>
                            <div className={styles.mapNameText}>Summoner's Rift</div>
                          </div>
                          <div className={styles.matchItems}>
                            {match.items.slice(0, 6).map((itemId, i) => (
                              <div key={i} className={styles.itemSlot}>
                                {itemId !== 0 ? (
                                  <img
                                    src={`https://ddragon.leagueoflegends.com/cdn/14.21.1/img/item/${itemId}.png`}
                                    alt=""
                                    onError={(e) => {
                                      if (!e.target.src.includes('communitydragon')) {
                                        e.target.src = `https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/item-icons/${itemId}.png`;
                                      } else {
                                        e.target.src = 'https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/item-icons/0.png';
                                        e.target.style.opacity = '0.3';
                                      }
                                    }}
                                  />
                                ) : <div className={styles.emptyItemSlot}></div>}
                              </div>
                            ))}
                            <div className={styles.trinketSlot}>
                              {match.items[6] !== 0 ? (
                                <img
                                  src={`https://ddragon.leagueoflegends.com/cdn/14.21.1/img/item/${match.items[6]}.png`}
                                  alt=""
                                  onError={(e) => {
                                    if (!e.target.src.includes('communitydragon')) {
                                      e.target.src = `https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/item-icons/${match.items[6]}.png`;
                                    } else {
                                      e.target.src = 'https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/item-icons/0.png';
                                      e.target.style.opacity = '0.3';
                                    }
                                  }}
                                />
                              ) : <div className={styles.emptyItemSlot}></div>}
                            </div>
                          </div>
                          <div className={styles.matchStats}>
                            <div className={styles.statRow}>
                              <div className={styles.matchGoldStat}>
                                <span className={styles.matchGoldIcon}></span> {(match.goldEarned / 1000).toFixed(1)}k
                              </div>
                              <div className={styles.matchKdaStat}>
                                <span className={styles.matchKdaIcon}></span> {match.kills} / {match.deaths} / {match.assists}
                              </div>
                              <div className={styles.matchCsStat}>
                                <span className={styles.matchCsIcon}></span> {match.cs}
                              </div>
                            </div>
                            <div className={styles.matchDate}>{formatDate(match.gameCreation)}</div>
                          </div>
                        </div>
                      ))}
                      <div className={styles.matchHistoryFooter}>
                        <div className={styles.footerNote}>Note: Clicking on a game will open the advanced details on the website.</div>
                        <button className={styles.fullHistoryBtn}>View Full Match History</button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {error && (
                <div style={{ position: 'absolute', bottom: '10px', right: '10px', fontSize: '10px', color: '#ff0000' }}>
                  {error}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      {renderTooltip()}

      {showRunesWarning && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h3>Unsaved Changes</h3>
            <p>You have unsaved changes in your {activeTab === 'runes' ? 'Runes' : 'Masteries'}. Would you like to save them before switching tabs?</p>
            <div className={styles.modalActions}>
              <button onClick={() => setShowRunesWarning(false)}>Cancel</button>
              <button onClick={handleDiscardAndSwitch}>Discard</button>
              <button onClick={handleSaveAndSwitch} className={styles.confirmBtn}>Save & Switch</button>
            </div>
          </div>
        </div>
      )}
      {showDeleteMasteryWarning && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h3>Delete Page</h3>
            <p>Are you sure you want to delete this mastery page?</p>
            <div className={styles.modalActions}>
              <button onClick={() => setShowDeleteMasteryWarning(false)}>Cancel</button>
              <button onClick={() => {
                if (masteriesRef.current) masteriesRef.current.confirmDelete();
                setShowDeleteMasteryWarning(false);
              }} className={styles.confirmBtn}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
