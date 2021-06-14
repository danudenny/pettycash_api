import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Put,
  Query,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiHeader,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { QueryBranchDTO } from '../../../domain/branch/branch.query.dto';
import { BranchWithPaginationResponse } from '../../../domain/branch/response.dto';
import { UpdateBranchDTO } from '../../../domain/branch/update.dto';
import { BranchService } from '../../../services/master/v1/branch.service';

@ApiTags('Branch')
@Controller('v1/branches')
export class BranchController {
  constructor(private svc: BranchService) {}

  @Get()
  @ApiOperation({ summary: 'List all Branch' })
  @ApiOkResponse({ type: BranchWithPaginationResponse })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  @ApiHeader({
    name: 'x-username',
    description: 'User Request',
    required: false,
  })
  public async list(@Query() query: QueryBranchDTO) {
    return await this.svc.list(query);
  }

  @Get('/budgets')
  @ApiOperation({ summary: 'List all Branch for Budget' })
  @ApiOkResponse({ type: BranchWithPaginationResponse })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  @ApiHeader({
    name: 'x-username',
    description: 'User Request',
    required: false,
  })
  public async listForBudget(@Query() query: QueryBranchDTO) {
    return await this.svc.listForBudget(query);
  }

  @Put('/:id')
  @ApiOperation({ summary: 'Update Branch' })
  @ApiOkResponse({ description: 'Branch successfully updated' })
  @ApiBadRequestResponse({ description: 'Failed to update branch' })
  @ApiBody({ type: UpdateBranchDTO })
  @ApiHeader({
    name: 'x-username',
    description: 'User Request',
    required: false,
  })
  public async update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() payload: UpdateBranchDTO,
  ) {
    return await this.svc.update(id, payload);
  }
}
