import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../../model/user.entity';
import { UserRoleService } from '../services/v1/user-role.service';
import { UserRoleController } from '../controllers/v1/user-role.controller';
import { Role } from '../../model/role.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Role])],
  providers: [UserRoleService],
  controllers: [UserRoleController],
  exports: [],
})
export class UserRoleModule {}
