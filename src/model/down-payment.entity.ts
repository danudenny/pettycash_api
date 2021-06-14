import {
  Entity,
  Column,
  JoinColumn,
  ManyToOne,
  OneToMany,
  Index,
} from 'typeorm';
import {
  DownPaymentPayType,
  DownPaymentState,
  DownPaymentType,
} from './utils/enum';
import { Branch } from './branch.entity';
import { Employee } from './employee.entity';
import { PtcBaseEntity } from './base.entity';
import { Department } from './department.entity';
import { DownPaymentHistory } from './down-payment-history.entity';
import { Expense } from './expense.entity';
import { Period } from './period.entity';
import { Product } from './product.entity';

@Entity('down_payment')
export class DownPayment extends PtcBaseEntity {
  @Column({ type: 'uuid', name: 'branch_id' })
  @Index()
  branchId: string;

  @Column({ type: 'uuid', name: 'period_id' })
  @Index()
  periodId: string;

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

  @Column({ type: 'enum', enum: DownPaymentPayType, name: 'payment_type' })
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
  state: DownPaymentState;

  @Column({ type: 'uuid', name: 'expense_id', nullable: true })
  @Index()
  expenseId?: string;
  
  @Column({ type: 'uuid', name: 'product_id', nullable: true })
  @Index()
  productId?: string;
  
  @ManyToOne(() => Expense, (e) => e.downPayment, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'expense_id' })
  expense?: Expense;

  @ManyToOne(() => Branch)
  @JoinColumn({ name: 'branch_id' })
  branch: Branch;

  @ManyToOne(() => Department)
  @JoinColumn({ name: 'department_id', referencedColumnName: 'id' })
  department: Department;

  @ManyToOne(() => Employee)
  @JoinColumn({ name: 'employee_id', referencedColumnName: 'id' })
  employee: Employee;

  @ManyToOne(() => Period)
  @JoinColumn({ name: 'period_id' })
  period: Period;

  @ManyToOne(() => Product)
  @JoinColumn({ name: 'product_id' })
  product?: Product;

  @OneToMany(() => DownPaymentHistory, (e) => e.downPayment, { cascade: true })
  histories: DownPaymentHistory[];
}
