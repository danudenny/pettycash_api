import { Column, Entity, JoinColumn, Index } from 'typeorm';
import { PtcBaseEntity } from './base.entity';
import { Voucher } from './voucher.entity';

@Entity('voucher_item')
export class VoucherItem extends PtcBaseEntity {
  @Column({
    type: 'uuid',
    name: 'voucher_id',
    nullable: false,
  })
  @Index()
  voucherId: string;

  @Column({
    type: 'uuid',
    name: 'product_id',
    nullable: false,
  })
  productId: string;

  @Column({
    type: 'decimal',
    name: 'amount',
    nullable: false,
  })
  amount: number;

  @JoinColumn({ name: 'voucher_id' })
  voucher: Voucher;
}
