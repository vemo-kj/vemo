import { Controller, Delete, Get, Patch, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AppService } from './app.service';

@ApiTags('초안')
@Controller()
export class AppController {
    constructor(private readonly appService: AppService) {}

    // auth
    // 로그인
    @ApiTags('/auth')
    @Post('login')
    login(): string {
        const loginData = {
            email: '',
            password: '',
        };
        return 'jwt token';
    }

    // 로그아웃
    @ApiTags('/auth')
    @Post('logout')
    logout(): string {
        // jwt 사용 가정
        const logoutData = {
            token: '',
        };
        return 'logout';
    }

    // 회원가입
    @ApiTags('/auth')
    @Post('signup')
    signup(): string {
        const signupData = {
            name: '',
            email: '',
            password: '',
            birth: new Date(),
            gender: '',
            nickname: '',
            profileImage: '',
            introduction: '',
        };

        return 'signup';
    }

    // playlist
    @ApiTags('/playlist')
    @Get('playlist/:playlistId')
    // 만든사람, 동영상 갯수, 총 시간, 공동 학습자, 진도률, 재생목록 타이틀, 영상 링크들
    playlistGetPlaylistId(): string {
        return 'playlistGetPlaylistId';
    }

    @ApiTags('/playlist')
    @Post('playlist/:playlistId')
    // 만든 사람, 동영상 갯수, 총 시간, 공동 학습자, 진도률, 재생목록 타이틀, 영상 링크들
    playlistPostPlaylistId(): string {
        return 'playlistPostPlaylistId';
    }

    @ApiTags('/playlist')
    @Patch('playlist/:playlistId')
    playlistPatchPlaylistId(): string {
        return 'playlistPatchPlaylistId';
    }

    @ApiTags('/playlist')
    @Delete('playlist/:playlistId')
    playlistDeletePlaylistId(): string {
        return 'playlistDeletePlaylistId';
    }

    //search
    @ApiTags('/search')
    @Get('search')
    // 검색 결과
    searchGet(): string {
        return 'searchGet';
    }

    @ApiTags('/search')
    @Post('search')
    // 검색 키워드
    searchPost(): string {
        return 'searchPost';
    }

    //user
    // 프로필 가져오기
    @ApiTags('/user')
    @Get('user')
    user(): string {
        const userData = {
            nickname: '',
            vemoCount: '',
            email: '',
            profileImage: '',
            introduction: '',
        };
        return 'user';
    }

    @ApiTags('/user')
    @Patch('edit')
    // 닉네임, 비밀번호, 프로필 이미지, 자기소개
    userPatch(): string {
        const userData = {
            nickname: '',
            vemoCount: '',
            email: '',
            profileImage: '',
            introduction: '',
        };
        return 'userPatch';
    }

    // home
    @ApiTags('/home')
    @Get()
    home(): string {
        return 'home';
    }

    // video
    // 전체 비디오 가져오기
    @ApiTags('/video')
    @Get('video')
    videoGet(): string {
        const videoData = {
            thumbnail: '',
            runTime: '',
            videoId: '',
            videoTitle: '',
            channelImage: '',
            channelName: '',
            vemoCount: '',
            category: '',
        };
        return 'videoGet';
    }

    // 비디오 아이디로 비디오 하나 가져오기
    @ApiTags('/video')
    @Get('video/:videoId')
    videoGetVideoId(): string {
        const videoData = {
            // youtube response data
            thumbnail: '',
            runTime: '',
            videoId: '',
            videoTitle: '',
            channelImage: '',
            channelName: '',
            // service data
            vemoCount: '',
            category: '',
        };
        return 'videoGetVideoId';
    }

    //비디오 카테고리로 비디오 가져오기
    @ApiTags('/video')
    @Get('video/:category')
    videoGetCategory(): string {
        const videoCategoryData = {
            // youtube response data
            thumbnail: '',
            runTime: '',
            videoId: '',
            videoTitle: '',
            channelImage: '',
            channelName: '',
            // service data
            vemoCount: '',
            category: '',
        };
        return 'videoGetCategory';
    }

    // 비디오 추가하기
    @ApiTags('/video')
    @Post('video')
    videoPost(): string {
        // videoId는 https://youtu.be/wXhTHyIgQ_U?si=BdnAq85jL9Ww_-9j (링크복사 출력값) 중에 wXhTHyIgQ_U 이부분으로 하면 고유값 // si 파라미터 부분은 무슨 의미인지 모르겠음
        // 영상 링크에서 가공을 해서 request값을 넣어줘야할듯
        // yotube data api 사용해서 썸네일, 영상 타이틀, 유튜버 이미지, 유튜버 이름, 영상 시간 << youtube api response 값으로 db에 저장
        const videoData = {
            // youtube response data
            thumbnail: '',
            runTime: '',
            videoId: '',
            videoTitle: '',
            channelImage: '',
            channelName: '',
            // service data
            vemoCount: '',
            category: '',
        };
        return 'videoPost';
    }

    // 메인 페이지 카드 랜더링
    @ApiTags('/maincard')
    @Get('maincard')
    maincardGet(): string {
        const maincardData = {
            videoId: '',
            thumbnail: '',
            runTime: '',
            videoTitle: '',
            channelImage: '',
            channelName: '',
            vemoCount: '',
            category: '',
        };
        return 'maincardGet';
    }

