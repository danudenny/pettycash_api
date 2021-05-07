import { Module } from '@nestjs/common';
import { PingController } from '../controllers/v1/other.controller';
import { OtherService } from '../services/v1/other.service';

@Module({
  controllers: [PingController],
  providers: [OtherService],
})
export class OtherModule {}
