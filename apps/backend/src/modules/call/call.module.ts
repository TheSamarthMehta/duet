import { Module } from '@nestjs/common';
import { CallService } from './call.service';
import { CallController } from './call.controller';
import { CouplesModule } from '../couples/couples.module';

@Module({
  imports: [CouplesModule],
  controllers: [CallController],
  providers: [CallService],
})
export class CallModule {}
