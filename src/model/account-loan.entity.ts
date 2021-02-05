import {
  Entity,
  Column,
  JoinColumn,
  ManyToOne,
  ManyToMany,
  JoinTable,
  Index,
} from 'typeorm';
import { AccountPayment } from './account-payment.entity';
import { Attachment } from './attachment.entity';
import { PtcBaseEntity } from './base.entity';
import { Branch } from './branch.entity';
import { Employee } from './employee.entity';
import { Period } from './period.entity';
import {
  AccountLoanPaymentType,
  AccountLoanState,
  AccountLoanType,
} from './utils/enum';

@Entity('account_loan')
export class AccountLoan extends PtcBaseEntity {
  @Column({ type: 'uuid', name: 'branch_id' })
  @Index()
  branchId: string;

  @Column({ type: 'varchar', length: 25, name: 'number' })
  number: string;

  @Column({
    type: 'varchar',
    length: 100,
    name: 'source_document',
    nullable: true,
  })
  sourceDocument?: string;

  @Column({ type: 'date', name: 'transaction_date' })
  transactionDate: Date;

  @Column({ type: 'uuid', name: 'period_id' })
  periodId: string;

  @Column({ type: 'uuid', name: 'employee_id' })
  employeeId: string;

  @Column({ type: 'numeric', name: 'amount', default: 0 })
  amount: Number;

  @Column({ type: 'numeric', name: 'residual_amount', default: 0 })
  residualAmount: Number;

  @Column({ type: 'numeric', name: 'paid_amount', default: 0 })
  paidAmount: Number;

  @Column({
    type: 'enum',
    enum: AccountLoanType,
    name: 'type',
  })
  type: AccountLoanType;

  @Column({
    type: 'enum',
    enum: AccountLoanPaymentType,
    name: 'payment_type',
  })
  paymentType: AccountLoanPaymentType;

  @Column({
    type: 'enum',
    enum: AccountLoanState,
    default: AccountLoanState.UNPAID,
  })
  state: AccountLoanState;

  @ManyToMany(() => Attachment)
  @JoinTable({
    name: 'account_loan_attachment',
    joinColumn: {
      name: 'account_loan_id',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'attachment_id',
      referencedColumnName: 'id',
    },
  })
  attachments: Attachment[];

  @ManyToMany(() => AccountPayment)
  @JoinTable({
    name: 'account_loan_payment',
    joinColumn: {
      name: 'account_loan_id',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'payment_id',
      referencedColumnName: 'id',
    },
  })
  payments: AccountPayment[];

  @ManyToOne(() => Branch)
  @JoinColumn({ name: 'branch_id' })
  branch: Branch;

  @ManyToOne(() => Period)
  @JoinColumn({ name: 'period_id' })
  period: Period;

  @ManyToOne(() => Employee)
  @JoinColumn({ name: 'employee_id' })
  employee: Employee;
}
