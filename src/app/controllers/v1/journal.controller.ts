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
import { BatchApproveJournalDTO } from '../../domain/journal/approve.dto';
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

  @Patch('/:id/approve')
  @ApiOperation({ summary: 'Approve Journal' })
  @ApiNotFoundResponse({ description: 'Journal not found' })
  @ApiBody({})
  public async approve(@Param('id', new ParseUUIDPipe()) id: string) {
    return await this.svc.approve(id);
  }

  @Put('/batch-approve')
  @ApiOperation({ summary: 'Batch Approve Journal' })
  @ApiOkResponse({
    type: JournalBatchResponse,
    description: 'Successfully approve journal',
  })
  @ApiBadRequestResponse({ description: 'Failed to batch approve journal' })
  @ApiHeader({ name: 'x-username', description: 'Custom User Request' })
  @ApiBody({ type: BatchApproveJournalDTO })
  public async batchApprove(@Body() data: BatchApproveJournalDTO) {
    return await this.svc.batchApprove(data);
  }

  @Patch('/:id/post')
  @ApiOperation({ summary: 'Post Journal' })
  @ApiNotFoundResponse({ description: 'Journal not found' })
  @ApiBody({})
  public async post(@Param('id', new ParseUUIDPipe()) id: string) {
    return await this.svc.post(id);
  }

  @Patch('/:id/reverse')
  @ApiOperation({ summary: 'Reverse Journal' })
  @ApiOkResponse({ description: 'Successfully reversing journal' })
  @ApiNotFoundResponse({ description: 'Journal not found' })
  @ApiBody({ type: ReverseJournalDTO })
  public async reverse(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() payload: ReverseJournalDTO,
  ) {
    return await this.svc.reverse(id, payload);
  }
}
