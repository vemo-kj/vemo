import { Test, TestingModule } from '@nestjs/testing';
import { PlaylistService } from './playlist.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Playlist } from './entities/playlist.entity';

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

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                PlaylistService,
                {
                    provide: getRepositoryToken(Playlist),
                    useValue: createMockRepository(),
                },
            ],
        }).compile();

        service = module.get<PlaylistService>(PlaylistService);
        playlistRepository = module.get<MockRepository<Playlist>>(getRepositoryToken(Playlist));
    });

    describe('getPlaylistsByUser', () => {
        it('사용자의 모든 재생목록을 성공적으로 조회해야 한다', async () => {
            const userId = 1;
            const playlistsList: Playlist[] = [
                {
                    id: 1,
                    name: 'My Playlist 1',
                    user: { id: userId } as any,
                    videos: [],
                },
                {
                    id: 2,
                    name: 'My Playlist 2',
                    user: { id: userId } as any,
                    videos: [],
                },
            ];

            playlistRepository.find.mockResolvedValue(playlistsList);

            const result = await service.getPlaylistsByUser(userId);

            expect(playlistRepository.find).toHaveBeenCalledWith({
                where: { user: { id: userId } },
                relations: ['videos'],
            });
            expect(result).toEqual(playlistsList);
        });

        it('사용자가 재생목록을 가지고 있지 않을 경우 NotFoundException을 던져야 한다', async () => {
            const userId = 999;

            playlistRepository.find.mockResolvedValue([]);

            await expect(service.getPlaylistsByUser(userId)).rejects.toThrow(
                `User with ID ${userId} has no playlists`,
            );
            expect(playlistRepository.find).toHaveBeenCalledWith({
                where: { user: { id: userId } },
                relations: ['videos'],
            });
        });
    });
});
