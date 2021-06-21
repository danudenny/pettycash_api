import { Entity, Column, ManyToOne, Index, JoinColumn } from 'typeorm';
import { AccountCoa } from './account-coa.entity';
import { PtcBaseEntity } from './base.entity';
import { Branch } from './branch.entity';
import { Journal } from './journal.entity';
import { Period } from './period.entity';
import { Product } from './product.entity';
import { ColumnNumericTransformer } from './utils/transformer';

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
    type: 'text',
    name: 'description',
    nullable: true,
  })
  description?: string;

  @Column({
    type: 'uuid',
    name: 'coa_id',
    nullable: false,
  })
  coaId: string;

  @Column({
    type: 'uuid',
    name: 'product_id',
    nullable: true,
  })
  @Index()
  productId?: string;

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
    transformer: new ColumnNumericTransformer(),
  })
  debit: number;

  @Column({
    type: 'decimal',
    name: 'credit',
    default: 0,
    transformer: new ColumnNumericTransformer(),
  })
  credit: number;

  @Column({
    type: 'boolean',
    nullable: false,
    default: () => 'false',
    name: 'is_ledger',
  })
  isLedger: boolean;

  @ManyToOne(() => Journal, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'journal_id' })
  journal: Journal;

  @ManyToOne(() => Branch)
  @JoinColumn({ name: 'branch_id' })
  branch: Branch;

  @ManyToOne(() => Period)
  @JoinColumn({ name: 'period_id' })
  period: Period;

  @ManyToOne(() => AccountCoa)
  @JoinColumn({ name: 'coa_id' })
  coa: AccountCoa;

  @ManyToOne(() => Product)
  @JoinColumn({ name: 'product_id' })
  product?: Product;
}
