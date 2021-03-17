import { Entity, Column, JoinColumn, ManyToOne, Index } from 'typeorm';
import { PtcBaseEntity } from './base.entity';
import { Branch } from './branch.entity';
import { AccountPaymentPayMethod, AccountPaymentType } from './utils/enum';

@Entity('account_payment')
export class AccountPayment extends PtcBaseEntity {
  @Column({ type: 'uuid', name: 'branch_id' })
  @Index()
  branchId: string;

  @Column({ type: 'date', name: 'transaction_date' })
  transactionDate: Date;

  @Column({ type: 'decimal', name: 'amount', default: 0 })
  amount: number;

  @Column({
    type: 'enum',
    enum: AccountPaymentType,
    name: 'type',
    comment: 'Payment Type either partially or full',
  })
  type: AccountPaymentType;

  @Column({
    type: 'enum',
    enum: AccountPaymentPayMethod,
    name: 'payment_method',
    comment: 'Payment Method either cash or bank',
  })
  paymentMethod: AccountPaymentPayMethod;

  @ManyToOne(() => Branch)
  @JoinColumn({ name: 'branch_id' })
  branch: Branch;
}
