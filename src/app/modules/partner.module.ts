import { Attachment } from './../../model/attachment.entity';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Partner } from '../../model/partner.entity';
import { PartnerController } from '../controllers/v1/partner.controller';
import { PartnerService } from '../services/v1/partner.service';

@Module({
  imports: [TypeOrmModule.forFeature([Partner, Attachment])],
  providers: [PartnerService],
  controllers: [PartnerController],
  exports: [],
})
export class PartnerModule {}
