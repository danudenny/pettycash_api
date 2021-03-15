import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Query,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
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
  @ApiOkResponse({ type: JournalWithPaginationResponse })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  public async list(
    @Query() query: any,
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
