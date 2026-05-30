import { WebSocketGateway, WebSocketServer, SubscribeMessage, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@/common/services/prisma.service';

@Injectable()
@WebSocketGateway({ cors: { origin: '*' } })
export class WebSocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private logger = new Logger('WebSocketGateway');
  private userSockets: Map<string, Set<string>> = new Map();

  constructor(private prisma: PrismaService) {}

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
    // Remove user socket mapping
    for (const [userId, socketIds] of this.userSockets) {
      socketIds.delete(client.id);
      if (socketIds.size === 0) {
        this.userSockets.delete(userId);
      }
    }
  }

  @SubscribeMessage('user:connect')
  handleUserConnect(client: Socket, data: { userId: string; organizationId: string }) {
    const { userId, organizationId } = data;
    
    // Store user-socket mapping
    if (!this.userSockets.has(userId)) {
      this.userSockets.set(userId, new Set());
    }
    this.userSockets.get(userId).add(client.id);

    // Join user-specific room
    client.join(`user:${userId}`);
    client.join(`org:${organizationId}`);

    this.logger.log(`User ${userId} connected`);
  }

  /**
   * Broadcast activity update to organization
   */
  broadcastActivityUpdate(organizationId: string, activity: any) {
    this.server.to(`org:${organizationId}`).emit('activity:update', {
      timestamp: new Date().toISOString(),
      activity,
    });
  }

  /**
   * Broadcast pipeline update
   */
  broadcastPipelineUpdate(organizationId: string, pipelineUpdate: any) {
    this.server.to(`org:${organizationId}`).emit('pipeline:update', {
      timestamp: new Date().toISOString(),
      update: pipelineUpdate,
    });
  }

  /**
   * Send real-time notification
   */
  sendRealTimeNotification(userId: string, notification: any) {
    this.server.to(`user:${userId}`).emit('notification:new', {
      timestamp: new Date().toISOString(),
      notification,
    });
  }

  /**
   * Broadcast investor update
   */
  broadcastInvestorUpdate(organizationId: string, investorId: string, update: any) {
    this.server.to(`org:${organizationId}`).emit('investor:update', {
      investorId,
      timestamp: new Date().toISOString(),
      update,
    });
  }

  /**
   * Broadcast startup update
   */
  broadcastStartupUpdate(organizationId: string, startupId: string, update: any) {
    this.server.to(`org:${organizationId}`).emit('startup:update', {
      startupId,
      timestamp: new Date().toISOString(),
      update,
    });
  }

  /**
   * Get active users count
   */
  getActiveUsersCount(organizationId: string): number {
    return Array.from(this.userSockets.values()).filter((socketIds) => socketIds.size > 0).length;
  }

  /**
   * Get online status
   */
  getOnlineStatus(userId: string): boolean {
    return this.userSockets.has(userId) && (this.userSockets.get(userId)?.size ?? 0) > 0;
  }
}
