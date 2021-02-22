import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../../model/user.entity';
import { UserController } from '../controllers/v1/user.controller';
import { UserService } from '../services/v1/user.service';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  providers: [UserService],
  controllers: [UserController],
  exports: [],
})
export class UserModule {}
