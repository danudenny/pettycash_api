import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../../model/user.entity';
import { UserRoleService } from '../services/v1/user-role.service';
import { UserRoleController } from '../controllers/v1/user-role.controller';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  providers: [UserRoleService],
  controllers: [UserRoleController],
  exports: [],
})
export class UserRoleModule {}
