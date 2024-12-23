import Link from "next/link"
import styles from './MainCard.module.css'

type mainCardProps = {
  thumbnail: string;
  mainCardTitle: string;
  youtuberLogo: string;
  youtuberProfile: string;
  cardMemoCount: number;
}

export default function MainCard({
  thumbnail,
  mainCardTitle,
  youtuberLogo,
  youtuberProfile,
  cardMemoCount
}: mainCardProps) {

  return(
    // 링크로 처리해야함
    <div className="mainCard">
      <div>
        <image className="youtubeImage" />
      </div>
      <div>
        <span>썸네일이 들어옵니다.</span>
        <div>
          <image className="youtuberLogo" />
          <span>유튜브채널명</span>
        </div>
        <span>vemo의 수</span>
      </div>
    </div>
  )
}