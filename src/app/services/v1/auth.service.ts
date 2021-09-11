import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOneOptions, getConnection } from 'typeorm';
import { ContextService } from '../../../common/services/context.service';
import { LoaderEnv } from '../../../config/loader';
import { User } from '../../../model/user.entity';
import { MASTER_ROLES } from '../../../model/utils/enum';
import { AuthorizationResponse } from '../../domain/auth/response.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  private static async getUsernameFromHeader() {
    const headers = ContextService.get('headers');
    const username =
      headers && headers['x-username'] ? headers['x-username'] : null;
    return username;
  }

  /**
   * Get User data based from request header
   * Data taken from cache or database.
   *
   * @static
   * @param {FindOneOptions<User>} [options]
   * @param {number} [retry=0]
   * @return {*}  {Promise<User>}
   * @memberof AuthService
   */
  public static async getUser(
    options?: FindOneOptions<User>,
    retry: number = 0,
    strict: boolean = true,
  ): Promise<User> {
    const MAX_RETRY = 1;
    let username = await AuthService.getUsernameFromHeader();
    let user: User;
    // TODO: Remove this mock after integrating with API Gateway Service
    if (!username) {
      username = 'internalsystem';
    }
    try {
      // Find User from Cache or Database.
      user = await User.findOne({
        cache: LoaderEnv.envs.AUTH_CACHE_DURATION_IN_MINUTES * 60000,
        ...options,
        where: { username, isDeleted: false },
      });

      // Retry to Find User from Database.
      if (!user && retry < MAX_RETRY) {
        retry += 1;
        user = await this.getUser({ ...options, cache: false }, retry);
        // If user found. clear all cache.
        if (user) {
          await getConnection().queryResultCache?.clear();
        }

        if (strict && !user) {
          throw new BadRequestException(`User for ${username} not found!`);
        }

        return user;
      }

      if (strict && !user) {
        throw new BadRequestException(`User for ${username} not found!`);
      }

      return user;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get User Branch and Role from `x-username` header request
   *
   * @static
   * @param {FindOneOptions<User>} [options]
   * @return {*}  {Promise<{
   *     user: User,
   *     userBranchIds: string[];
   *     userRoleName: MASTER_ROLES;
   *     isSuperUser: boolean;
   *   }>}
   * @memberof AuthService
   */
  public static async getUserBranchAndRole(
    options?: FindOneOptions<User>,
  ): Promise<{
    user: User;
    userBranchIds: string[];
    userRoleName: MASTER_ROLES;
    isSuperUser: boolean;
  }> {
    const user = await AuthService.getUser({
      ...options,
      relations: ['branches', 'role'],
    });
    const userBranchIds = user?.branches?.map((v) => v.id);
    const userRoleName = user?.role?.name as MASTER_ROLES;
    const isSuperUser = userRoleName === MASTER_ROLES.SUPERUSER;
    return { user, userBranchIds, userRoleName, isSuperUser };
  }

  public async get(query?: any): Promise<AuthorizationResponse> {
    let username: string = query && query.username;
    if (!username) {
      username = await AuthService.getUsernameFromHeader();
      if (!username) {
        throw new BadRequestException(
          `Request doesn't has params 'username' or Header 'X-username'!`,
        );
      }
    }

    const user = await this.userRepo.findOne({
      where: { username },
      relations: ['role', 'role.permissions'],
    });

    if (!user) {
      throw new NotFoundException(
        `User for ${username} not found in database!`,
      );
    }

    return new AuthorizationResponse(user);
  }

  /**
   * Clear cache for User.
   *
   * @static
   * @memberof AuthService
   */
  public static async clearCache(): Promise<void> {
    await getConnection().queryResultCache?.clear();
  }
}
