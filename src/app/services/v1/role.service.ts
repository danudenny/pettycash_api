import { InjectRepository } from '@nestjs/typeorm';
import { Role } from '../../../model/role.entity';
import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { RoleResponse } from '../../domain/role/response.dto';

@Injectable()
export class RoleService {
  constructor(
    @InjectRepository(Role) private readonly roleRepo: Repository<Role>,
  ) {}

  getUserId() {
    // TODO: Use From Authentication User.
    const userId = '3aa3eac8-a62f-44c3-b53c-31372492f9a0';
    return userId;
  }

  async list(): Promise<RoleResponse> {
    const roles = await this.roleRepo.find({
      where: {
        isDeleted: false,
        isActive: true,
      },
      select: ['id', 'name'],
    });

    return new RoleResponse(roles);
  }
}
