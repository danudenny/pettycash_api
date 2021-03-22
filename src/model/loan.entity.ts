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
import { LoanState, LoanType } from './utils/enum';
import { ColumnNumericTransformer } from './utils/transformer';

@Entity('loan')
export class Loan extends PtcBaseEntity {
  @Column({ type: 'uuid', name: 'branch_id' })
  @Index()
  branchId: string;

  @Column({ type: 'varchar', length: 25, name: 'number', unique: true })
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

  @Column({
    type: 'numeric',
    name: 'amount',
    default: 0,
    transformer: new ColumnNumericTransformer(),
  })
  amount: number;

  @Column({
    type: 'numeric',
    name: 'residual_amount',
    default: 0,

    transformer: new ColumnNumericTransformer(),
  })
  residualAmount: number;

  @Column({
    type: 'numeric',
    name: 'paid_amount',
    default: 0,

    transformer: new ColumnNumericTransformer(),
  })
  paidAmount: number;

  @Column({
    type: 'enum',
    enum: LoanType,
    name: 'type',
  })
  type: LoanType;

  @Column({
    type: 'enum',
    enum: LoanState,
    default: LoanState.UNPAID,
  })
  state: LoanState;

  @ManyToMany(() => Attachment)
  @JoinTable({
    name: 'loan_attachment',
    joinColumn: {
      name: 'loan_id',
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
    name: 'loan_payment',
    joinColumn: {
      name: 'loan_id',
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
