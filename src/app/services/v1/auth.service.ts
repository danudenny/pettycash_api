import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOneOptions } from 'typeorm';
import { ContextService } from '../../../common/services/context.service';
import { LoaderEnv } from '../../../config/loader';
import { User } from '../../../model/user.entity';
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
        ...options,
        where: { username, isDeleted: false },
        cache: LoaderEnv.envs.AUTH_CACHE_DURATION_IN_MINUTES * 60000,
      });
      console.log(user);
      return user;
    } catch (error) {
      throw error;
    }
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
