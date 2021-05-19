import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  Query,
  Req,
  Res,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiConsumes,
  ApiCreatedResponse,
  ApiInternalServerErrorResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { Response } from 'express';
import { AttachmentType } from '../../../model/utils/enum';
import { FindPartnerIdParams, FindAttachmentIdParams } from '../../domain/common/findId-param.dto';
import { CreatePartnerAttachmentDTO } from '../../domain/partner/create-attachment.dto';
import { CreatePartnerDTO } from '../../domain/partner/create.dto';
import { QueryPartnerDTO } from '../../domain/partner/partner.payload.dto';
import { PartnerAttachmentResponse } from '../../domain/partner/response-attachment.dto';
import {
  PartnerResponse,
  PartnerWithPaginationResponse,
} from '../../domain/partner/response.dto';
import { UpdatePartnerDTO } from '../../domain/partner/update.dto';
import { PartnerService } from '../../services/v1/partner.service';

@Controller('v1/partners')
@ApiTags('Partner')
@ApiInternalServerErrorResponse({ description: 'General Error' })
export class PartnerController {
  constructor(private svc: PartnerService) {}

  @Get()
  @ApiOperation({ summary: 'List all Partners' })
  @ApiOkResponse({ type: PartnerWithPaginationResponse })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  public async list(@Query() query: QueryPartnerDTO) {
    return await this.svc.list(query);
  }

  @Get('check-partner')
  @ApiOperation({ summary: 'List all Partners' })
  @ApiOkResponse({ type: PartnerWithPaginationResponse })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  public async activePartner() {
    return await this.svc.updatePartnerActive();
  }

  @Post()
  @ApiOperation({ summary: 'Create Partner' })
  @ApiCreatedResponse({
    description: 'Partner successfully created',
    type: PartnerResponse,
  })
  @ApiBadRequestResponse({ description: 'Failed to create partner' })
  @ApiBody({ type: CreatePartnerDTO })
  public async create(@Body() payload: CreatePartnerDTO) {
    return await this.svc.create(payload);
  }

  @Get('/:id')
  @ApiOperation({ summary: 'Get partner detail' })
  @ApiOkResponse({
    description: 'Get partner',
    type: PartnerResponse,
  })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  @ApiNotFoundResponse({ description: 'Partner not found' })
  public async get(@Param('id', new ParseUUIDPipe()) id: string) {
    return await this.svc.get(id);
  }

  @Put('/:id')
  @ApiOperation({ summary: 'Update Partner' })
  @ApiOkResponse({ description: 'Partner successfully updated' })
  @ApiBadRequestResponse({ description: 'Failed to update partner' })
  @ApiBody({ type: UpdatePartnerDTO })
  public async update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() payload: UpdatePartnerDTO,
  ) {
    return await this.svc.update(id, payload);
  }

  @Delete('/:id')
  @ApiOperation({ summary: 'Delete Partner' })
  @ApiNoContentResponse({ description: 'Partner successfully deleted' })
  @ApiBadRequestResponse({ description: 'Failed to delete partner' })
  @ApiNotFoundResponse({ description: 'Partner not found' })
  public async delete(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Res() res: Response,
  ) {
    await this.svc.delete(id);
    return res.status(HttpStatus.NO_CONTENT).json();
  }

  @Put('/:id/approve')
  @ApiOperation({ summary: 'Approve Partner' })
  @ApiOkResponse({
    description: 'Partner successfully approved',
    type: PartnerResponse,
  })
  @ApiBadRequestResponse({ description: 'Failed to approve partner' })
  public async approve(@Param('id', new ParseUUIDPipe()) id: string) {
    return await this.svc.approve(id);
  }

  @Post('/:id/attachments')
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Create Partner Attachment' })
  @UseInterceptors(FilesInterceptor('attachments'))
  @ApiCreatedResponse({ type: PartnerAttachmentResponse })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  @ApiBody({ type: CreatePartnerAttachmentDTO })
  public async createAttachment(
    @Param('id', new ParseUUIDPipe()) id: string,
    @UploadedFiles() attachments: any,
    @Body() body
  ) {
    return await this.svc.createAttachment(id, attachments, body['attachmentType']);
  }

  @Delete('/:partnerId/attachments/:attachmentId')
  @ApiParam({ name: 'attachmentId' })
  @ApiParam({ name: 'partnerId' })
  @ApiOperation({ summary: 'Delete Partner Attachment' })
  @ApiNoContentResponse({ description: 'Successfully delete attachment' })
  public async deleteAttachment(
    @Param() { partnerId }: FindPartnerIdParams,
    @Param() { attachmentId }: FindAttachmentIdParams,
    @Res() res: Response,
  ) {
    await this.svc.deleteAttachment(partnerId, attachmentId);
    return res.status(HttpStatus.NO_CONTENT).json();
  }
}
