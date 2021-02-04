import { Entity, Column, JoinColumn, Index } from 'typeorm';
import { AccountExpense } from './account-expense.entity';
import { PtcBaseEntity } from './base.entity';
import { AccountExpenseState } from './utils/enum';

@Entity('account_expense_history')
export class AccountExpenseHistory extends PtcBaseEntity {
  @Column({ type: 'uuid', name: 'account_expense_id' })
  @Index()
  accountExpenseId: string;

  @Column({
    type: 'enum',
    enum: AccountExpenseState,
    default: AccountExpenseState.DRAFT,
  })
  state: AccountExpenseState;

  @Column({ type: 'text', name: 'rejected_note', nullable: true })
  rejectedNote?: string;

  @JoinColumn({ name: 'account_expense_id' })
  accountExpense: AccountExpense;
}
