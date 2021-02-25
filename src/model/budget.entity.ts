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
import { BudgetHistory } from './budget-history.entity';
import { BudgetItem } from './budget-item.entity';
import { BudgetState } from './utils/enum';
import { User } from './user.entity';
import { Transform, Type } from 'class-transformer';
import moment from 'moment';

@Entity('budget')
export class Budget extends PtcBaseEntity {
  @Column({ type: 'uuid', name: 'branch_id' })
  @Index()
  branchId: string;

  @Column({ type: 'varchar', length: 25 })
  number: string;

  @Column({ type: 'uuid', name: 'responsible_user_id' })
  @Index()
  responsibleUserId: string;

  @Column({ type: 'date', name: 'start_date' })
  startDate: Date;

  @Column({ type: 'date', name: 'end_date', nullable: true })
  endDate?: Date;

  // Sum of Items
  @Column({ type: 'numeric', name: 'total_amount', default: 0 })
  totalAmount: number;

  @Column({ type: 'numeric', name: 'minimum_amount', default: 0 })
  minimumAmount: number;

  @Column({ type: 'enum', enum: BudgetState, default: BudgetState.DRAFT })
  state: BudgetState;

  @Column({ type: 'text', name: 'rejected_note', nullable: true })
  rejectedNote?: string;

  @ManyToOne(() => Branch)
  @JoinColumn({ name: 'branch_id' })
  branch: Branch;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'responsible_user_id' })
  users: User;

  @OneToMany(() => BudgetItem, (e) => e.budget)
  items: BudgetItem[];

  @OneToMany(() => BudgetHistory, (e) => e.budget)
  histories: BudgetHistory[];
}
