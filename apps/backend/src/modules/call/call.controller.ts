import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { CallService } from './call.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('call')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('call')
export class CallController {
  constructor(private readonly callService: CallService) {}

  @Get('room')
  getRoom(@CurrentUser('userId') userId: string) {
    return this.callService.getRoom(userId);
  }
}
