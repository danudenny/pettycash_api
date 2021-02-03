import { Entity, Column, JoinColumn, Index } from 'typeorm';
import { PtcBaseEntity } from './base.entity';
import { BudgetRequest } from './budget.request.entity';
import { BudgetRequestState } from './utils/enum';

@Entity('budget_request_history')
export class BudgetRequestHistory extends PtcBaseEntity {
  @Column({ type: 'uuid', name: 'budget_request_id' })
  @Index()
  budgetRequestId: string;

  @Column({ type: 'date', name: 'need_date', nullable: true })
  needDate?: Date;

  @Column({ type: 'text', name: 'rejected_note', nullable: true })
  rejectedNote?: string;

  @Column({
    type: 'enum',
    enum: BudgetRequestState,
    default: BudgetRequestState.DRAFT,
  })
  state: BudgetRequestState;

  @JoinColumn({ name: 'budget_request_id' })
  budgetRequest: BudgetRequest;
}
