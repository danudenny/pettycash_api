import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PinoLogger } from 'nestjs-pino';
import { Repository, getConnection } from 'typeorm';
import { ContextService } from '../../../common/services/context.service';
import { LoaderEnv } from '../../../config/loader';
import { User } from '../../../model/user.entity';
import { MASTER_ROLES } from '../../../model/utils/enum';
import { AuthorizationResponse } from '../../domain/auth/response.dto';

const logger = new PinoLogger({});

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

  private static async getUsername() {
    let username = await AuthService.getUsernameFromHeader();
    // TODO: Remove this mock after integrating with API Gateway Service
    if (!username) {
      username = 'internalsystem';
    }
    return username;
  }

  /**
   * Get User data based from `x-username` request header.
   * Data taken from cache or database.
   *
   * @static
   * @return {*}  {Promise<User>}
   * @memberof AuthService
   */
  public static async getUser(): Promise<User> {
    const username = await AuthService.getUsername();
    const user = await User.findOne({
      cache: {
        id: `user:${username}`,
        milliseconds: LoaderEnv.envs.AUTH_CACHE_DURATION_IN_MINUTES * 60000,
      },
      where: { username, isDeleted: false },
    });
    return user;
  }

  /**
   * Get User and Branches data based from `x-username` request header.
   * Data taken from cache or database.
   *
   * @static
   * @return {*}  {Promise<User>}
   * @memberof AuthService
   */
  public static async getUserBranches(): Promise<User> {
    const username = await AuthService.getUsername();
    const user = await User.findOne({
      cache: {
        id: `user_branches:${username}`,
        milliseconds: LoaderEnv.envs.AUTH_CACHE_DURATION_IN_MINUTES * 60000,
      },
      where: { username, isDeleted: false },
      relations: ['branches'],
    });
    return user;
  }

  /**
   * Get User and Role data based from `x-username` request header.
   * Data taken from cache or database.
   *
   * @static
   * @return {*}  {Promise<User>}
   * @memberof AuthService
   */
  public static async getUserRole(): Promise<User> {
    const username = await AuthService.getUsername();
    const user = await User.findOne({
      cache: {
        id: `user_role:${username}`,
        milliseconds: LoaderEnv.envs.AUTH_CACHE_DURATION_IN_MINUTES * 60000,
      },
      where: { username, isDeleted: false },
      relations: ['role'],
    });
    return user;
  }

  /**
   * Get User Branch and Role from `x-username` header request
   *
   * @static
   * @return {*}  {Promise<{
   *     user: User,
   *     userBranchIds: string[];
   *     userRoleName: MASTER_ROLES;
   *     isSuperUser: boolean;
   *   }>}
   * @memberof AuthService
   */
  // TODO: need refactoring
  public static async getUserBranchAndRole(): Promise<{
    user: User;
    userBranchIds: string[];
    userRoleName: MASTER_ROLES;
    isSuperUser: boolean;
  }> {
    const username = await AuthService.getUsername();
    const user = await User.findOne({
      cache: {
        id: `user_branch_and_role:${username}`,
        milliseconds: LoaderEnv.envs.AUTH_CACHE_DURATION_IN_MINUTES * 60000,
      },
      where: { username, isDeleted: false },
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
   * @param {string} [username]
   * @returns {Promise<void>}
   * @memberof AuthService
   */
  public static async clearCache(username?: string): Promise<void> {
    username = username ? username : await AuthService.getUsername();
    const listPrefix = [
      'user',
      'user_branches',
      'user_role',
      'user_branch_and_role',
    ];

    const keys = [];
    for (const k of listPrefix) {
      keys.push(`${k}:${username}`);
    }

    await getConnection().queryResultCache?.remove(keys);
    logger.info(`Invalidated cache for ${keys}`);
  }
}
