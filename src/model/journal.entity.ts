import {
  Entity,
  Column,
  OneToMany,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { PtcBaseEntity } from './base.entity';
import { Branch } from './branch.entity';
import { JournalItem } from './journal-item.entity';
import { Period } from './period.entity';
import { JournalState } from './utils/enum';
import { ColumnNumericTransformer } from './utils/transformer';

@Entity('journal')
export class Journal extends PtcBaseEntity {
  @Column({
    type: 'uuid',
    name: 'branch_id',
  })
  @Index()
  branchId: string;

  @Column({
    type: 'date',
    name: 'transaction_date',
  })
  transactionDate: Date;

  @Column({
    type: 'uuid',
    name: 'period_id',
  })
  periodId: string;

  @Column({
    type: 'varchar',
    name: 'number',
    length: 25,
  })
  number: string;

  @Column({
    type: 'varchar',
    name: 'reference',
    length: 100,
    nullable: true,
  })
  reference?: string;

  // FIXME: use ENUM `JournalSourceType`?
  @Column({
    type: 'varchar',
    name: 'source_type',
    length: 50,
    nullable: true,
  })
  sourceType?: string;

  @Column({
    type: 'varchar',
    name: 'partner_name',
    length: 250,
    nullable: true,
  })
  partnerName?: string;

  @Column({
    type: 'varchar',
    name: 'partner_code',
    length: 30,
    nullable: true,
  })
  partnerCode?: string;

  @Column({
    type: 'decimal',
    name: 'total_amount',
    default: 0,
    transformer: new ColumnNumericTransformer(),
  })
  totalAmount: number;

  @Column({
    type: 'enum',
    enum: JournalState,
    default: JournalState.DRAFT,
  })
  state: JournalState;

  @Column({
    type: 'uuid',
    name: 'reverse_journal_id',
    nullable: true,
  })
  reverseJournalId: string;

  @Column({
    type: 'boolean',
    name: 'is_synced',
    default: false,
  })
  isSynced: boolean;

  @Column({ type: 'text', name: 'sync_fail_reason', nullable: true })
  syncFailReason?: string;

  @ManyToOne(() => Journal, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'reverse_journal_id' })
  reverseJournal: Journal;

  @ManyToOne(() => Branch)
  @JoinColumn({ name: 'branch_id' })
  branch: Branch;

  @ManyToOne(() => Period)
  @JoinColumn({ name: 'period_id' })
  period: Period;

  @OneToMany(() => JournalItem, (e) => e.journal, { cascade: true })
  items: JournalItem[];
}
