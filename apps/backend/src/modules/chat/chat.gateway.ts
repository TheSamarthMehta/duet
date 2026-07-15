import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { JwtService } from '@nestjs/jwt';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';
import { CouplesService } from '../couples/couples.service';

interface AuthedSocket extends Socket {
  userId?: string;
  coupleId?: string;
  room?: string;
}

@WebSocketGateway({ cors: { origin: '*' } })
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;

  constructor(
    private jwt: JwtService,
    private chat: ChatService,
    private couples: CouplesService
  ) {}

  async handleConnection(client: AuthedSocket) {
    try {
      const token =
        client.handshake.auth?.token ||
        (client.handshake.headers.authorization || '').replace('Bearer ', '');
      const payload = await this.jwt.verifyAsync(token, {
        secret: process.env.JWT_SECRET || 'dev_secret_change_me',
      });
      client.userId = payload.sub;

      const couple = await this.couples.getCoupleForUser(payload.sub);
      if (couple) {
        client.coupleId = couple.id;
        client.room = `couple:${couple.id}`;
        client.join(client.room);

        // Tell the partner we're online...
        client.to(client.room).emit('online', { userId: client.userId });
        // ...and tell us whether they already were. Without this, whoever
        // connects first never learns about the other.
        client.emit('presence', { partnerOnline: await this.isPartnerOnline(client) });
      }
    } catch {
      client.disconnect();
    }
  }

  handleDisconnect(client: AuthedSocket) {
    if (client.room) {
      client.to(client.room).emit('offline', { userId: client.userId });
    }
  }

  /** True when someone other than `client` is in the couple's room. */
  private async isPartnerOnline(client: AuthedSocket): Promise<boolean> {
    if (!client.room) return false;
    const sockets = await this.server.in(client.room).fetchSockets();
    return sockets.some((s) => s.id !== client.id);
  }

  @SubscribeMessage('sendMessage')
  async onSendMessage(
    @ConnectedSocket() client: AuthedSocket,
    @MessageBody() data: { content: string; imageUrl?: string; clientId?: string }
  ) {
    if (!client.userId || !client.room) return;
    const message = await this.chat.createMessage(client.userId, data.content, data.imageUrl);
    // clientId is echoed back so the sender can match this against the message
    // it rendered optimistically instead of showing it twice.
    this.server.to(client.room).emit('receiveMessage', { ...message, clientId: data.clientId });
    return message;
  }

  @SubscribeMessage('typing')
  onTyping(@ConnectedSocket() client: AuthedSocket) {
    if (client.room) client.to(client.room).emit('typing', { userId: client.userId });
  }

  @SubscribeMessage('stopTyping')
  onStopTyping(@ConnectedSocket() client: AuthedSocket) {
    if (client.room) client.to(client.room).emit('stopTyping', { userId: client.userId });
  }

  @SubscribeMessage('messageSeen')
  async onMessageSeen(@ConnectedSocket() client: AuthedSocket) {
    if (!client.userId || !client.room) return;
    const seenAt = new Date().toISOString();
    await this.chat.markSeen(client.userId);
    client.to(client.room).emit('messageSeen', { userId: client.userId, seenAt });
  }

  @SubscribeMessage('ping:presence')
  async onPresencePing(@ConnectedSocket() client: AuthedSocket) {
    if (!client.room) return;
    client.to(client.room).emit('online', { userId: client.userId });
    client.emit('presence', { partnerOnline: await this.isPartnerOnline(client) });
  }

  // ---- Video call signaling (Jitsi room coordination) ----

  @SubscribeMessage('call:start')
  onCallStart(
    @ConnectedSocket() client: AuthedSocket,
    @MessageBody() data: { room: string }
  ) {
    if (client.room) {
      client.to(client.room).emit('call:incoming', {
        room: data.room,
        fromUserId: client.userId,
      });
    }
  }

  @SubscribeMessage('call:end')
  onCallEnd(@ConnectedSocket() client: AuthedSocket) {
    if (client.room) {
      client.to(client.room).emit('call:ended', { fromUserId: client.userId });
    }
  }
}
