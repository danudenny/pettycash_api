import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../../model/user.entity';
import { UserBranchService } from '../services/v1/user-branch.service';
import { UserBranchController } from '../controllers/v1/user-branch.controller';
import { Role } from '../../model/role.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  providers: [UserBranchService],
  controllers: [UserBranchController],
  exports: [],
})
export class UserBranchModule {}
