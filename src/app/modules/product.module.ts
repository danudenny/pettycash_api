import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from '../../model/product.entity';
import { ProductService } from '../services/master/v1/product.service';
import { ProductsController } from '../controllers/master/v1/product.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Product])],
  providers: [ProductService],
  controllers: [ProductsController],
  exports: [],
})
export class ProductModule {}
