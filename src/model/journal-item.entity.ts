import { BaseEntity, Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('journal_items')
export class JournalItem extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'uuid',
    name: 'journal_id',
    nullable: false
  })
  journalId: string;

  @Column({
    type: 'uuid',
    name: 'branch_id',
    nullable: false
  })
  branchId: string;

  @Column({
    type: 'timestamp',
    name: 'transaction_date',
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
    name: 'reference',
    length: 100
  })
  reference: string;

  @Column({
    type: 'uuid',
    name: 'coa_id',
    nullable: false
  })
  coaId: string;

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
    precision: 2,
    default: () => 0
  })
  debit: number;

  @Column({
    type: 'decimal',
    name: 'total_amount',
    precision: 2,
    default: () => 0
  })
  credit: number;
}
