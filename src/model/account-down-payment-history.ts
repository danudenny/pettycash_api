import { Entity, Column, JoinColumn, Index } from 'typeorm';
import { AccountDownPayment } from './account-down-payment.entity';
import { PtcBaseEntity } from './base.entity';
import { AccountDownPaymentState } from './utils/enum';

@Entity('account_down_payment_history')
export class AccountDownPaymentHistory extends PtcBaseEntity {
  @Column({ type: 'uuid', name: 'account_down_payment_id' })
  @Index()
  accountDownPaymentId: string;

  @Column({
    type: 'enum',
    enum: AccountDownPaymentState,
    default: AccountDownPaymentState.DRAFT,
  })
  state: AccountDownPaymentState;

  @Column({ type: 'text', name: 'rejected_note', nullable: true })
  rejectedNote?: string;

  @JoinColumn({ name: 'account_down_payment_id' })
  accountDownPayment: AccountDownPayment;
}
