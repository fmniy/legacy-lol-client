'use client';

import { useState, useEffect, useMemo, forwardRef, useImperativeHandle, useRef } from 'react';
import styles from '../styles/MasteriesTab.module.css';

const TREES = {
  FEROCITY: 'Ferocity',
  CUNNING: 'Cunning',
  RESOLVE: 'Resolve'
};

const MASTERY_DATA = {
  [TREES.FEROCITY]: [
    // Tier 1 (5 pts)
    [
      { id: 'f1_1', name: 'Fury', maxRank: 5, description: '+0.8% Attack Speed', icon: '/images/fury_mastery.png' },
      { id: 'f1_2', name: 'Sorcery', maxRank: 5, description: '+0.4% increased Ability damage', icon: '/images/sorcery_mastery.png' }
    ],
    // Tier 2 (1 pt)
    [
      { id: 'f2_1', name: 'Double Edged Sword', maxRank: 1, description: 'Deal 3% additional damage, take 1.5% additional damage.', icon: '/images/edgedsword_mastery.png' },
      { id: 'f2_3', name: 'Feast', maxRank: 1, description: 'Killing a unit restores 20 Health (30 second cooldown)', icon: '/images/feast_mastery.png' },
      { id: 'f2_2', name: 'Expose Weakness', maxRank: 1, description: 'Damaging enemy champions causes them to take 3% more damage from your allies', icon: '/images/exposedweakness_mastery.png' }
    ],
    // Tier 3 (5 pts)
    [
      { id: 'f3_1', name: 'Vampirism', maxRank: 5, description: '+0.4% Lifesteal and Spell Vamp', icon: '/images/vampirism_mastery.png' },
      { id: 'f3_2', name: 'Natural Talent', maxRank: 5, description: 'Gain 0.4 + 0.09 per level Attack Damage, and 0.6 + 0.13 per level Ability Power (+2 Attack Damage and 3 Ability Power at level 18)', icon: '/images/ntalent_mastery.png' }
    ],
    // Tier 4 (1 pt)
    [
      { id: 'f4_1', name: 'Bounty Hunter', maxRank: 1, description: 'Deal 1% increased damage for each unique enemy champion you have killed', icon: '/images/bhunter_mastery.png' },
      { id: 'f4_2', name: 'Oppressor', maxRank: 1, description: 'Deal 2.5% increased damage to targets with impaired movement (slow, stun, root, taunt, etc.)', icon: '/images/oppresor_mastery.png' }
    ],
    // Tier 5 (5 pts)
    [
      { id: 'f5_1', name: 'Battering Blows', maxRank: 5, description: '+1.4% Armor Penetration', icon: '/images/bblows_mastery.png' },
      { id: 'f5_2', name: 'Piercing Thoughts', maxRank: 5, description: '+1.4% Magic Penetration', icon: '/images/pthoughts_mastery.png' }
    ],
    // Tier 6 (Keystones - 1 pt)
    [
      { id: 'f6_1', name: 'Warlord\'s Bloodlust', maxRank: 1, description: 'Gain increasingly more Life Steal based on your missing health against champions (up to 20%). Against minions gain 50% benefit (25% for ranged champions).', icon: '/images/wbloodlust_mastery.png', isKeystone: true },
      { id: 'f6_2', name: 'Fervor of Battle', maxRank: 1, description: 'Hitting champions with attacks and abilities generates a Fervor stack (2 for melee attacks, 2 second cooldown for ability hits). Stacks of Fervor last 6 seconds (max 8 stacks).\n\nYour basic attacks deal 1-14 bonus physical damage to champions for each stack.', icon: '/images/fervor_mastery.png', isKeystone: true },
      { id: 'f6_3', name: 'Deathfire Touch', maxRank: 1, description: "Your damaging abilities cause enemy champions to take magic damage over 4 seconds.\n\nDamage: 8 + 60% Bonus Attack Damage and 25% Ability Power\n\nDeathfire Touch's duration is reduced for:\n - Area of Effect: 2 second duration.\n - Damage over Time: 1 second duration.", icon: '/images/deathfire_touch_mastery.png', isKeystone: true }
    ]
  ],
  [TREES.CUNNING]: [
    [
      { id: 'c1_1', name: 'Wanderer', maxRank: 5, description: '+0.6% Movement Speed out of combat', icon: '/images/wanderer_mastery.png' },
      { id: 'c1_2', name: 'Savagery', maxRank: 5, description: 'Single target attacks and spells deal 1 bonus damage to minions and monsters', icon: '/images/savagery_mastery.png' }
    ],
    [
      { id: 'c2_1', name: 'Runic Affinity', maxRank: 1, description: 'Buffs from neutral monsters last 15% longer', icon: '/images/raffinity_mastery.png' },
      { id: 'c2_3', name: 'Secret Stash', maxRank: 1, description: 'Your Potions and Elixirs last 10% longer.\n\nYour Health Potions are replaced with Biscuits that restore 15 Health and Mana instantly on use', icon: '/images/sstash_mastery.png' },
      { id: 'c2_2', name: 'Assassin', maxRank: 1, description: 'Deal 2% increased damage to champions when no allied champions are nearby', icon: '/images/assassin_mastery.png' }
    ],
    [
      { id: 'c3_1', name: 'Merciless', maxRank: 5, description: 'Deal 1% increased damage to champions below 40% Health', icon: '/images/merciless.png' },
      { id: 'c3_2', name: 'Meditation', maxRank: 5, description: 'Regenerate 0.3% of your missing Mana every 5 seconds', icon: '/images/meditation.png' }
    ],
    [
      { id: 'c4_1', name: 'Bandit', maxRank: 1, description: 'Gain 1 gold for each nearby minion killed by an ally.\n\nGain 3 gold (10 if melee) when hitting an enemy champion with a basic attack (5 second cooldown)', icon: '/images/bandit.png' },
      { id: 'c4_2', name: 'Dangerous Game', maxRank: 1, description: 'Champion kills and assists restore 5% of your missing Health and Mana', icon: '/images/dangame.png' }
    ],
    [
      { id: 'c5_1', name: 'Precision', maxRank: 5, description: 'Gain 0.6 + 0.06 per level Magic Penetration and Armor Penetration', icon: '/images/precision.png' },
      { id: 'c5_2', name: 'Intelligence', maxRank: 5, description: 'Your Cooldown Reduction cap is increased to 41% and you gain 1% Cooldown Reduction', icon: '/images/intelligence.png' }
    ],
    [
      { id: 'c6_1', name: 'Stormraider\'s Surge', maxRank: 1, description: "Dealing 30% of a champion's max Health within 2.5 seconds grants you 40% Movement Speed and 75% Slow Resistance for 3 seconds (10 second cooldown).", icon: '/images/stormraider.png', isKeystone: true },
      { id: 'c6_2', name: 'Thunderlord\'s Decree', maxRank: 1, description: 'Your 3rd attack or damaging spell against the same enemy champion calls down a lightning strike, dealing magic damage in the area.\n\nDamage: 10 per level, plus 30% of your Bonus Attack Damage, and 10% of your Ability Power (25-15 second cooldown, based on level).', icon: '/images/thunderlords.png', isKeystone: true },
      { id: 'c6_3', name: 'Windspeaker\'s Blessing', maxRank: 1, description: 'Your heals and shields are 10% stronger. Additionally, your shields and heals on other allies increase their armor by 5-22 (based on level) and their magic resistance by half that amount for 3 seconds.', icon: '/images/windspeaker.png', isKeystone: true }
    ]
  ],
  [TREES.RESOLVE]: [
    [
      { id: 'r1_1', name: 'Recovery', maxRank: 5, description: '+0.4 Health per 5 seconds', icon: '/images/recovery.png' },
      { id: 'r1_2', name: 'Unyielding', maxRank: 5, description: '+1% Bonus Armor and Magic Resist', icon: '/images/unyielding.png' }
    ],
    [
      { id: 'r2_1', name: 'Explorer', maxRank: 1, description: '+15 Movement Speed in Brush and River', icon: '/images/explorer.png' },
      { id: 'r2_2', name: 'Tough Skin', maxRank: 1, description: 'You take 2 less damage from champion and neutral monster basic attacks', icon: '/images/tskin.png' }
    ],
    [
      { id: 'r3_1', name: 'Runic Armor', maxRank: 5, description: 'Shields, healing, regeneration, and lifesteal on you are 1.6% stronger', icon: '/images/rarmor.png' },
      { id: 'r3_2', name: 'Veteran\'s Scars', maxRank: 5, description: '+10 Health', icon: '/images/vscars.png' }
    ],
    [
      { id: 'r4_1', name: 'Insight', maxRank: 1, description: 'Reduces the cooldown of Summoner Spells by 15%', icon: '/images/insight.png' },
      { id: 'r4_2', name: 'Perseverance', maxRank: 1, description: '+50% Base Health Regen, increased to +200% when below 25% Health', icon: '/images/perseverance.png' }
    ],
    [
      { id: 'r5_1', name: 'Swiftness', maxRank: 5, description: '+3% Tenacity and Slow Resist', icon: '/images/swiftness.png' },
      { id: 'r5_2', name: 'Legendary Guardian', maxRank: 5, description: '+0.6 Armor and Magic Resist for each nearby enemy champion', icon: '/images/lgardian.png' }
    ],
    [
      { id: 'r6_1', name: 'Grasp of the Undying', maxRank: 1, description: 'Every 4 seconds in combat, your next attack against an enemy champion deals damage equal to 3% of your max Health and heals you for 1.5% of your max Health (halved for ranged champions, deals magic damage)', icon: '/images/grasp.png', isKeystone: true },
      { id: 'r6_2', name: 'Strength of the Ages', maxRank: 1, description: 'You permanently gain Health (300 max) for you or allies killing certain nearby units:\n - Siege minions: +20 Health\n - Large monsters: +10 Health\n\nAt the max bonus, these kills instead restore 6% of your Maximum Health.', icon: '/images/aegis.png', isKeystone: true },
      { id: 'r6_3', name: 'Bond of Stone', maxRank: 1, description: '+4% Damage Reduction. 6% of the damage from enemy champions taken by the nearest allied champion is dealt to you instead. Damage is not redirected if you are below 5% of your maximum health.', icon: '/images/bstone.png', isKeystone: true }
    ]
  ]
};

