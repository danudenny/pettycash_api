import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Repository, Not, IsNull } from 'typeorm';
import { User } from '../../../model/user.entity';
import { QueryBuilder } from 'typeorm-query-builder-wrapper';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryUserDTO } from '../../domain/user/user.payload.dto';
import { UserWithPaginationResponse } from '../../domain/user/response.dto';
import { parseBool } from '../../../shared/utils';
import { UserResetPasswordeDTO } from '../../domain/user/user-reset-password.dto';
import { LoaderEnv } from '../../../config/loader';
import axios from 'axios';
import https from 'https';
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
      'User-Agent': 'PETTYCASH-API',
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
    const url = encodeURI(LoaderEnv.envs.USER_HELPER_URL);
    // PATCH: At request level
    const agent = new https.Agent({
      rejectUnauthorized: false,
    });
    const options = {
      headers: UserService.headerWebhook,
      httpsAgent: agent,
    };
    const skip = ['superadmin', 'superuser'];
    if (skip.includes(payload.username)) {
      throw new HttpException(
        'User tidak valid, hubungi admin!',
        HttpStatus.BAD_REQUEST,
      );
    } else {
      const user = await User.findOne({
        where: {
          username: payload.username,
          roleId: Not(IsNull()),
          isDeleted: false,
        },
      });
      if (!user) {
        throw new HttpException(
          'User tidak valid, hubungi admin!',
          HttpStatus.BAD_REQUEST,
        );
      }
    }
    const data = {
      username: payload.username,
      password: payload.password,
    };
    try {
      const res = await axios.post(url, data, options);
      if (res.data.code == HttpStatus.UNPROCESSABLE_ENTITY) {
        throw new HttpException(
          res.data.message,
          HttpStatus.UNPROCESSABLE_ENTITY,
        );
      } else {
        return { status: res.status, data: res.data };
      }
    } catch (error) {
      console.error(error);
      throw new HttpException(
        'Gagal Menyambungkan ke Service master, hubungi admin!',
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
