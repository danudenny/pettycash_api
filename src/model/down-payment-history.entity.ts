import { Entity, Column, JoinColumn, ManyToOne, Index } from 'typeorm';
import { DownPaymentState } from './utils/enum';
import { PtcBaseEntity } from './base.entity';
import { DownPayment } from './down-payment.entity';

@Entity('down_payment_history')
export class DownPaymentHistory extends PtcBaseEntity {
  @Column({ type: 'uuid', name: 'down_payment_id' })
  @Index()
  downPaymentId: string;

  @Column({ type: 'uuid', name: 'create_user_id' })
  @Index()
  createUserId: string;

  @Column({
    type: 'enum',
    enum: DownPaymentState,
    default: DownPaymentState.DRAFT,
  })
  state: DownPaymentState;

  @Column({ type: 'text', name: 'rejected_note', nullable: true })
  rejectedNote?: string;

  @ManyToOne(() => DownPayment, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'down_payment_id' })
  downPayment: DownPayment;
}
