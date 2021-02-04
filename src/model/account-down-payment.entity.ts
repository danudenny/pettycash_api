import { Entity, Column, JoinColumn, ManyToOne, Index } from 'typeorm';
import { PtcBaseEntity } from './base.entity';
import { Branch } from './branch.entity';
import { Department } from './department.entity';
import { User } from './user.entity';
import {
  AccountDownPaymentPayType,
  AccountDownPaymentState,
  AccountDownPaymentType,
} from './utils/enum';

@Entity('account_down_payment')
export class AccountDownPayment extends PtcBaseEntity {
  @Column({ type: 'uuid', name: 'branch_id' })
  @Index()
  branchId: string;

  @Column({ type: 'varchar', length: 25, name: 'number' })
  number: string;

  @Column({ type: 'date', name: 'transaction_date' })
  transactionDate: Date;

  @Column({ type: 'enum', enum: AccountDownPaymentType, name: 'type' })
  type: AccountDownPaymentType;

  @Column({ type: 'uuid', name: 'department_id' })
  departmentId: string;

  @Column({ type: 'uuid', name: 'responsible_user_id' })
  responsibleUserId: string;

  @Column({ type: 'decimal', name: 'amount', default: 0 })
  amount: Number;

  @Column({
    type: 'enum',
    enum: AccountDownPaymentPayType,
    name: 'payment_type',
  })
  paymentType: AccountDownPaymentPayType;

  @Column({ type: 'text', name: 'description', nullable: true })
  description?: string;

  @Column({ type: 'text', name: 'destination_place', nullable: true })
  destinationPlace?: string;

  @Column({
    type: 'enum',
    enum: AccountDownPaymentState,
    default: AccountDownPaymentState.DRAFT,
  })
  state: string;

  @Column({
    type: 'boolean',
    nullable: false,
    default: () => 'false',
    name: 'is_realized',
  })
  isRealized?: boolean;

  @ManyToOne(() => Branch)
  @JoinColumn({ name: 'branch_id' })
  branch: Branch;

  @ManyToOne(() => Department)
  @JoinColumn({ name: 'department_id', referencedColumnName: 'id' })
  department: Department;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'responsible_user_id', referencedColumnName: 'id' })
  responsibleUser: User;
}
