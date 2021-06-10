import { Entity, Column, JoinColumn, ManyToOne, Index } from 'typeorm';
import { PtcBaseEntity } from './base.entity';
import { Branch } from './branch.entity';
import {
  AccountStatementAmountPosition,
  AccountStatementType,
} from './utils/enum';

@Entity('account_statement')
export class AccountStatement extends PtcBaseEntity {
  @Column({ type: 'uuid', name: 'branch_id' })
  @Index()
  branchId: string;

  @Column({ type: 'varchar', name: 'reference', nullable: true })
  reference?: string;

  // FIXME: use ENUM `AccountStatementSourceType`?
  @Column({
    type: 'varchar',
    name: 'source_type',
    length: 50,
    nullable: true,
  })
  @Index()
  sourceType?: string;

  @Column({ type: 'date', name: 'transaction_date' })
  transactionDate: Date;

  @Column({ type: 'enum', enum: AccountStatementType, name: 'type' })
  type: AccountStatementType;

  @Column({ type: 'decimal', name: 'amount', default: 0 })
  amount: number;

  @Column({
    type: 'enum',
    enum: AccountStatementAmountPosition,
    name: 'amount_position',
  })
  amountPosition: AccountStatementAmountPosition;

  @ManyToOne(() => Branch)
  @JoinColumn({ name: 'branch_id' })
  branch: Branch;
}
