import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Employee } from '../../../../model/employee.entity';
import { QueryBuilder } from 'typeorm-query-builder-wrapper';
import { QueryEmployeeDTO } from '../../../domain/employee/employee.payload.dto';
import { EmployeeResponse } from '../../../domain/employee/employee-response.dto';

@Injectable()
export class EmployeeService {
  constructor(
    @InjectRepository(Employee)
    private readonly taxRepo: Repository<Employee>,
  ) {
  }

  async getUserId() {
    // TODO: Use From Authentication User.
    return '3aa3eac8-a62f-44c3-b53c-31372492f9a0';
  }

  public async list(query?: QueryEmployeeDTO): Promise<EmployeeResponse> {
    const params = { order: '^id', limit: 10, ...query };
    const qb = new QueryBuilder(Employee, 'emp', params);

    qb.fieldResolverMap['nik__contains'] = 'emp.nik';
    qb.fieldResolverMap['name__contains'] = 'emp.name';
    qb.fieldResolverMap['idCardNumber__contains'] = 'emp.idCardNumber';
    qb.fieldResolverMap['branchId__contains'] = 'emp.branchId';

    qb.applyFilterPagination();
    qb.selectRaw(
      ['emp.id', 'id'],
      ['emp.employee_id', 'employeeId'],
      ['emp.nik', 'nik'],
      ['emp.name', 'name'],
      ['emp.npwp_number', 'npwpNumber'],
      ['emp.id_card_number', 'idCardNumber'],
      ['emp.position_id', 'positionId'],
      ['emp.position_name', 'positionName'],
      ['emp.branch_id', 'branchId'],
      ['emp.is_deleted', 'isDeleted']
    );
    qb.andWhere(
      (e) => e.isDeleted,
      (v) => v.isFalse(),
    );

    const emp = await qb.exec();
    return new EmployeeResponse(emp);
  }
}
