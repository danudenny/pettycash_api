import { Entity, Column, JoinColumn, Index } from 'typeorm';
import { PtcBaseEntity } from './base.entity';
import { Budget } from './budget.entity';
import { BudgetState } from './utils/enum';

@Entity('budget_history')
export class BudgetHistory extends PtcBaseEntity {
  @Column({ type: 'uuid', name: 'budget_id' })
  @Index()
  budgetId: string;

  @Column({ type: 'date', name: 'end_date', nullable: true })
  endDate?: Date;

  @Column({ type: 'text', name: 'rejected_note', nullable: true })
  rejectedNote?: string;

  @Column({ type: 'enum', enum: BudgetState, default: BudgetState.DRAFT })
  state: BudgetState;

  @JoinColumn({ name: 'budget_id' })
  budget: Budget;
}
