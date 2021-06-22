import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Journal } from '../../model/journal.entity';
import { ReportParkingJournalController } from '../controllers/v1/report-parking-journal.controller';
import { ReportParkingJournalService } from '../services/v1/report-parking-journal.service';

@Module({
  imports: [TypeOrmModule.forFeature([Journal])],
  providers: [ReportParkingJournalService],
  controllers: [ReportParkingJournalController],
  exports: [],
})
export class ReportParkingJournalModule {}
