import { BaseEntity, Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import { JournalState } from './utils/enum';

@Entity('journals')
export class Journal extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'uuid',
    name: 'branch_id',
    nullable: false
  })
  branchId: string;

  @Column({
    type: 'varchar',
    name: 'branch_code',
    length: 25,
    nullable: false
  })
  branchCode: string;

  @Column({
    type: 'timestamp',
    name: 'transaction_date',
    default: () => 'CURRENT_TIMESTAMP',
    nullable: false
  })
  transactionDate: Date;

  @Column({
    type: 'uuid',
    name: 'period_id',
    nullable: false
  })
  periodId: string;

  @Column({
    type: 'char',
    name: 'number',
    length: 100,
    nullable: false
  })
  number: string;

  @Column({
    type: 'char',
    name: 'reference',
    length: 100
  })
  reference: string;

  @Column({
    type: 'char',
    name: 'source_type',
    length: 50
  })
  sourceType: string;

  @Column({
    type: 'char',
    name: 'partner_name',
    length: 100
  })
  partnerName: string;

  @Column({
    type: 'char',
    name: 'partner_code',
    length: 100
  })
  partnerCode: string;

  @Column({
    type: 'decimal',
    name: 'total_amount',
    precision: 2
  })
  totalAmount: number;

  @Column({
    type: 'enum',
    enum: JournalState,
    default: JournalState.DRAFT,
    nullable: false
  })
  state: JournalState

  @Column({
    name: 'is_reversed',
    nullable: false,
    default: false
  })
  isReversed: boolean;

  @Column({
    name: 'is_synced',
    nullable: false,
    default: false
  })
  isSynced: boolean;
}
