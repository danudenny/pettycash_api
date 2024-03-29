import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Repository, Not, IsNull } from 'typeorm';
import { User } from '../../../model/user.entity';
import { QueryBuilder } from 'typeorm-query-builder-wrapper';
import { UserRoleWithPaginationResponse } from '../../domain/user-role/response.dto';
import { QueryUserRoleDTO } from '../../domain/user-role/user-role.payload.dto';
import { CreateUserRoleDTO } from '../../domain/user-role/create-user-role.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Role } from '../../../model/role.entity';
import { Branch } from '../../../model/branch.entity';
import { MASTER_ROLES } from '../../../model/utils/enum';
import { UpdateUserRoleDTO } from '../../domain/user-role/update-user-role.dto';
import { UserRoleDetailResponse } from '../../domain/user-role/response-detail.dto';
import { AuthService } from './auth.service';
import { PinoLogger } from 'nestjs-pino';

@Injectable()
export class UserRoleService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(Role)
    private readonly roleRepo: Repository<Role>,
    private readonly logger: PinoLogger,
  ) {}

  async list(query: QueryUserRoleDTO): Promise<UserRoleWithPaginationResponse> {
    const params = { page: 1, ...query };
    const qb = new QueryBuilder(User, 'u', params);

    // qb.fieldResolverMap['employee_name__icontains'] = 'u.first_name';
    qb.fieldResolverMap['role_id'] = 'u.role_id';
    qb.fieldResolverMap['nik__icontains'] = 'u.username';

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
    // Custom Search in multiple column
    if (params.employee_name__icontains) {
      let firstName = params.employee_name__icontains;
      let lastName = params.employee_name__icontains;
      const names = params.employee_name__icontains.split(' ');
      if (names.length > 1) {
        firstName = names[0];
        names.shift();
        lastName = names.join(' ');
      }
      qb.andWhereIsolated((q) =>
        q
          .andWhere(
            (e) => e.firstName,
            (v) => v.contains(firstName, true),
          )
          .orWhere(
            (e) => e.lastName,
            (v) => v.contains(lastName, true),
          ),
      );
    }

    const userRoles = await qb.exec();
    return new UserRoleWithPaginationResponse(userRoles);
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

    try {
      const updatedUser = await user.save();
      await AuthService.clearCache(user.username);
      return updatedUser;
    } catch (error) {
      this.logger.error(error);
    }
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
