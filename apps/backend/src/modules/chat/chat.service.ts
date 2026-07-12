import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CouplesService } from '../couples/couples.service';

@Injectable()
export class ChatService {
  constructor(
    private prisma: PrismaService,
    private couples: CouplesService
  ) {}

  async requireCouple(userId: string) {
    const couple = await this.couples.getCoupleForUser(userId);
    if (!couple) throw new ForbiddenException('You are not paired yet');
    return couple;
  }

  async getHistory(userId: string, limit = 50, before?: string) {
    const couple = await this.requireCouple(userId);
    const messages = await this.prisma.message.findMany({
      where: {
        coupleId: couple.id,
        ...(before ? { createdAt: { lt: new Date(before) } } : {}),
      },
      orderBy: { createdAt: 'desc' },
      take: Math.min(limit, 100),
    });
    return messages.reverse();
  }

  async createMessage(userId: string, content: string, imageUrl?: string) {
    const couple = await this.requireCouple(userId);
    return this.prisma.message.create({
      data: { coupleId: couple.id, senderId: userId, content, imageUrl },
    });
  }

  async markSeen(userId: string) {
    const couple = await this.couples.getCoupleForUser(userId);
    if (!couple) return { updated: 0 };
    const result = await this.prisma.message.updateMany({
      where: { coupleId: couple.id, senderId: { not: userId }, seenAt: null },
      data: { seenAt: new Date() },
    });
    return { updated: result.count, coupleId: couple.id };
  }
}
