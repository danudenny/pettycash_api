import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../../model/user.entity';
import { AuthController } from '../controllers/v1/auth.controller';
import { AuthService } from '../services/v1/auth.service';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  providers: [AuthService],
  controllers: [AuthController],
  exports: [],
})
export class AuthModule {}
