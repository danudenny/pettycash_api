import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { PtcBaseEntity } from './base.entity';

@Entity('product')
export class Product extends PtcBaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'varchar',
    length: 50,
    nullable: true,
    name: 'code',
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
}
