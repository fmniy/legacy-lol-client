import { useState, useMemo, useEffect, useRef, forwardRef, useImperativeHandle, Fragment } from 'react';
import { createPortal } from 'react-dom';

import styles from '../styles/RunesTab.module.css';

const RUNE_TYPES = {
  MARK: 'Mark',
  SEAL: 'Seal',
  GLYPH: 'Glyph',
  QUINTESSENCE: 'Quintessence'
};

const MOCK_RUNES = [
  // Marks (Red) - Tier 1
  { id: 'm_ap_t1', name: 'Lesser Mark of Ability Power', type: RUNE_TYPES.MARK, tier: 1, stats: { 'Ability Power': 0.33 }, icon: '/images/arrow_mark_t1.png', isPrimary: false },
  { id: 'm_arm_t1', name: 'Lesser Mark of Armor', type: RUNE_TYPES.MARK, tier: 1, stats: { 'Armor': 0.51 }, icon: '/images/arrow_mark_t1.png', isPrimary: false },
  { id: 'm_let_t1', name: 'Lesser Mark of Armor Penetration', type: RUNE_TYPES.MARK, tier: 1, stats: { 'Lethality': 0.9 }, icon: '/images/arrow_mark_t1.png', isPrimary: true },
  { id: 'm_ad_t1', name: 'Lesser Mark of Attack Damage', type: RUNE_TYPES.MARK, tier: 1, stats: { 'Attack Damage': 0.53 }, icon: '/images/arrow_mark_t1.png', isPrimary: true },
  { id: 'm_as_t1', name: 'Lesser Mark of Attack Speed', type: RUNE_TYPES.MARK, tier: 1, stats: { 'Attack Speed': 0.94 }, icon: '/images/pot_mark_t1.png', isPrimary: true },
  { id: 'm_cdr_t1', name: 'Lesser Mark of Cooldown Reduction', type: RUNE_TYPES.MARK, tier: 1, stats: { 'Cooldown Reduction': 0.11 }, icon: '/images/pot_mark_t1.png', isPrimary: false },
  { id: 'm_critc_t1', name: 'Lesser Mark of Critical Chance', type: RUNE_TYPES.MARK, tier: 1, stats: { 'Critical Chance': 0.52 }, icon: '/images/pot_mark_t1.png', isPrimary: true },
  { id: 'm_critd_t1', name: 'Lesser Mark of Critical Damage', type: RUNE_TYPES.MARK, tier: 1, stats: { 'Critical Damage': 1.24 }, icon: '/images/pot_mark_t1.png', isPrimary: true },
  { id: 'm_hp_t1', name: 'Lesser Mark of Health', type: RUNE_TYPES.MARK, tier: 1, stats: { 'Health': 1.93 }, icon: '/images/pot_mark_t1.png', isPrimary: false },
  { id: 'm_hyb_t1', name: 'Lesser Mark of Hybrid Penetration', type: RUNE_TYPES.MARK, tier: 1, stats: { 'Armor Pen.': 0.63, 'Magic Pen.': 0.34 }, icon: '/images/arrow_mark_t1.png', isPrimary: true },
  { id: 'm_mpen_t1', name: 'Lesser Mark of Magic Penetration', type: RUNE_TYPES.MARK, tier: 1, stats: { 'Magic Pen.': 0.49 }, icon: '/images/arrow_mark_t1.png', isPrimary: true },
  { id: 'm_mr_t1', name: 'Lesser Mark of Magic Resist', type: RUNE_TYPES.MARK, tier: 1, stats: { 'Magic Resist': 0.43 }, icon: '/images/arrow_mark_t1.png', isPrimary: false },
  { id: 'm_mana_t1', name: 'Lesser Mark of Mana', type: RUNE_TYPES.MARK, tier: 1, stats: { 'Mana': 3.28 }, icon: '/images/pot_mark_t1.png', isPrimary: false },
  { id: 'm_mreg_t1', name: 'Lesser Mark of Mana Regeneration', type: RUNE_TYPES.MARK, tier: 1, stats: { 'Mana Regen / 5 sec.': 0.15 }, icon: '/images/pot_mark_t1.png', isPrimary: false },
  { id: 'm_sap_t1', name: 'Lesser Mark of Scaling Ability Power', type: RUNE_TYPES.MARK, tier: 1, stats: { 'Ability Power at lvl 18': 1.08 }, icon: '/images/mace_mark_t1.png', isPrimary: false },
  { id: 'm_sad_t1', name: 'Lesser Mark of Scaling Attack Damage', type: RUNE_TYPES.MARK, tier: 1, stats: { 'Attack Damage at lvl 18': 1.44 }, icon: '/images/knife_mark_t1.png', isPrimary: true },
  { id: 'm_shp_t1', name: 'Lesser Mark of Scaling Health', type: RUNE_TYPES.MARK, tier: 1, stats: { 'Health at lvl 18': 5.4 }, icon: '/images/mace_mark_t1.png', isPrimary: false },
  { id: 'm_smr_t1', name: 'Lesser Mark of Scaling Magic Resist', type: RUNE_TYPES.MARK, tier: 1, stats: { 'Magic Resist at lvl 18': 0.72 }, icon: '/images/mace_mark_t1.png', isPrimary: false },
  { id: 'm_smana_t1', name: 'Lesser Mark of Scaling Mana', type: RUNE_TYPES.MARK, tier: 1, stats: { 'Mana at lvl 18': 11.7 }, icon: '/images/knife_mark_t1.png', isPrimary: false },

  // Marks (Red) - Tier 2
  { id: 'm_ap_t2', name: 'Mark of Ability Power', type: RUNE_TYPES.MARK, tier: 2, stats: { 'Ability Power': 0.46 }, icon: '/images/arrow_mark_t2.png', isPrimary: false },
  { id: 'm_arm_t2', name: 'Mark of Armor', type: RUNE_TYPES.MARK, tier: 2, stats: { 'Armor': 0.71 }, icon: '/images/arrow_mark_t2.png', isPrimary: false },
  { id: 'm_let_t2', name: 'Mark of Armor Penetration', type: RUNE_TYPES.MARK, tier: 2, stats: { 'Lethality': 1.25 }, icon: '/images/arrow_mark_t2.png', isPrimary: true },
  { id: 'm_ad_t2', name: 'Mark of Attack Damage', type: RUNE_TYPES.MARK, tier: 2, stats: { 'Attack Damage': 0.74 }, icon: '/images/arrow_mark_t2.png', isPrimary: true },
  { id: 'm_as_t2', name: 'Mark of Attack Speed', type: RUNE_TYPES.MARK, tier: 2, stats: { 'Attack Speed': 1.32 }, icon: '/images/pot_mark_t2.png', isPrimary: true },
  { id: 'm_cdr_t2', name: 'Mark of Cooldown Reduction', type: RUNE_TYPES.MARK, tier: 2, stats: { 'Cooldown Reduction': 0.16 }, icon: '/images/pot_mark_t2.png', isPrimary: false },
  { id: 'm_critc_t2', name: 'Mark of Critical Chance', type: RUNE_TYPES.MARK, tier: 2, stats: { 'Critical Chance': 0.72 }, icon: '/images/pot_mark_t2.png', isPrimary: true },
  { id: 'm_critd_t2', name: 'Mark of Critical Damage', type: RUNE_TYPES.MARK, tier: 2, stats: { 'Critical Damage': 1.74 }, icon: '/images/pot_mark_t2.png', isPrimary: true },
  { id: 'm_hp_t2', name: 'Mark of Health', type: RUNE_TYPES.MARK, tier: 2, stats: { 'Health': 2.70 }, icon: '/images/pot_mark_t2.png', isPrimary: false },
  { id: 'm_hyb_t2', name: 'Mark of Hybrid Penetration', type: RUNE_TYPES.MARK, tier: 2, stats: { 'Armor Pen.': 0.88, 'Magic Pen.': 0.48 }, icon: '/images/arrow_mark_t2.png', isPrimary: true },
  { id: 'm_mpen_t2', name: 'Mark of Magic Penetration', type: RUNE_TYPES.MARK, tier: 2, stats: { 'Magic Pen.': 0.68 }, icon: '/images/arrow_mark_t2.png', isPrimary: true },
  { id: 'm_mr_t2', name: 'Mark of Magic Resist', type: RUNE_TYPES.MARK, tier: 2, stats: { 'Magic Resist': 0.6 }, icon: '/images/arrow_mark_t2.png', isPrimary: false },
  { id: 'm_mana_t2', name: 'Mark of Mana', type: RUNE_TYPES.MARK, tier: 2, stats: { 'Mana': 4.59 }, icon: '/images/pot_mark_t2.png', isPrimary: false },
  { id: 'm_mreg_t2', name: 'Mark of Mana Regeneration', type: RUNE_TYPES.MARK, tier: 2, stats: { 'Mana Regen / 5 sec.': 0.20 }, icon: '/images/pot_mark_t2.png', isPrimary: false },
  { id: 'm_sap_t2', name: 'Mark of Scaling Ability Power', type: RUNE_TYPES.MARK, tier: 2, stats: { 'Ability Power at lvl 18': 1.44 }, icon: '/images/mace_mark_t2.png', isPrimary: false },
  { id: 'm_sad_t2', name: 'Mark of Scaling Attack Damage', type: RUNE_TYPES.MARK, tier: 2, stats: { 'Attack Damage at lvl 18': 1.98 }, icon: '/images/knife_mark_t2.png', isPrimary: true },
  { id: 'm_shp_t2', name: 'Mark of Scaling Health', type: RUNE_TYPES.MARK, tier: 2, stats: { 'Health at lvl 18': 7.56 }, icon: '/images/mace_mark_t2.png', isPrimary: false },
  { id: 'm_smr_t2', name: 'Mark of Scaling Magic Resist', type: RUNE_TYPES.MARK, tier: 2, stats: { 'Magic Resist at lvl 18': 1.08 }, icon: '/images/mace_mark_t2.png', isPrimary: false },
  { id: 'm_smana_t2', name: 'Mark of Scaling Mana', type: RUNE_TYPES.MARK, tier: 2, stats: { 'Mana at lvl 18': 16.38 }, icon: '/images/knife_mark_t2.png', isPrimary: false },

  // Marks (Red) - Tier 3
  { id: 'm_ap_t3', name: 'Greater Mark of Ability Power', type: RUNE_TYPES.MARK, tier: 3, stats: { 'Ability Power': 0.59 }, icon: '/images/arrow_mark.png', isPrimary: false },
  { id: 'm_arm_t3', name: 'Greater Mark of Armor', type: RUNE_TYPES.MARK, tier: 3, stats: { 'Armor': 0.91 }, icon: '/images/arrow_mark.png', isPrimary: false },
  { id: 'm_let_t3', name: 'Greater Mark of Armor Penetration', type: RUNE_TYPES.MARK, tier: 3, stats: { 'Lethality': 1.6 }, icon: '/images/arrow_mark.png', isPrimary: true },
  { id: 'm_ad_t3', name: 'Greater Mark of Attack Damage', type: RUNE_TYPES.MARK, tier: 3, stats: { 'Attack Damage': 0.95 }, icon: '/images/arrow_mark.png', isPrimary: true },
  { id: 'm_as_t3', name: 'Greater Mark of Attack Speed', type: RUNE_TYPES.MARK, tier: 3, stats: { 'Attack Speed': 1.7 }, icon: '/images/pot_mark.png', isPrimary: true },
  { id: 'm_cdr_t3', name: 'Greater Mark of Cooldown Reduction', type: RUNE_TYPES.MARK, tier: 3, stats: { 'Cooldown Reduction': 0.2 }, icon: '/images/pot_mark.png', isPrimary: false },
  { id: 'm_critc_t3', name: 'Greater Mark of Critical Chance', type: RUNE_TYPES.MARK, tier: 3, stats: { 'Critical Chance': 0.93 }, icon: '/images/pot_mark.png', isPrimary: true },
  { id: 'm_critd_t3', name: 'Greater Mark of Critical Damage', type: RUNE_TYPES.MARK, tier: 3, stats: { 'Critical Damage': 2.23 }, icon: '/images/pot_mark.png', isPrimary: true },
  { id: 'm_hp_t3', name: 'Greater Mark of Health', type: RUNE_TYPES.MARK, tier: 3, stats: { 'Health': 3.47 }, icon: '/images/pot_mark.png', isPrimary: false },
  { id: 'm_hyb_t3', name: 'Greater Mark of Hybrid Penetration', type: RUNE_TYPES.MARK, tier: 3, stats: { 'Armor Pen.': 1.13, 'Magic Pen.': 0.61 }, icon: '/images/arrow_mark.png', isPrimary: true },
  { id: 'm_mpen_t3', name: 'Greater Mark of Magic Penetration', type: RUNE_TYPES.MARK, tier: 3, stats: { 'Magic Pen.': 0.87 }, icon: '/images/arrow_mark.png', isPrimary: true },
  { id: 'm_mr_t3', name: 'Greater Mark of Magic Resist', type: RUNE_TYPES.MARK, tier: 3, stats: { 'Magic Resist': 0.77 }, icon: '/images/arrow_mark.png', isPrimary: false },
  { id: 'm_mana_t3', name: 'Greater Mark of Mana', type: RUNE_TYPES.MARK, tier: 3, stats: { 'Mana': 5.91 }, icon: '/images/pot_mark.png', isPrimary: false },
  { id: 'm_mreg_t3', name: 'Greater Mark of Mana Regeneration', type: RUNE_TYPES.MARK, tier: 3, stats: { 'Mana Regen / 5 sec.': 0.26 }, icon: '/images/pot_mark.png', isPrimary: false },
  { id: 'm_sap_t3', name: 'Greater Mark of Scaling Ability Power', type: RUNE_TYPES.MARK, tier: 3, stats: { 'Ability Power at lvl 18': 1.8 }, icon: '/images/mace_mark.png', isPrimary: false },
  { id: 'm_sad_t3', name: 'Greater Mark of Scaling Attack Damage', type: RUNE_TYPES.MARK, tier: 3, stats: { 'Attack Damage at lvl 18': 2.52 }, icon: '/images/knife_mark.png', isPrimary: true },
  { id: 'm_shp_t3', name: 'Greater Mark of Scaling Health', type: RUNE_TYPES.MARK, tier: 3, stats: { 'Health at lvl 18': 9.72 }, icon: '/images/mace_mark.png', isPrimary: false },
  { id: 'm_smr_t3', name: 'Greater Mark of Scaling Magic Resist', type: RUNE_TYPES.MARK, tier: 3, stats: { 'Magic Resist at lvl 18': 1.26 }, icon: '/images/mace_mark.png', isPrimary: false },
  { id: 'm_smana_t3', name: 'Greater Mark of Scaling Mana', type: RUNE_TYPES.MARK, tier: 3, stats: { 'Mana at lvl 18': 21.06 }, icon: '/images/knife_mark.png', isPrimary: false },

  // Special Promotional Marks
  { id: 'm_spec_candy', name: 'Mark of the Crippling Candy Cane', type: RUNE_TYPES.MARK, tier: 2, stats: { 'Attack Damage': 0.74 }, icon: '/images/arrow_mark_t2.png', isPrimary: true },
  { id: 'm_spec_tree', name: 'Lesser Mark of the Yuletide Tannenbaum', type: RUNE_TYPES.MARK, tier: 1, stats: { 'Attack Damage': 0.53 }, icon: '/images/arrow_mark_t1.png', isPrimary: true },
  { id: 'm_spec_comb', name: 'Mark of the Combatant', type: RUNE_TYPES.MARK, tier: 2, stats: { 'Magic Pen.': 0.68 }, icon: '/images/arrow_mark_t2.png', isPrimary: true },
  { id: 'm_spec_alpine', name: 'Lesser Mark of Alpine Alacrity', type: RUNE_TYPES.MARK, tier: 1, stats: { 'Attack Speed': 0.94 }, icon: '/images/pot_mark_t1.png', isPrimary: true },

  // Seals (Yellow)
  // Seals (Yellow) - Tier 1
  { id: 's_ap_t1', name: 'Lesser Seal of Ability Power', type: RUNE_TYPES.SEAL, tier: 1, stats: { 'Ability Power': 0.33 }, icon: '/images/wing_seal_t1.png', isPrimary: false },
  { id: 's_sap_t1', name: 'Lesser Seal of Scaling Ability Power', type: RUNE_TYPES.SEAL, tier: 1, stats: { 'Ability Power at lvl 18': 1.04 }, icon: '/images/shield_seal_t1.png', isPrimary: false },
  { id: 's_arm_t1', name: 'Lesser Seal of Armor', type: RUNE_TYPES.SEAL, tier: 1, stats: { 'Armor': 0.56 }, icon: '/images/trophy_seal_t1.png', isPrimary: true },
  { id: 's_sarm_t1', name: 'Lesser Seal of Scaling Armor', type: RUNE_TYPES.SEAL, tier: 1, stats: { 'Armor at lvl 18': 1.68 }, icon: '/images/shield_seal_t1.png', isPrimary: true },
  { id: 's_ad_t1', name: 'Lesser Seal of Attack Damage', type: RUNE_TYPES.SEAL, tier: 1, stats: { 'Attack Damage': 0.24 }, icon: '/images/trophy_seal_t1.png', isPrimary: false },
  { id: 's_sad_t1', name: 'Lesser Seal of Scaling Attack Damage', type: RUNE_TYPES.SEAL, tier: 1, stats: { 'Attack Damage at lvl 18': 0.61 }, icon: '/images/shield_seal_t1.png', isPrimary: false },
  { id: 's_as_t1', name: 'Lesser Seal of Attack Speed', type: RUNE_TYPES.SEAL, tier: 1, stats: { 'Attack Speed': 0.42 }, icon: '/images/wing_seal_t1.png', isPrimary: false },
  { id: 's_cdr_t1', name: 'Lesser Seal of Cooldown Reduction', type: RUNE_TYPES.SEAL, tier: 1, stats: { 'Cooldown Reduction': 0.2 }, icon: '/images/trophy_seal_t1.png', isPrimary: false },
  { id: 's_critc_t1', name: 'Lesser Seal of Critical Chance', type: RUNE_TYPES.SEAL, tier: 1, stats: { 'Critical Chance': 0.23 }, icon: '/images/wing_seal_t1.png', isPrimary: false },
  { id: 's_critd_t1', name: 'Lesser Seal of Critical Damage', type: RUNE_TYPES.SEAL, tier: 1, stats: { 'Critical Damage': 0.43 }, icon: '/images/trophy_seal_t1.png', isPrimary: false },
  { id: 's_hp_t1', name: 'Lesser Seal of Health', type: RUNE_TYPES.SEAL, tier: 1, stats: { 'Health': 4.48 }, icon: '/images/wing_seal_t1.png', isPrimary: true },
  { id: 's_php_t1', name: 'Lesser Seal of Percent Health', type: RUNE_TYPES.SEAL, tier: 1, stats: { 'Increased Health %': 0.28 }, icon: '/images/wing_seal_t1.png', isPrimary: true },
  { id: 's_shp_t1', name: 'Lesser Seal of Scaling Health', type: RUNE_TYPES.SEAL, tier: 1, stats: { 'Health at lvl 18': 13.44 }, icon: '/images/shield_seal_t1.png', isPrimary: true },
  { id: 's_hreg_t1', name: 'Lesser Seal of Health Regeneration', type: RUNE_TYPES.SEAL, tier: 1, stats: { 'Health Regen / 5 sec.': 0.31 }, icon: '/images/trophy_seal_t1.png', isPrimary: true },
  { id: 's_shreg_t1', name: 'Lesser Seal of Scaling Health Regeneration', type: RUNE_TYPES.SEAL, tier: 1, stats: { 'Health Regen / 5 sec. at lvl 18': 1.13 }, icon: '/images/shield_seal_t1.png', isPrimary: true },
  { id: 'm_mr_t1_s', name: 'Lesser Seal of Magic Resist', type: RUNE_TYPES.SEAL, tier: 1, stats: { 'Magic Resist': 0.41 }, icon: '/images/wing_seal_t1.png', isPrimary: false },
  { id: 's_smr_t1', name: 'Lesser Seal of Scaling Magic Resist', type: RUNE_TYPES.SEAL, tier: 1, stats: { 'Magic Resist at lvl 18': 0.96 }, icon: '/images/shield_seal_t1.png', isPrimary: false },
  { id: 's_mana_t1', name: 'Lesser Seal of Mana', type: RUNE_TYPES.SEAL, tier: 1, stats: { 'Mana': 3.83 }, icon: '/images/trophy_seal_t1.png', isPrimary: false },
  { id: 's_smana_t1', name: 'Lesser Seal of Scaling Mana', type: RUNE_TYPES.SEAL, tier: 1, stats: { 'Mana at lvl 18': 11.67 }, icon: '/images/shield_seal_t1.png', isPrimary: false },
  { id: 's_mreg_t1', name: 'Lesser Seal of Mana Regeneration', type: RUNE_TYPES.SEAL, tier: 1, stats: { 'Mana Regen / 5 sec.': 0.23 }, icon: '/images/wing_seal_t1.png', isPrimary: true },
  { id: 's_smreg_t1', name: 'Lesser Seal of Scaling Mana Regeneration', type: RUNE_TYPES.SEAL, tier: 1, stats: { 'Mana Regen / 5 sec. at lvl 18': 0.65 }, icon: '/images/shield_seal_t1.png', isPrimary: true },

  // Seals (Yellow) - Tier 2
  { id: 's_ap_t2', name: 'Seal of Ability Power', type: RUNE_TYPES.SEAL, tier: 2, stats: { 'Ability Power': 0.46 }, icon: '/images/wing_seal_t2.png', isPrimary: false },
  { id: 's_sap_t2', name: 'Seal of Scaling Ability Power', type: RUNE_TYPES.SEAL, tier: 2, stats: { 'Ability Power at lvl 18': 1.45 }, icon: '/images/shield_seal_t2.png', isPrimary: false },
  { id: 's_arm_t2', name: 'Seal of Armor', type: RUNE_TYPES.SEAL, tier: 2, stats: { 'Armor': 0.78 }, icon: '/images/trophy_seal_t2.png', isPrimary: true },
  { id: 's_sarm_t2', name: 'Seal of Scaling Armor', type: RUNE_TYPES.SEAL, tier: 2, stats: { 'Armor at lvl 18': 2.34 }, icon: '/images/shield_seal_t2.png', isPrimary: true },
  { id: 's_ad_t2', name: 'Seal of Attack Damage', type: RUNE_TYPES.SEAL, tier: 2, stats: { 'Attack Damage': 0.33 }, icon: '/images/trophy_seal_t2.png', isPrimary: false },
  { id: 's_sad_t2', name: 'Seal of Scaling Attack Damage', type: RUNE_TYPES.SEAL, tier: 2, stats: { 'Attack Damage at lvl 18': 0.85 }, icon: '/images/shield_seal_t2.png', isPrimary: false },
  { id: 's_as_t2', name: 'Seal of Attack Speed', type: RUNE_TYPES.SEAL, tier: 2, stats: { 'Attack Speed': 0.59 }, icon: '/images/wing_seal_t2.png', isPrimary: false },
  { id: 's_cdr_t2', name: 'Seal of Cooldown Reduction', type: RUNE_TYPES.SEAL, tier: 2, stats: { 'Cooldown Reduction': 0.29 }, icon: '/images/trophy_seal_t2.png', isPrimary: false },
  { id: 's_critc_t2', name: 'Seal of Critical Chance', type: RUNE_TYPES.SEAL, tier: 2, stats: { 'Critical Chance': 0.32 }, icon: '/images/wing_seal_t2.png', isPrimary: false },
  { id: 's_critd_t2', name: 'Seal of Critical Damage', type: RUNE_TYPES.SEAL, tier: 2, stats: { 'Critical Damage': 0.61 }, icon: '/images/trophy_seal_t2.png', isPrimary: false },
  { id: 's_hp_t2', name: 'Seal of Health', type: RUNE_TYPES.SEAL, tier: 2, stats: { 'Health': 6.24 }, icon: '/images/wing_seal_t2.png', isPrimary: true },
  { id: 's_php_t2', name: 'Seal of Percent Health', type: RUNE_TYPES.SEAL, tier: 2, stats: { 'Increased Health %': 0.39 }, icon: '/images/wing_seal_t2.png', isPrimary: true },
  { id: 's_shp_t2', name: 'Seal of Scaling Health', type: RUNE_TYPES.SEAL, tier: 2, stats: { 'Health at lvl 18': 18.72 }, icon: '/images/shield_seal_t2.png', isPrimary: true },
  { id: 's_hreg_t2', name: 'Seal of Health Regeneration', type: RUNE_TYPES.SEAL, tier: 2, stats: { 'Health Regen / 5 sec.': 0.43 }, icon: '/images/trophy_seal_t2.png', isPrimary: true },
  { id: 's_shreg_t2', name: 'Seal of Scaling Health Regeneration', type: RUNE_TYPES.SEAL, tier: 2, stats: { 'Health Regen / 5 sec. at lvl 18': 1.58 }, icon: '/images/shield_seal_t2.png', isPrimary: true },
  { id: 'm_mr_t2_s', name: 'Seal of Magic Resist', type: RUNE_TYPES.SEAL, tier: 2, stats: { 'Magic Resist': 0.58 }, icon: '/images/wing_seal_t2.png', isPrimary: false },
  { id: 's_smr_t2', name: 'Seal of Scaling Magic Resist', type: RUNE_TYPES.SEAL, tier: 2, stats: { 'Magic Resist at lvl 18': 1.35 }, icon: '/images/shield_seal_t2.png', isPrimary: false },
  { id: 's_mana_t2', name: 'Seal of Mana', type: RUNE_TYPES.SEAL, tier: 2, stats: { 'Mana': 5.36 }, icon: '/images/trophy_seal_t2.png', isPrimary: false },
  { id: 's_smana_t2', name: 'Seal of Scaling Mana', type: RUNE_TYPES.SEAL, tier: 2, stats: { 'Mana at lvl 18': 16.33 }, icon: '/images/shield_seal_t2.png', isPrimary: false },
  { id: 's_mreg_t2', name: 'Seal of Mana Regeneration', type: RUNE_TYPES.SEAL, tier: 2, stats: { 'Mana Regen / 5 sec.': 0.32 }, icon: '/images/wing_seal_t2.png', isPrimary: true },
  { id: 's_smreg_t2', name: 'Seal of Scaling Mana Regeneration', type: RUNE_TYPES.SEAL, tier: 2, stats: { 'Mana Regen / 5 sec. at lvl 18': 0.9 }, icon: '/images/shield_seal_t2.png', isPrimary: true },

  // Seals (Yellow) - Tier 3
  { id: 's_ap_t3', name: 'Greater Seal of Ability Power', type: RUNE_TYPES.SEAL, tier: 3, stats: { 'Ability Power': 0.59 }, icon: '/images/wing_seal.png', isPrimary: false },
  { id: 's_sap_t3', name: 'Greater Seal of Scaling Ability Power', type: RUNE_TYPES.SEAL, tier: 3, stats: { 'Ability Power at lvl 18': 1.87 }, icon: '/images/shield_seal.png', isPrimary: false },
  { id: 's_arm_t3', name: 'Greater Seal of Armor', type: RUNE_TYPES.SEAL, tier: 3, stats: { 'Armor': 1.0 }, icon: '/images/trophy_seal.png', isPrimary: true },
  { id: 's_sarm_t3', name: 'Greater Seal of Scaling Armor', type: RUNE_TYPES.SEAL, tier: 3, stats: { 'Armor at lvl 18': 3.0 }, icon: '/images/shield_seal.png', isPrimary: true },
  { id: 's_ad_t3', name: 'Greater Seal of Attack Damage', type: RUNE_TYPES.SEAL, tier: 3, stats: { 'Attack Damage': 0.43 }, icon: '/images/trophy_seal.png', isPrimary: false },
  { id: 's_sad_t3', name: 'Greater Seal of Scaling Attack Damage', type: RUNE_TYPES.SEAL, tier: 3, stats: { 'Attack Damage at lvl 18': 1.09 }, icon: '/images/shield_seal.png', isPrimary: false },
  { id: 's_as_t3', name: 'Greater Seal of Attack Speed', type: RUNE_TYPES.SEAL, tier: 3, stats: { 'Attack Speed': 0.76 }, icon: '/images/wing_seal.png', isPrimary: false },
  { id: 's_cdr_t3', name: 'Greater Seal of Cooldown Reduction', type: RUNE_TYPES.SEAL, tier: 3, stats: { 'Cooldown Reduction': 0.36 }, icon: '/images/trophy_seal.png', isPrimary: false },
  { id: 's_critc_t3', name: 'Greater Seal of Critical Chance', type: RUNE_TYPES.SEAL, tier: 3, stats: { 'Critical Chance': 0.42 }, icon: '/images/wing_seal.png', isPrimary: false },
  { id: 's_critd_t3', name: 'Greater Seal of Critical Damage', type: RUNE_TYPES.SEAL, tier: 3, stats: { 'Critical Damage': 0.78 }, icon: '/images/trophy_seal.png', isPrimary: false },
  { id: 's_eregen_t3', name: 'Greater Seal of Energy Regeneration', type: RUNE_TYPES.SEAL, tier: 3, stats: { 'Energy Regen / 5 sec.': 0.63 }, icon: '/images/trophy_seal.png', isPrimary: true },
  { id: 's_seregen_t3', name: 'Greater Seal of Scaling Energy Regeneration', type: RUNE_TYPES.SEAL, tier: 3, stats: { 'Energy Regen / 5 sec. at lvl 18': 1.15 }, icon: '/images/shield_seal.png', isPrimary: true },
  { id: 's_gold_t3', name: 'Greater Seal of Gold', type: RUNE_TYPES.SEAL, tier: 3, stats: { 'Gold / 10 sec.': 0.25 }, icon: '/images/wing_seal.png', isPrimary: true },
  { id: 's_hp_t3', name: 'Greater Seal of Health', type: RUNE_TYPES.SEAL, tier: 3, stats: { 'Health': 8.0 }, icon: '/images/wing_seal.png', isPrimary: true },
  { id: 's_php_t3', name: 'Greater Seal of Percent Health', type: RUNE_TYPES.SEAL, tier: 3, stats: { 'Increased Health %': 0.5 }, icon: '/images/wing_seal.png', isPrimary: true },
  { id: 's_shp_t3', name: 'Greater Seal of Scaling Health', type: RUNE_TYPES.SEAL, tier: 3, stats: { 'Health at lvl 18': 24.0 }, icon: '/images/shield_seal.png', isPrimary: true },
  { id: 's_hreg_t3', name: 'Greater Seal of Health Regeneration', type: RUNE_TYPES.SEAL, tier: 3, stats: { 'Health Regen / 5 sec.': 0.56 }, icon: '/images/trophy_seal.png', isPrimary: true },
  { id: 's_shreg_t3', name: 'Greater Seal of Scaling Health Regeneration', type: RUNE_TYPES.SEAL, tier: 3, stats: { 'Health Regen / 5 sec. at lvl 18': 2.03 }, icon: '/images/shield_seal.png', isPrimary: true },
  { id: 'm_mr_t3_s', name: 'Greater Seal of Magic Resist', type: RUNE_TYPES.SEAL, tier: 3, stats: { 'Magic Resist': 0.74 }, icon: '/images/wing_seal.png', isPrimary: false },
  { id: 's_smr_t3', name: 'Greater Seal of Scaling Magic Resist', type: RUNE_TYPES.SEAL, tier: 3, stats: { 'Magic Resist at lvl 18': 1.74 }, icon: '/images/shield_seal.png', isPrimary: false },
  { id: 's_mana_t3', name: 'Greater Seal of Mana', type: RUNE_TYPES.SEAL, tier: 3, stats: { 'Mana': 6.89 }, icon: '/images/trophy_seal.png', isPrimary: false },
  { id: 's_smana_t3', name: 'Greater Seal of Scaling Mana', type: RUNE_TYPES.SEAL, tier: 3, stats: { 'Mana at lvl 18': 21.0 }, icon: '/images/shield_seal.png', isPrimary: false },
  { id: 's_mreg_t3', name: 'Greater Seal of Mana Regeneration', type: RUNE_TYPES.SEAL, tier: 3, stats: { 'Mana Regen / 5 sec.': 0.41 }, icon: '/images/wing_seal.png', isPrimary: true },
  { id: 's_smreg_t3', name: 'Greater Seal of Scaling Mana Regeneration', type: RUNE_TYPES.SEAL, tier: 3, stats: { 'Mana Regen / 5 sec. at lvl 18': 1.17 }, icon: '/images/shield_seal.png', isPrimary: true },


  // Glyphs (Blue) - Tier 1
  { id: 'g_ap_t1', name: 'Lesser Glyph of Ability Power', type: RUNE_TYPES.GLYPH, tier: 1, stats: { 'Ability Power': 0.66 }, icon: '/images/shell_glyph_t1.png', isPrimary: true },
  { id: 'g_sap_t1', name: 'Lesser Glyph of Scaling Ability Power', type: RUNE_TYPES.GLYPH, tier: 1, stats: { 'Ability Power at lvl 18': 1.73 }, icon: '/images/key_glyph_t1.png', isPrimary: true },
  { id: 'g_arm_t1', name: 'Lesser Glyph of Armor', type: RUNE_TYPES.GLYPH, tier: 1, stats: { 'Armor': 0.39 }, icon: '/images/candle_glyph.png', isPrimary: false },
  { id: 'g_sarm_t1', name: 'Lesser Glyph of Scaling Armor', type: RUNE_TYPES.GLYPH, tier: 1, stats: { 'Armor at lvl 18': 0.7 }, icon: '/images/hand_glyph_t1.png', isPrimary: false },
  { id: 'g_ad_t1', name: 'Lesser Glyph of Attack Damage', type: RUNE_TYPES.GLYPH, tier: 1, stats: { 'Attack Damage': 0.16 }, icon: '/images/candle_glyph.png', isPrimary: false },
  { id: 'g_sad_t1', name: 'Lesser Glyph of Scaling Attack Damage', type: RUNE_TYPES.GLYPH, tier: 1, stats: { 'Attack Damage at lvl 18': 0.41 }, icon: '/images/hand_glyph_t1.png', isPrimary: false },
  { id: 'g_as_t1', name: 'Lesser Glyph of Attack Speed', type: RUNE_TYPES.GLYPH, tier: 1, stats: { 'Attack Speed': 0.35 }, icon: '/images/shell_glyph_t1.png', isPrimary: false },
  { id: 'g_cdr_t1', name: 'Lesser Glyph of Cooldown Reduction', type: RUNE_TYPES.GLYPH, tier: 1, stats: { 'Cooldown Reduction': 0.47 }, icon: '/images/shell_glyph_t1.png', isPrimary: true },
  { id: 'g_scdr_t1', name: 'Lesser Glyph of Scaling Cooldown Reduction', type: RUNE_TYPES.GLYPH, tier: 1, stats: { 'CDR at lvl 18': 0.9 }, icon: '/images/hand_glyph_t1.png', isPrimary: true },
  { id: 'g_critc_t1', name: 'Lesser Glyph of Critical Chance', type: RUNE_TYPES.GLYPH, tier: 1, stats: { 'Critical Chance': 0.15 }, icon: '/images/shell_glyph_t1.png', isPrimary: false },
  { id: 'g_critd_t1', name: 'Lesser Glyph of Critical Damage', type: RUNE_TYPES.GLYPH, tier: 1, stats: { 'Critical Damage': 0.31 }, icon: '/images/candle_glyph.png', isPrimary: false },
  { id: 'g_energy_t1', name: 'Lesser Glyph of Energy', type: RUNE_TYPES.GLYPH, tier: 1, stats: { 'Energy': 1.22 }, icon: '/images/candle_glyph.png', isPrimary: true },
  { id: 'g_senergy_t1', name: 'Lesser Glyph of Scaling Energy', type: RUNE_TYPES.GLYPH, tier: 1, stats: { 'Energy at lvl 18': 1.61 }, icon: '/images/hand_glyph_t1.png', isPrimary: true },
  { id: 'g_hp_t1', name: 'Lesser Glyph of Health', type: RUNE_TYPES.GLYPH, tier: 1, stats: { 'Health': 1.49 }, icon: '/images/shell_glyph_t1.png', isPrimary: false },
  { id: 'g_shp_t1', name: 'Lesser Glyph of Scaling Health', type: RUNE_TYPES.GLYPH, tier: 1, stats: { 'Health at lvl 18': 5.41 }, icon: '/images/key_glyph_t1.png', isPrimary: false },
  { id: 'g_hreg_t1', name: 'Lesser Glyph of Health Regeneration', type: RUNE_TYPES.GLYPH, tier: 1, stats: { 'Health Regen / 5 sec.': 0.15 }, icon: '/images/candle_glyph.png', isPrimary: false },
  { id: 'g_mpen_t1', name: 'Lesser Glyph of Magic Penetration', type: RUNE_TYPES.GLYPH, tier: 1, stats: { 'Magic Pen.': 0.35 }, icon: '/images/candle_glyph.png', isPrimary: false },
  { id: 'g_mr_t1', name: 'Lesser Glyph of Magic Resist', type: RUNE_TYPES.GLYPH, tier: 1, stats: { 'Magic Resist': 0.74 }, icon: '/images/shell_glyph_t1.png', isPrimary: true },
  { id: 'g_smr_t1', name: 'Lesser Glyph of Scaling Magic Resist', type: RUNE_TYPES.GLYPH, tier: 1, stats: { 'Magic Resist at lvl 18': 1.68 }, icon: '/images/key_glyph_t1.png', isPrimary: true },
  { id: 'g_mana_t1', name: 'Lesser Glyph of Mana', type: RUNE_TYPES.GLYPH, tier: 1, stats: { 'Mana': 6.25 }, icon: '/images/candle_glyph.png', isPrimary: true },
  { id: 'g_smana_t1', name: 'Lesser Glyph of Scaling Mana', type: RUNE_TYPES.GLYPH, tier: 1, stats: { 'Mana at lvl 18': 14.17 }, icon: '/images/hand_glyph_t1.png', isPrimary: true },
  { id: 'g_mreg_t1', name: 'Lesser Glyph of Mana Regeneration', type: RUNE_TYPES.GLYPH, tier: 1, stats: { 'Mana Regen / 5 sec.': 0.19 }, icon: '/images/shell_glyph_t1.png', isPrimary: true },
  { id: 'g_smreg_t1', name: 'Lesser Glyph of Scaling Mana Regeneration', type: RUNE_TYPES.GLYPH, tier: 1, stats: { 'Mana Regen / 5 sec. at lvl 18': 0.67 }, icon: '/images/key_glyph_t1.png', isPrimary: true },

  // Glyphs (Blue) - Tier 2
  { id: 'g_ap_t2', name: 'Glyph of Ability Power', type: RUNE_TYPES.GLYPH, tier: 2, stats: { 'Ability Power': 0.92 }, icon: '/images/shell_glyph_t2.png', isPrimary: true },
  { id: 'g_sap_t2', name: 'Glyph of Scaling Ability Power', type: RUNE_TYPES.GLYPH, tier: 2, stats: { 'Ability Power at lvl 18': 2.42 }, icon: '/images/key_glyph_t2.png', isPrimary: true },
  { id: 'g_arm_t2', name: 'Glyph of Armor', type: RUNE_TYPES.GLYPH, tier: 2, stats: { 'Armor': 0.55 }, icon: '/images/candle_glyph_t2.png', isPrimary: false },
  { id: 'g_sarm_t2', name: 'Glyph of Scaling Armor', type: RUNE_TYPES.GLYPH, tier: 2, stats: { 'Armor at lvl 18': 0.99 }, icon: '/images/hand_glyph_t2.png', isPrimary: false },
  { id: 'g_ad_t2', name: 'Glyph of Attack Damage', type: RUNE_TYPES.GLYPH, tier: 2, stats: { 'Attack Damage': 0.22 }, icon: '/images/candle_glyph_t2.png', isPrimary: false },
  { id: 'g_sad_t2', name: 'Glyph of Scaling Attack Damage', type: RUNE_TYPES.GLYPH, tier: 2, stats: { 'Attack Damage at lvl 18': 0.57 }, icon: '/images/hand_glyph_t2.png', isPrimary: false },
  { id: 'g_as_t2', name: 'Glyph of Attack Speed', type: RUNE_TYPES.GLYPH, tier: 2, stats: { 'Attack Speed': 0.5 }, icon: '/images/shell_glyph_t2.png', isPrimary: false },
  { id: 'g_cdr_t2', name: 'Glyph of Cooldown Reduction', type: RUNE_TYPES.GLYPH, tier: 2, stats: { 'Cooldown Reduction': 0.67 }, icon: '/images/shell_glyph_t2.png', isPrimary: true },
  { id: 'g_scdr_t2', name: 'Glyph of Scaling Cooldown Reduction', type: RUNE_TYPES.GLYPH, tier: 2, stats: { 'CDR at lvl 18': 1.26 }, icon: '/images/hand_glyph_t2.png', isPrimary: true },
  { id: 'g_critc_t2', name: 'Glyph of Critical Chance', type: RUNE_TYPES.GLYPH, tier: 2, stats: { 'Critical Chance': 0.22 }, icon: '/images/shell_glyph_t2.png', isPrimary: false },
  { id: 'g_critd_t2', name: 'Glyph of Critical Damage', type: RUNE_TYPES.GLYPH, tier: 2, stats: { 'Critical Damage': 0.43 }, icon: '/images/candle_glyph_t2.png', isPrimary: false },
  { id: 'g_energy_t2', name: 'Glyph of Energy', type: RUNE_TYPES.GLYPH, tier: 2, stats: { 'Energy': 1.71 }, icon: '/images/candle_glyph_t2.png', isPrimary: true },
  { id: 'g_senergy_t2', name: 'Glyph of Scaling Energy', type: RUNE_TYPES.GLYPH, tier: 2, stats: { 'Energy at lvl 18': 2.25 }, icon: '/images/hand_glyph_t2.png', isPrimary: true },
  { id: 'g_hp_t2', name: 'Glyph of Health', type: RUNE_TYPES.GLYPH, tier: 2, stats: { 'Health': 2.08 }, icon: '/images/shell_glyph_t2.png', isPrimary: false },
  { id: 'g_shp_t2', name: 'Glyph of Scaling Health', type: RUNE_TYPES.GLYPH, tier: 2, stats: { 'Health at lvl 18': 7.57 }, icon: '/images/key_glyph_t2.png', isPrimary: false },
  { id: 'g_hreg_t2', name: 'Glyph of Health Regeneration', type: RUNE_TYPES.GLYPH, tier: 2, stats: { 'Health Regen / 5 sec.': 0.21 }, icon: '/images/candle_glyph_t2.png', isPrimary: false },
  { id: 'g_mpen_t2', name: 'Glyph of Magic Penetration', type: RUNE_TYPES.GLYPH, tier: 2, stats: { 'Magic Pen.': 0.49 }, icon: '/images/candle_glyph_t2.png', isPrimary: false },
  { id: 'g_mr_t2', name: 'Glyph of Magic Resist', type: RUNE_TYPES.GLYPH, tier: 2, stats: { 'Magic Resist': 1.04 }, icon: '/images/shell_glyph_t2.png', isPrimary: true },
  { id: 'g_smr_t2', name: 'Glyph of Scaling Magic Resist', type: RUNE_TYPES.GLYPH, tier: 2, stats: { 'Magic Resist at lvl 18': 2.34 }, icon: '/images/key_glyph_t2.png', isPrimary: true },
  { id: 'g_mana_t2', name: 'Glyph of Mana', type: RUNE_TYPES.GLYPH, tier: 2, stats: { 'Mana': 8.75 }, icon: '/images/candle_glyph_t2.png', isPrimary: true },
  { id: 'g_smana_t2', name: 'Glyph of Scaling Mana', type: RUNE_TYPES.GLYPH, tier: 2, stats: { 'Mana at lvl 18': 19.8 }, icon: '/images/hand_glyph_t2.png', isPrimary: true },
  { id: 'g_mreg_t2', name: 'Glyph of Mana Regeneration', type: RUNE_TYPES.GLYPH, tier: 2, stats: { 'Mana Regen / 5 sec.': 0.26 }, icon: '/images/shell_glyph_t2.png', isPrimary: true },
  { id: 'g_smreg_t2', name: 'Glyph of Scaling Mana Regeneration', type: RUNE_TYPES.GLYPH, tier: 2, stats: { 'Mana Regen / 5 sec. at lvl 18': 0.94 }, icon: '/images/key_glyph_t2.png', isPrimary: true },

  // Glyphs (Blue) - Tier 3
  { id: 'g_ap_t3', name: 'Greater Glyph of Ability Power', type: RUNE_TYPES.GLYPH, tier: 3, stats: { 'Ability Power': 1.19 }, icon: '/images/shell_glyph.png', isPrimary: true },
  { id: 'g_sap_t3', name: 'Greater Glyph of Scaling Ability Power', type: RUNE_TYPES.GLYPH, tier: 3, stats: { 'Ability Power at lvl 18': 3.12 }, icon: '/images/key_glyph.png', isPrimary: true },
  { id: 'g_arm_t3', name: 'Greater Glyph of Armor', type: RUNE_TYPES.GLYPH, tier: 3, stats: { 'Armor': 0.7 }, icon: '/images/candle_glyph.png', isPrimary: false },
  { id: 'g_sarm_t3', name: 'Greater Glyph of Scaling Armor', type: RUNE_TYPES.GLYPH, tier: 3, stats: { 'Armor at lvl 18': 1.26 }, icon: '/images/hand_glyph.png', isPrimary: false },
  { id: 'g_apen_t3', name: 'Greater Glyph of Armor Penetration', type: RUNE_TYPES.GLYPH, tier: 3, stats: { 'Armor Pen.': 0.17 }, icon: '/images/candle_glyph.png', isPrimary: false },
  { id: 'g_ad_t3', name: 'Greater Glyph of Attack Damage', type: RUNE_TYPES.GLYPH, tier: 3, stats: { 'Attack Damage': 0.28 }, icon: '/images/candle_glyph.png', isPrimary: false },
  { id: 'g_sad_t3', name: 'Greater Glyph of Scaling Attack Damage', type: RUNE_TYPES.GLYPH, tier: 3, stats: { 'Attack Damage at lvl 18': 0.73 }, icon: '/images/hand_glyph.png', isPrimary: false },
  { id: 'g_as_t3', name: 'Greater Glyph of Attack Speed', type: RUNE_TYPES.GLYPH, tier: 3, stats: { 'Attack Speed': 0.64 }, icon: '/images/shell_glyph.png', isPrimary: false },
  { id: 'g_cdr_t3', name: 'Greater Glyph of Cooldown Reduction', type: RUNE_TYPES.GLYPH, tier: 3, stats: { 'Cooldown Reduction': 0.83 }, icon: '/images/shell_glyph.png', isPrimary: true },
  { id: 'g_scdr_t3', name: 'Greater Glyph of Scaling Cooldown Reduction', type: RUNE_TYPES.GLYPH, tier: 3, stats: { 'CDR at lvl 18': 1.62 }, icon: '/images/hand_glyph.png', isPrimary: true },
  { id: 'g_critc_t3', name: 'Greater Glyph of Critical Chance', type: RUNE_TYPES.GLYPH, tier: 3, stats: { 'Critical Chance': 0.28 }, icon: '/images/shell_glyph.png', isPrimary: false },
  { id: 'g_critd_t3', name: 'Greater Glyph of Critical Damage', type: RUNE_TYPES.GLYPH, tier: 3, stats: { 'Critical Damage': 0.56 }, icon: '/images/candle_glyph.png', isPrimary: false },
  { id: 'g_energy_t3', name: 'Greater Glyph of Energy', type: RUNE_TYPES.GLYPH, tier: 3, stats: { 'Energy': 2.2 }, icon: '/images/candle_glyph.png', isPrimary: true },
  { id: 'g_senergy_t3', name: 'Greater Glyph of Scaling Energy', type: RUNE_TYPES.GLYPH, tier: 3, stats: { 'Energy at lvl 18': 2.89 }, icon: '/images/hand_glyph.png', isPrimary: true },
  { id: 'g_eregen_t3', name: 'Greater Glyph of Energy Regeneration', type: RUNE_TYPES.GLYPH, tier: 3, stats: { 'Energy Regen / 5 sec.': 0.22 }, icon: '/images/candle_glyph.png', isPrimary: true },
  { id: 'g_seregen_t3', name: 'Greater Glyph of Scaling Energy Regeneration', type: RUNE_TYPES.GLYPH, tier: 3, stats: { 'Energy Regen / 5 sec. at lvl 18': 0.54 }, icon: '/images/key_glyph.png', isPrimary: true },
  { id: 'g_exp_t3', name: 'Greater Glyph of Experience', type: RUNE_TYPES.GLYPH, tier: 3, stats: { 'Experience %': 0.25 }, icon: '/images/hand_glyph.png', isPrimary: true },
  { id: 'g_hp_t3', name: 'Greater Glyph of Health', type: RUNE_TYPES.GLYPH, tier: 3, stats: { 'Health': 2.67 }, icon: '/images/shell_glyph.png', isPrimary: false },
  { id: 'g_shp_t3', name: 'Greater Glyph of Scaling Health', type: RUNE_TYPES.GLYPH, tier: 3, stats: { 'Health at lvl 18': 9.74 }, icon: '/images/key_glyph.png', isPrimary: false },
  { id: 'g_hreg_t3', name: 'Greater Glyph of Health Regeneration', type: RUNE_TYPES.GLYPH, tier: 3, stats: { 'Health Regen / 5 sec.': 0.27 }, icon: '/images/candle_glyph.png', isPrimary: false },
  { id: 'g_php_t3', name: 'Greater Glyph of Percent Health', type: RUNE_TYPES.GLYPH, tier: 3, stats: { 'Increased Health %': 0.1 }, icon: '/images/shell_glyph.png', isPrimary: false },
  { id: 'g_mpen_t3', name: 'Greater Glyph of Magic Penetration', type: RUNE_TYPES.GLYPH, tier: 3, stats: { 'Magic Pen.': 0.63 }, icon: '/images/candle_glyph.png', isPrimary: false },
  { id: 'g_mr_t3', name: 'Greater Glyph of Magic Resist', type: RUNE_TYPES.GLYPH, tier: 3, stats: { 'Magic Resist': 1.34 }, icon: '/images/shell_glyph.png', isPrimary: true },
  { id: 'g_smr_t3', name: 'Greater Glyph of Scaling Magic Resist', type: RUNE_TYPES.GLYPH, tier: 3, stats: { 'Magic Resist at lvl 18': 3.0 }, icon: '/images/key_glyph.png', isPrimary: true },
  { id: 'g_mana_t3', name: 'Greater Glyph of Mana', type: RUNE_TYPES.GLYPH, tier: 3, stats: { 'Mana': 11.25 }, icon: '/images/candle_glyph.png', isPrimary: true },
  { id: 'g_smana_t3', name: 'Greater Glyph of Scaling Mana', type: RUNE_TYPES.GLYPH, tier: 3, stats: { 'Mana at lvl 18': 25.5 }, icon: '/images/hand_glyph.png', isPrimary: true },
  { id: 'g_mreg_t3', name: 'Greater Glyph of Mana Regeneration', type: RUNE_TYPES.GLYPH, tier: 3, stats: { 'Mana Regen / 5 sec.': 0.33 }, icon: '/images/shell_glyph.png', isPrimary: true },
  { id: 'g_smreg_t3', name: 'Greater Glyph of Scaling Mana Regeneration', type: RUNE_TYPES.GLYPH, tier: 3, stats: { 'Mana Regen / 5 sec. at lvl 18': 1.2 }, icon: '/images/key_glyph.png', isPrimary: true },

  // Quintessences (Purple)
  { id: 'q1', name: 'Greater Quintessence of Ability Power', type: RUNE_TYPES.QUINTESSENCE, tier: 3, stats: { 'Ability Power': 4.95 }, icon: '/images/goat_quint.png', isPrimary: true },
  { id: 'q2', name: 'Greater Quintessence of Attack Damage', type: RUNE_TYPES.QUINTESSENCE, tier: 3, stats: { 'Attack Damage': 2.25 }, icon: '/images/dragon_quint.png', isPrimary: true },
  { id: 'q3', name: 'Greater Quintessence of Attack Speed', type: RUNE_TYPES.QUINTESSENCE, tier: 3, stats: { 'Attack Speed': 4.5 }, icon: '/images/goat_quint.png', isPrimary: true },
  { id: 'q4', name: 'Greater Quintessence of Movement Speed', type: RUNE_TYPES.QUINTESSENCE, tier: 3, stats: { 'Movement Speed': 1.5 }, icon: '/images/goat_quint.png', isPrimary: true },
  { id: 'q5', name: 'Greater Quintessence of Armor', type: RUNE_TYPES.QUINTESSENCE, tier: 3, stats: { 'Armor': 4.26 }, icon: '/images/dragon_quint.png', isPrimary: true },
  { id: 'q6', name: 'Greater Quintessence of Life Steal', type: RUNE_TYPES.QUINTESSENCE, tier: 3, stats: { 'Life Steal': 1.5 }, icon: '/images/dragon_quint.png', isPrimary: true },
  { id: 'q7', name: 'Greater Quintessence of Cooldown Reduction', type: RUNE_TYPES.QUINTESSENCE, tier: 3, stats: { 'Cooldown Reduction': 2.5 }, icon: '/images/dragon_quint.png', isPrimary: true },
  { id: 'q8', name: 'Greater Quintessence of Health', type: RUNE_TYPES.QUINTESSENCE, tier: 3, stats: { 'Health': 26.0 }, icon: '/images/goat_quint.png', isPrimary: true },
  { id: 'q9', name: 'Greater Quintessence of Health Regeneration', type: RUNE_TYPES.QUINTESSENCE, tier: 3, stats: { 'Health Regen / 5 sec.': 2.7 }, icon: '/images/dragon_quint.png', isPrimary: true },
  { id: 'q10', name: 'Greater Quintessence of Magic Penetration', type: RUNE_TYPES.QUINTESSENCE, tier: 3, stats: { 'Magic Pen.': 2.01 }, icon: '/images/dragon_quint.png', isPrimary: true },
  { id: 'q11', name: 'Greater Quintessence of Mana Regeneration', type: RUNE_TYPES.QUINTESSENCE, tier: 3, stats: { 'Mana Regen / 5 sec.': 1.25 }, icon: '/images/goat_quint.png', isPrimary: true },
  { id: 'q12', name: 'Greater Quintessence of Gold', type: RUNE_TYPES.QUINTESSENCE, tier: 3, stats: { 'Gold / 10 sec.': 1.0 }, icon: '/images/tree_quint.png', isPrimary: true },
  { id: 'q13', name: 'Greater Quintessence of Mana', type: RUNE_TYPES.QUINTESSENCE, tier: 3, stats: { 'Mana': 37.5 }, icon: '/images/dragon_quint.png', isPrimary: true },
  { id: 'q15', name: 'Greater Quintessence of Armor Penetration', type: RUNE_TYPES.QUINTESSENCE, tier: 3, stats: { 'Armor Pen.': 2.56 }, icon: '/images/dragon_quint.png', isPrimary: true },
  { id: 'q16', name: 'Quintessence of the Speedy Specter', type: RUNE_TYPES.QUINTESSENCE, tier: 3, stats: { 'Movement Speed': 1.39 }, icon: '/images/ghost_quint.png', isPrimary: true },
  { id: 'q17', name: 'Greater Quintessence of Magic Resist', type: RUNE_TYPES.QUINTESSENCE, tier: 3, stats: { 'Magic Resist': 4.0 }, icon: '/images/goat_quint.png', isPrimary: true },
  { id: 'q19', name: 'Greater Quintessence of Percent Health', type: RUNE_TYPES.QUINTESSENCE, tier: 3, stats: { 'Increased Health %': 1.5 }, icon: '/images/goat_quint.png', isPrimary: true },
  { id: 'q20', name: 'Greater Quintessence of Spell Vamp', type: RUNE_TYPES.QUINTESSENCE, tier: 3, stats: { 'Spell Vamp': 2.0 }, icon: '/images/tree_quint.png', isPrimary: true },
  { id: 'q22', name: 'Greater Quintessence of Scaling Cooldown Reduction', type: RUNE_TYPES.QUINTESSENCE, tier: 3, stats: { 'CDR at lvl 18': 5.0 }, icon: '/images/lion_quint.png', isPrimary: true },
];


