'use client';

import styles from './intro.module.css';
import Image from 'next/image';
import Link from 'next/link';

export default function IntroPage() {
  return (
    <div className={styles.container}>
      {/* Intro Section */}
      <section className={styles.intro}>
        <div className={styles.introContent}>
          <h1>완벽한 기록 VEMO</h1>
          <p>동영상 학습의 모든 것, VEMO와 함께 시작하세요</p>
        </div>
      </section>

      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <h2>동영상 학습을 더 효율적으로</h2>
          <p>기록부터 공유까지, 한 번에 해결하세요</p>
          <Link href="/" className={styles.ctaButton}>
            <img src="/icons/Button_home.svg" alt="이동" className={styles.buttonIcon} />
            <span>시작하기</span>
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className={styles.features}>
        <div className={styles.featureHeader}>
          <h2>Core Features</h2>
          <p>VEMO와 함께 작성하고, 매핑하고, 요약하고, 공유하며 학습하세요.</p>
        </div>
        <div className={styles.featureGrid}>
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>
              <Image
                src="/icons/bt_H_SideNav_Edit.svg"
                alt="작성하기 아이콘"
                width={48}
                height={48}
              />
            </div>
            <h3>Writing</h3>
            <p>동영상을 보면서 실시간으로 필기하세요</p>
          </div>
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>
              <div className={styles.timestampIcon}>
                <svg
                  width="48"
                  height="48"
                  viewBox="0 0 56 56"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <circle
                    cx="28"
                    cy="28"
                    r="28"
                    stroke="currentColor"
                    strokeWidth="5"
                  />
                  <path
                    d="M28 14V28L36 32"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <text
                    x="28"
                    y="44"
                    fontSize="12"
                    fontWeight="600"
                    fill="currentColor"
                    textAnchor="middle"
                  >
                    00:00
                  </text>
                </svg>
              </div>
            </div>
            <h3>Mapping</h3>
            <p>타임스탬프로 원하는 부분을 빠르게 찾아보세요</p>
          </div>
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>
              <Image
                src="/icons/bt_H_edit_nav_AiSummery.svg"
                alt="요약하기 아이콘"
                width={48}
                height={48}
              />
            </div>
            <h3>Summary</h3>
            <p>AI가 영상 내용을 자동으로 요약해드려요</p>
          </div>
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>
              <Image
                src="/icons/bt_H_SideNav_Community.svg"
                alt="공유하기 아이콘"
                width={48}
                height={48}
              />
            </div>
            <h3>Sharing</h3>
            <p>다른 사용자들과 노트를 공유하고 협업하세요</p>
          </div>
        </div>
      </section>

      {/* Service Story Section */}
      <section className={styles.storySection}>
        <div className={styles.storyContainer}>
          <div className={styles.storyHeader}>
            <h2>이러한 이유 때문에 저희 서비스 VEMO가 탄생했습니다.</h2>
          </div>
          <div className={styles.storyContent}>
            <div className={styles.storyBlock}>
              <div className={styles.storyText}>
                <h3>학습자들의 학습 방향</h3>
                <p>많은 사람들이 온라인 영상을 활용해 학습하고 있지만, 시간 관리와 학습 효율성에서 어려움을 겪고 있습니다.</p>
              </div>
              <div className={styles.storyImage}>
                <Image
                  src="/images/Slide 16_9 - 559.png"
                  alt="학습자들의 고민"
                  width={600}
                  height={338}
                  layout="responsive"
                />
              </div>
            </div>

            <div className={styles.storyBlock}>
              <div className={styles.storyImage}>
                <Image
                  src="/images/Slide 16_9 - 570.png"
                  alt="학습 효율성 문제"
                  width={600}
                  height={338}
                  layout="responsive"
                />
              </div>
              <div className={styles.storyText}>
                <h3>학습 효율성 문제</h3>
                <p>작성한 기록이 영상의 어느 부분에서 비롯된 것인지 찾기 어려워 학습 내용의 연속성과 활용도가 떨어지는 문제가 있습니다.</p>
              </div>
            </div>

            <div className={styles.storyBlock}>
              <div className={styles.storyText}>
                <h3>VEMO의 해결책</h3>
                <p>분산된 기록을 하나로 통합하여 효율적인 학습 환경 제공</p>
              </div>
              <div className={styles.storyImage}>
                <div className={styles.imageComparison}>
                  <Image
                    src="/images/Slide 16_9 - 566.png"
                    alt="기존 문제점"
                    width={300}
                    height={169}
                  />
                  <div className={styles.arrow}>→</div>
                  <Image
                    src="/images/Slide 16_9 - 575.png"
                    alt="VEMO 솔루션"
                    width={300}
                    height={169}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className={styles.finalCta}>
        <div className={styles.finalCtaContainer}>
          <div className={styles.finalCtaHeader}>
            <h2>VEMO 서비스로 학습을 시작하세요</h2>
            <p>지금 바로 VEMO와 함께 효율적인 학습을 경험해보세요</p>
          </div>
          <div className={styles.servicePreview}>
            <Image
              src="/images/homepage.png"
              alt="VEMO 홈페이지"
              width={800}
              height={450}
              className={styles.previewImage}
            />
            <Image
              src="/images/vemopage.png"
              alt="VEMO 메인 페이지"
              width={800}
              height={450}
              className={styles.previewImage}
            />
          </div>
          <div className={styles.quizBanner}>
            <h3>영상 요약 퀴즈 풀고 상품 받기 🎁</h3>
            <Link href="/quiz" className={styles.quizButton}>
              <span>퀴즈 풀러가기</span>
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
