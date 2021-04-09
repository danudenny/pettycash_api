import { Column, Entity, JoinColumn, Index, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { PtcBaseEntity } from './base.entity';
import { Voucher } from './voucher.entity';
import { IsUUID } from 'class-validator';
import { Product } from './product.entity';

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

  @ManyToOne(() => Voucher, {onDelete: 'CASCADE'})
  @JoinColumn({ name: 'voucher_id' })
  voucher: Voucher;

  @ManyToOne(() => Product)
  @JoinColumn({ name: 'product_id' })
  products: Product;
}
