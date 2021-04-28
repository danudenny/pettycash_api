import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { PtcBaseEntity } from './base.entity';
import { AccountCoa } from './account-coa.entity';
import { ProductExpenseType, ProductTaxType } from './utils/enum';

@Entity('product')
export class Product extends PtcBaseEntity {
  @Column({
    type: 'varchar',
    length: 50,
    nullable: true,
    name: 'code',
    unique: true
  })
  code: string;

  @Column({
    type: 'varchar',
    length: 100,
    nullable: false,
    name: 'name',
  })
  name: string;

  @Column({
    type: 'text',
    nullable: true,
    name: 'description',
  })
  description: string;

  @Column({
    type: 'boolean',
    nullable: true,
    name: 'is_has_tax',
  })
  isHasTax: boolean;

  @Column({
    type: 'decimal',
    nullable: true,
    name: 'amount',
    default: 0,
  })
  amount: number;

  @Column({
    type: 'uuid',
    nullable: true,
    name: 'coa_id',
  })
  coaId: string;

  @Column({
    type: 'boolean',
    nullable: false,
    default: () => 'true',
    name: 'is_active',
  })
  isActive: boolean;

  @Column({
    type: 'boolean',
    nullable: false,
    default: () => 'false',
    name: 'is_has_km',
  })
  isHasKm: boolean;

  @Column({
    type: 'enum',
    enum: ProductTaxType,
    name: 'tax_type',
    nullable: true,
  })
  taxType: ProductTaxType

  @Column({
    type: 'enum',
    enum: ProductExpenseType,
    name: 'tax_type',
    nullable: true,
    default: ProductExpenseType.EXPENSE
  })
  type: ProductExpenseType

  @ManyToOne(() => AccountCoa)
  @JoinColumn({ name: 'coa_id', referencedColumnName: 'id' })
  coaProduct: AccountCoa;
}
