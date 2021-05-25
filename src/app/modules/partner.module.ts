import { Attachment } from './../../model/attachment.entity';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Partner } from '../../model/partner.entity';
import { PartnerController } from '../controllers/v1/partner.controller';
import { PartnerService } from '../services/v1/partner.service';
import { AttachmentType } from '../../model/attachment-type.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Partner, Attachment, AttachmentType])],
  providers: [PartnerService],
  controllers: [PartnerController],
  exports: [],
})
export class PartnerModule {}
