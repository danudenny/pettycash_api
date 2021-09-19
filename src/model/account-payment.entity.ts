import { Entity, Column, JoinColumn, ManyToOne, Index } from 'typeorm';
import { PtcBaseEntity } from './base.entity';
import { Branch } from './branch.entity';
import {
  AccountPaymentPayMethod,
  AccountPaymentState,
  AccountPaymentType,
} from './utils/enum';
import { ColumnNumericTransformer } from './utils/transformer';

@Entity('account_payment')
export class AccountPayment extends PtcBaseEntity {
  @Column({ type: 'uuid', name: 'branch_id' })
  @Index()
  branchId: string;

  @Column({ type: 'varchar', length: 25, unique: true })
  number: string;

  @Column({ type: 'date', name: 'transaction_date' })
  transactionDate: Date;

  @Column({
    type: 'decimal',
    name: 'amount',
    default: 0,
    transformer: new ColumnNumericTransformer(),
  })
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

  @Column({
    type: 'enum',
    enum: AccountPaymentState,
    name: 'state',
    default: AccountPaymentState.PAID,
    comment: 'Payment State either paid or reversed',
  })
  state: AccountPaymentState;

  @ManyToOne(() => Branch)
  @JoinColumn({ name: 'branch_id' })
  branch: Branch;
}
