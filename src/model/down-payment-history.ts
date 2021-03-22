import { Entity, Column, JoinColumn, Index } from 'typeorm';
import { DownPayment } from './down-payment.entity';
import { PtcBaseEntity } from './base.entity';
import { DownPaymentState } from './utils/enum';

@Entity('down_payment_history')
export class DownPaymentHistory extends PtcBaseEntity {
  @Column({ type: 'uuid', name: 'down_payment_id' })
  @Index()
  downPaymentId: string;

  @Column({
    type: 'enum',
    enum: DownPaymentState,
    default: DownPaymentState.DRAFT,
  })
  state: DownPaymentState;

  @Column({ type: 'text', name: 'rejected_note', nullable: true })
  rejectedNote?: string;

  @JoinColumn({ name: 'down_payment_id' })
  downPayment: DownPayment;
}
