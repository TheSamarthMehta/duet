import { Body, Controller, Delete, Get, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { CouplesService } from './couples.service';
import { PairDto, UpdateCoupleDto } from './dto/couple.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('couples')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('couples')
export class CouplesController {
  constructor(private readonly couplesService: CouplesService) {}

  @Get('me')
  getMyCouple(@CurrentUser('userId') userId: string) {
    return this.couplesService.getMyCouple(userId);
  }

  @Post('pair')
  pair(@CurrentUser('userId') userId: string, @Body() dto: PairDto) {
    return this.couplesService.pair(userId, dto.inviteCode);
  }

  @Patch('me')
  update(@CurrentUser('userId') userId: string, @Body() dto: UpdateCoupleDto) {
    return this.couplesService.update(userId, dto.anniversary);
  }

  @Delete('me')
  unpair(@CurrentUser('userId') userId: string) {
    return this.couplesService.unpair(userId);
  }
}
