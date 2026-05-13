'use client';

import React from 'react';
import styles from '../styles/TermsOfUse.module.css';

const TermsOfUse = ({ onClose }) => {
  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h1 className={styles.title}>Terms of Use & Legal Disclaimer</h1>
          <button className={styles.closeButton} onClick={onClose}>×</button>
        </div>
        
        <div className={styles.scrollArea}>
          <div className={styles.disclaimer}>
            <strong>LEGAL JIBBER JABBER:</strong> This project is not endorsed by Riot Games and does not reflect the views or opinions of Riot Games or anyone officially involved in producing or managing League of Legends. League of Legends and Riot Games are trademarks or registered trademarks of Riot Games, Inc. League of Legends © Riot Games, Inc.
          </div>

          <h2>1. Purpose of the Project</h2>
          <p>
            This website is a non-commercial, fan-made project created for educational and entertainment purposes only. It is an artistic recreation and emulation of the legacy League of Legends client interface as it existed circa 2016.
          </p>

          <h2>2. Intellectual Property</h2>
          <p>
            All visual assets, logos, character names, and lore elements are the property of Riot Games, Inc. This project does not claim any ownership over these assets. This site is intended to be a tribute to the game's history and a portfolio piece for web development.
          </p>

          <h2>3. No Affiliation</h2>
          <p>
            The creator of this page is not affiliated with, authorized, maintained, sponsored, or endorsed by Riot Games or any of its affiliates. This is an independent fan project.
          </p>

          <h2>4. No Commercial Use</h2>
          <p>
            This project is strictly non-commercial. No revenue is generated from this site, and no content is locked behind any form of payment or subscription. The "Support me on Ko-Fi" link is a purely voluntary option to support the developer's general work and is not a payment for any Riot-owned content.
          </p>

          <h2>5. Use at Your Own Risk</h2>
          <p>
            This page is provided "as is" without any warranties. The creator is not responsible for any issues arising from the use of this emulation. We do not collect or store any official Riot account credentials; the "Login" process is a simulation for aesthetic purposes.
          </p>

          <h2>6. Compliance with Riot Policy</h2>
          <p>
            This project aims to comply with Riot Games' "Legal Jibber Jabber" policy regarding fan creations. If you are a representative of Riot Games and have concerns regarding this project, please contact us directly.
          </p>
        </div>

        <div className={styles.footer}>
          <button className={styles.acceptButton} onClick={onClose}>I Understand</button>
        </div>
      </div>
    </div>
  );
};

export default TermsOfUse;
