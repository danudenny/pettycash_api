import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Employee } from '../../../../model/employee.entity';
import { QueryBuilder } from 'typeorm-query-builder-wrapper';
import { QueryEmployeeDTO } from '../../../domain/employee/employee.payload.dto';
import { EmployeeResponse, EmployeeWithPaginationResponse } from '../../../domain/employee/employee-response.dto';

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

  public async list(query?: QueryEmployeeDTO): Promise<EmployeeWithPaginationResponse> {
    const params = { order: '^id', limit: 10, ...query };
    const qb = new QueryBuilder(Employee, 'emp', params);

    qb.fieldResolverMap['nik__icontains'] = 'emp.nik';
    qb.fieldResolverMap['name__icontains'] = 'emp.name';
    qb.fieldResolverMap['idCardNumber__icontains'] = 'emp.idCardNumber';
    qb.fieldResolverMap['branchId'] = 'emp.branchId';

    qb.applyFilterPagination();
    qb.selectRaw(
      ['emp.id', 'id'],
      ['emp.employee_id', 'employeeId'],
      ['emp.nik', 'nik'],
      ['emp.name', 'name'],
      ['emp.employee_role_id', 'positionId'],
      ['emp_role.employee_role_name', 'positionName'],
      ['emp.branch_id', 'branchId'],
      ['emp.is_deleted', 'isDeleted'],
    );
    qb.leftJoin((e) => e.employeeRole, 'emp_role');
    qb.andWhere(
      (e) => e.isDeleted,
      (v) => v.isFalse(),
    );

    const emp = await qb.exec();
    return new EmployeeWithPaginationResponse(emp, params);
  }
}
