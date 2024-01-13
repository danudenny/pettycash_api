import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Department } from '../../model/department.entity';
import { DepartmentService } from '../services/master/v1/department.service';
import { DepartmentController } from '../controllers/master/v1/department.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Department])],
  providers: [DepartmentService],
  controllers: [DepartmentController],
  exports: [],
})
export class DepartmentModule {}
