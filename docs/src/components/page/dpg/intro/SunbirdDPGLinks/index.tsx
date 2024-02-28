import React from 'react';
import styles from './index.module.scss';

export default function SunbirdDPGLinks() {
  return (
    <div className={styles.sunbirddpgLinks}>
      <header>
        {/* <h3 className={styles.dpgLinksTitle}>Samagra Digital Public Goods </h3> */}
        <p className={styles.sunbirddpgLinksDescription}>
          Explore Sunbird DPGs managed by Samagra in detail using the links given below.
        </p>
      </header>
      <div className={styles.sunbirddpgLinksLinks}>
        <a href="https://uci.sunbird.org/" target="_blank" rel="noopener noreferrer">
          Sunbird UCI →
        </a>
        <a href="https://cqube.sunbird.org/" target="_blank" rel="noopener noreferrer">
          Sunbird cQube →
        </a>
      </div>
    </div>
  );
}