const MasteriesTab = forwardRef(({ puuid, playClickSound, onUnsavedChangesChange, onDelete, scale = 1 }, ref) => {
  const [activePage, setActivePage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageNames, setPageNames] = useState({ 1: 'Mastery Page 1' });
  const [pageConfigs, setPageConfigs] = useState({ 1: {} });
  const [lastSaveTime, setLastSaveTime] = useState(Date.now());
  const [tooltip, setTooltip] = useState({ visible: false, x: 0, y: 0, mastery: null, unlocked: true, tree: null });
  const masteriesWrapperRef = useRef(null);
  const [isEditingName, setIsEditingName] = useState(false);

  const getStorageKey = (suffix) => `mastery_${puuid || 'default'}_${suffix}`;

  useEffect(() => {
    const savedTotal = localStorage.getItem(getStorageKey('totalPages'));
    const savedNames = localStorage.getItem(getStorageKey('names'));
    const savedConfigs = localStorage.getItem(getStorageKey('configs'));

    if (savedTotal) setTotalPages(parseInt(savedTotal));
    if (savedNames) setPageNames(JSON.parse(savedNames));
    if (savedConfigs) setPageConfigs(JSON.parse(savedConfigs));
  }, [puuid]);

  const activeConfig = useMemo(() => pageConfigs[activePage] || {}, [pageConfigs, activePage]);
  const activePageName = useMemo(() => {
    const name = pageNames[activePage];
    return name !== undefined ? name : `Mastery Page ${activePage}`;
  }, [pageNames, activePage]);

  const treeSpent = useMemo(() => {
    const spent = { [TREES.FEROCITY]: 0, [TREES.CUNNING]: 0, [TREES.RESOLVE]: 0 };
    Object.keys(MASTERY_DATA).forEach(tree => {
      MASTERY_DATA[tree].forEach(tier => {
        tier.forEach(mastery => {
          spent[tree] += (activeConfig[mastery.id] || 0);
        });
      });
    });
    return spent;
  }, [activeConfig]);

  const totalSpent = useMemo(() => Object.values(treeSpent).reduce((a, b) => a + b, 0), [treeSpent]);
  const pointsAvailable = 30 - totalSpent;

  const hasChanges = useMemo(() => {
    const savedConfigs = JSON.parse(localStorage.getItem(getStorageKey('configs')) || '{}');
    const currentConfig = pageConfigs[activePage] || {};
    const savedConfig = savedConfigs[activePage] || {};
    
    const savedNames = JSON.parse(localStorage.getItem(getStorageKey('names')) || '{}');
    const currentName = pageNames[activePage] || `Mastery Page ${activePage}`;
    const savedName = savedNames[activePage] || `Mastery Page ${activePage}`;

    const configChanged = JSON.stringify(currentConfig) !== JSON.stringify(savedConfig);
    const nameChanged = currentName !== savedName;
    
    return configChanged || nameChanged;
  }, [pageConfigs, pageNames, activePage, lastSaveTime]);

  useEffect(() => {
    if (onUnsavedChangesChange) onUnsavedChangesChange(hasChanges);
  }, [hasChanges, onUnsavedChangesChange]);

  const isMasteryUnlocked = (masteryId, tree, tierIndex) => {
    if (tierIndex === 0) return true;
    const tierLimits = [5, 1, 5, 1, 5, 1];
    const tierAboveIndex = tierIndex - 1;
    const requiredPoints = tierLimits[tierAboveIndex];
    const pointsInTierAbove = MASTERY_DATA[tree][tierAboveIndex].reduce((acc, m) => acc + (activeConfig[m.id] || 0), 0);
    return pointsInTierAbove >= requiredPoints;
  };

  const handleAddPoint = (mastery, tree, tierIndex) => {
    if (pointsAvailable <= 0) return;
    if (treeSpent[tree] >= 18) return;
    if (!isMasteryUnlocked(mastery.id, tree, tierIndex)) return;
    
    const currentRank = activeConfig[mastery.id] || 0;
    if (currentRank >= mastery.maxRank) return;

    const tierLimits = [5, 1, 5, 1, 5, 1];
    const currentTierSpent = MASTERY_DATA[tree][tierIndex].reduce((acc, m) => acc + (activeConfig[m.id] || 0), 0);
    if (currentTierSpent >= tierLimits[tierIndex]) return;

    if (mastery.isKeystone) {
      const keystoneTier = MASTERY_DATA[tree][5];
      const otherKeystone = keystoneTier.find(m => m.id !== mastery.id && (activeConfig[m.id] || 0) > 0);
      if (otherKeystone) return;
    }

    setPageConfigs(prev => ({
      ...prev,
      [activePage]: {
        ...(prev[activePage] || {}),
        [mastery.id]: currentRank + 1
      }
    }));
    if (playClickSound) playClickSound();
  };

  const handleRemovePoint = (e, mastery, tree, tierIndex) => {
    if (e) e.preventDefault();
    const currentRank = activeConfig[mastery.id] || 0;
    if (currentRank <= 0) return;

    const tierLimits = [5, 1, 5, 1, 5, 1];
    const currentTierSpent = MASTERY_DATA[tree][tierIndex].reduce((acc, m) => acc + (activeConfig[m.id] || 0), 0);
    
    if (currentTierSpent <= tierLimits[tierIndex]) {
      const anyTierBelowHasPoints = MASTERY_DATA[tree].slice(tierIndex + 1).some(tier => 
        tier.some(m => (activeConfig[m.id] || 0) > 0)
      );
      if (anyTierBelowHasPoints) return;
    }

    setPageConfigs(prev => {
      const newConfig = { ...(prev[activePage] || {}) };
      if (currentRank === 1) {
        delete newConfig[mastery.id];
      } else {
        newConfig[mastery.id] = currentRank - 1;
      }
      return { ...prev, [activePage]: newConfig };
    });
    if (playClickSound) playClickSound();
  };

  const handleReturnPoints = () => {
    // Correct logic for "Return Points": Clear all points to zero
    setPageConfigs(prev => ({ ...prev, [activePage]: {} }));
    if (playClickSound) playClickSound();
  };

  const handleClearPage = () => {
    // Correct logic for "Revert": Restore last saved state
    const savedConfigs = JSON.parse(localStorage.getItem(getStorageKey('configs')) || '{}');
    setPageConfigs(prev => ({
      ...prev,
      [activePage]: savedConfigs[activePage] || {}
    }));
    if (playClickSound) playClickSound();
  };

  const handleSaveMasteries = () => {
    localStorage.setItem(getStorageKey('configs'), JSON.stringify(pageConfigs));
    localStorage.setItem(getStorageKey('names'), JSON.stringify(pageNames));
    setLastSaveTime(Date.now());
    if (playClickSound) playClickSound();
  };

  const handlePageSelect = (pageId) => {
    if (pageId === activePage) return;
    if (hasChanges) {
      if (onUnsavedChangesChange) onUnsavedChangesChange(true, pageId);
    } else {
      setActivePage(pageId);
      if (playClickSound) playClickSound();
    }
  };

  const switchPage = (pageId) => {
    setActivePage(pageId);
  };

  const handleAddPage = () => {
    if (hasChanges) {
      if (onUnsavedChangesChange) onUnsavedChangesChange(true, 'NEW');
      return;
    }
    if (totalPages < 20) {
      const newTotal = totalPages + 1;
      setTotalPages(newTotal);
      setActivePage(newTotal);
      localStorage.setItem(getStorageKey('totalPages'), newTotal.toString());
      if (playClickSound) playClickSound();
    }
  };

  const handleDeleteClick = () => {
    if (onDelete) onDelete();
    if (playClickSound) playClickSound();
  };

  const confirmDelete = () => {
    if (totalPages <= 1) {
      handleReturnPoints();
      setPageNames({ 1: 'Mastery Page 1' });
      return;
    }
    const newConfigs = { ...pageConfigs };
    for (let i = activePage; i < totalPages; i++) {
      newConfigs[i] = newConfigs[i + 1] || {};
    }
    delete newConfigs[totalPages];
    setPageConfigs(newConfigs);
    
    const newNames = { ...pageNames };
    for (let i = activePage; i < totalPages; i++) {
      newNames[i] = newNames[i + 1] || `Mastery Page ${i}`;
    }
    delete newNames[totalPages];
    setPageNames(newNames);
    
    setTotalPages(totalPages - 1);
    if (activePage > totalPages - 1) setActivePage(totalPages - 1);
    
    localStorage.setItem(getStorageKey('totalPages'), (totalPages - 1).toString());
    localStorage.setItem(getStorageKey('configs'), JSON.stringify(newConfigs));
    localStorage.setItem(getStorageKey('names'), JSON.stringify(newNames));
    if (playClickSound) playClickSound();
  };

  const handleMouseMove = (e) => {
    if (!masteriesWrapperRef.current) return;
    const rect = masteriesWrapperRef.current.getBoundingClientRect();
    setTooltip(prev => ({
      ...prev,
      x: (e.clientX - rect.left) / scale,
      y: (e.clientY - rect.top) / scale
    }));
  };

  useImperativeHandle(ref, () => ({
    save: handleSaveMasteries,
    discard: handleClearPage,
    switchPage: switchPage,
    addPage: handleAddPage,
    confirmDelete: confirmDelete,
    hasChanges: hasChanges
  }));

  const renderTree = (treeName) => {
    const bgMap = {
      [TREES.FEROCITY]: '/images/ferocity_background.jpg',
      [TREES.CUNNING]: '/images/cunning_background.jpg',
      [TREES.RESOLVE]: '/images/resolve_background.jpg'
    };
    
    return (
      <div 
        className={styles.treeColumn}
        style={{ 
          backgroundImage: `url(${bgMap[treeName]})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className={styles.treeContent}>
          <div className={styles.treeRows}>
            {MASTERY_DATA[treeName].map((tier, tIdx) => (
              <div key={tIdx} className={`${styles.masteryRow} ${ (tIdx % 2 === 0 && tIdx !== 5) ? styles.rowWide : styles.rowNarrow} ${tIdx === 5 ? styles.keystoneRow : ''}`}>
                {tier.map(mastery => {
                  const rank = activeConfig[mastery.id] || 0;
                  const unlocked = isMasteryUnlocked(mastery.id, treeName, tIdx);
                  const isMaxed = rank === mastery.maxRank;
                  
                  return (
                    <div 
                      key={mastery.id} 
                      className={`${styles.masteryIconWrapper} ${mastery.isKeystone ? styles.keystoneWrapper : ''} ${!unlocked ? styles.locked : ''}`}
                      onClick={() => handleAddPoint(mastery, treeName, tIdx)}
                      onContextMenu={(e) => handleRemovePoint(e, mastery, treeName, tIdx)}
                      onMouseEnter={() => {
                        setTooltip(prev => ({
                          ...prev,
                          visible: true,
                          mastery,
                          unlocked,
                          tree: treeName
                        }));
                      }}
                      onMouseMove={handleMouseMove}
                      onMouseLeave={() => setTooltip({ visible: false, x: 0, y: 0, mastery: null })}
                    >
                      <div 
                        className={`${styles.masteryIcon} ${rank > 0 ? styles.active : ''} ${!unlocked ? styles.locked : ''} ${isMaxed ? styles.maxed : ''} ${mastery.isKeystone ? styles.keystoneBorder : ''}`}
                        style={{
                          backgroundImage: `url(${mastery.icon})`,
                          backgroundPosition: mastery.iconPos || 'center',
                          backgroundSize: mastery.iconPos ? '300% 300%' : 'cover',
                          filter: `${mastery.iconFilter || ''} ${!unlocked ? 'brightness(0.4)' : ''} ${rank === 0 ? 'grayscale(100%)' : ''}`
                        }}
                      >
                        {(tIdx === 1 || tIdx === 3 || tIdx === 5) && (
                          <div className={`${styles.selectionBorderOverlay} ${rank > 0 ? styles.visibleBorder : ''} ${tIdx === 1 ? styles.borderT1 : tIdx === 3 ? styles.borderT2 : styles.borderT3}`} />
                        )}
                      </div>
                      {mastery.maxRank > 1 && (
                        <div className={`${styles.masteryRank} ${(() => {
                          const otherMasteries = tier.filter(m => m.id !== mastery.id);
                          if (otherMasteries.length === 0) {
                            if (rank === 0) return '';
                            return rank === mastery.maxRank ? styles.rankMaxed : styles.rankActive;
                          }
                          
                          const otherRanks = otherMasteries.map(m => activeConfig[m.id] || 0);
                          const maxOtherRank = Math.max(...otherRanks);
                          const anyTierPoints = rank > 0 || otherRanks.some(r => r > 0);
                          
                          if (!anyTierPoints) return '';
                          
                          if (rank > maxOtherRank) return styles.rankMajority;
                          if (rank < maxOtherRank) return styles.rankMinority;
                          // If equal and > 0, check if maxed
                          if (rank > 0) return rank === mastery.maxRank ? styles.rankMaxed : styles.rankActive;
                          return styles.rankMinority; // 0 but others have points
                        })()}`}>
                          {rank}/{mastery.maxRank}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
          <div className={styles.treeTitle}>{treeName.toUpperCase()}: <span className={styles.treeSpentNumber}>{treeSpent[treeName]}</span></div>
        </div>
      </div>
    );
  };

  return (
    <div className={styles.masteriesWrapper} ref={masteriesWrapperRef}>
      <div className={styles.topBar}>
        <div className={styles.pageSelector}>
          {Array.from({ length: totalPages }).map((_, i) => (
            <button
              key={i}
              className={`${styles.pageBtn} ${activePage === i + 1 ? styles.pageBtnActive : ''}`}
              onClick={() => handlePageSelect(i + 1)}
            >
              {i + 1}
            </button>
          ))}
          {totalPages < 20 && (
            <button className={styles.pageBtn} onClick={handleAddPage}>+</button>
          )}
        </div>
      </div>

      <div className={styles.mainArea}>
        <div className={styles.sidebar}>
          <div className={styles.masteryPageHeader}>
            {isEditingName ? (
              <input 
                type="text" 
                autoFocus
                maxLength={10}
                className={styles.pageNameInput} 
                value={activePageName}
                onChange={(e) => {
                  setPageNames(prev => ({ ...prev, [activePage]: e.target.value }));
                }}
                onBlur={() => setIsEditingName(false)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') setIsEditingName(false);
                }}
              />
            ) : (
              <span className={styles.pageNameDisplay}>{activePageName}</span>
            )}
            <img 
              src="/images/pen.png" 
              className={styles.editIcon} 
              alt="Edit" 
              onClick={() => setIsEditingName(true)}
            />
          </div>

          <div className={styles.pointSummary}>
            <div className={styles.treePoint}>
              <img src="/images/ferocity_icon.png" className={styles.treeIcon} alt="Ferocity" />
              <span className={styles.treePointValue}>{treeSpent[TREES.FEROCITY]}</span>
            </div>
            <div className={styles.treePoint}>
              <img src="/images/cunning_icon.png" className={styles.treeIcon} alt="Cunning" />
              <span className={styles.treePointValue}>{treeSpent[TREES.CUNNING]}</span>
            </div>
            <div className={styles.treePoint}>
              <img src="/images/resolve_icon.png" className={styles.treeIcon} alt="Resolve" />
              <span className={styles.treePointValue}>{treeSpent[TREES.RESOLVE]}</span>
            </div>
          </div>

          <div className={styles.availablePoints}>
            Points Available: <span className={styles.availablePointsValue}>{pointsAvailable}</span>
          </div>

          <div className={styles.actionButtons}>
            <button 
              className={`${styles.actionBtnWide} ${hasChanges && activePageName.trim() !== '' ? styles.actionBtnBlue : ''}`} 
              onClick={handleSaveMasteries}
              disabled={activePageName.trim() === ''}
            >
              Save Masteries
            </button>
            <button 
              className={`${styles.actionBtnWide} ${totalSpent > 0 ? styles.actionBtnBlue : ''}`} 
              onClick={handleReturnPoints}
              disabled={totalSpent === 0}
            >
              Return Points
            </button>
            <div className={styles.actionBtnRow}>
              <button className={`${styles.actionBtnSmall} ${styles.actionBtnBlue}`} onClick={handleDeleteClick}>Delete</button>
              <button className={`${styles.actionBtnSmall} ${hasChanges ? styles.actionBtnBlue : ''}`} onClick={handleClearPage}>Revert</button>
            </div>
          </div>
        </div>

        <div className={styles.treesContainer}>
          {renderTree(TREES.FEROCITY)}
          {renderTree(TREES.CUNNING)}
          {renderTree(TREES.RESOLVE)}
        </div>
      </div>

      {tooltip.visible && tooltip.mastery && (
        <div 
          className={styles.classicTooltip}
          style={{ 
            left: `${tooltip.x}px`, 
            top: `${tooltip.y}px`,
            maxWidth: tooltip.tree === TREES.RESOLVE ? '350px' : '280px'
          }}
        >
          <div 
            className={styles.nameText}
            style={{ 
              color: tooltip.tree === TREES.FEROCITY ? '#8b2513' : 
                     tooltip.tree === TREES.CUNNING ? '#8833ff' : 
                     '#2c5fb8' 
            }}
          >
            {tooltip.mastery.name}
          </div>
          <div className={styles.tierText}>
            Rank: {activeConfig[tooltip.mastery.id] || 0} / {tooltip.mastery.maxRank}
          </div>
          {!tooltip.unlocked && (
            <div className={styles.requirementText}>
              Requires {(() => {
                const tierLimits = [5, 1, 5, 1, 5, 1];
                const tree = tooltip.tree;
                const mIdx = MASTERY_DATA[tree].findIndex(tier => tier.some(m => m.id === tooltip.mastery.id));
                return tierLimits.slice(0, mIdx).reduce((a, b) => a + b, 0);
              })()} points in {tooltip.tree}.
            </div>
          )}
          <div className={styles.statText}>{tooltip.mastery.description}</div>
        </div>
      )}
    </div>
  );
});

export default MasteriesTab;