const SLOT_POSITIONS = [
  // Marks (Red) - Cluster Bottom Left
  { id: 0, type: RUNE_TYPES.MARK, top: 433, left: -61 },
  { id: 1, type: RUNE_TYPES.MARK, top: 433, left: 13 },
  { id: 2, type: RUNE_TYPES.MARK, top: 434, left: 100 },
  { id: 3, type: RUNE_TYPES.MARK, top: 366, left: -78 },
  { id: 4, type: RUNE_TYPES.MARK, top: 362, left: -4 },
  { id: 5, type: RUNE_TYPES.MARK, top: 379, left: 62 },
  { id: 6, type: RUNE_TYPES.MARK, top: 307, left: -50 },
  { id: 7, type: RUNE_TYPES.MARK, top: 311, left: 45 },
  { id: 8, type: RUNE_TYPES.MARK, top: 261, left: -1 },

  // Seals (Yellow) - Curve
  { id: 9, type: RUNE_TYPES.SEAL, top: 209, left: -45 },
  { id: 10, type: RUNE_TYPES.SEAL, top: 204, left: 40 },
  { id: 11, type: RUNE_TYPES.SEAL, top: 152, left: -9 },
  { id: 12, type: RUNE_TYPES.SEAL, top: 125, left: 56 },
  { id: 13, type: RUNE_TYPES.SEAL, top: 73, left: 94 },
  { id: 14, type: RUNE_TYPES.SEAL, top: 41, left: 162 },
  { id: 15, type: RUNE_TYPES.SEAL, top: 21, left: 231 },
  { id: 16, type: RUNE_TYPES.SEAL, top: -1, left: 307 },
  { id: 17, type: RUNE_TYPES.SEAL, top: 58, left: 340 },

  // Glyphs (Blue) - Cluster Top Right
  { id: 18, type: RUNE_TYPES.GLYPH, top: 2, left: 387 },
  { id: 19, type: RUNE_TYPES.GLYPH, top: 59, left: 428 },
  { id: 20, type: RUNE_TYPES.GLYPH, top: 1, left: 466 },
  { id: 21, type: RUNE_TYPES.GLYPH, top: 49, left: 519 },
  { id: 22, type: RUNE_TYPES.GLYPH, top: 103, left: 483 },
  { id: 23, type: RUNE_TYPES.GLYPH, top: 2, left: 563 },
  { id: 24, type: RUNE_TYPES.GLYPH, top: 42, left: 621 },
  { id: 25, type: RUNE_TYPES.GLYPH, top: 90, left: 574 },
  { id: 26, type: RUNE_TYPES.GLYPH, top: 150, left: 600 },

  // Quintessences (Large)
  { id: 27, type: RUNE_TYPES.QUINTESSENCE, top: 268, left: 163, large: true },
  { id: 28, type: RUNE_TYPES.QUINTESSENCE, top: 46, left: -22, large: true },
  { id: 29, type: RUNE_TYPES.QUINTESSENCE, top: 206, left: 440, large: true },
];

