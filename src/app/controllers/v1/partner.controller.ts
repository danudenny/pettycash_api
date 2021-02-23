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
  Res,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiCreatedResponse,
  ApiInternalServerErrorResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { Response } from 'express';
import { CreatePartnerDTO } from '../../domain/partner/create.dto';
import { QueryPartnerDTO } from '../../domain/partner/partner.payload.dto';
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

  @Post()
  @ApiOperation({ summary: 'Create Partner' })
  @ApiCreatedResponse({ description: 'Partner successfully created' })
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
}
