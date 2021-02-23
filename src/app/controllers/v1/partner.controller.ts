import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiCreatedResponse,
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { CreatePartnerDTO } from '../../domain/partner/create.dto';
import { QueryPartnerDTO } from '../../domain/partner/partner.payload.dto';
import { PartnerWithPaginationResponse } from '../../domain/partner/response.dto';
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
}