    // 마이 페이지 카드 렌더링
    @ApiTags('/mycard')
    @Get('mycard')
    mycardGet(): string {
        const mycardData = {
            videoId: '',
            thumbnail: '',
            runTime: '',
            videoTitle: '',
            author: '',
            authorImage: '',
            remainTime: '',
            progress: '',
            category: '',
        };
        return 'mycardGet';
    }

    //capture
    @ApiTags('/capture')
    @Get('capture')
    capture(): string {
        return 'capture';
    }

    @ApiTags('/capture')
    @Post('capture')
    capturePost(): string {
        return 'capturePost';
    }

    @ApiTags('/capture')
    @Delete('capture')
    captureDelete(): string {
        return 'captureDelete';
    }

    @ApiTags('/capture')
    @Get('partialCapture')
    partialCapture(): string {
        return 'partialCapture';
    }

    @ApiTags('/capture')
    @Post('partialCapture')
    partialCapturePost(): string {
        return 'partialCapturePost';
    }

    @ApiTags('/capture')
    @Delete('partialCapture')
    partialCaptureDelete(): string {
        return 'partialCaptureDelete';
    }
    // 메모장(memo) 관련 API
    @ApiTags('/memo')
    @Get('memo')
    memoGet(): string {
        // 사용자의 모든 메모장 목록 조회
        const memoData = {
            title: '',
            description: '',
            author: '',
            createdAt: '',
            updatedAt: '',
            viewCount: '',
            forkCount: '',
        };
        return 'memoGet';
    }

    @ApiTags('/memo')
    @Get('memo/:memoId')
    memoGetMemoId(): string {
        // 특정 메모장의 상세 정보와 포함된 메모 블록들 조회
        const memoData = {
            title: '',
            description: '',
            author: '',
            createdAt: '',
            updatedAt: '',
            viewCount: '',
            forkCount: '',
        };
        return 'memoGetMemoId';
    }

    @ApiTags('/memo')
    @Post('memo')
    memoPost(): string {
        // 새로운 메모장 생성
        const memoData = {
            title: '',
            description: '',
            author: '',
            createdAt: '',
            updatedAt: '',
            viewCount: '',
            forkCount: '',
        };
        return 'memoPost';
    }

    @ApiTags('/memo')
    @Patch('memo/:memoId')
    memoPatchMemoId(): string {
        // 메모장 정보 수정 (제목 등)
        return 'memoPatchMemoId';
    }

    // 메모 블록 관련 API
    @ApiTags('/memo')
    @Get('memo/:memoId/block')
    memoGetMemoIdBlock(): string {
        // 특정 메모장의 모든 메모 블록 조회
        return 'memoGetMemoIdBlock';
    }

    @ApiTags('/memo')
    @Post('memo/:memoId/block')
    memoPostMemoIdBlock(): string {
        // 특정 메모장에 새 메모 블록 생성
        return 'memoPostMemoIdBlock';
    }

    @ApiTags('/memo')
    @Patch('memo/:memoId/block')
    memoPatchMemoIdBlock(): string {
        // 메모 블록 내용 수정
        return 'memoPatchMemoIdBlock';
    }

    @ApiTags('/memo')
    @Delete('memo/:memoId/block')
    memoDeleteMemoIdBlock(): string {
        // 메모 블록 삭제
        return 'memoDeleteMemoIdBlock';
    }

    // 메모 스타일 관련 API
    @ApiTags('/memo')
    @Patch('memo/:memoId/style')
    memoPatchMemoIdStyle(): string {
        // 메모 스타일 일괄 수정 (폰트, 크기, 색상 등)
        return 'memoPatchMemoIdStyle';
    }

    //timestamp
    @ApiTags('/timestamp')
    @Get('timestamp')
    timestampGet(): string {
        return 'timestampGet';
    }

    @ApiTags('/timestamp')
    @Post('timestamp')
    timestampPost(): string {
        return 'timestampPost';
    }

    @ApiTags('/timestamp')
    @Delete('timestamp')
    timestampDelete(): string {
        return 'timestampDelete';
    }

    //draw
    @ApiTags('/draw')
    @Get('draw')
    draw(): string {
        return 'draw';
    }

    @ApiTags('/draw')
    @Get('draw/:id')
    drawGetId(): string {
        return 'drawGetId';
    }

    @ApiTags('/draw')
    @Post('draw/:id')
    drawPostId(): string {
        return 'drawPostId';
    }

    @ApiTags('/draw')
    @Patch('draw/:id')
    drawPatchId(): string {
        return 'drawPatchId';
    }

    @ApiTags('/draw')
    @Delete('draw/:id')
    drawDeleteId(): string {
        return 'drawDeleteId';
    }

    //extract
    @ApiTags('/extract')
    @Get('extract')
    extract(): string {
        return 'extract';
    }

    //summary
    @ApiTags('/summary')
    @Get('summary')
    summary(): string {
        return 'summary';
    }

    @ApiTags('/summary')
    @Post('summary')
    summaryPost(): string {
        return 'summaryPost';
    }

    //chat
    @ApiTags('/chat')
    @Get('chat')
    chat(): string {
        //작성자 이름, 메시지, 채팅방 아이디, 작성 시간
        return 'chat';
    }

    @ApiTags('/chat')
    @Post('chat')
    chatPost(): string {
        // 메시지, 채팅방 아이디
        return 'chatPost';
    }

    // export
    @ApiTags('/export')
    @Get('export')
    export(): string {
        // 어떤 요약,메모 타이틀, 영상 타이틀, 형식, 파일이름, 파일 내용
        return 'export';
    }
}
