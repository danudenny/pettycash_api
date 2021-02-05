import { Column, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { PtcBaseEntity } from './base.entity';
import { Voucher } from './voucher.entity';

@Entity('voucher-item')
export class VoucherItem extends PtcBaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'uuid',
    name: 'voucher_id',
    nullable: false
  })
  voucherId: string;

  @Column({
    type: 'uuid',
    name: 'product_id',
    nullable: false
  })
  productId: string;

  @Column({
    type: 'decimal',
    nullable: false,
    name: 'amount',
    precision: 2
  })
  amount: number;

  @ManyToOne(() => Voucher, voucher => voucher.item)
  @JoinColumn({
    name: 'voucher_id'
  })
  voucher: Voucher;
}
