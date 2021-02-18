import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccountTax } from '../../model/account-tax.entity';
import { TaxService } from '../services/master/v1/tax.service';
import { TaxController } from '../controllers/master/v1/tax.controller';

@Module({
  imports: [TypeOrmModule.forFeature([AccountTax])],
  providers: [TaxService],
  controllers: [TaxController],
  exports: [],
})
export class TaxModule {}
