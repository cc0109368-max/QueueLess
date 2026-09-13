import { Server as HttpServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import { SocketEvent } from '@queueless/types';

export class SocketManager {
  private static instance: SocketManager;
  private io: SocketIOServer | null = null;

  private constructor() {}

  public static getInstance(): SocketManager {
    if (!SocketManager.instance) {
      SocketManager.instance = new SocketManager();
    }
    return SocketManager.instance;
  }

  public initialize(server: HttpServer): SocketIOServer {
    this.io = new SocketIOServer(server, {
      cors: {
        origin: '*',
        methods: ['GET', 'POST'],
      },
    });

    this.io.on('connection', (socket: Socket) => {
      console.log(`[Socket.IO] Client connected: ${socket.id}`);

      socket.on(SocketEvent.JOIN_SHOP_ROOM, ({ shopId }: { shopId: string }) => {
        if (shopId) {
          const room = `shop:${shopId}`;
          socket.join(room);
          console.log(`[Socket.IO] ${socket.id} joined room ${room}`);
        }
      });

      socket.on(SocketEvent.JOIN_COUNTER_ROOM, ({ counterId }: { counterId: string }) => {
        if (counterId) {
          const room = `counter:${counterId}`;
          socket.join(room);
          console.log(`[Socket.IO] ${socket.id} joined room ${room}`);
        }
      });

      socket.on('disconnect', () => {
        console.log(`[Socket.IO] Client disconnected: ${socket.id}`);
      });
    });

    return this.io;
  }

  public emitToShop(shopId: string, event: SocketEvent | string, data: any): void {
    if (this.io) {
      this.io.to(`shop:${shopId}`).emit(event, data);
    }
  }

  public emitToCounter(counterId: string, event: SocketEvent | string, data: any): void {
    if (this.io) {
      this.io.to(`counter:${counterId}`).emit(event, data);
    }
  }

  public emitToAll(event: SocketEvent | string, data: any): void {
    if (this.io) {
      this.io.emit(event, data);
    }
  }
}

export const socketManager = SocketManager.getInstance();
