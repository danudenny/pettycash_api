import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Journal } from '../../model/journal.entity';
import { JournalController } from '../controllers/v1/journal.controller';
import { JournalService } from '../services/v1/journal.service';

@Module({
  imports: [TypeOrmModule.forFeature([Journal])],
  providers: [JournalService],
  controllers: [JournalController],
  exports: [],
})
export class JournalModule {}
