import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Role } from '../../model/role.entity';
import { RoleService } from '../services/v1/role.service';
import { RoleController } from '../controllers/v1/role.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Role])],
  providers: [RoleService],
  controllers: [RoleController],
  exports: [],
})
export class RoleModule {}
