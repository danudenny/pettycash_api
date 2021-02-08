import { Entity, Column, ManyToOne, Index, JoinColumn } from 'typeorm';
import { PtcBaseEntity } from './base.entity';
import { Branch } from './branch.entity';
import { Journal } from './journal.entity';
import { Period } from './period.entity';

@Entity('journal_item')
export class JournalItem extends PtcBaseEntity {
  @Column({
    type: 'uuid',
    name: 'journal_id',
    nullable: false,
  })
  @Index()
  journalId: string;

  @Column({
    type: 'uuid',
    name: 'branch_id',
    nullable: false,
  })
  branchId: string;

  @Column({
    type: 'date',
    name: 'transaction_date',
    nullable: false,
    default: () => 'CURRENT_DATE',
  })
  transactionDate: Date;

  @Column({
    type: 'uuid',
    name: 'period_id',
    nullable: false,
  })
  periodId: string;

  @Column({
    type: 'varchar',
    name: 'reference',
    length: 100,
    nullable: true,
  })
  reference?: string;

  @Column({
    type: 'uuid',
    name: 'coa_id',
    nullable: false,
  })
  coaId: string;

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
    name: 'debit',
    default: 0,
  })
  debit: number;

  @Column({
    type: 'decimal',
    name: 'credit',
    default: 0,
  })
  credit: number;

  @JoinColumn({ name: 'journal_id' })
  journal: Journal;

  @ManyToOne(() => Branch)
  @JoinColumn({ name: 'branch_id' })
  branch: Branch;

  @ManyToOne(() => Period)
  @JoinColumn({ name: 'period_id' })
  period: Period;
}
