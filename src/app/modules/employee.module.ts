import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmployeeService } from '../services/master/v1/employee.service';
import { EmployeeController } from '../controllers/master/v1/employee.controller';
import { Employee } from '../../model/employee.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Employee])],
  providers: [EmployeeService],
  controllers: [EmployeeController],
  exports: [],
})
export class EmployeeModule {}
