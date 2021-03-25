import { Entity, Column, JoinColumn, Index, ManyToOne } from 'typeorm';
import { PtcBaseEntity } from './base.entity';
import { CashBalanceAllocationState } from './utils/enum';
import { CashBalanceAllocation } from './cash.balance.allocation.entity';

@Entity('account_statement_history')
export class AccountStatementHistory extends PtcBaseEntity {
  @Column({ type: 'uuid', name: 'account_statement_id' })
  @Index()
  accountStatementId: string;

  @Column({
    type: 'enum',
    enum: CashBalanceAllocationState,
    default: CashBalanceAllocationState.DRAFT,
  })
  state: CashBalanceAllocationState;

  @Column({ type: 'text', name: 'rejected_note', nullable: true })
  rejectedNote?: string;

  @ManyToOne(() => CashBalanceAllocation, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'account_statement_id' })
  cashBalance: CashBalanceAllocation;
}
