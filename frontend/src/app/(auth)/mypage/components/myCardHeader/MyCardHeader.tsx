'use client'

import { useEffect, useState } from 'react';
import styles from './MyCardHeader.module.css';

interface MyCardHeaderProps {
  totalPlaylists: number;
  totalVideos: number;
}

export default function MyCardHeader({ totalPlaylists, totalVideos }: MyCardHeaderProps) {
  return (
    <div className={styles.headerContainer}>
      <div className={styles.titleSection}>
        <h2 className={styles.title}>나의 VEMO 모아보기</h2>
      </div>
      <div className={styles.statsSection}>
        <div className={styles.statItem}>
          <span className={styles.statLabel}>총 재생목록 수:</span>
          <span className={styles.statValue}>{totalPlaylists}개</span>
        </div>
        <div className={styles.statItem}>
          <span className={styles.statLabel}>총 영상 수:</span>
          <span className={styles.statValue}>{totalVideos}개</span>
        </div>
      </div>
    </div>
  );
}
