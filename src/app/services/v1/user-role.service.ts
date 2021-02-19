import { Injectable } from '@nestjs/common';
import { User } from '../../../model/user.entity';
import { QueryBuilder } from 'typeorm-query-builder-wrapper';
import { UserRoleResponse } from '../../domain/user-role/response.dto';
import { QueryUserRoleDTO } from '../../domain/user-role/user-role.payload.dto';

@Injectable()
export class UserRoleService {
  constructor() {}

  async list(query: QueryUserRoleDTO): Promise<UserRoleResponse> {
    const params = { ...query };
    const qb = new QueryBuilder(User, 'u', params);

    qb.fieldResolverMap['employee_name__contains'] = 'u.first_name';
    qb.fieldResolverMap['role_id'] = 'u.role_id';
    qb.fieldResolverMap['nik'] = 'u.username';

    qb.applyFilterPagination();
    qb.selectRaw(
      ['u.id', 'id'],
      [`CONCAT(u.first_name, ' ', u.last_name)`, 'fullName'],
      ['u.username', 'username'],
      ['r.id', 'roleId'],
      ['r.name', 'roleName'],
    );
    qb.leftJoin(
      (e) => e.role,
      'r',
      (j) =>
        j.andWhere(
          (e) => e.isActive,
          (v) => v.isTrue(),
        ),
    );
    qb.andWhere(
      (e) => e.isDeleted,
      (v) => v.isFalse(),
    );
    qb.andWhere(
      (e) => e.roleId,
      (v) => v.isNotNull(),
    );

    const userRoles = await qb.exec();
    return new UserRoleResponse(userRoles);
  }
}
