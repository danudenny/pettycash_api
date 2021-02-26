import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { User } from '../../../model/user.entity';
import { QueryBuilder } from 'typeorm-query-builder-wrapper';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryUserDTO } from '../../domain/user/user.payload.dto';
import { UserWithPaginationResponse } from '../../domain/user/response.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async list(query: QueryUserDTO): Promise<UserWithPaginationResponse> {
    const params = { limit: 10, ...query };
    const qb = new QueryBuilder(User, 'u', params);

    qb.fieldResolverMap['name__contains'] = 'u.first_name';
    qb.fieldResolverMap['nik__contains'] = 'u.username';

    qb.applyFilterPagination();
    qb.selectRaw(
      ['u.id', 'id'],
      ['u.username', 'username'],
      ['u.first_name', 'firstName'],
      ['u.last_name', 'lastName'],
    );
    qb.andWhere(
      (e) => e.isDeleted,
      (v) => v.isFalse(),
    );

    const users = await qb.exec();
    return new UserWithPaginationResponse(users, params);
  }
}