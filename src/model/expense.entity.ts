import {
  Entity,
  Column,
  JoinColumn,
  OneToMany,
  ManyToOne,
  ManyToMany,
  JoinTable,
  Index,
} from 'typeorm';
import { AccountDownPayment } from './account-down-payment.entity';
import { ExpenseHistory } from './expense-history.entity';
import { ExpenseItem } from './expense-item.entity';
import { Attachment } from './attachment.entity';
import { PtcBaseEntity } from './base.entity';
import { Branch } from './branch.entity';
import { Partner } from './partner.entity';
import { Period } from './period.entity';
import { ExpensePaymentType, ExpenseState, ExpenseType } from './utils/enum';

@Entity('expense')
export class Expense extends PtcBaseEntity {
  @Column({ type: 'uuid', name: 'branch_id' })
  @Index()
  branchId: string;

  @Column({ type: 'varchar', length: 25, name: 'number' })
  number: string;

  @Column({ type: 'varchar', length: 100, name: 'source_document' })
  sourceDocument: string;

  @Column({ type: 'date', name: 'transaction_date' })
  transactionDate: Date;

  @Column({ type: 'uuid', name: 'period_id' })
  periodId: string;

  @Column({ type: 'uuid', name: 'down_payment_id' })
  downPaymentId: string;

  @Column({ type: 'uuid', name: 'partner_id' })
  partnerId: string;

  @Column({
    type: 'enum',
    enum: ExpenseType,
    name: 'type',
    default: ExpenseType.EXPENSE,
  })
  type: ExpenseType;

  @Column({
    type: 'enum',
    enum: ExpensePaymentType,
    name: 'payment_type',
  })
  paymentType: ExpensePaymentType;

  // Sum of Items
  @Column({ type: 'numeric', name: 'total_amount', default: 0 })
  totalAmount: Number;

  @Column({ type: 'numeric', name: 'down_payment_amount', default: 0 })
  downPaymentAmount: Number;

  @Column({ type: 'numeric', name: 'difference_amount', default: 0 })
  differenceAmount: Number;

  @Column({
    type: 'enum',
    enum: ExpenseState,
    default: ExpenseState.DRAFT,
  })
  state: ExpenseState;

  @ManyToMany(() => Attachment)
  @JoinTable({
    name: 'expense_attachment',
    joinColumn: {
      name: 'expense_id',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'attachment_id',
      referencedColumnName: 'id',
    },
  })
  attachments: Attachment[];

  @OneToMany(() => ExpenseItem, (e) => e.expense)
  items: ExpenseItem[];

  @OneToMany(() => ExpenseHistory, (e) => e.expense)
  histories: ExpenseHistory[];

  @ManyToOne(() => Branch)
  @JoinColumn({ name: 'branch_id' })
  branch: Branch;

  @ManyToOne(() => Period)
  @JoinColumn({ name: 'period_id' })
  period: Period;

  @ManyToOne(() => AccountDownPayment)
  @JoinColumn({ name: 'down_payment_id' })
  accountDownPayment: AccountDownPayment;

  @ManyToOne(() => Partner)
  @JoinColumn({ name: 'partner_id' })
  partner: Partner;
}
