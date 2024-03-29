import {
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Query,
  Res,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { Response } from 'express';
import { QueryPenggunaanKendaraanDTO } from '../../domain/report-penggunaan-kendaraan/report-penggunaan-kendaraan.dto';
import { ReportPenggunaanKendaraanService } from '../../services/v1/report-penggunaan-kendaraan.service';

@Controller('pettycash/laporan-penggunaan-kendaraan')
@ApiTags('Report Penggunaan Kendaraan')
export class ReportPenggunaanKendaraanController {
  constructor(
    private penggunaanKendaraanService: ReportPenggunaanKendaraanService,
  ) {}

  @Get('/xlsx')
  @ApiOperation({ summary: 'Exports Laporan Penggunaan Kendaraan to Excel' })
  @ApiOkResponse({ type: Buffer })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  async excel(
    @Res() res: Response,
    @Query() query?: QueryPenggunaanKendaraanDTO,
  ): Promise<Buffer> {
    try {
      return this.penggunaanKendaraanService.excel(res, query);
    } catch (err) {
      throw new HttpException(
        err.message,
        err.status || HttpStatus.BAD_REQUEST,
      );
    }
  }
}
