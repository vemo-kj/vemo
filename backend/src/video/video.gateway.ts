import {
    OnGatewayConnection,
    OnGatewayDisconnect,
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

interface RoomState {
    viewers: string[];
    currentTime: number;
    isPlaying: boolean;
    lastUpdate: number;
}

@WebSocketGateway({
    namespace: '/video',
    cors: {
        origin: 'http://localhost:3000',
        credentials: true,
    },
})
export class VideoGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;

    private rooms: Map<string, RoomState> = new Map();

    handleConnection(client: Socket) {
        console.log(`클라이언트 연결됨: ${client.id}`);
    }

    handleDisconnect(client: Socket) {
        console.log(`클라이언트 연결 해제: ${client.id}`);
        // 모든 방에서 클라이언트 제거
        this.rooms.forEach((state, roomId) => {
            const index = state.viewers.indexOf(client.id);
            if (index !== -1) {
                state.viewers.splice(index, 1);
                this.server.to(roomId).emit('viewerUpdate', {
                    count: state.viewers.length,
                });
            }
        });
    }

    @SubscribeMessage('joinRoom')
    handleJoinRoom(client: Socket, payload: { videoId: string }) {
        const { videoId } = payload;

        // 이전 방에서 나가기
        Array.from(client.rooms).forEach(room => {
            if (room !== client.id) {
                const roomState = this.rooms.get(room);
                if (roomState) {
                    const index = roomState.viewers.indexOf(client.id);
                    if (index !== -1) {
                        roomState.viewers.splice(index, 1);
                        this.server.to(room).emit('viewerUpdate', {
                            count: roomState.viewers.length,
                        });
                    }
                }
                client.leave(room);
            }
        });

        // 새로운 방 참여
        client.join(videoId);

        // 방 상태 초기화 또는 가져오기
        if (!this.rooms.has(videoId)) {
            this.rooms.set(videoId, {
                viewers: [client.id],
                currentTime: 0,
                isPlaying: false,
                lastUpdate: Date.now(),
            });
        } else {
            const roomState = this.rooms.get(videoId)!;
            if (!roomState.viewers.includes(client.id)) {
                roomState.viewers.push(client.id);
            }
        }

        // 시청자 수 업데이트와 함께 현재 상태 브로드캐스트
        const roomState = this.rooms.get(videoId)!;
        this.server.to(videoId).emit('viewerUpdate', {
            count: roomState.viewers.length,
            currentTime: roomState.currentTime,
            isPlaying: roomState.isPlaying,
        });
    }

    @SubscribeMessage('videoStateChange')
    handleVideoStateChange(
        client: Socket,
        payload: { videoId: string; currentTime: number; isPlaying: boolean },
    ) {
        const { videoId, currentTime, isPlaying } = payload;
        const roomState = this.rooms.get(videoId);

        if (roomState) {
            const now = Date.now();
            // 마지막 업데이트로부터 500ms 이상 지났을 때만 상태 업데이트
            if (now - roomState.lastUpdate > 500) {
                roomState.currentTime = currentTime;
                roomState.isPlaying = isPlaying;
                roomState.lastUpdate = now;

                // 상태 변경을 방의 다른 사용자들에게 브로드캐스트
                client.to(videoId).emit('syncVideoState', { currentTime, isPlaying });
            }
        }
    }

    @SubscribeMessage('seekVideo')
    handleSeekVideo(client: Socket, payload: { videoId: string; currentTime: number }) {
        const { videoId, currentTime } = payload;
        const roomState = this.rooms.get(videoId);

        if (roomState) {
            const now = Date.now();
            // 마지막 업데이트로부터 500ms 이상 지났을 때만 상태 업데이트
            if (now - roomState.lastUpdate > 1500) {
                roomState.currentTime = currentTime;
                roomState.lastUpdate = now;

                // 시간 변경을 방의 다른 사용자들에게 브로드캐스트
                client.to(videoId).emit('syncVideoTime', { currentTime });
            }
        }
    }
}
