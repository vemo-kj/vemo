import { Test, TestingModule } from '@nestjs/testing';
import { PlaylistService } from './playlist.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Playlist } from './entities/playlist.entity';
import { Repository } from 'typeorm';
import { CreatePlaylistWithMemosDto } from '../home/dto/create-playlist-with-memos.dto';
import { UsersService } from '../users/users.service';
import { VideoService } from '../video/video.service';
import { Users } from '../users/users.entity';
import { Video } from '../video/video.entity';
import { Channel } from '../channel/channel.entity';
import { NotFoundException } from '@nestjs/common';

type MockRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;

const createMockRepository = <T = any>(): MockRepository<T> => ({
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    delete: jest.fn(),
});

describe('PlaylistService', () => {
    let service: PlaylistService;
    let playlistRepository: MockRepository<Playlist>;
    let usersService: UsersService;
    let videoService: VideoService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                PlaylistService,
                {
                    provide: getRepositoryToken(Playlist),
                    useValue: createMockRepository(),
                },
                {
                    provide: UsersService,
                    useValue: {
                        findById: jest.fn(),
                    },
                },
                {
                    provide: VideoService,
                    useValue: {
                        getVideosByIds: jest.fn(),
                    },
                },
            ],
        }).compile();

        service = module.get<PlaylistService>(PlaylistService);
        playlistRepository = module.get<MockRepository<Playlist>>(getRepositoryToken(Playlist));
        usersService = module.get<UsersService>(UsersService);
        videoService = module.get<VideoService>(VideoService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('createPlaylist', () => {
        it('재생목록을 성공적으로 생성해야 한다', async () => {
            const createPlaylistDto: CreatePlaylistWithMemosDto = {
                name: '내 재생목록',
                videoIds: ['video1', 'video2'],
            };
            const userId = 1;

            const mockUser: Users = {
                id: userId,
                name: '테스트 유저',
                nickname: '테스트 유저',
                email: 'test@example.com',
                password: 'hashedPassword',
                birth: new Date('1990-01-01'),
                gender: 'male',
                playlists: [],
                memos: [],
            };

            const mockVideos: Video[] = [
                {
                    id: 'video1',
                    title: '비디오 1',
                    thumbnails: 'http://example.com/video1.jpg',
                    duration: '00:10:00',
                    category: '교육',
                    channel: {
                        id: 'channel1',
                        title: '채널 1',
                        thumbnails: 'http://example.com/channel1.jpg',
                    } as Channel,
                    playlists: [],
                } as Video,
                {
                    id: 'video2',
                    title: '비디오 2',
                    thumbnails: 'http://example.com/video2.jpg',
                    duration: '00:15:00',
                    category: '엔터테인먼트',
                    channel: {
                        id: 'channel2',
                        title: '채널 2',
                        thumbnails: 'http://example.com/channel2.jpg',
                    } as Channel,
                    playlists: [],
                } as Video,
            ];

            (usersService.findById as jest.Mock).mockResolvedValue(mockUser);
            (videoService.getVideosByIds as jest.Mock).mockResolvedValue(mockVideos);

            const mockPlaylist = {
                id: 1,
                name: createPlaylistDto.name,
                user: mockUser,
                videos: mockVideos,
            } as Playlist;

            (playlistRepository.create as jest.Mock).mockReturnValue(mockPlaylist);
            (playlistRepository.save as jest.Mock).mockResolvedValue(mockPlaylist);

            const result = await service.createPlaylist(createPlaylistDto, userId);

            expect(usersService.findById).toHaveBeenCalledWith(userId);
            expect(videoService.getVideosByIds).toHaveBeenCalledWith(createPlaylistDto.videoIds);
            expect(playlistRepository.create).toHaveBeenCalledWith({
                name: createPlaylistDto.name,
                user: mockUser,
                videos: mockVideos,
            });
            expect(playlistRepository.save).toHaveBeenCalledWith(mockPlaylist);

            expect(result).toEqual({
                id: mockPlaylist.id,
                name: mockPlaylist.name,
                userId: mockUser.id,
                videos: mockVideos.map(video => ({
                    id: video.id,
                    title: video.title,
                    thumbnails: video.thumbnails,
                    duration: video.duration,
                    channel: {
                        id: video.channel.id,
                        title: video.channel.title,
                        thumbnails: video.channel.thumbnails,
                    },
                    category: video.category,
                })),
            });
        });

        it('존재하지 않는 사용자의 경우 NotFoundException을 던져야 한다', async () => {
            const createPlaylistDto: CreatePlaylistWithMemosDto = {
                name: '내 재생목록',
                videoIds: ['video1', 'video2'],
            };
            const userId = 999;

            (usersService.findById as jest.Mock).mockRejectedValue(
                new NotFoundException(`User with ID ${userId} not found`),
            );

            await expect(service.createPlaylist(createPlaylistDto, userId)).rejects.toThrow(
                `User with ID ${userId} not found`,
            );

            expect(usersService.findById).toHaveBeenCalledWith(userId);
            expect(videoService.getVideosByIds).not.toHaveBeenCalled();
            expect(playlistRepository.create).not.toHaveBeenCalled();
            expect(playlistRepository.save).not.toHaveBeenCalled();
        });
    });

    describe('getPlaylist', () => {
        it('재생목록을 성공적으로 조회해야 한다', async () => {
            const playlistId = 1;
            const mockPlaylist = {
                id: playlistId,
                name: '테스트 재생목록',
                user: {
                    id: 1,
                    nickname: '테스트 유저',
                } as Users,
                videos: [
                    {
                        id: 'video1',
                        title: '비디오 1',
                        thumbnails: 'thumbnail1.jpg',
                        duration: '10:00',
                        channel: {
                            id: 'channel1',
                            title: '채널 1',
                            thumbnails: 'channel1.jpg',
                        },
                    },
                ],
            } as Playlist;

            (playlistRepository.findOne as jest.Mock).mockResolvedValue(mockPlaylist);

            const result = await service.getPlaylist(playlistId);

            expect(playlistRepository.findOne).toHaveBeenCalledWith({
                where: { id: playlistId },
                relations: ['videos', 'user'],
            });
            expect(result).toEqual(mockPlaylist);
        });

        it('존재하지 않는 재생목록의 경우 NotFoundException을 던져야 한다', async () => {
            const playlistId = 999;

            (playlistRepository.findOne as jest.Mock).mockResolvedValue(null);

            await expect(service.getPlaylist(playlistId)).rejects.toThrow(
                `Playlist with ID ${playlistId} not found`,
            );

            expect(playlistRepository.findOne).toHaveBeenCalledWith({
                where: { id: playlistId },
                relations: ['videos', 'user'],
            });
        });
    });

    describe('getPlaylistsByUser', () => {
        it('사용자의 모든 재생목록을 성공적으로 조회해야 한다', async () => {
            const userId = 1;
            const mockUser: Users = {
                id: userId,
                name: '테스트 유저',
                nickname: '테스트 유저',
                email: 'test@example.com',
                password: 'hashedPassword',
                birth: new Date('1990-01-01'),
                gender: 'male',
                playlists: [],
                memos: [],
            };

            const mockPlaylists = [
                {
                    id: 1,
                    name: '재생목록 1',
                    user: mockUser,
                    videos: [
                        {
                            id: 'video1',
                            title: '비디오 1',
                            thumbnails: 'thumbnail1.jpg',
                            duration: '10:00',
                            channel: {
                                id: 'channel1',
                                title: '채널 1',
                                thumbnails: 'channel1.jpg',
                            },
                            category: '교육',
                        },
                    ],
                },
                {
                    id: 2,
                    name: '재생목록 2',
                    user: mockUser,
                    videos: [],
                },
            ] as Playlist[];

            (usersService.findById as jest.Mock).mockResolvedValue(mockUser);
            (playlistRepository.find as jest.Mock).mockResolvedValue(mockPlaylists);

            const result = await service.getPlaylistsByUser(userId);

            expect(usersService.findById).toHaveBeenCalledWith(userId);
            expect(playlistRepository.find).toHaveBeenCalledWith({
                where: { user: { id: userId } },
                relations: ['videos', 'videos.channel'],
            });

            expect(result).toEqual(
                mockPlaylists.map(playlist => ({
                    id: playlist.id,
                    name: playlist.name,
                    userId: mockUser.id,
                    videos: playlist.videos.map(video => ({
                        id: video.id,
                        title: video.title,
                        thumbnails: video.thumbnails,
                        duration: video.duration,
                        channel: {
                            id: video.channel.id,
                            title: video.channel.title,
                            thumbnails: video.channel.thumbnails,
                        },
                        category: video.category,
                    })),
                })),
            );
        });

        it('존재하지 않는 사용자의 경우 NotFoundException을 던져야 한다', async () => {
            const userId = 999;

            (usersService.findById as jest.Mock).mockRejectedValue(
                new NotFoundException(`User with ID ${userId} not found`),
            );

            await expect(service.getPlaylistsByUser(userId)).rejects.toThrow(
                `User with ID ${userId} not found`,
            );

            expect(usersService.findById).toHaveBeenCalledWith(userId);
            expect(playlistRepository.find).not.toHaveBeenCalled();
        });
    });
});
