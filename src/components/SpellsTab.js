'use client';

import { useState } from 'react';
import styles from '../styles/SpellsTab.module.css';

const SUMMONER_SPELLS = [
  {
    id: 'clarity',
    name: 'Clarity',
    level: 6,
    modes: 'ARAM',
    description: "Restores 50% of your champion's maximum Mana. Also restores allies for 25% of their maximum Mana.",
    icon: '/images/clarity.png',
    detailsImage: '/images/clarity_image.png'
  },
  {
    id: 'ghost',
    name: 'Ghost',
    level: 1,
    modes: 'ARSR, Classic, ARAM, Tutorial',
    description: 'Your champion can move through units for 10 seconds, gaining increased Movement Speed. Grants a maximum of 28-45% (depending on champion level) Movement Speed after accelerating for 2 seconds.',
    icon: '/images/ghost.png',
    detailsImage: '/images/ghost_image.png'
  },
  {
    id: 'heal',
    name: 'Heal',
    level: 1,
    modes: 'Classic, ARAM',
    description: 'Restores 90-345 Health (depending on champion level) and grants 30% Movement Speed for 1 second to you and target allied champion. This healing is halved for units recently affected by another Heal summoner spell.',
    icon: '/images/heal.png',
    detailsImage: '/images/heal_image.png'
  },
  {
    id: 'mark',
    name: 'Mark',
    level: 6,
    modes: 'ARAM',
    description: 'Throw a snowball in a straight line at your enemies. If it hits an enemy, they become marked, granting True Sight, and your champion can quickly travel to the marked target as a follow up.',
    icon: '/images/mark.png',
    detailsImage: '/images/mark_image.png'
  },
  {
    id: 'barrier',
    name: 'Barrier',
    level: 4,
    modes: 'Classic, ARAM',
    description: 'Shields your champion from 115-455 damage (depending on champion level) for 2 seconds.',
    icon: '/images/barrier.png',
    detailsImage: '/images/barrier_image.png'
  },
  {
    id: 'exhaust',
    name: 'Exhaust',
    level: 4,
    modes: 'Classic, ARAM',
    description: 'Exhausts target enemy champion, reducing their Movement Speed and Attack Speed by 30%, their Armor and Magic Resist by 10, and their damage dealt by 40% for 2.5 seconds.',
    icon: '/images/exhaust.png',
    detailsImage: '/images/exhaust_image.png'
  },
  {
    id: 'cleanse',
    name: 'Cleanse',
    level: 6,
    modes: 'ARSR, Classic, ARAM, Tutorial',
    description: 'Removes all disables (excluding suppression) and summoner spell debuffs affecting your champion and lowers the duration of incoming disables by 65% for 3 seconds.',
    icon: '/images/cleanse.png',
    detailsImage: '/images/cleanse_image.png'
  },
  {
    id: 'teleport',
    name: 'Teleport',
    level: 6,
    modes: 'ARSR, Classic, Tutorial',
    description: 'After channeling for 4.5 seconds, teleports your champion to target allied structure, minion, or ward.',
    icon: '/images/teleport.png',
    detailsImage: '/images/teleport_image.png'
  },
  {
    id: 'flash',
    name: 'Flash',
    level: 10,
    modes: 'ARSR, Classic, ARAM, Tutorial',
    description: 'Teleports your champion a short distance toward your cursor\'s location.',
    icon: '/images/flash.png',
    detailsImage: '/images/flash_image.png'
  },
  {
    id: 'ignite',
    name: 'Ignite',
    level: 10,
    modes: 'ARSR, Classic, ARAM, Tutorial',
    description: 'Ignites target enemy champion, dealing 70-410 true damage (depending on champion level) over 5 seconds, grants you vision of the target, and reduces healing effects on them for the duration.',
    icon: '/images/ignite.png',
    detailsImage: '/images/ignite_image.png'
  },
  {
    id: 'smite',
    name: 'Smite',
    level: 10,
    modes: 'Classic',
    description: 'Deals 390-1000 true damage (depending on champion level) to target epic or large monster or enemy minion. Restores Health based on your maximum life when used against monsters.',
    icon: '/images/smite.png',
    detailsImage: '/images/smite_image.png'
  }
];

export default function SpellsTab({ playClickSound }) {
  const [selectedSpell, setSelectedSpell] = useState(SUMMONER_SPELLS.find(s => s.id === 'ignite') || SUMMONER_SPELLS[0]);
  const [prevSpell, setPrevSpell] = useState(null);

  const handleSpellClick = (spell) => {
    if (spell.id === selectedSpell.id) return;
    setPrevSpell(selectedSpell);
    setSelectedSpell(spell);
    if (playClickSound) playClickSound();
  };

  return (
    <div className={styles.spellsContainer}>
      <div className={styles.sidebar}>
        <div className={styles.spellsGrid}>
          {SUMMONER_SPELLS.map(spell => (
            <div
              key={spell.id}
              className={`${styles.spellItem} ${selectedSpell.id === spell.id ? styles.selected : ''}`}
              onClick={() => handleSpellClick(spell)}
            >
              <div className={styles.iconBorder}>
                <img src={spell.icon} alt={spell.name} className={styles.spellIcon} />
              </div>
              <div className={styles.spellLabel}>{spell.name}</div>
            </div>
          ))}
        </div>
      </div>

      <div className={styles.detailsArea}>
        <div className={styles.topDetails}>
          <div className={styles.headerInfo}>
            <div className={styles.bigIconBorder}>
              {prevSpell && (
                <img
                  src={prevSpell.icon}
                  alt=""
                  className={styles.bigSpellIconPrev}
                />
              )}
              <img
                key={`icon-${selectedSpell.id}`}
                src={selectedSpell.icon}
                alt={selectedSpell.name}
                className={styles.bigSpellIcon}
              />
            </div>
            <div className={styles.titleInfo}>
              <h2 className={styles.spellName}>{selectedSpell.name}</h2>
              <div className={styles.spellMeta}>(Summoner Level: {selectedSpell.level})</div>
              <div className={styles.spellMeta}>Supported Game Modes: {selectedSpell.modes}</div>
            </div>
          </div>
          <p className={styles.spellDescription}>{selectedSpell.description}</p>
        </div>
        <div className={styles.imageDetails}>
          <div className={styles.actionImageWrapper}>
            {prevSpell && (
              <img
                src={prevSpell.detailsImage}
                alt=""
                className={styles.actionImagePrev}
              />
            )}
            <img
              key={`action-${selectedSpell.id}`}
              src={selectedSpell.detailsImage}
              alt={selectedSpell.name}
              className={styles.actionImage}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
