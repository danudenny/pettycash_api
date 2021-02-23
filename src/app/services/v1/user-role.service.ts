import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Repository, Not, IsNull } from 'typeorm';
import { User } from '../../../model/user.entity';
import { QueryBuilder } from 'typeorm-query-builder-wrapper';
import { UserRoleResponse } from '../../domain/user-role/response.dto';
import { QueryUserRoleDTO } from '../../domain/user-role/user-role.payload.dto';
import { CreateUserRoleDTO } from '../../domain/user-role/create-user-role.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Role } from '../../../model/role.entity';
import { Branch } from '../../../model/branch.entity';
import { MASTER_ROLES } from '../../../model/utils/enum';
import { UpdateUserRoleDTO } from '../../domain/user-role/update-user-role.dto';
import { UserRoleDetailResponse } from '../../domain/user-role/response-detail.dto';

@Injectable()
export class UserRoleService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(Role)
    private readonly roleRepo: Repository<Role>,
  ) {}

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

  public async get(id: string): Promise<any> {
    const userRole = await this.userRepo.findOne({
      where: {
        id,
        roleId: Not(IsNull()),
        isDeleted: false,
      },
      relations: ['role', 'branches'],
      select: [
        'id',
        'username',
        'firstName',
        'lastName',
        'roleId',
        'role',
        'branches',
      ],
    });

    if (!userRole) {
      throw new NotFoundException(`User ID ${id} not found!`);
    }

    return new UserRoleDetailResponse(userRole);
  }

  private async updateRole(params: CreateUserRoleDTO): Promise<any> {
    const { userId, roleId, branches } = params;

    const user = await this.userRepo.findOne({
      where: { id: userId, isDeleted: false },
    });
    if (!user) {
      throw new NotFoundException(`User ID ${userId} not found!`);
    }

    const role = await this.roleRepo.findOne({
      where: { id: roleId, isDeleted: false },
    });
    if (!role) {
      throw new NotFoundException(`Role ID ${roleId} not found!`);
    }

    const assignedBranches = branches.map((branch) => {
      const newBranch = new Branch();
      newBranch.id = branch;
      return newBranch;
    });

    // if ROLE is ADMIN_BRANCH only can be assigned to 1 branch
    if (role.name === MASTER_ROLES.ADMIN_BRANCH) {
      if (assignedBranches.length > 1) {
        throw new BadRequestException(
          `Role ${role.name} only can be assigned to 1 branch!`,
        );
      }
    }

    user.roleId = roleId;
    user.branches = assignedBranches;

    return await user.save();
  }

  public async create(payload: CreateUserRoleDTO): Promise<any> {
    await this.updateRole(payload);
    return;
  }

  public async update(id: string, payload: UpdateUserRoleDTO): Promise<any> {
    const params = { ...payload, userId: id };
    await this.updateRole(params);
    return;
  }

  public async delete(id: string): Promise<any> {
    const user = await this.userRepo.findOne({
      where: { id, roleId: Not(IsNull()), isDeleted: false },
    });
    if (!user) {
      throw new NotFoundException(`User ID ${id} not found!`);
    }

    user.roleId = null;
    user.branches = null;

    await user.save();
    return;
  }
}
