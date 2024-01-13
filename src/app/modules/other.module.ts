import { Module } from '@nestjs/common';
import { OtherController } from '../controllers/v1/other.controller';
import { PingController } from '../controllers/v1/ping.controller';
import { OtherService } from '../services/v1/other.service';

@Module({
  controllers: [PingController, OtherController],
  providers: [OtherService],
})
export class OtherModule {}
