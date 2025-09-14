import React from "react";

import styles from "./index.module.css";

export const Background: React.FC = () => (
  <div aria-hidden className={styles.bgWrapper}>
    <div className={styles.gridWrapper}>
      <div className={`${styles.grid} ${styles.grid1}`} />

      <div className={`${styles.grid} ${styles.grid2}`} />

      <div className={`${styles.grid} ${styles.grid3}`} />

      <div className={`${styles.grid} ${styles.grid4}`} />
    </div>

    <div className={styles.colorWrapper}>
      <div className={styles.topColor} />

      <div className={styles.bottomColor} />
    </div>
  </div>
);

export default Background;
