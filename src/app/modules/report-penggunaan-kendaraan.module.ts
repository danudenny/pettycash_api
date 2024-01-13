import { Module } from '@nestjs/common';
import { ReportPenggunaanKendaraanController } from '../controllers/v1/report-penggunaan-kendaraan.controller';
import { ReportPenggunaanKendaraanService } from '../services/v1/report-penggunaan-kendaraan.service';

@Module({
  controllers: [ReportPenggunaanKendaraanController],
  providers: [ReportPenggunaanKendaraanService],
})
export class ReportPenggunaanKendaraanModule {}
