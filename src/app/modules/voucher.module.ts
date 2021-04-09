import { HttpModule, Module } from '@nestjs/common';
import { VoucherService } from '../services/v1/voucher.service';
import { VoucherController } from '../controllers/v1/voucher.controller';
import { Voucher } from '../../model/voucher.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VoucherSunfish } from '../../model/voucher-sunfish.entity';
import { Product } from '../../model/product.entity';
import { VoucherItem } from '../../model/voucher-item.entity';

@Module({
	imports: [
		TypeOrmModule.forFeature([Voucher, VoucherSunfish, VoucherItem, Product]),
		HttpModule.registerAsync({
			useFactory: () => ({
				timeout: 5000,
				maxRedirects: 5,
			}),
		})
	],
	providers: [VoucherService],
	controllers: [VoucherController],
	exports: [],
})
export class VoucherModule {}
