import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOneOptions } from 'typeorm';
import { ContextService } from '../../../common/services/context.service';
import { LoaderEnv } from '../../../config/loader';
import { Branch } from '../../../model/branch.entity';
import { Role } from '../../../model/role.entity';
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

  public static async getUser(options?: FindOneOptions<User>): Promise<User> {
    let username = await AuthService.getUsernameFromHeader();
    // TODO: Remove this mock after integrating with API Gateway Service
    if (!username) {
      username = 'adry';
    }
    try {
      // Find User
      const user = await User.findOne({
        cache: LoaderEnv.envs.AUTH_CACHE_DURATION_IN_MINUTES * 60000,
        ...options,
        where: { username, isDeleted: false },
      });
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
    user: User,
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
}
