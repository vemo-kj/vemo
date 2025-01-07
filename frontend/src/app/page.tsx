'use client';

//style
//component
//type
import { MainCardProps } from './types/MainCardProps';
//next
import { useSearchParams } from 'next/navigation';
import router from 'next/router';

// categories 배열을 컴포넌트 외부로 이동
const categories = ['All', 'Education', 'Travel', 'Technology', 'Lifestyle'];

// SearchParams를 사용하는 컴포넌트를 분리
function SearchParamsComponent() {
    const searchParams = useSearchParams();
    const search = searchParams?.get('q') ?? '';
    const category = searchParams?.get('category') ?? 'All';
    const [mainCards, setMainCards] = useState<MainCardProps[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState('All');

    // API
    const fetchMainCards = async () => {
        try {
            setIsLoading(true);
            setError(null);

            const response = await fetch('http://localhost:5050/home', {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch main cards: ${response.status}`);
            }

            const data = await response.json();

            if (!data || !Array.isArray(data.videos)) {
                throw new Error('Invalid data format received from server');
            }

            // 데이터 매핑
            const formattedData: MainCardProps[] = data.videos.map((video: any) => {
                // channel 객체가 없는 경우 기본값 설정
                const channel = video.channel || {};

                return {
                    id: String(video.id || ''), // 문자열로 변환
                    title: String(video.title || '제목 없음'),
                    thumbnails: String(video.thumbnails || '/default-thumbnail.jpg'),
                    duration: String(video.duration || '00:00'),
                    category: String(video.category || 'Uncategorized'),
                    channel: {
                        id: String(channel.id || ''),
                        thumbnails: String(channel.thumbnails || '/default-channel-thumbnail.jpg'),
                        title: String(channel.title || '채널명 없음'),
                    },
                    vemoCount: Number(video.vemoCount || 0), // 숫자로 변환
                };
            });

            setMainCards(formattedData);
        } catch (error) {
            console.error('Error fetching main cards:', error);
            setError('데이터를 불러오는데 실패했습니다.');
            setMainCards([]);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchMainCards();
    }, []);

    useEffect(() => {
        setSelectedCategory(category);
    }, [category]);

    const handleCategoryClick = (category: string) => {
        try {
            if (category === 'All') {
                router.push('/');
            } else {
                router.push(`/?category=${encodeURIComponent(category)}`);
            }
        } catch (error) {
            console.error('Navigation error:', error);
        }
    };

    const filteredCards = mainCards.filter(card => {
        const matchesCategory = selectedCategory === 'All' || card.category === selectedCategory;
        const matchesSearch = !search || card.title.toLowerCase().includes(search.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    return (
        <main className={styles.main}>
            <Category categories={categories} onCategoryClick={handleCategoryClick} />
            {isLoading ? (
                <div>Loading...</div>
            ) : error ? (
                <div>{error}</div>
            ) : (
                <div className={styles.cardContainer}>
                    {filteredCards.map(card => (
                        <MainCard key={card.id} {...card} />
                    ))}
                </div>
            )}
        </main>
    );
}

// Home page
export default function Home() {
    return (
        <>
            <Header />
            <Suspense fallback={<div>Loading...</div>}>
                <SearchParamsComponent />
            </Suspense>
        </>
    );
}
