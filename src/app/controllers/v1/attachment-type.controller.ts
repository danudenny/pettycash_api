import { AttachmentTypes } from './../../../model/utils/enum';
import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiBadRequestResponse, ApiOkResponse, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { AttachmentTypeDTO, CreateAttachmentTypeDTO, QueryAttachmentTypeDTO } from '../../domain/attachment-type/att-type.dto';
import { AttachmentTypeResponse } from '../../domain/attachment-type/att-type.response';
import FindIdParams from '../../domain/common/findId-param.dto';
import { AttachmentTypeService } from './../../services/v1/attachment-type.service';

@Controller('v1/attachment-type')
@ApiTags('Attachment Type')
export class AttachmentTypeController {
  constructor(private attTypeService: AttachmentTypeService) {}

  @Get('')
  @ApiOperation({ summary: 'List all Attachment Type' })
  @ApiOkResponse({ type: AttachmentTypeResponse })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  public async list(@Query() query: QueryAttachmentTypeDTO){
    return await this.attTypeService.get(query);
  }

  @Get('/:id')
  @ApiParam({ name: 'id' })
  @ApiOperation({ summary: 'List all Attachment Type' })
  @ApiOkResponse({ type: AttachmentTypeResponse })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  public async find(@Param() { id }: FindIdParams){
    return await this.attTypeService.find(id);
  }

  @Post('')
  @ApiOperation({ summary: 'Create Attachment Type' })
  @ApiOkResponse({ type: AttachmentTypeResponse })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  public async create(@Body() payload: CreateAttachmentTypeDTO) {
    return await this.attTypeService.create(payload);
  }

  @Patch(':id/update')
  @ApiParam({ name: 'id' })
  @ApiOperation({ summary: 'Edit Attachment Type' })
  @ApiOkResponse({ type: AttachmentTypeResponse })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  public async update(
    @Param() { id }: FindIdParams,
    @Body() payload: CreateAttachmentTypeDTO,
  ) {
    return await this.attTypeService.update(id, payload);
  }

  @Delete(':id/delete')
  @ApiParam({ name: 'id' })
  @ApiOperation({ summary: 'Delete AttachmentType' })
  @ApiOkResponse({ type: AttachmentTypeResponse })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  public async delete(@Param() { id }: FindIdParams) {
    return await this.attTypeService.delete(id);
  }
}