import { SubscribeMessage, WebSocketGateway } from '@nestjs/websockets';

@WebSocketGateway({
    namespace: 'video',
    cors: {
        origin: 'http://localhost:3000',
        methods: ['GET', 'POST'],
        allowedHeaders: [
            'Content-Type',
            'Authorization',
            'Origin',
            'Accept',
            'X-Requested-With',
            'Range',
            'Access-Control-Allow-Origin',
        ],
        credentials: true,
    },
    pingTimeout: 5000,
    pingInterval: 10000,
})
export class VideoGateway {
    @SubscribeMessage('stream')
    handleMessage(client: any, payload: any): string {
        return 'Hello world!';
    }
}