const RunesTab = forwardRef(({ playClickSound, onUnsavedChangesChange, puuid, scale = 1 }, ref) => {

  const getStorageKey = (key) => `rune_${key}_${puuid || 'default'}`;
  const [activePage, setActivePage] = useState(1);
  const [totalPages, setTotalPages] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(getStorageKey('totalPages'));
      return saved ? parseInt(saved) : 1;
    }
    return 1;
  });
  const [pageConfigs, setPageConfigs] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(getStorageKey('configs'));
      return saved ? JSON.parse(saved) : {};
    }
    return {};
  });
  const [pageNames, setPageNames] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(getStorageKey('names'));
      return saved ? JSON.parse(saved) : {};
    }
    return {};
  });
  const runesWrapperRef = useRef(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [lastSaveTime, setLastSaveTime] = useState(Date.now());
  const [tooltip, setTooltip] = useState({ visible: false, x: 0, y: 0, rune: null });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleRuneMouseEnter = (rune) => {
    setTooltip(prev => ({ ...prev, visible: true, rune }));
  };

  const handleMouseMove = (e) => {
    if (!runesWrapperRef.current) return;
    const rect = runesWrapperRef.current.getBoundingClientRect();
    setTooltip(prev => ({
      ...prev,
      x: (e.clientX - rect.left) / scale,
      y: (e.clientY - rect.top) / scale
    }));

  };

  const handleRuneMouseLeave = () => {
    setTooltip({ visible: false, x: 0, y: 0, rune: null });
  };
  const [tempName, setTempName] = useState('');
  const [expandedCategory, setExpandedCategory] = useState(null);
  const [runeTypeFilter, setRuneTypeFilter] = useState('All');
  const [tierFilters, setTierFilters] = useState({ 1: true, 2: true, 3: true });
  const [draggedRune, setDraggedRune] = useState(null);

  // Save to localStorage when configs, names, or total changes
  // Removed autosave useEffects as per user request to only save on click

  // Revert unsaved changes when switching pages
  useEffect(() => {
    const savedConfigs = localStorage.getItem(getStorageKey('configs'));
    if (savedConfigs) {
      setPageConfigs(JSON.parse(savedConfigs));
    }
  }, [activePage, puuid]);

  const activeConfig = useMemo(() => pageConfigs[activePage] || {}, [pageConfigs, activePage]);
  const activePageName = pageNames[activePage] || `Rune Page ${activePage}`;

  const hasUnsavedChanges = useMemo(() => {
    if (typeof window === 'undefined') return false;
    const storageConfigs = JSON.parse(localStorage.getItem(getStorageKey('configs')) || '{}');
    const storageNames = JSON.parse(localStorage.getItem(getStorageKey('names')) || '{}');

    const currentConfig = pageConfigs[activePage] || {};
    const storedConfig = storageConfigs[activePage] || {};

    const currentName = pageNames[activePage] || `Rune Page ${activePage}`;
    const storedName = storageNames[activePage] || `Rune Page ${activePage}`;

    return JSON.stringify(currentConfig) !== JSON.stringify(storedConfig) || currentName !== storedName;
  }, [pageConfigs, pageNames, activePage, puuid, lastSaveTime]);

  useEffect(() => {
    if (onUnsavedChangesChange) {
      onUnsavedChangesChange(hasUnsavedChanges);
    }
  }, [hasUnsavedChanges, onUnsavedChangesChange]);

  useImperativeHandle(ref, () => ({
    save: () => {
      localStorage.setItem(getStorageKey('configs'), JSON.stringify(pageConfigs));
      localStorage.setItem(getStorageKey('names'), JSON.stringify(pageNames));
      localStorage.setItem(getStorageKey('totalPages'), totalPages.toString());
      setLastSaveTime(Date.now());
    },
    discard: () => {
      const savedConfigs = JSON.parse(localStorage.getItem(getStorageKey('configs')) || '{}');
      const savedNames = JSON.parse(localStorage.getItem(getStorageKey('names')) || '{}');
      setPageConfigs(savedConfigs);
      setPageNames(savedNames);
      setLastSaveTime(Date.now());
    },
    switchPage: (page) => {
      setActivePage(page);
    },
    addPage: () => {
      if (totalPages < 20) {
        const newTotal = totalPages + 1;
        setTotalPages(newTotal);
        setActivePage(newTotal);
        localStorage.setItem(getStorageKey('totalPages'), newTotal.toString());
        if (playClickSound) playClickSound();
      }
    }
  }));

  const filteredRunes = useMemo(() => {
    return [...MOCK_RUNES]
      .filter(rune => {
        if (runeTypeFilter === 'Primary' && !rune.isPrimary) return false;
        if (runeTypeFilter === 'Secondary' && rune.isPrimary) return false;
        if (!tierFilters[rune.tier]) return false;
        return true;
      })
      .sort((a, b) => {
        const iconCompare = a.icon.localeCompare(b.icon);
        if (iconCompare !== 0) return iconCompare;
        return a.name.localeCompare(b.name);
      });
  }, [runeTypeFilter, tierFilters]);

  const stats = useMemo(() => {
    const combined = {};
    Object.values(activeConfig).forEach(runeId => {
      const rune = MOCK_RUNES.find(r => r.id === runeId);
      if (rune) {
        Object.entries(rune.stats).forEach(([key, val]) => {
          combined[key] = (combined[key] || 0) + val;
        });
      }
    });
    return combined;
  }, [activeConfig]);

  const handleSlotDrop = (slotId) => {
    if (!draggedRune) return;
    const slot = SLOT_POSITIONS.find(s => s.id === slotId);
    if (slot.type !== draggedRune.type) return;

    setPageConfigs(prev => ({
      ...prev,
      [activePage]: {
        ...(prev[activePage] || {}),
        [slotId]: draggedRune.id
      }
    }));
    setDraggedRune(null);
  };

  const handleRemoveRune = (slotId) => {
    setPageConfigs(prev => {
      const newConfig = { ...(prev[activePage] || {}) };
      delete newConfig[slotId];
      return {
        ...prev,
        [activePage]: newConfig
      };
    });
    handleRuneMouseLeave();
  };

  const handleRuneClick = (rune) => {
    const emptySlot = SLOT_POSITIONS.find(slot =>
      slot.type === rune.type && !activeConfig[slot.id]
    );

    if (emptySlot) {
      setPageConfigs(prev => ({
        ...prev,
        [activePage]: {
          ...(prev[activePage] || {}),
          [emptySlot.id]: rune.id
        }
      }));
    }
    if (playClickSound) playClickSound();
  };

  const handleClearPage = () => {
    setPageConfigs(prev => ({
      ...prev,
      [activePage]: {}
    }));
    if (playClickSound) playClickSound();
  };

  const handleSavePage = () => {
    setTempName(pageNames[activePage] || `Rune Page ${activePage}`);
    setIsSaving(true);
    if (playClickSound) playClickSound();
  };

  const confirmSave = () => {
    const newNames = {
      ...pageNames,
      [activePage]: tempName
    };
    setPageNames(newNames);

    // Explicitly save everything to localStorage
    localStorage.setItem(getStorageKey('configs'), JSON.stringify(pageConfigs));
    localStorage.setItem(getStorageKey('names'), JSON.stringify(newNames));
    localStorage.setItem(getStorageKey('totalPages'), totalPages.toString());

    setLastSaveTime(Date.now());
    setIsSaving(false);
    if (playClickSound) playClickSound();
  };

  const handlePageSwitch = (targetPage) => {
    if (targetPage === activePage) return;

    if (hasUnsavedChanges) {
      if (onUnsavedChangesChange) {
        onUnsavedChangesChange(true, targetPage);
      }
    } else {
      setActivePage(targetPage);
    }
    if (playClickSound) playClickSound();
  };

  const handleAddPage = () => {
    if (totalPages < 20) {
      if (hasUnsavedChanges) {
        if (onUnsavedChangesChange) {
          onUnsavedChangesChange(true, 'NEW');
        }
        return;
      }

      const newTotal = totalPages + 1;
      setTotalPages(newTotal);
      setActivePage(newTotal);
      // Auto-save the new page count
      localStorage.setItem(getStorageKey('totalPages'), newTotal.toString());
      if (playClickSound) playClickSound();
    }
  };

  const handleDeletePage = () => {
    setIsDeleting(true);
    if (playClickSound) playClickSound();
  };

  const confirmDelete = () => {
    if (totalPages <= 1) {
      clearPage();
      setIsDeleting(false);
      return;
    }

    const newConfigs = { ...pageConfigs };
    for (let i = activePage; i < totalPages; i++) {
      newConfigs[i] = newConfigs[i + 1] || {};
    }
    delete newConfigs[totalPages];
    setPageConfigs(newConfigs);

    const newNames = { ...pageNames };
    // Revert names to default "Rune Page X" for the deleted page and all subsequent ones
    for (let i = activePage; i <= totalPages; i++) {
      delete newNames[i];
    }
    setPageNames(newNames);

    const newTotal = totalPages - 1;
    setTotalPages(newTotal);

    // Also update localStorage on delete to keep structure consistent
    localStorage.setItem(getStorageKey('configs'), JSON.stringify(newConfigs));
    localStorage.setItem(getStorageKey('names'), JSON.stringify(newNames));
    localStorage.setItem(getStorageKey('totalPages'), newTotal.toString());

    setLastSaveTime(Date.now());
    if (activePage > totalPages - 1) {
      setActivePage(Math.max(1, totalPages - 1));
    }
    setIsDeleting(false);
    if (playClickSound) playClickSound();
  };

  const clearPage = () => {
    setPageConfigs(prev => ({
      ...prev,
      [activePage]: {}
    }));
    setPageNames(prev => {
      const newNames = { ...prev };
      delete newNames[activePage];
      return newNames;
    });
    if (playClickSound) playClickSound();
  };

  return (
    <div className={styles.runesWrapper} ref={runesWrapperRef}>
      <div className={styles.topBar}>
        <div className={styles.filterSection}>
          <span className={styles.filterLabel}>Runes Type:</span>
          <select
            className={styles.runeSelect}
            value={runeTypeFilter}
            onChange={(e) => setRuneTypeFilter(e.target.value)}
          >
            <option value="All">All</option>
            <option value="Primary">Primary</option>
            <option value="Secondary">Secondary</option>
          </select>
        </div>

        <div className={styles.pageSelector}>
          {Array.from({ length: totalPages }).map((_, i) => (
            <button
              key={i}
              className={`${styles.pageBtn} ${activePage === i + 1 ? styles.pageBtnActive : ''}`}
              onClick={() => handlePageSwitch(i + 1)}
            >
              {i + 1}
            </button>
          ))}
          {totalPages < 20 && (
            <button
              className={styles.pageBtn}
              onClick={handleAddPage}
              title="Add Page"
            >
              +
            </button>
          )}
        </div>
      </div>

      <div className={styles.mainArea}>
        {/* Sidebar */}
        <div className={styles.sidebar}>
          <div className={styles.tierFilters}>
            <span className={styles.tierLabel}>Tier:</span>
            {[1, 2, 3].map(t => (
              <label key={t} className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={tierFilters[t]}
                  onChange={() => setTierFilters(prev => ({ ...prev, [t]: !prev[t] }))}
                /> {t}
              </label>
            ))}
          </div>

          <div className={`${styles.categories} legacy-scrollbar`}>
            {Object.values(RUNE_TYPES).map(cat => (
              <div key={cat} className={styles.categoryGroup}>
                <div
                  className={`${styles.categoryHeader} ${styles[`header${cat}`]}`}
                  onClick={() => setExpandedCategory(expandedCategory === cat ? null : cat)}
                >
                  <span className={styles.categoryArrow}>{expandedCategory === cat ? '▼' : '▶'}</span>
                  {cat}s
                </div>
                {expandedCategory === cat && (
                  <div className={styles.runeItems}>
                    {filteredRunes.filter(r => r.type === cat).map(rune => (
                      <div
                        key={rune.id}
                        className={styles.runeItem}
                        draggable
                        onDragStart={() => setDraggedRune(rune)}
                        onClick={() => handleRuneClick(rune)}
                      >
                        <img
                          src={rune.icon}
                          className={`${styles.runeIconSmall} ${rune.type === RUNE_TYPES.QUINTESSENCE ? styles.runeIconQuintessence : ''}`}
                          alt=""
                        />
                        <div className={styles.runeInfo}>
                          <div className={styles.runeName}>{rune.name}</div>
                          <div className={styles.runeStatsInline}>
                            {Object.entries(rune.stats).map(([name, val]) => (
                              <span key={name}>+{val.toFixed(val % 1 === 0 ? 0 : 2)} {name}</span>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Rune Grid */}
        <div className={styles.runeGridContainer}>
          <div className={styles.runeGrid}>
            <div className={styles.pageTitle}>{activePageName}</div>
            {SLOT_POSITIONS.map(slot => {
              const runeId = activeConfig[slot.id];
              const rune = runeId ? MOCK_RUNES.find(r => r.id === runeId) : null;

              return (
                <Fragment key={slot.id}>
                  {rune && (
                    <div
                      className={`${styles.slotGlow} ${styles[`glow${slot.type}`]} ${slot.large ? styles.largeGlow : ''}`}
                      style={{ top: `${slot.top}px`, left: `${slot.left}px` }}
                    />
                  )}
                  <div
                    className={`${styles.runeSlot} ${slot.large ? styles.largeSlot : ''} ${styles[`slot${slot.type}`]} ${rune ? styles.hasRune : ''}`}
                    style={{ top: `${slot.top}px`, left: `${slot.left}px` }}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={() => handleSlotDrop(slot.id)}
                  >
                    {rune ? (
                      <img
                        src={rune.icon}
                        className={styles.placedRune}
                        alt=""
                        onClick={() => handleRemoveRune(slot.id)}
                        onMouseEnter={() => handleRuneMouseEnter(rune)}
                        onMouseMove={handleMouseMove}
                        onMouseLeave={handleRuneMouseLeave}
                      />
                    ) : (
                      <div className={styles.slotIndicator} />
                    )}
                  </div>
                </Fragment>
              );
            })}
          </div>
        </div>

        {/* Stats Panel */}
        <div className={styles.statsPanel}>
          <div className={styles.statsTitle}>Statistics</div>
          <div className={`${styles.statsList} legacy-scrollbar`}>
            {Object.keys(stats).length === 0 ? (
              <div className={styles.emptyStats}>No runes placed</div>
            ) : (
              Object.entries(stats).map(([name, val]) => (
                <div key={name} className={styles.statRow}>
                  <div className={styles.statName}>{name}</div>
                  <div className={styles.statValue}>+ {val.toFixed(val % 1 === 0 ? 0 : 2)}</div>
                </div>
              ))
            )}
          </div>

          {/* Action Buttons */}
          <div className={styles.actionButtons}>
            <div className={styles.actionBtn} onClick={handleDeletePage} title="Delete Page">
              <img src="/images/x_runebutton.png" className={styles.actionBtnImg} alt="Delete" />
            </div>
            <div className={styles.actionBtn} onClick={handleClearPage} title="Clear Page">
              <img src="/images/clear_runebutton.png" className={styles.actionBtnImg} alt="Clear" />
            </div>
            <div className={styles.actionBtn} onClick={handleSavePage} title="Save">
              <img src="/images/save_runebutton.png" className={styles.actionBtnImg} alt="Save" />
            </div>
          </div>
        </div>
      </div>

      {mounted && isSaving && createPortal(
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h3>Rename Rune Page</h3>
            <input
              type="text"
              value={tempName}
              onChange={(e) => setTempName(e.target.value)}
              className={styles.modalInput}
              autoFocus
            />
            <div className={styles.modalActions}>
              <button onClick={() => setIsSaving(false)}>Cancel</button>
              <button onClick={confirmSave} className={styles.confirmBtn}>Save</button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {mounted && isDeleting && createPortal(
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h3>Delete Rune Page?</h3>
            <p>Are you sure you want to delete "{activePageName}"? This cannot be undone.</p>
            <div className={styles.modalActions}>
              <button onClick={() => setIsDeleting(false)}>Cancel</button>
              <button onClick={confirmDelete} className={styles.confirmBtn} style={{ background: '#7a0000', color: 'white' }}>Delete</button>
            </div>
          </div>
        </div>,
        document.body
      )}



      {tooltip.visible && tooltip.rune && (
        <div
          className={styles.classicTooltip}
          style={{ left: `${tooltip.x}px`, top: `${tooltip.y}px` }}
        >
          <div className={styles.tierText}>Tier: {tooltip.rune.tier}</div>
          <div className={styles.nameText}>{tooltip.rune.name}</div>
          <div className={styles.statText}>
            {Object.entries(tooltip.rune.stats).map(([name, val]) => (
              <div key={name}>+{val.toFixed(val % 1 === 0 ? 0 : 2)} {name}</div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
});

export default RunesTab;
