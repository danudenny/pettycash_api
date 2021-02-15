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
import { AccountExpenseHistory } from './account-expense-history.entity';
import { AccountExpenseItem } from './account-expense-item.entity';
import { Attachment } from './attachment.entity';
import { PtcBaseEntity } from './base.entity';
import { Branch } from './branch.entity';
import { Partner } from './partner.entity';
import { Period } from './period.entity';
import { AccountExpensePaymentType, AccountExpenseState } from './utils/enum';

@Entity('account_expense')
export class AccountExpense extends PtcBaseEntity {
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
    enum: AccountExpensePaymentType,
    name: 'payment_type',
  })
  paymentType: AccountExpensePaymentType;

  // Sum of Items
  @Column({ type: 'numeric', name: 'total_amount', default: 0 })
  totalAmount: Number;

  @Column({ type: 'numeric', name: 'down_payment_amount', default: 0 })
  downPaymentAmount: Number;

  @Column({ type: 'numeric', name: 'difference_amount', default: 0 })
  differenceAmount: Number;

  @Column({
    type: 'enum',
    enum: AccountExpenseState,
    default: AccountExpenseState.DRAFT,
  })
  state: AccountExpenseState;

  @ManyToMany(() => Attachment)
  @JoinTable({
    name: 'account_expense_attachment',
    joinColumn: {
      name: 'account_expense_id',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'attachment_id',
      referencedColumnName: 'id',
    },
  })
  attachments: Attachment[];

  @OneToMany(() => AccountExpenseItem, (e) => e.accountExpense)
  items: AccountExpenseItem[];

  @OneToMany(() => AccountExpenseHistory, (e) => e.accountExpense)
  histories: AccountExpenseHistory[];

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