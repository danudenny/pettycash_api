import {
  Column,
  Entity,
  PrimaryColumn,
  BaseEntity,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Branch } from './branch.entity';
import { ColumnNumericTransformer } from './utils/transformer';

@Entity('balance')
export class Balance extends BaseEntity {
  @PrimaryColumn('uuid', { name: 'branch_id' })
  @Index()
  branchId: string;

  @Column({
    type: 'decimal',
    name: 'cash_amount',
    default: 0,
    transformer: new ColumnNumericTransformer(),
  })
  cashAmount: number;

  @Column({
    type: 'decimal',
    name: 'bank_amount',
    default: 0,
    transformer: new ColumnNumericTransformer(),
  })
  bankAmount: number;

  @Column({
    type: 'decimal',
    name: 'bon_amount',
    default: 0,
    transformer: new ColumnNumericTransformer(),
  })
  bonAmount: number;

  @ManyToOne(() => Branch)
  @JoinColumn({ name: 'branch_id' })
  branch: Branch;
}
