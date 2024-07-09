import React from 'react';
import styles from './index.module.scss';

export default function SamagraDPGLinks() {
  return (
    <div className={styles.samagradpgLinks}>
      <header>
        {/* <h3 className={styles.dpgLinksTitle}>Samagra Digital Public Goods </h3> */}
        <p className={styles.samagradpgLinksDescription}>
          Explore Samagra DPGs in detail using the links given below.
        </p>
      </header>
      <div className={styles.samagradpgLinksLinks}>
        <a href="https://documentation-akai.vercel.app/" target="_blank" rel="noopener noreferrer">
          Ama Krushai →
        </a>
        <a href="https://documentation-akai.vercel.app/" target="_blank" rel="noopener noreferrer">
          NL Chatbot →
        </a>
      </div>
    </div>
  );
}
