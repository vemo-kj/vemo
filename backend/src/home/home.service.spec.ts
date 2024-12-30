// src/home/home.service.spec.ts

import { Test, TestingModule } from '@nestjs/testing';
import { HomeService } from './home.service';
import { Repository } from 'typeorm';
import { Video } from '../video/video.entity';
import { Channel } from '../channel/channel.entity';
import { Memos } from '../memos/memos.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';

describe('HomeService', () => {
    let service: HomeService;
    let videoRepository: Repository<Video>;
    let memosRepository: Repository<Memos>;

    // Mock 데이터 정의
    const mockChannel: Channel = {
        id: 'channel1-id',
        thumbnails: 'http://example.com/channel1.jpg',
        title: 'Channel One',
        videos: [],
    };

    const mockVideos: Video[] = [
        {
            id: 'video1ABCDE1',
            title: 'Sample Video 1',
            thumbnails: 'http://example.com/thumb1.jpg',
            duration: '00:05:30',
            category: 'Education',
            channel: mockChannel,
            memos: [],
        },
        {
            id: 'video2ABCDE2',
            title: 'Sample Video 2',
            thumbnails: 'http://example.com/thumb2.jpg',
            duration: '00:03:45',
            category: 'Entertainment',
            channel: mockChannel,
            memos: [],
        },
    ];

    const mockVideoRepository = {
        find: jest.fn(),
    };

    const mockMemosRepository = {
        count: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                HomeService,
                {
                    provide: getRepositoryToken(Video),
                    useValue: mockVideoRepository,
                },
                {
                    provide: getRepositoryToken(Memos),
                    useValue: mockMemosRepository,
                },
            ],
        }).compile();

        service = module.get<HomeService>(HomeService);
        videoRepository = module.get<Repository<Video>>(getRepositoryToken(Video));
        memosRepository = module.get<Repository<Memos>>(getRepositoryToken(Memos));
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    // 모든 비디오를 정상적으로 반환하는 경우
    it('모든 비디오를 정상적으로 반환해야 한다', async () => {
        // Mock Repository의 find 메서드 설정
        mockVideoRepository.find.mockResolvedValue(mockVideos);

        // Mock memosRepository.count 설정
        mockMemosRepository.count.mockImplementation(
            ({
                where: {
                    video: { id },
                },
            }) => {
                if (id === 'video1ABCDE1') {
                    return Promise.resolve(2); // video1에 2개의 메모가 있음
                }
                return Promise.resolve(0); // 나머지 비디오에는 메모가 없음
            },
        );

        const result = await service.getAllVideos(1, 10);

        expect(videoRepository.find).toHaveBeenCalledWith({
            relations: ['channel'],
            order: { id: 'DESC' },
            skip: 0,
            take: 10,
        });

        expect(memosRepository.count).toHaveBeenCalledTimes(2);
        expect(memosRepository.count).toHaveBeenCalledWith({
            where: { video: { id: 'video1ABCDE1' } },
        });
        expect(memosRepository.count).toHaveBeenCalledWith({
            where: { video: { id: 'video2ABCDE2' } },
        });

        expect(result).toEqual({
            videos: [
                {
                    id: 'video1ABCDE1',
                    title: 'Sample Video 1',
                    thumbnails: 'http://example.com/thumb1.jpg',
                    duration: '00:05:30',
                    category: 'Education',
                    channel: {
                        id: 'channel1-id',
                        thumbnails: 'http://example.com/channel1.jpg',
                        title: 'Channel One',
                    },
                    vemoCount: 2, // 메모 수
                },
                {
                    id: 'video2ABCDE2',
                    title: 'Sample Video 2',
                    thumbnails: 'http://example.com/thumb2.jpg',
                    duration: '00:03:45',
                    category: 'Entertainment',
                    channel: {
                        id: 'channel1-id',
                        thumbnails: 'http://example.com/channel1.jpg',
                        title: 'Channel One',
                    },
                    vemoCount: 0, // 메모 수
                },
            ],
        });
    });

    // 비디오가 존재하지 않을 때 NotFoundException을 던지는 경우
    it('비디오가 존재하지 않을 때 NotFoundException을 던져야 한다', async () => {
        // Mock Repository의 find 메서드 설정
        mockVideoRepository.find.mockResolvedValue([]);

        await expect(service.getAllVideos(1, 10)).rejects.toThrow(NotFoundException);
        await expect(service.getAllVideos(1, 10)).rejects.toThrow('비디오가 존재하지 않습니다.');
    });

    // 특정 카테고리에 속한 비디오를 정상적으로 반환하는 경우
    it('특정 카테고리에 속한 비디오를 정상적으로 반환해야 한다', async () => {
        const category = 'Education';

        const filteredVideos = mockVideos.filter(video => video.category === category);

        // Mock Repository의 find 메서드 설정
        mockVideoRepository.find.mockResolvedValue(filteredVideos);

        // Mock memosRepository.count 설정
        mockMemosRepository.count.mockImplementation(
            ({
                where: {
                    video: { id },
                },
            }) => {
                if (id === 'video1ABCDE1') {
                    return Promise.resolve(2); // video1에 2개의 메모가 있음
                }
                return Promise.resolve(0);
            },
        );

        const result = await service.getVideosByCategory(category, 1, 10);

        expect(videoRepository.find).toHaveBeenCalledWith({
            where: { category },
            relations: ['channel'],
            order: { id: 'DESC' },
            skip: 0,
            take: 10,
        });

        expect(memosRepository.count).toHaveBeenCalledTimes(1);
        expect(memosRepository.count).toHaveBeenCalledWith({
            where: { video: { id: 'video1ABCDE1' } },
        });

        expect(result).toEqual({
            videos: [
                {
                    id: 'video1ABCDE1',
                    title: 'Sample Video 1',
                    thumbnails: 'http://example.com/thumb1.jpg',
                    duration: '00:05:30',
                    category: 'Education',
                    channel: {
                        id: 'channel1-id',
                        thumbnails: 'http://example.com/channel1.jpg',
                        title: 'Channel One',
                    },
                    vemoCount: 2, // 메모 수
                },
            ],
        });
    });

    // 특정 카테고리에 속한 비디오가 존재하지 않을 때 NotFoundException을 던지는 경우
    it('특정 카테고리에 속한 비디오가 존재하지 않을 때 NotFoundException을 던져야 한다', async () => {
        const category = 'NonExistentCategory';

        // Mock Repository의 find 메서드 설정
        mockVideoRepository.find.mockResolvedValue([]);

        await expect(service.getVideosByCategory(category, 1, 10)).rejects.toThrow(
            NotFoundException,
        );
        await expect(service.getVideosByCategory(category, 1, 10)).rejects.toThrow(
            `카테고리 '${category}'에 해당하는 비디오가 존재하지 않습니다.`,
        );
    });

    // vemoCount를 정확하게 계산해야 한다
    it('vemoCount를 정확하게 계산해야 한다', async () => {
        // Mock Repository의 find 메서드 설정
        mockVideoRepository.find.mockResolvedValue([mockVideos[0]]);

        // Mock memosRepository.count 설정
        mockMemosRepository.count.mockResolvedValue(3); // video1에 3개의 메모가 있음

        const result = await service.getAllVideos(1, 10);

        expect(videoRepository.find).toHaveBeenCalledWith({
            relations: ['channel'],
            order: { id: 'DESC' },
            skip: 0,
            take: 10,
        });

        expect(memosRepository.count).toHaveBeenCalledWith({
            where: { video: { id: 'video1ABCDE1' } },
        });

        expect(result).toEqual({
            videos: [
                {
                    id: 'video1ABCDE1',
                    title: 'Sample Video 1',
                    thumbnails: 'http://example.com/thumb1.jpg',
                    duration: '00:05:30',
                    category: 'Education',
                    channel: {
                        id: 'channel1-id',
                        thumbnails: 'http://example.com/channel1.jpg',
                        title: 'Channel One',
                    },
                    vemoCount: 3, // 메모 수
                },
            ],
        });
    });
});
