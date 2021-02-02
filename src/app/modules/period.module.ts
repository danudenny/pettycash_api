import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Period } from '../../model/period.entity';
import { PeriodController } from '../controllers/v1/period.controller';
import { PeriodService } from '../services/v1/period.service';

@Module({
  imports: [TypeOrmModule.forFeature([Period])],
  providers: [PeriodService],
  controllers: [PeriodController],
  exports: [],
})
export class PeriodModule {}
