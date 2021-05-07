import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AttachmentType } from "../../model/attachment-type.entity";
import { AttachmentTypeController } from "../controllers/v1/attachment-type.controller";
import { AttachmentTypeService } from "../services/v1/attachment-type.service";

@Module({
  imports: [TypeOrmModule.forFeature([AttachmentType])],
  providers: [AttachmentTypeService],
  controllers: [AttachmentTypeController],
  exports: [],
})
export class AttachmentTypeModule {}