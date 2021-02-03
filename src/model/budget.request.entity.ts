import {
  Entity,
  Column,
  JoinColumn,
  ManyToOne,
  OneToMany,
  Index,
} from 'typeorm';
import { PtcBaseEntity } from './base.entity';
import { Branch } from './branch.entity';
import { BudgetRequestHistory } from './budget.request-history.entity';
import { BudgetRequestItem } from './budget.request-item.entity';
import { User } from './user.entity';
import { BudgetRequestState } from './utils/enum';

@Entity('budget_request')
export class BudgetRequest extends PtcBaseEntity {
  @Column({ type: 'uuid', name: 'branch_id' })
  @Index()
  branchId: string;

  @Column({ type: 'uuid', name: 'budget_id' })
  @Index()
  budgetId: string;

  @Column({ type: 'uuid', name: 'responsible_user_id' })
  @Index()
  responsibleUserId: string;

  @Column({ type: 'varchar', length: 25 })
  number: string;

  @Column({ type: 'date', name: 'need_date' })
  needDate: Date;

  // Sum of Items
  @Column({ type: 'numeric', name: 'total_amount', default: 0 })
  totalAmount: Number;

  @Column({
    type: 'enum',
    enum: BudgetRequestState,
    default: BudgetRequestState.DRAFT,
  })
  state: BudgetRequestState;

  @Column({ type: 'text', name: 'description', nullable: true })
  description?: string;

  @Column({ type: 'text', name: 'rejected_note', nullable: true })
  rejectedNote?: string;

  @ManyToOne(() => Branch)
  @JoinColumn({ name: 'branch_id' })
  branch: Branch;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'responsible_user_id' })
  responsibleUser: User;

  @OneToMany(() => BudgetRequestItem, (e) => e.budgetRequest)
  items: BudgetRequestItem[];

  @OneToMany(() => BudgetRequestHistory, (e) => e.budgetRequest)
  histories: BudgetRequestHistory[];
}
