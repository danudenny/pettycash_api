import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../../model/user.entity';
import { AuthorizationResponse } from '../../domain/auth/response.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  private async getUsernameFromHeader() {
    // TODO: Get username from header.
    // return username
    return null;
  }

  public async get(query?: any): Promise<AuthorizationResponse> {
    let username: string = query && query.username;
    if (!username) {
      username = await this.getUsernameFromHeader();
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
