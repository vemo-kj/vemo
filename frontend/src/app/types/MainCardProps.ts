export interface MainCardProps {
  id: string;
  title: string;
  thumbnails: string;
  duration: string;
  category: string;
  channel: {
    id: string;
    thumbnails: string;
    title: string;
  }
  vemoCount: number;
}

