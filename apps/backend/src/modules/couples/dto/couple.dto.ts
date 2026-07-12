import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsDateString } from 'class-validator';

export class PairDto {
  @ApiProperty({ example: 'clx123abc', description: "Your partner's invite code" })
  @IsString()
  inviteCode: string;
}

export class UpdateCoupleDto {
  @ApiProperty({ required: false, example: '2023-06-14' })
  @IsOptional()
  @IsDateString()
  anniversary?: string;
}
