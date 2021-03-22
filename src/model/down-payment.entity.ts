import { Entity, Column, JoinColumn, ManyToOne, Index } from 'typeorm';
import { PtcBaseEntity } from './base.entity';
import { Branch } from './branch.entity';
import { Department } from './department.entity';
import { Employee } from './employee.entity';
import {
  DownPaymentPayType,
  DownPaymentState,
  DownPaymentType,
} from './utils/enum';

@Entity('account_down_payment')
export class DownPayment extends PtcBaseEntity {
  @Column({ type: 'uuid', name: 'branch_id' })
  @Index()
  branchId: string;

  @Column({ type: 'varchar', length: 25, name: 'number', unique: true })
  number: string;

  @Column({ type: 'date', name: 'transaction_date' })
  transactionDate: Date;

  @Column({ type: 'enum', enum: DownPaymentType, name: 'type' })
  type: DownPaymentType;

  @Column({ type: 'uuid', name: 'department_id' })
  departmentId: string;

  @Column({ type: 'uuid', name: 'employee_id' })
  employeeId: string;

  @Column({ type: 'decimal', name: 'amount', default: 0 })
  amount: number;

  @Column({
    type: 'enum',
    enum: DownPaymentPayType,
    name: 'payment_type',
  })
  paymentType: DownPaymentPayType;

  @Column({ type: 'text', name: 'description', nullable: true })
  description?: string;

  @Column({ type: 'text', name: 'destination_place', nullable: true })
  destinationPlace?: string;

  @Column({
    type: 'enum',
    enum: DownPaymentState,
    default: DownPaymentState.DRAFT,
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

  @ManyToOne(() => Employee)
  @JoinColumn({ name: 'employee_id', referencedColumnName: 'id' })
  employee: Employee;
}
