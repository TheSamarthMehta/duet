import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { Couple } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

const partnerSelect = {
  id: true,
  name: true,
  email: true,
  avatarUrl: true,
};

@Injectable()
export class CouplesService {
  constructor(private prisma: PrismaService) {}

  /** Finds the accepted couple a user belongs to, if any. Used by chat/call. */
  async getCoupleForUser(userId: string): Promise<Couple | null> {
    return this.prisma.couple.findFirst({
      where: {
        status: 'ACCEPTED',
        OR: [{ user1Id: userId }, { user2Id: userId }],
      },
    });
  }

  partnerIdOf(couple: Couple, userId: string): string {
    return couple.user1Id === userId ? couple.user2Id : couple.user1Id;
  }

  async pair(userId: string, inviteCode: string) {
    const partner = await this.prisma.user.findUnique({ where: { inviteCode } });
    if (!partner) throw new NotFoundException('Invalid invite code');
    if (partner.id === userId) throw new BadRequestException('You cannot pair with yourself');

    const [mine, theirs] = await Promise.all([
      this.getCoupleForUser(userId),
      this.getCoupleForUser(partner.id),
    ]);
    if (mine) throw new ConflictException('You already have a partner');
    if (theirs) throw new ConflictException('That person already has a partner');

    // Entering the partner's private code is itself consent, so we accept immediately.
    await this.prisma.couple.create({
      data: { user1Id: partner.id, user2Id: userId, status: 'ACCEPTED' },
    });

    return this.getMyCouple(userId);
  }

  async getMyCouple(userId: string) {
    const couple = await this.prisma.couple.findFirst({
      where: {
        status: 'ACCEPTED',
        OR: [{ user1Id: userId }, { user2Id: userId }],
      },
      include: {
        user1: { select: partnerSelect },
        user2: { select: partnerSelect },
      },
    });

    if (!couple) return { paired: false, couple: null };

    const partner = couple.user1Id === userId ? couple.user2 : couple.user1;
    const daysTogether = Math.floor(
      (Date.now() - new Date(couple.createdAt).getTime()) / (1000 * 60 * 60 * 24)
    );

    return {
      paired: true,
      couple: {
        id: couple.id,
        partner,
        anniversary: couple.anniversary,
        daysTogether,
        since: couple.createdAt,
      },
    };
  }

  async update(userId: string, anniversary?: string) {
    const couple = await this.getCoupleForUser(userId);
    if (!couple) throw new NotFoundException('You are not paired yet');

    await this.prisma.couple.update({
      where: { id: couple.id },
      data: { anniversary: anniversary ? new Date(anniversary) : null },
    });
    return this.getMyCouple(userId);
  }

  async unpair(userId: string) {
    const couple = await this.getCoupleForUser(userId);
    if (!couple) throw new NotFoundException('You are not paired yet');
    await this.prisma.couple.delete({ where: { id: couple.id } });
    return { success: true };
  }
}
