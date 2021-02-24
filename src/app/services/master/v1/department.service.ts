import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { QueryBuilder } from 'typeorm-query-builder-wrapper';
import { Department } from '../../../../model/department.entity';
import { QueryDepartmentDTO } from '../../../domain/department/department.payload.dto';
import { DepartmentResponse, DepartmentWithPaginationResponse } from '../../../domain/department/department-response.dto';

@Injectable()
export class DepartmentService {
  constructor(
    @InjectRepository(Department)
    private readonly departRepo: Repository<Department>,
  ) {
  }

  public async list(query?: QueryDepartmentDTO): Promise<DepartmentWithPaginationResponse> {
    const params = { order: '^code', limit: 10, ...query };
    const qb = new QueryBuilder(Department, 'dept', params);

    qb.fieldResolverMap['code__contains'] = 'dept.code';
    qb.fieldResolverMap['name__contains'] = 'dept.name';

    qb.applyFilterPagination();
    qb.selectRaw(
      ['dept.id', 'id'],
      ['dept.department_id', 'departmentId'],
      ['dept.department_parent_id', 'departmentParentId'],
      ['dept.code', 'code'],
      ['dept.name', 'name']
    );
    qb.andWhere(
      (e) => e.isDeleted,
      (v) => v.isFalse(),
    );

    const dept = await qb.exec();
    return new DepartmentWithPaginationResponse(dept, params);
  }
}
