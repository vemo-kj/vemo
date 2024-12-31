import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Playlist } from './entities/playlist.entity';

@Injectable()
export class PlaylistService {
    constructor(
        @InjectRepository(Playlist) private readonly playlistRepository: Repository<Playlist>,
    ) {}

    /**
     * 사용자 ID로 재생목록 조회
     * @param userId 사용자 ID
     * @returns 재생목록 목록
     */
    async getPlaylistsByUser(userId: number): Promise<Playlist[]> {
        const playlists = await this.playlistRepository.find({
            where: { user: { id: userId } },
            relations: ['videos'],
        });

        if (!playlists || playlists.length === 0) {
            throw new NotFoundException(`User with ID ${userId} has no playlists`);
        }

        return playlists;
    }
}
