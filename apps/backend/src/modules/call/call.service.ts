import { Injectable, ForbiddenException } from '@nestjs/common';
import { CouplesService } from '../couples/couples.service';

@Injectable()
export class CallService {
  constructor(private couples: CouplesService) {}

  async getRoom(userId: string) {
    const couple = await this.couples.getCoupleForUser(userId);
    if (!couple) throw new ForbiddenException('You are not paired yet');

    // A stable, unguessable room name unique to this couple.
    const room = `duet-${couple.id.replace(/-/g, '')}`;
    return {
      room,
      domain: process.env.JITSI_DOMAIN || 'meet.jit.si',
      url: `https://${process.env.JITSI_DOMAIN || 'meet.jit.si'}/${room}`,
    };
  }
}
