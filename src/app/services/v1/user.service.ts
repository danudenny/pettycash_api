import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { User } from '../../../model/user.entity';
import { QueryBuilder } from 'typeorm-query-builder-wrapper';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryUserDTO } from '../../domain/user/user.payload.dto';
import { UserWithPaginationResponse } from '../../domain/user/response.dto';
import { parseBool } from '../../../shared/utils';
import { UserResetPasswordeDTO } from '../../domain/user/user-reset-password.dto';
import { LoaderEnv } from '../../../config/loader';
import axios from 'axios';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  private static get headerWebhook() {
    return {
      'api-key': LoaderEnv.envs.USER_HELPER_KEY,
      'Content-Type': 'application/json',
      Connection: 'keep-alive',
    };
  }

  async list(query: QueryUserDTO): Promise<UserWithPaginationResponse> {
    const params = { limit: 10, ...query };
    const qb = new QueryBuilder(User, 'u', params);

    qb.fieldResolverMap['nik__icontains'] = 'u.username';

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

    if (params.name__icontains) {
      let firstName = params.name__icontains;
      let lastName = null;
      let isNik = false;
      const names = params.name__icontains.split(' ');
      if (names.length > 1) {
        firstName = names[0];
        names.shift();
        lastName = names.join(' ');
      }

      if (!lastName) {
        firstName = firstName.trim();
        isNik = /^\d+$/.test(firstName);
      }

      if (isNik) {
        qb.andWhere(
          (e) => e.username,
          (v) => v.contains(firstName, true),
        );
      } else {
        qb.andWhere(
          (e) => e.firstName,
          (v) => v.contains(firstName, true),
        );
      }

      if (lastName) {
        qb.andWhere(
          (e) => e.lastName,
          (v) => v.contains(lastName, true),
        );
      }
    }

    if (params.isHasRole) {
      const isHasRole = parseBool(params.isHasRole);
      if (isHasRole) {
        qb.andWhere(
          (e) => e.roleId,
          (v) => v.isNotNull(),
        );
      } else {
        qb.andWhere(
          (e) => e.roleId,
          (v) => v.isNull(),
        );
      }
    }

    const users = await qb.exec();
    return new UserWithPaginationResponse(users, params);
  }

  // integration master data api for reset password user
  async resetPassword(payload: UserResetPasswordeDTO): Promise<any> {
    const url = LoaderEnv.envs.USER_HELPER_URL;
    const options = {
      headers: UserService.headerWebhook,
    };

    const user = await User.findOne({ where: {username: payload.username, isDeleted: false} });
    if (!user) {
      throw new HttpException(
        'User tidak valid, hubungi admin!',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      return await axios.post(url, payload, options);
    } catch (error) {
      throw new HttpException(
        'Gagal Menyambungkan ke Service master, hubungi admin!',
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
