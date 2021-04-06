import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Put,
  Query,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiHeader,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { BatchPayloadJournalDTO } from '../../domain/journal/approve.dto';
import { QueryJournalDTO } from '../../domain/journal/journal.payload.dto';
import { JournalBatchResponse } from '../../domain/journal/response-batch.dto';
import { JournalWithPaginationResponse } from '../../domain/journal/response.dto';
import { ReverseJournalDTO } from '../../domain/journal/reverse.dto';
import { JournalService } from '../../services/v1/journal.service';

@Controller('v1/journals')
@ApiTags('Journal')
@ApiInternalServerErrorResponse({ description: 'General Error' })
export class JournalController {
  constructor(private svc: JournalService) {}

  @Get()
  @ApiOperation({ summary: 'List all journal' })
  @ApiHeader({ name: 'x-username', description: 'Custom User Request' })
  @ApiOkResponse({ type: JournalWithPaginationResponse })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  public async list(
    @Query() query: QueryJournalDTO,
  ): Promise<JournalWithPaginationResponse> {
    return await this.svc.list(query);
  }

  @Put('/batch-approve')
  @ApiOperation({ summary: 'Batch Approve Journal' })
  @ApiOkResponse({
    type: JournalBatchResponse,
    description: 'Successfully approve journal',
  })
  @ApiBadRequestResponse({ description: 'Failed to batch approve journal' })
  @ApiHeader({ name: 'x-username', description: 'Custom User Request' })
  @ApiBody({ type: BatchPayloadJournalDTO })
  public async batchApprove(@Body() data: BatchPayloadJournalDTO) {
    return await this.svc.batchApprove(data);
  }

  @Put('/batch-post')
  @ApiOperation({ summary: 'Batch Post Journal' })
  @ApiOkResponse({
    type: JournalBatchResponse,
    description: 'Successfully post journal',
  })
  @ApiBadRequestResponse({ description: 'Failed to batch post journal' })
  @ApiHeader({ name: 'x-username', description: 'Custom User Request' })
  @ApiBody({ type: BatchPayloadJournalDTO })
  public async batchPost(@Body() data: BatchPayloadJournalDTO) {
    return await this.svc.batchPost(data);
  }

  @Put('/batch-reverse')
  @ApiOperation({ summary: 'Batch Reverse Journal' })
  @ApiOkResponse({
    type: JournalBatchResponse,
    description: 'Successfully reverse journal',
  })
  @ApiBadRequestResponse({ description: 'Failed to batch reverse journal' })
  @ApiHeader({ name: 'x-username', description: 'Custom User Request' })
  @ApiBody({ type: BatchPayloadJournalDTO })
  public async batchReverse(@Body() data: BatchPayloadJournalDTO) {
    return await this.svc.batchReverse(data);
  }
}
