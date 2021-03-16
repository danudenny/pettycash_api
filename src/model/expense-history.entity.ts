import { Entity, Column, JoinColumn, Index, ManyToOne } from 'typeorm';
import { Expense } from './expense.entity';
import { PtcBaseEntity } from './base.entity';
import { ExpenseState } from './utils/enum';

@Entity('expense_history')
export class ExpenseHistory extends PtcBaseEntity {
  @Column({ type: 'uuid', name: 'expense_id' })
  @Index()
  expenseId: string;

  @Column({
    type: 'enum',
    enum: ExpenseState,
    default: ExpenseState.DRAFT,
  })
  state: ExpenseState;

  @Column({ type: 'text', name: 'rejected_note', nullable: true })
  rejectedNote?: string;

  @ManyToOne(() => Expense, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'expense_id' })
  expense: Expense;
}
